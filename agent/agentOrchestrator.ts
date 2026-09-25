import { prisma } from '@/lib/prisma';
import { SearchRequest, ResolvedProperty } from './types';
import { resolve_property } from './propertyResolver';
import { fetch_booking_inventory, BookingFetchOptions } from './bookingFetcher';
import { normalize_inventory } from './normalization';
import { validate_inventory } from './validationEngine';
import { persist_snapshot } from './snapshotWriter';

export interface OrchestratorRunOptions {
  searchId?: string;
  fetchRunId?: string;
  fetchOptions?: BookingFetchOptions;
  concurrency?: number;
}

export interface OrchestrationResult {
  fetchRunId: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  requestedHotels: number;
  successfulHotels: number;
  failedHotels: number;
  totalSnapshotsPersisted: number;
  hotelOutcomes: Array<{
    hotelId: string;
    hotelName: string;
    status: 'COMPLETED' | 'FAILED';
    snapshotsCount: number;
    error?: string;
  }>;
}

/**
 * Agent Orchestrator (docs/03-DATA-AND-AGENT.md §1–2 & docs/04-API-AND-SECURITY.md §2)
 * Coordinates the full deterministic pipeline across all requested properties.
 * Creates immutable audit records (FetchRun, FetchRunHotel, AgentEvent, AgentError).
 * Never mutates previous historical snapshots on failure.
 */
export async function runAgentOrchestrator(
  search: SearchRequest,
  options?: OrchestratorRunOptions
): Promise<OrchestrationResult> {
  const agentVersion = '1.0.0';
  const extractorVersion = 'taj-booking-v1';

  // Step 1: Resolve Target Properties
  const targetHotels: ResolvedProperty[] = await resolve_property(
    search.hotelId ? { hotelId: search.hotelId } : undefined
  );

  if (targetHotels.length === 0) {
    throw new Error(`Property Resolver could not resolve target hotel: ${search.hotelId || 'all'}`);
  }

  // Step 2: Initialize FetchRun
  const fetchRun = await prisma.fetchRun.create({
    data: {
      id: options?.fetchRunId,
      searchId: options?.searchId,
      status: 'RUNNING',
      startedAt: new Date(),
      requestedHotels: targetHotels.length,
      successfulHotels: 0,
      failedHotels: 0,
      searchParameters: {
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        adults: search.adults,
        children: search.children ?? 0,
        rooms: search.rooms ?? 1,
        hotelId: search.hotelId ?? 'all',
      },
      agentVersion,
      extractorVersion,
    },
  });

  await prisma.agentEvent.create({
    data: {
      fetchRunId: fetchRun.id,
      eventType: 'FETCH_RUN_STARTED',
      severity: 'INFO',
      message: `Started fetch run ${fetchRun.id} for ${targetHotels.length} properties`,
    },
  });

  const hotelOutcomes: OrchestrationResult['hotelOutcomes'] = [];
  let successfulHotels = 0;
  let failedHotels = 0;
  let totalSnapshotsPersisted = 0;

  // Process properties with controlled batch concurrency per 02-SYSTEM-ARCHITECTURE.md §6
  const concurrency = options?.concurrency ?? parseInt(process.env.AGENT_CONCURRENCY || '5', 10);
  
  for (let i = 0; i < targetHotels.length; i += concurrency) {
    const batch = targetHotels.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (hotel) => {
        const fetchRunHotel = await prisma.fetchRunHotel.create({
          data: {
            fetchRunId: fetchRun.id,
            hotelId: hotel.hotelId,
            status: 'RUNNING',
            startedAt: new Date(),
          },
        });

        try {
          // Subsystem A: Booking Fetcher
          const rawResponse = await fetch_booking_inventory(hotel, search, options?.fetchOptions);

          if (rawResponse.error || rawResponse.statusCode >= 400) {
            throw new Error(rawResponse.error || `HTTP ${rawResponse.statusCode} from booking source`);
          }

          // Subsystem B: Normalization Layer
          const normalizedItems = rawResponse.records.map((raw) =>
            normalize_inventory(raw, hotel.hotelId, search)
          );

          // Subsystem C: Validation Engine
          const validationOutput = await validate_inventory(normalizedItems);

          // Subsystem D: Snapshot Writer (Immutable Persistence)
          const writeResult = await persist_snapshot(
            validationOutput.items,
            fetchRun.id,
            options?.searchId
          );

          totalSnapshotsPersisted += writeResult.savedCount;
          successfulHotels++;

          await prisma.fetchRunHotel.update({
            where: { id: fetchRunHotel.id },
            data: {
              status: 'COMPLETED',
              roomsFound: normalizedItems.length,
              ratesFound: normalizedItems.length,
              validationPassed: validationOutput.allValid,
              validationMessage: `Validated ${validationOutput.passedCount} items. ${validationOutput.anomaliesCount} anomalies flagged.`,
              rawResponse: (rawResponse.rawPayload as any) ?? {},
              completedAt: new Date(),
            },
          });

          await prisma.agentEvent.create({
            data: {
              fetchRunId: fetchRun.id,
              hotelId: hotel.hotelId,
              eventType: 'FETCH_HOTEL_SUCCESS',
              severity: 'INFO',
              message: `Fetched ${hotel.canonicalName}: ${writeResult.savedCount} snapshots persisted.`,
            },
          });

          hotelOutcomes.push({
            hotelId: hotel.hotelId,
            hotelName: hotel.canonicalName,
            status: 'COMPLETED',
            snapshotsCount: writeResult.savedCount,
          });
        } catch (err: any) {
          failedHotels++;

          await prisma.fetchRunHotel.update({
            where: { id: fetchRunHotel.id },
            data: {
              status: 'FAILED',
              error: err.message,
              completedAt: new Date(),
            },
          });

          await prisma.agentError.create({
            data: {
              fetchRunId: fetchRun.id,
              hotelId: hotel.hotelId,
              errorCode: 'FETCH_ERROR',
              message: err.message,
              stackTrace: err.stack,
            },
          });

          hotelOutcomes.push({
            hotelId: hotel.hotelId,
            hotelName: hotel.canonicalName,
            status: 'FAILED',
            snapshotsCount: 0,
            error: err.message,
          });
        }
      })
    );
  }

  // Determine final run status
  let finalStatus: OrchestrationResult['status'] = 'COMPLETED';
  if (failedHotels > 0 && successfulHotels > 0) {
    finalStatus = 'PARTIAL';
  } else if (failedHotels > 0 && successfulHotels === 0) {
    finalStatus = 'FAILED';
  }

  await prisma.fetchRun.update({
    where: { id: fetchRun.id },
    data: {
      status: finalStatus,
      successfulHotels,
      failedHotels,
      completedAt: new Date(),
    },
  });

  return {
    fetchRunId: fetchRun.id,
    status: finalStatus,
    requestedHotels: targetHotels.length,
    successfulHotels,
    failedHotels,
    totalSnapshotsPersisted,
    hotelOutcomes,
  };
}
