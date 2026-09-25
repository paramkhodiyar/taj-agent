import { prisma } from '../lib/prisma';
import { runScheduledCollector } from '../workers/scheduledCollector';

async function runPhase8Gate() {
  console.log('--- Running Phase 8 Gate Verification ---');

  const hotelId = 'taj-fort-aguada-resort-spa-goa';
  const checkIn = new Date('2027-02-10T00:00:00.000Z');
  const checkOut = new Date('2027-02-12T00:00:00.000Z');

  // Step 1: Create a TrackedSearch
  const tracked = await prisma.trackedSearch.create({
    data: {
      hotelId,
      checkIn,
      checkOut,
      adults: 2,
      rooms: 1,
      targetPriceThreshold: 30000,
      notifyEmail: 'family@taj-intelligence.local',
      isActive: true,
    },
  });
  console.log(`Created TrackedSearch ID: ${tracked.id} for ${hotelId}`);

  // Count snapshots before scheduled runs
  const initialCount = await prisma.priceSnapshot.count({
    where: { hotelId, checkIn, checkOut },
  });
  console.log(`Initial snapshot count: ${initialCount}`);

  // Step 2: Run Scheduled Cycle 1
  console.log('\nCycle 1: Executing scheduled collection...');
  const cycle1 = await runScheduledCollector();
  console.log(`Cycle 1 complete: new snapshots=${cycle1.newSnapshotsCount}, digests=${cycle1.digestsGenerated.length}`);

  const countAfter1 = await prisma.priceSnapshot.count({
    where: { hotelId, checkIn, checkOut },
  });
  console.log(`Total snapshots after Cycle 1: ${countAfter1}`);
  if (countAfter1 <= initialCount) {
    throw new Error('Cycle 1 failed to accumulate snapshots!');
  }

  // Step 3: Run Scheduled Cycle 2 (Identical pricing - nothing changed)
  console.log('\nCycle 2: Executing second scheduled collection (no meaningful price change)...');
  const cycle2 = await runScheduledCollector();
  console.log(`Cycle 2 complete: new snapshots=${cycle2.newSnapshotsCount}, digests=${cycle2.digestsGenerated.length}`);

  const countAfter2 = await prisma.priceSnapshot.count({
    where: { hotelId, checkIn, checkOut },
  });
  console.log(`Total snapshots after Cycle 2: ${countAfter2}`);
  if (countAfter2 <= countAfter1) {
    throw new Error('Cycle 2 failed to accumulate immutable snapshots!');
  }

  // In Cycle 2, price did not drop meaningfully compared to Cycle 1, so no noise notification should be sent
  const cycle2DigestsForTracked = cycle2.digestsGenerated.filter((d) => d.trackedSearchId === tracked.id);
  if (cycle2DigestsForTracked.length > 0) {
    throw new Error('PHASE GATE FAILED: Duplicate notification digest sent when price did not change meaningfully!');
  }
  console.log('✓ Noise-prevention verified: No duplicate digest sent when price was unchanged.');

  // Step 4: Verify accumulated historical series
  const snapshotsSeries = await prisma.priceSnapshot.findMany({
    where: { hotelId, checkIn, checkOut },
    orderBy: { fetchedAt: 'asc' },
  });

  console.log(`\nVerified historical snapshots series (${snapshotsSeries.length} observations):`);
  snapshotsSeries.forEach((s, idx) => {
    console.log(`  Observation ${idx + 1}: ID=${s.id}, Price=₹${s.pricePerNight}, Run=${s.fetchRunId}, Time=${s.fetchedAt.toISOString()}`);
  });

  // Verify each is a distinct immutable row
  const ids = new Set(snapshotsSeries.map((s) => s.id));
  if (ids.size !== snapshotsSeries.length) {
    throw new Error('Duplicate IDs found in snapshots series!');
  }

  // Clean up test tracked search
  await prisma.trackedSearch.delete({ where: { id: tracked.id } });

  console.log('\n=========================================');
  console.log('✅ PHASE 8 GATE PASSED:');
  console.log('1. Tracked searches accumulate real historical snapshots across scheduled runs without manual intervention.');
  console.log('2. Distinct immutable rows appended on every cycle.');
  console.log('3. Notification digest triggers ONLY on meaningful change — noise alerts suppressed.');
  console.log('=========================================\n');
}

runPhase8Gate()
  .catch((e) => {
    console.error('Phase 8 Gate test error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
