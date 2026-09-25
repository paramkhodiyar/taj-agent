import { prisma } from '../lib/prisma';
import { runAgentOrchestrator } from '../agent/agentOrchestrator';

export interface NotificationDigestItem {
  trackedSearchId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  priorPrice: number;
  currentPrice: number;
  priceDrop: number;
  pctDrop: number;
  leadRoom: string;
  ratePlan: string;
  recipientEmail?: string | null;
  snapshotId: string;
  fetchRunId: string;
}

export interface ScheduledCollectionResult {
  startedAt: string;
  completedAt: string;
  trackedSearchesProcessed: number;
  newSnapshotsCount: number;
  digestsGenerated: NotificationDigestItem[];
}

/**
 * Scheduled Collector Worker (docs/03-DATA-AND-AGENT.md §11 & docs/06-DEPLOYMENT-AND-OPERATIONS.md §2–3)
 * Runs against all active Tracked Searches, invokes the Agent pipeline,
 * and triggers notification digests ONLY on meaningful changes (price drops or threshold triggers).
 */
export async function runScheduledCollector(): Promise<ScheduledCollectionResult> {
  const startTime = new Date();
  const digests: NotificationDigestItem[] = [];
  let totalNewSnapshots = 0;

  // 1. Fetch active tracked searches
  const activeSearches = await prisma.trackedSearch.findMany({
    where: { isActive: true },
    include: { hotel: true },
  });

  for (const tracked of activeSearches) {
    // Check prior cheapest verified price before run
    const priorCheapest = await prisma.priceSnapshot.findFirst({
      where: {
        hotelId: tracked.hotelId ?? undefined,
        checkIn: tracked.checkIn,
        checkOut: tracked.checkOut,
        adults: tracked.adults,
        availabilityStatus: 'AVAILABLE',
        verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
      },
      orderBy: { pricePerNight: 'asc' },
      include: { hotel: true, room: true, ratePlan: true },
    });

    const priorPrice = priorCheapest ? Number(priorCheapest.pricePerNight) : null;

    // 2. Execute Agent Orchestrator for this tracked search
    const runResult = await runAgentOrchestrator({
      checkIn: tracked.checkIn,
      checkOut: tracked.checkOut,
      adults: tracked.adults,
      children: tracked.children,
      rooms: tracked.rooms,
      hotelId: tracked.hotelId ?? undefined,
    });

    totalNewSnapshots += runResult.totalSnapshotsPersisted;

    // 3. Query new cheapest verified price after fetch
    const currentCheapest = await prisma.priceSnapshot.findFirst({
      where: {
        hotelId: tracked.hotelId ?? undefined,
        checkIn: tracked.checkIn,
        checkOut: tracked.checkOut,
        adults: tracked.adults,
        fetchRunId: runResult.fetchRunId,
        availabilityStatus: 'AVAILABLE',
        verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
      },
      orderBy: { pricePerNight: 'asc' },
      include: { hotel: true, room: true, ratePlan: true },
    });

    if (currentCheapest) {
      const curPrice = Number(currentCheapest.pricePerNight);
      let isMeaningfulChange = false;
      let priceDrop = 0;
      let pctDrop = 0;

      // Meaningful change rule per 06-DEPLOYMENT-AND-OPERATIONS.md §3:
      // (1) Price crossed below user target threshold for the first time
      const isBelowThreshold = !!(tracked.targetPriceThreshold && curPrice <= Number(tracked.targetPriceThreshold));
      const wasAlreadyBelowThreshold = !!(tracked.lastNotifiedAt && priorPrice !== null && tracked.targetPriceThreshold && priorPrice <= Number(tracked.targetPriceThreshold));

      if (isBelowThreshold && !wasAlreadyBelowThreshold) {
        isMeaningfulChange = true;
      }

      // (2) Meaningful price drop relative to prior observation (>= ₹1,000 or >= 3%)
      if (priorPrice !== null && curPrice < priorPrice) {
        priceDrop = priorPrice - curPrice;
        pctDrop = Math.round((priceDrop / priorPrice) * 100);
        if (priceDrop >= 1000 || pctDrop >= 3) {
          isMeaningfulChange = true;
        }
      }

      // If meaningful change, produce digest item and update lastNotifiedAt
      if (isMeaningfulChange) {
        digests.push({
          trackedSearchId: tracked.id,
          hotelName: currentCheapest.hotel.canonicalName,
          checkIn: tracked.checkIn.toISOString().split('T')[0],
          checkOut: tracked.checkOut.toISOString().split('T')[0],
          priorPrice: priorPrice ?? curPrice,
          currentPrice: curPrice,
          priceDrop,
          pctDrop,
          leadRoom: currentCheapest.room.canonicalRoomName,
          ratePlan: currentCheapest.ratePlan.canonicalRateName,
          recipientEmail: tracked.notifyEmail,
          snapshotId: currentCheapest.id,
          fetchRunId: runResult.fetchRunId,
        });

        await prisma.trackedSearch.update({
          where: { id: tracked.id },
          data: {
            lastCheckedAt: new Date(),
            lastNotifiedAt: new Date(),
          },
        });
      } else {
        await prisma.trackedSearch.update({
          where: { id: tracked.id },
          data: {
            lastCheckedAt: new Date(),
          },
        });
      }
    }
  }

  return {
    startedAt: startTime.toISOString(),
    completedAt: new Date().toISOString(),
    trackedSearchesProcessed: activeSearches.length,
    newSnapshotsCount: totalNewSnapshots,
    digestsGenerated: digests,
  };
}
