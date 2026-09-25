import { prisma } from '../lib/prisma.js';
import { runAgentOrchestrator } from '../agent/agentOrchestrator.js';

async function runPhase2Gate() {
  console.log('--- Running Phase 2 Gate Verification ---');

  const hotelId = 'taj-exotica-resort-spa-goa';
  const searchParams = {
    checkIn: '2026-12-20',
    checkOut: '2026-12-23',
    adults: 2,
    children: 0,
    rooms: 1,
    hotelId,
  };

  // Step 1: Execute a successful baseline fetch run to establish historical truth
  console.log('Step 1: Running initial successful fetch run to establish prior snapshots...');
  const initialResult = await runAgentOrchestrator(searchParams);
  console.log(`Initial run completed: status=${initialResult.status}, persisted=${initialResult.totalSnapshotsPersisted}`);

  if (initialResult.totalSnapshotsPersisted === 0) {
    throw new Error('Initial run failed to persist snapshots');
  }

  // Record initial snapshots
  const priorSnapshots = await prisma.priceSnapshot.findMany({
    where: {
      hotelId,
      checkIn: new Date(searchParams.checkIn),
      checkOut: new Date(searchParams.checkOut),
    },
    orderBy: { fetchedAt: 'asc' },
  });

  console.log(`Found ${priorSnapshots.length} prior snapshots in database.`);
  const priorIds = priorSnapshots.map((s) => s.id);
  const priorPrices = priorSnapshots.map((s) => ({ id: s.id, price: Number(s.pricePerNight), time: s.fetchedAt }));

  // Step 2: Simulate a subsequent fetch failure (e.g. TIMEOUT or CAPTCHA)
  console.log('\nStep 2: Simulating subsequent fetch failure (TIMEOUT / Connection refused)...');
  const failureResult = await runAgentOrchestrator(searchParams, {
    fetchOptions: {
      simulateFailure: 'TIMEOUT',
    },
  });

  console.log(`Simulated failure run completed: status=${failureResult.status}, failedHotels=${failureResult.failedHotels}`);

  // Step 3: Verify the FetchRun state is FAILED
  if (failureResult.status !== 'FAILED') {
    throw new Error(`PHASE GATE FAILED: Expected run status FAILED, but got ${failureResult.status}`);
  }

  // Step 4: Verify FetchRunHotel record reflects FAILED status and error message
  const failedHotelRecord = await prisma.fetchRunHotel.findFirst({
    where: {
      fetchRunId: failureResult.fetchRunId,
      hotelId,
    },
  });

  if (!failedHotelRecord || failedHotelRecord.status !== 'FAILED') {
    throw new Error(`PHASE GATE FAILED: FetchRunHotel record is not in FAILED status`);
  }
  console.log(`✓ FetchRunHotel record confirmed FAILED with error: "${failedHotelRecord.error}"`);

  // Step 5: Verify AgentError table logged the failure for observability
  const agentError = await prisma.agentError.findFirst({
    where: {
      fetchRunId: failureResult.fetchRunId,
      hotelId,
    },
  });
  if (!agentError) {
    throw new Error('PHASE GATE FAILED: AgentError was not logged for failed run');
  }
  console.log(`✓ AgentError logged correctly: code=${agentError.errorCode}, message=${agentError.message}`);

  // Step 6: CRITICAL CHECK: Verify prior snapshots are 100% untouched
  console.log('\nStep 3: Verifying historical data integrity (Prior snapshots must be untouched)...');
  const currentSnapshots = await prisma.priceSnapshot.findMany({
    where: {
      hotelId,
      checkIn: new Date(searchParams.checkIn),
      checkOut: new Date(searchParams.checkOut),
    },
    orderBy: { fetchedAt: 'asc' },
  });

  // Count should be strictly equal to prior count (no deletions, no replacements)
  if (currentSnapshots.length !== priorSnapshots.length) {
    throw new Error(
      `PHASE GATE FAILED: Snapshot count changed after failed fetch! Expected ${priorSnapshots.length}, found ${currentSnapshots.length}`
    );
  }

  // Exact ID and price comparison
  for (const prior of priorPrices) {
    const matching = currentSnapshots.find((s) => s.id === prior.id);
    if (!matching) {
      throw new Error(`PHASE GATE FAILED: Prior snapshot ${prior.id} is missing after failed fetch!`);
    }
    if (Number(matching.pricePerNight) !== prior.price) {
      throw new Error(`PHASE GATE FAILED: Prior snapshot ${prior.id} price was mutated!`);
    }
    if (matching.fetchedAt.getTime() !== prior.time.getTime()) {
      throw new Error(`PHASE GATE FAILED: Prior snapshot ${prior.id} timestamp was modified!`);
    }
  }

  console.log(`✓ All ${currentSnapshots.length} prior snapshots verified completely intact with identical IDs, prices, and timestamps.`);

  console.log('\n=========================================');
  console.log('✅ PHASE 2 GATE PASSED:');
  console.log('1. Discrete agent subsystems (Resolver, Fetcher, Extractors, Normalizer, Validator, Writer) executed in harmony.');
  console.log('2. A simulated fetch failure leaves prior snapshots completely untouched.');
  console.log('3. Failure produces an honest FAILED status, with audit records in FetchRun, FetchRunHotel, and AgentError.');
  console.log('4. Zero data gap, zero overwrite, 100% historical fidelity maintained.');
  console.log('=========================================\n');
}

runPhase2Gate()
  .catch((e) => {
    console.error('Phase 2 Gate test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
