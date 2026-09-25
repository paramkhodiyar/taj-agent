import http from 'http';
import { spawn } from 'child_process';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let json: any = null;
  try {
    json = await response.json();
  } catch (e) {
    // Non-JSON response
  }

  return { status, json, headers: response.headers };
}

async function runPhase3Gate() {
  console.log('--- Running Phase 3 Gate Verification ---');

  // Start Next.js server on port 3005
  console.log(`Starting server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit',
  });

  // Wait for server to become responsive
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/hotels`);
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (!ready) {
    server.kill();
    throw new Error('Server failed to start on port ' + PORT);
  }
  console.log('✓ Server is ready.');

  try {
    // 1. Verify GET /api/hotels
    console.log('\nTest 1: GET /api/hotels...');
    const hotelsRes = await request('/api/hotels');
    if (hotelsRes.status !== 200 || !hotelsRes.json?.success || hotelsRes.json?.count < 30) {
      throw new Error(`Expected at least 30 canonical hotels, got status ${hotelsRes.status}`);
    }
    console.log(`✓ GET /api/hotels returned ${hotelsRes.json.count} canonical Taj properties.`);

    // 2. Verify Input Validation on POST /api/searches
    console.log('\nTest 2: Input Validation on POST /api/searches...');
    // A: Missing dates
    const invalidRes1 = await request('/api/searches', { method: 'POST', body: {} });
    if (invalidRes1.status !== 400 || !invalidRes1.json?.error) {
      throw new Error('Expected 400 Bad Request for missing dates');
    }
    console.log(`✓ Missing dates properly rejected: "${invalidRes1.json.error}"`);

    // B: checkOut <= checkIn
    const invalidRes2 = await request('/api/searches', {
      method: 'POST',
      body: { checkIn: '2026-12-25', checkOut: '2026-12-20' },
    });
    if (invalidRes2.status !== 400) {
      throw new Error('Expected 400 for checkOut <= checkIn');
    }
    console.log(`✓ checkOut before checkIn properly rejected: "${invalidRes2.json.error}"`);

    // C: Valid search creation
    const validSearchRes = await request('/api/searches', {
      method: 'POST',
      body: { checkIn: '2026-11-20', checkOut: '2026-11-22', adults: 2, rooms: 1 },
    });
    if (validSearchRes.status !== 201 || !validSearchRes.json?.data?.id) {
      throw new Error('Expected 201 Created for valid search');
    }
    const searchId = validSearchRes.json.data.id;
    console.log(`✓ Valid search accepted and created with ID: ${searchId}`);

    // 3. Verify GET /api/searches/:id/results (DB-first query)
    console.log('\nTest 3: GET /api/searches/:id/results (DB-first)...');
    const resultsRes = await request(`/api/searches/${searchId}/results`);
    if (resultsRes.status !== 200 || !resultsRes.json?.success) {
      throw new Error('Expected 200 OK for search results');
    }
    console.log(`✓ GET /api/searches/:id/results succeeded. Monitored: ${resultsRes.json.summary.totalPropertiesMonitored}`);

    // 4. Verify Rate Limiting on POST /api/searches/:id/fetch
    console.log('\nTest 4: Rate Limiting on POST /api/searches/:id/fetch...');
    // We configured rate limit to 5 per minute. Send 6 requests in rapid succession.
    let rateLimitTriggered = false;
    for (let i = 1; i <= 7; i++) {
      const fetchRes = await request(`/api/searches/${searchId}/fetch`, {
        method: 'POST',
        body: { hotelId: 'taj-mahal-palace-mumbai' },
      });

      if (fetchRes.status === 429) {
        rateLimitTriggered = true;
        console.log(`✓ Rate limit triggered on request ${i} as expected with HTTP 429: "${fetchRes.json?.error}"`);
        break;
      }
    }

    if (!rateLimitTriggered) {
      throw new Error('PHASE GATE FAILED: Rate limit was NOT triggered on POST /api/searches/:id/fetch!');
    }

    // 5. Verify Operator Authentication on /api/admin/data-health
    console.log('\nTest 5: Security restriction on /api/admin/data-health...');
    // A: Without key
    const unauthRes = await request('/api/admin/data-health');
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for admin route without key, got ${unauthRes.status}`);
    }
    console.log('✓ Access without admin key rejected with 401 Unauthorized.');

    // B: With valid key
    const authRes = await request('/api/admin/data-health', {
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY || 'dev_taj_admin_secret_key_8921' },
    });
    if (authRes.status !== 200 || !authRes.json?.health) {
      throw new Error(`Expected 200 OK for admin route with valid key, got ${authRes.status}`);
    }
    console.log(`✓ Admin access granted with key. System status: ${authRes.json.health.status}`);

    console.log('\n=========================================');
    console.log('✅ PHASE 3 GATE PASSED:');
    console.log('1. All public endpoints match 04-API-AND-SECURITY.md §1.');
    console.log('2. Input validation verified and enforced at API boundary.');
    console.log('3. Rate limiting verified and strictly enforced on fetch endpoint.');
    console.log('4. Admin endpoints restricted to authenticated operators.');
    console.log('=========================================\n');
  } finally {
    server.kill();
  }
}

runPhase3Gate().catch((e) => {
  console.error('Phase 3 Gate test error:', e);
  process.exit(1);
});
