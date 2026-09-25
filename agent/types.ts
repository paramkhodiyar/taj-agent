export interface SearchRequest {
  checkIn: string | Date; // ISO string or Date
  checkOut: string | Date;
  adults: number;
  children?: number;
  rooms?: number;
  hotelId?: string; // Optional: specific hotel or all
}

export interface ResolvedProperty {
  hotelId: string;
  canonicalName: string;
  slug: string;
  city: string;
  state: string;
  officialBookingUrl: string | null;
  source: 'taj_official';
}

export interface RawBookingRecord {
  sourceRoomName: string;
  sourceRateName: string;
  rawPrice: string | number; // e.g. "₹25,000", "25,000", "25k"
  rawTax?: string | number;
  rawFee?: string | number;
  rawTotal?: string | number;
  rawMealPlan?: string;
  rawCancellationPolicy?: string;
  rawAvailability?: string;
  sourceUrl?: string;
}

export interface RawBookingResponse {
  hotelId: string;
  timestamp: Date;
  durationMs: number;
  statusCode: number;
  records: RawBookingRecord[];
  rawPayload?: any;
  error?: string;
}

export interface NormalizedInventoryItem {
  hotelId: string;
  canonicalRoomName: string;
  sourceRoomName: string;
  canonicalRateName: string;
  sourceRateName: string;
  rateCode?: string;
  mealPlan: string;
  cancellationPolicy: string;
  isFlexible: boolean;
  currency: string;
  basePrice: number | null;
  taxAmount: number | null;
  feeAmount: number | null;
  totalPrice: number | null;
  pricePerNight: number;
  availabilityStatus: 'AVAILABLE' | 'SOLD_OUT' | 'CALL_HOTEL';
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  source: 'taj_official';
  sourceUrl?: string;
  rawRecordHash: string;
}

export type VerificationState =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'ANOMALOUS'
  | 'FAILED'
  | 'UNAVAILABLE';

export interface ValidationItemResult {
  passed: boolean;
  state: VerificationState;
  reason: string;
  anomalies: string[];
  errors: string[];
  item: NormalizedInventoryItem;
}

export interface ValidationEngineOutput {
  allValid: boolean;
  items: ValidationItemResult[];
  errors: string[];
  anomaliesCount: number;
  passedCount: number;
}
