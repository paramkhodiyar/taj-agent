import crypto from 'crypto';
import { RawBookingRecord, NormalizedInventoryItem, SearchRequest } from './types';
import { extract_rooms } from './extractors/roomExtractor';
import { extract_rates } from './extractors/rateExtractor';
import { parse_price } from './extractors/priceExtractor';
import { extract_availability } from './extractors/availabilityExtractor';

/**
 * Normalization Layer (docs/03-DATA-AND-AGENT.md §5 & docs/04-API-AND-SECURITY.md §2)
 * Converts raw booking extractions into canonical inventory records while
 * preserving source labels, raw hashes, and search parameters.
 */
export function normalize_inventory(
  rawRecord: RawBookingRecord,
  hotelId: string,
  search: SearchRequest
): NormalizedInventoryItem {
  const room = extract_rooms(rawRecord);
  const rate = extract_rates(rawRecord);

  const priceResult = parse_price(rawRecord.rawPrice);
  const taxResult = parse_price(rawRecord.rawTax);
  const feeResult = parse_price(rawRecord.rawFee);
  const totalResult = parse_price(rawRecord.rawTotal);

  const checkInDate = new Date(search.checkIn);
  const checkOutDate = new Date(search.checkOut);

  // Compute stay duration in nights (at least 1)
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  let basePrice = priceResult.amount;
  let taxAmount = taxResult.amount;
  let feeAmount = feeResult.amount;
  let totalPrice = totalResult.amount;
  let pricePerNight = basePrice ?? 0;

  // Compute 18% GST (standard Indian luxury hospitality tax) and comprehensive total
  if (basePrice !== null) {
    if (taxAmount === null || taxAmount === 0) {
      taxAmount = Math.round(basePrice * 0.18 * nights);
    } else if (nights > 1 && Math.abs(taxAmount - Math.round(basePrice * 0.18)) <= 50) {
      // taxAmount was provided on a per-night basis, scale to full stay
      taxAmount = taxAmount * nights;
    }

    if (totalPrice === null) {
      totalPrice = (basePrice * nights) + taxAmount + (feeAmount ?? 0);
    } else if (nights > 1 && Math.abs(totalPrice - (basePrice + Math.round(taxAmount / nights))) <= 100) {
      // totalPrice was provided on a per-night basis, scale to full stay
      totalPrice = (basePrice * nights) + taxAmount + (feeAmount ?? 0);
    }
  }

  // Hash the raw record contents for duplicate detection & auditability
  const hashPayload = JSON.stringify({
    hotelId,
    room: rawRecord.sourceRoomName,
    rate: rawRecord.sourceRateName,
    price: rawRecord.rawPrice,
    tax: rawRecord.rawTax,
    total: rawRecord.rawTotal,
    mealPlan: rawRecord.rawMealPlan,
    checkIn: checkInDate.toISOString(),
    checkOut: checkOutDate.toISOString(),
    adults: search.adults,
  });
  const rawRecordHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

  const availability = extract_availability(rawRecord.rawAvailability);
  const resolvedMealPlan = rawRecord.rawMealPlan?.trim() || rate.mealPlan;

  return {
    hotelId,
    canonicalRoomName: room.canonicalRoomName,
    sourceRoomName: room.sourceRoomName,
    canonicalRateName: rate.canonicalRateName,
    sourceRateName: rate.sourceRateName,
    rateCode: rate.rateCode,
    mealPlan: resolvedMealPlan,
    cancellationPolicy: rate.cancellationPolicy,
    isFlexible: rate.isFlexible,
    currency: priceResult.currency || 'INR',
    basePrice,
    taxAmount,
    feeAmount,
    totalPrice,
    pricePerNight,
    availabilityStatus: availability,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    adults: search.adults,
    children: search.children ?? 0,
    rooms: search.rooms ?? 1,
    source: 'taj_official',
    sourceUrl: rawRecord.sourceUrl,
    rawRecordHash,
  };
}
