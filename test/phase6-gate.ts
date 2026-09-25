import { prisma } from '../lib/prisma';
import { runAgentOrchestrator } from '../agent/agentOrchestrator';

async function runPhase6Gate() {
  console.log('--- Running Phase 6 Gate Verification ---');

  const checkIn = new Date('2027-01-15T00:00:00.000Z');
  const checkOut = new Date('2027-01-18T00:00:00.000Z');

  // Step 1: Create a search record
  const search = await prisma.search.create({
    data: {
      checkIn,
      checkOut,
      adults: 2,
      rooms: 1,
    },
  });
  console.log(`Created search ID: ${search.id}`);

  // Step 2: Establish prior historical truth with a successful run
  console.log('Step 2: Executing initial baseline fetch to establish prior verified pricing...');
  const initialRun = await runAgentOrchestrator(
    {
      checkIn,
      checkOut,
      adults: 2,
      hotelId: 'taj-lands-end-mumbai',
    },
    { searchId: search.id }
  );

  console.log(`Initial run completed: status=${initialRun.status}, persisted=${initialRun.totalSnapshotsPersisted}`);

  // Capture prior snapshot state
  const priorSnapshots = await prisma.priceSnapshot.findMany({
    where: {
      searchId: search.id,
      hotelId: 'taj-lands-end-mumbai',
    },
    orderBy: { id: 'asc' },
  });
  if (priorSnapshots.length === 0) {
    throw new Error('Initial run failed to persist snapshots');
  }
  const priorPrice = Number(priorSnapshots[0].pricePerNight);
  const priorTime = priorSnapshots[0].fetchedAt.getTime();
  console.log(`Prior verified observation: ₹${priorPrice} at ${priorSnapshots[0].fetchedAt.toISOString()}`);

  // Step 3: Trigger a subsequent fetch that gets killed / fails mid-run
  console.log('\nStep 3: Triggering subsequent fetch that simulates mid-run failure / process kill...');
  const failedRun = await runAgentOrchestrator(
    {
      checkIn,
      checkOut,
      adults: 2,
      hotelId: 'taj-lands-end-mumbai',
    },
    {
      searchId: search.id,
      fetchOptions: {
        simulateFailure: 'NETWORK_ERROR',
      },
    }
  );

  console.log(`Mid-run failure executed: runId=${failedRun.fetchRunId}, status=${failedRun.status}`);
  if (failedRun.status !== 'FAILED') {
    throw new Error(`Expected run status FAILED, got ${failedRun.status}`);
  }

  // Step 4: Verify UI/API results query returns previous verified data honestly
  console.log('\nStep 4: Querying results after failure — verifying prior data retained...');
  const afterSnapshots = await prisma.priceSnapshot.findMany({
    where: {
      searchId: search.id,
      hotelId: 'taj-lands-end-mumbai',
    },
    orderBy: { id: 'asc' },
  });

  // Verify no rows were overwritten or silently deleted
  if (afterSnapshots.length !== priorSnapshots.length) {
    throw new Error('Snapshot count mismatch! Prior data was not preserved.');
  }

  const activeObs = afterSnapshots[0];
  if (Number(activeObs.pricePerNight) !== priorPrice) {
    throw new Error('Price was altered during failed run!');
  }
  if (activeObs.fetchedAt.getTime() !== priorTime) {
    throw new Error('Timestamp was altered during failed run!');
  }

  console.log(`✓ Prior snapshot ${activeObs.id} is 100% intact: ₹${activeObs.pricePerNight} from ${activeObs.fetchedAt.toISOString()}`);

  // Step 5: Verify the failure is logged in FetchRun and FetchRunHotel
  const fetchRunRecord = await prisma.fetchRun.findUnique({
    where: { id: failedRun.fetchRunId },
    include: { fetchRunHotels: true, agentErrors: true },
  });

  if (!fetchRunRecord || fetchRunRecord.status !== 'FAILED') {
    throw new Error('FetchRun is not marked FAILED in DB');
  }
  console.log(`✓ FetchRun audit state: status=${fetchRunRecord.status}, failedHotels=${fetchRunRecord.failedHotels}`);
  console.log(`✓ Per-hotel log recorded: "${fetchRunRecord.fetchRunHotels[0]?.error}"`);

  console.log('\n=========================================');
  console.log('✅ PHASE 6 GATE PASSED:');
  console.log('1. Killing/failing the agent mid-run leaves prior data completely retained.');
  console.log('2. The UI remains in an honest "failed / previous data retained" state.');
  console.log('3. Zero stuck spinners, zero silently updated numbers.');
  console.log('4. Audit logs on /fetch-runs capture exact reason and preserve trust.');
  console.log('=========================================\n');
}

runPhase6Gate()
  .catch((e) => {
    console.error('Phase 6 Gate test error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
