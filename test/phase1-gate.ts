import { PrismaClient } from '@prisma/client';
import { prisma as extendedPrisma } from '../lib/prisma.js';

const rawPrisma = new PrismaClient();

async function runPhase1Gate() {
  console.log('--- Running Phase 1 Gate Verification ---');

  // Step 1: Query seeded hotel, room, and rate plan
  const hotel = await rawPrisma.hotel.findUnique({
    where: { id: 'taj-mahal-palace-mumbai' },
  });
  if (!hotel) throw new Error('Hotel taj-mahal-palace-mumbai not found');

  const room = await rawPrisma.room.findFirst({
    where: { hotelId: hotel.id, canonicalRoomName: 'Deluxe Room' },
  });
  if (!room) throw new Error('Deluxe Room for taj-mahal-palace-mumbai not found');

  const ratePlan = await rawPrisma.ratePlan.findFirst({
    where: { canonicalRateName: 'Best Available Rate' },
  });
  if (!ratePlan) throw new Error('Best Available Rate plan not found');

  const checkIn = new Date('2026-11-15T00:00:00.000Z');
  const checkOut = new Date('2026-11-17T00:00:00.000Z');

  // Clean up any test snapshots for this specific date test
  // (Direct SQL delete for test setup before testing immutability trigger)
  // Disable trigger temporarily for clean test state if needed, or query counts
  const beforeCount = await rawPrisma.priceSnapshot.count({
    where: {
      hotelId: hotel.id,
      roomId: room.id,
      ratePlanId: ratePlan.id,
      checkIn,
      checkOut,
    },
  });

  console.log(`Initial snapshot count for test parameters: ${beforeCount}`);

  // Step 2: Insert Observation 1 (e.g. at 10:00 AM)
  const time1 = new Date('2026-09-25T10:00:00.000Z');
  const snap1 = await rawPrisma.priceSnapshot.create({
    data: {
      hotelId: hotel.id,
      roomId: room.id,
      ratePlanId: ratePlan.id,
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      rooms: 1,
      currency: 'INR',
      basePrice: 25000,
      taxAmount: 4500,
      feeAmount: 0,
      totalPrice: 29500,
      pricePerNight: 25000,
      mealPlan: 'Room only',
      cancellationPolicy: 'Flexible cancellation',
      availabilityStatus: 'AVAILABLE',
      verificationState: 'VERIFIED',
      source: 'taj_official',
      fetchedAt: time1,
    },
  });
  console.log(`Inserted snapshot 1: id=${snap1.id}, price=${snap1.pricePerNight}, fetchedAt=${snap1.fetchedAt.toISOString()}`);

  // Step 3: Insert Observation 2 (e.g. at 14:00 PM) for EXACT same hotel, room, rate, checkIn, checkOut
  const time2 = new Date('2026-09-25T14:00:00.000Z');
  const snap2 = await rawPrisma.priceSnapshot.create({
    data: {
      hotelId: hotel.id,
      roomId: room.id,
      ratePlanId: ratePlan.id,
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      rooms: 1,
      currency: 'INR',
      basePrice: 24500,
      taxAmount: 4410,
      feeAmount: 0,
      totalPrice: 28910,
      pricePerNight: 24500,
      mealPlan: 'Room only',
      cancellationPolicy: 'Flexible cancellation',
      availabilityStatus: 'AVAILABLE',
      verificationState: 'VERIFIED',
      source: 'taj_official',
      fetchedAt: time2,
    },
  });
  console.log(`Inserted snapshot 2: id=${snap2.id}, price=${snap2.pricePerNight}, fetchedAt=${snap2.fetchedAt.toISOString()}`);

  // Step 4: Verify two rows exist, NEVER one
  const afterCount = await rawPrisma.priceSnapshot.count({
    where: {
      hotelId: hotel.id,
      roomId: room.id,
      ratePlanId: ratePlan.id,
      checkIn,
      checkOut,
    },
  });

  console.log(`Total snapshots after 2 inserts: ${afterCount}`);
  if (afterCount !== beforeCount + 2) {
    throw new Error(`PHASE GATE FAILED: Expected ${beforeCount + 2} snapshots, but found ${afterCount}`);
  }

  // Step 5: Test DB-level trigger against UPDATE
  console.log('Testing DB-level trigger: Prohibiting UPDATE on PriceSnapshot...');
  let updateBlocked = false;
  try {
    await rawPrisma.$executeRawUnsafe(
      `UPDATE "PriceSnapshot" SET "pricePerNight" = 20000 WHERE id = '${snap1.id}'`
    );
  } catch (err: any) {
    if (err.message.includes('PriceSnapshot is strictly immutable')) {
      updateBlocked = true;
      console.log('✓ DB trigger successfully rejected UPDATE as expected:', err.message.split('\n')[0]);
    } else {
      throw err;
    }
  }
  if (!updateBlocked) {
    throw new Error('PHASE GATE FAILED: Direct SQL UPDATE was not blocked by DB trigger!');
  }

  // Step 6: Test DB-level trigger against DELETE
  console.log('Testing DB-level trigger: Prohibiting DELETE on PriceSnapshot...');
  let deleteBlocked = false;
  try {
    await rawPrisma.$executeRawUnsafe(
      `DELETE FROM "PriceSnapshot" WHERE id = '${snap1.id}'`
    );
  } catch (err: any) {
    if (err.message.includes('PriceSnapshot is strictly immutable')) {
      deleteBlocked = true;
      console.log('✓ DB trigger successfully rejected DELETE as expected:', err.message.split('\n')[0]);
    } else {
      throw err;
    }
  }
  if (!deleteBlocked) {
    throw new Error('PHASE GATE FAILED: Direct SQL DELETE was not blocked by DB trigger!');
  }

  // Step 7: Test ORM-level client wrapper protection
  console.log('Testing ORM-level wrapper: Prohibiting Prisma update()...');
  let ormBlocked = false;
  try {
    await (extendedPrisma.priceSnapshot as any).update({
      where: { id: snap1.id },
      data: { pricePerNight: 19000 },
    });
  } catch (err: any) {
    if (err.message.includes('CRITICAL VIOLATION: PriceSnapshot is strictly immutable')) {
      ormBlocked = true;
      console.log('✓ ORM wrapper successfully blocked update():', err.message);
    } else {
      throw err;
    }
  }
  if (!ormBlocked) {
    throw new Error('PHASE GATE FAILED: Prisma update() was not blocked by extended client!');
  }

  console.log('\n=========================================');
  console.log('✅ PHASE 1 GATE PASSED:');
  console.log('1. Two snapshots at different timestamps produce two distinct immutable rows.');
  console.log('2. Direct SQL UPDATE is blocked by PostgreSQL trigger.');
  console.log('3. Direct SQL DELETE is blocked by PostgreSQL trigger.');
  console.log('4. Application ORM layer prohibits mutating snapshots.');
  console.log('=========================================\n');
}

runPhase1Gate()
  .catch((e) => {
    console.error('Phase 1 Gate test error:', e);
    process.exit(1);
  })
  .finally(() => rawPrisma.$disconnect());
