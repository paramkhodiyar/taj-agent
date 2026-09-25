/**
 * Availability Extractor Subsystem (docs/03-DATA-AND-AGENT.md §3.3)
 */

export type AvailabilityStatus = 'AVAILABLE' | 'SOLD_OUT' | 'CALL_HOTEL';

export function extract_availability(rawText?: string): AvailabilityStatus {
  if (!rawText) return 'AVAILABLE';

  const text = rawText.toLowerCase();

  if (/sold out|no rooms available|fully booked|unavailable/i.test(text)) {
    return 'SOLD_OUT';
  }

  if (/call hotel|contact hotel|inquire|on request/i.test(text)) {
    return 'CALL_HOTEL';
  }

  return 'AVAILABLE';
}
