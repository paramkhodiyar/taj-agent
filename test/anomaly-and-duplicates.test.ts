import { normalize_inventory } from '../agent/normalization';
import { validate_inventory } from '../agent/validationEngine';
import { prisma } from '../lib/prisma';

export async function testAnomalyAndDuplicates() {
  console.log('Testing Anomaly Swing Detection & Duplicate Detection (05-TESTING-AND-RELIABILITY.md §4)...');

  const hotelId = 'taj-palace-new-delhi';
  const checkIn = new Date('2026-11-10');
  const checkOut = new Date('2026-11-12');

  // Find or create room and rate
  const room = await prisma.room.findFirst({ where: { hotelId, canonicalRoomName: 'Deluxe Room' } });
  const rate = await prisma.ratePlan.findFirst({ where: { canonicalRateName: 'Best Available Rate' } });
  if (!room || !rate) throw new Error('Room or rate plan not found in database');

  // Insert baseline historical observation: ₹25,000
  const baselineSnap = await prisma.priceSnapshot.create({
    data: {
      hotelId,
      roomId: room.id,
      ratePlanId: rate.id,
      checkIn,
      checkOut,
      adults: 2,
      pricePerNight: 25000,
      currency: 'INR',
      verificationState: 'VERIFIED',
      source: 'taj_official',
      fetchedAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  });

  // Test 1: Anomaly Swing Detection (>70% drop: ₹2,500 instead of ₹25,000)
  console.log('\nTest 1: Testing 90% price drop swing (₹2,500 vs baseline ₹25,000)...');
  const anomalousItem = normalize_inventory(
    {
      sourceRoomName: 'Deluxe Room',
      sourceRateName: 'Best Available Rate',
      rawPrice: '2,500', // 90% drop!
      rawAvailability: 'AVAILABLE',
    },
    hotelId,
    { checkIn, checkOut, adults: 2 }
  );

  const anomalyOutput = await validate_inventory([anomalousItem], { checkHistoricalAnomalies: true });
  const anomalyRes = anomalyOutput.items[0];

  if (anomalyRes.state !== 'ANOMALOUS') {
    throw new Error(`Expected ANOMALOUS state for >70% price swing, got "${anomalyRes.state}"`);
  }
  console.log(`✓ Anomalous swing correctly flagged as ANOMALOUS: "${anomalyRes.reason}"`);

  // Test 2: Duplicate Observation Detection in same payload batch
  console.log('\nTest 2: Testing Duplicate Detection within the same batch...');
  const duplicateBatch = [
    normalize_inventory(
      { sourceRoomName: 'Deluxe Room', sourceRateName: 'Best Available Rate', rawPrice: '25,000' },
      hotelId,
      { checkIn, checkOut, adults: 2 }
    ),
    normalize_inventory(
      { sourceRoomName: 'Deluxe Room', sourceRateName: 'Best Available Rate', rawPrice: '25,000' },
      hotelId,
      { checkIn, checkOut, adults: 2 }
    ),
  ];

  const duplicateOutput = await validate_inventory(duplicateBatch, { checkHistoricalAnomalies: false });
  const dupFirst = duplicateOutput.items[0];
  const dupSecond = duplicateOutput.items[1];

  if (dupFirst.state === 'FAILED' || dupSecond.state !== 'FAILED') {
    throw new Error('Duplicate detection failed: second identical record should be flagged as FAILED duplicate');
  }
  console.log(`✓ Duplicate detected and flagged: "${dupSecond.reason}"`);

  // Test 3: Base + Taxes + Fees != Total Consistency Check
  console.log('\nTest 3: Testing Price Consistency (base + taxes ≈ total)...');
  const inconsistentItem = normalize_inventory(
    {
      sourceRoomName: 'Deluxe Room',
      sourceRateName: 'Best Available Rate',
      rawPrice: '25,000',
      rawTax: '4,500',
      rawTotal: '50,000', // Inconsistent: 2 nights at 25k is 50k base + 4.5k tax = 54.5k total!
    },
    hotelId,
    { checkIn, checkOut, adults: 2 }
  );

  const inconsistencyOutput = await validate_inventory([inconsistentItem], { checkHistoricalAnomalies: false });
  const incRes = inconsistencyOutput.items[0];

  if (incRes.state !== 'PARTIALLY_VERIFIED') {
    throw new Error(`Expected PARTIALLY_VERIFIED for tax/total mismatch, got "${incRes.state}"`);
  }
  console.log(`✓ Price inconsistency correctly flagged as PARTIALLY_VERIFIED: "${incRes.reason}"`);
}

if (process.argv[1]?.includes('anomaly-and-duplicates.test')) {
  testAnomalyAndDuplicates().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
