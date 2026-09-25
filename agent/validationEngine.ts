import { NormalizedInventoryItem, ValidationEngineOutput, ValidationItemResult } from './types';
import { prisma } from '@/lib/prisma';

/**
 * Validation Engine Subsystem (docs/03-DATA-AND-AGENT.md §9–10 & docs/05-TESTING-AND-RELIABILITY.md §4)
 * Deterministic validation across dates, occupancy, currency, price consistency, duplicates, and anomalies.
 */
export async function validate_inventory(
  items: NormalizedInventoryItem[],
  options?: { checkHistoricalAnomalies?: boolean }
): Promise<ValidationEngineOutput> {
  const results: ValidationItemResult[] = [];
  const seenHashes = new Set<string>();
  const globalErrors: string[] = [];

  for (const item of items) {
    const errors: string[] = [];
    const anomalies: string[] = [];

    // 1. Date Validation
    if (isNaN(item.checkIn.getTime()) || isNaN(item.checkOut.getTime())) {
      errors.push('Invalid check-in or check-out date format');
    } else if (item.checkOut <= item.checkIn) {
      errors.push(`checkOut (${item.checkOut.toISOString()}) must be after checkIn (${item.checkIn.toISOString()})`);
    }

    // 2. Occupancy Validation
    if (item.adults < 1) {
      errors.push(`adults must be at least 1, received ${item.adults}`);
    }
    if (item.rooms < 1) {
      errors.push(`rooms must be at least 1, received ${item.rooms}`);
    }

    // 3. Currency Validation
    if (item.currency !== 'INR') {
      errors.push(`Expected INR currency for Taj domestic property, received "${item.currency}"`);
    }

    // 4. Price Sanity & Availability
    if (item.availabilityStatus === 'SOLD_OUT') {
      results.push({
        passed: true,
        state: 'UNAVAILABLE',
        reason: 'Room or property is sold out for the requested dates',
        anomalies: [],
        errors: [],
        item,
      });
      continue;
    }

    if (item.basePrice === null || item.pricePerNight <= 0) {
      errors.push('Price per night must be a positive number');
    }

    // 5. Price Consistency Validation (base + taxes + fees ≈ total when components are present)
    let isPartiallyVerified = false;
    let consistencyReason = '';

    if (item.basePrice !== null && item.taxAmount !== null && item.totalPrice !== null) {
      const diffMs = item.checkOut.getTime() - item.checkIn.getTime();
      const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      const expectedTotal = (item.basePrice * nights) + item.taxAmount + (item.feeAmount ?? 0);
      const diff = Math.abs(expectedTotal - item.totalPrice);
      const tolerance = Math.max(50, expectedTotal * 0.05); // 5% or ₹50 rounding tolerance

      if (diff > tolerance) {
        isPartiallyVerified = true;
        consistencyReason = `Total price (₹${item.totalPrice}) differs from computed sum (₹${expectedTotal}) by ₹${diff.toFixed(2)}`;
      }
    } else if (item.totalPrice === null || item.taxAmount === null) {
      isPartiallyVerified = true;
      consistencyReason = 'Total price or taxes were not fully broken down in the booking result';
    }

    // 6. Duplicate Detection (within the current batch)
    if (seenHashes.has(item.rawRecordHash)) {
      errors.push(`Duplicate observation detected for record hash ${item.rawRecordHash}`);
    } else {
      seenHashes.add(item.rawRecordHash);
    }

    // 7. Historical Anomaly Detection (e.g. >70% drop or >300% surge)
    let isAnomalous = false;
    if (options?.checkHistoricalAnomalies !== false && item.pricePerNight > 0) {
      try {
        const lastSnapshot = await prisma.priceSnapshot.findFirst({
          where: {
            hotelId: item.hotelId,
            room: { canonicalRoomName: item.canonicalRoomName },
            ratePlan: { canonicalRateName: item.canonicalRateName },
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
          },
          orderBy: { fetchedAt: 'desc' },
        });

        if (lastSnapshot) {
          const priorPrice = Number(lastSnapshot.pricePerNight);
          if (priorPrice > 0) {
            const ratio = item.pricePerNight / priorPrice;
            if (ratio < 0.3) {
              isAnomalous = true;
              anomalies.push(
                `ANOMALOUS PRICE DROP: Current price ₹${item.pricePerNight} is >70% below last verified observation ₹${priorPrice}`
              );
            } else if (ratio > 4.0) {
              isAnomalous = true;
              anomalies.push(
                `ANOMALOUS PRICE SURGE: Current price ₹${item.pricePerNight} is >300% above last verified observation ₹${priorPrice}`
              );
            }
          }
        }
      } catch (err) {
        // Non-blocking if DB query fails during offline tests
      }
    }

    // Determine final VerificationState per 03-DATA-AND-AGENT.md §10
    if (errors.length > 0) {
      results.push({
        passed: false,
        state: 'FAILED',
        reason: errors.join('; '),
        anomalies,
        errors,
        item,
      });
    } else if (isAnomalous) {
      results.push({
        passed: true,
        state: 'ANOMALOUS',
        reason: anomalies.join('; '),
        anomalies,
        errors: [],
        item,
      });
    } else if (isPartiallyVerified) {
      results.push({
        passed: true,
        state: 'PARTIALLY_VERIFIED',
        reason: consistencyReason,
        anomalies,
        errors: [],
        item,
      });
    } else {
      results.push({
        passed: true,
        state: 'VERIFIED',
        reason: 'Verified — total price matched extracted nightly rate and taxes',
        anomalies: [],
        errors: [],
        item,
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const anomaliesCount = results.filter((r) => r.state === 'ANOMALOUS').length;
  const allValid = results.length > 0 && results.every((r) => r.passed);

  return {
    allValid,
    items: results,
    errors: globalErrors,
    anomaliesCount,
    passedCount,
  };
}
