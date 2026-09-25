import { prisma } from '@/lib/prisma';
import { ValidationItemResult } from './types';

export interface SnapshotWriteResult {
  savedCount: number;
  snapshotIds: string[];
  skippedCount: number;
}

/**
 * Snapshot Writer Subsystem (docs/03-DATA-AND-AGENT.md §6, §7 & docs/04-API-AND-SECURITY.md §2)
 * Persists validated observations as immutable, append-only rows in PostgreSQL.
 * Never updates or overwrites existing snapshots.
 */
export async function persist_snapshot(
  validationResults: ValidationItemResult[],
  fetchRunId?: string,
  searchId?: string
): Promise<SnapshotWriteResult> {
  const snapshotIds: string[] = [];
  let skippedCount = 0;

  for (const res of validationResults) {
    // Only persist if validation passed or flagged as anomalous/unavailable with known reason
    // Do NOT persist hard FAILED items as valid prices
    if (!res.passed || res.state === 'FAILED') {
      skippedCount++;
      continue;
    }

    const { item } = res;

    // Resolve or upsert Room
    const room = await prisma.room.upsert({
      where: {
        hotelId_canonicalRoomName: {
          hotelId: item.hotelId,
          canonicalRoomName: item.canonicalRoomName,
        },
      },
      update: {
        sourceRoomName: item.sourceRoomName,
      },
      create: {
        hotelId: item.hotelId,
        canonicalRoomName: item.canonicalRoomName,
        sourceRoomName: item.sourceRoomName,
        capacityAdults: item.adults,
        capacityChildren: item.children,
      },
    });

    // Resolve or upsert RatePlan
    const ratePlan = await prisma.ratePlan.upsert({
      where: {
        canonicalRateName_mealPlan_cancellationPolicy: {
          canonicalRateName: item.canonicalRateName,
          mealPlan: item.mealPlan,
          cancellationPolicy: item.cancellationPolicy,
        },
      },
      update: {
        sourceRateName: item.sourceRateName,
        isFlexible: item.isFlexible,
      },
      create: {
        canonicalRateName: item.canonicalRateName,
        sourceRateName: item.sourceRateName,
        rateCode: item.rateCode,
        mealPlan: item.mealPlan,
        cancellationPolicy: item.cancellationPolicy,
        isFlexible: item.isFlexible,
      },
    });

    // If SOLD_OUT, record in AvailabilitySnapshot
    if (item.availabilityStatus === 'SOLD_OUT') {
      await prisma.availabilitySnapshot.create({
        data: {
          hotelId: item.hotelId,
          roomId: room.id,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          status: 'SOLD_OUT',
          source: item.source,
          fetchRunId: fetchRunId ?? null,
        },
      });
      continue;
    }

    // Persist immutable PriceSnapshot
    const snapshot = await prisma.priceSnapshot.create({
      data: {
        hotelId: item.hotelId,
        roomId: room.id,
        ratePlanId: ratePlan.id,
        searchId: searchId ?? null,
        fetchRunId: fetchRunId ?? null,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        adults: item.adults,
        children: item.children,
        rooms: item.rooms,
        currency: item.currency,
        basePrice: item.basePrice,
        taxAmount: item.taxAmount,
        feeAmount: item.feeAmount,
        totalPrice: item.totalPrice,
        pricePerNight: item.pricePerNight,
        mealPlan: item.mealPlan,
        cancellationPolicy: item.cancellationPolicy,
        availabilityStatus: item.availabilityStatus,
        verificationState: res.state,
        verificationReason: res.reason,
        source: item.source,
        sourceUrl: item.sourceUrl,
        rawRecordHash: item.rawRecordHash,
      },
    });

    snapshotIds.push(snapshot.id);
  }

  return {
    savedCount: snapshotIds.length,
    snapshotIds,
    skippedCount,
  };
}
