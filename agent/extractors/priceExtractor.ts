/**
 * Price Extractor Subsystem (docs/03-DATA-AND-AGENT.md §3.3 & docs/05-TESTING-AND-RELIABILITY.md §1)
 * Robust parser for Indian currency and formatted price strings.
 * Explicitly tested against:
 *   - ₹25,000
 *   - 25,000
 *   - 25k
 *   - ₹25.000
 *   - ₹25,000 + taxes
 *   - ₹1,25,000 (Lakhs notation)
 *   - 25000.50
 */

export interface ParsedPriceResult {
  amount: number | null;
  currency: string;
  isPlusTaxes: boolean;
  isValid: boolean;
  error?: string;
}

export function parse_price(raw: string | number | null | undefined): ParsedPriceResult {
  if (raw === null || raw === undefined) {
    return { amount: null, currency: 'INR', isPlusTaxes: false, isValid: false, error: 'Price is null or undefined' };
  }

  if (typeof raw === 'number') {
    if (isNaN(raw) || raw < 0) {
      return { amount: null, currency: 'INR', isPlusTaxes: false, isValid: false, error: 'Invalid numeric price' };
    }
    return { amount: raw, currency: 'INR', isPlusTaxes: false, isValid: true };
  }

  const str = String(raw).trim();
  if (!str) {
    return { amount: null, currency: 'INR', isPlusTaxes: false, isValid: false, error: 'Empty price string' };
  }

  // Detect currency (default INR, detect USD, EUR, etc.)
  let currency = 'INR';
  if (str.includes('$') || /USD/i.test(str)) currency = 'USD';
  else if (str.includes('€') || /EUR/i.test(str)) currency = 'EUR';
  else if (str.includes('£') || /GBP/i.test(str)) currency = 'GBP';

  // Detect "+ taxes" / "plus taxes" / "exclusive of taxes"
  const isPlusTaxes = /(\+|plus|excl|exclusive).*tax/i.test(str);

  // Clean string: remove currency symbols and text descriptors
  let cleaned = str
    .replace(/[₹$€£]/g, '')
    .replace(/\b(INR|USD|EUR|GBP|Rs\.?|Rupees)\b/gi, '')
    .replace(/(\+|plus).*$/i, '')
    .replace(/\b(per\s+night|\/night|nightly|avg|total)\b/gi, '')
    .trim();

  // Check shorthand "25k" or "25.5k"
  const kMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*k$/i);
  if (kMatch && kMatch[1]) {
    const val = parseFloat(kMatch[1]) * 1000;
    return { amount: val, currency, isPlusTaxes, isValid: true };
  }

  // Handle dot as thousands separator e.g. "25.000" when there are 3 trailing digits and no other comma
  if (/^\d{1,3}\.\d{3}$/.test(cleaned)) {
    cleaned = cleaned.replace('.', '');
  } else {
    // Standard comma-separated or Indian lakhs notation: "1,25,000" or "25,000.50"
    // Remove all commas
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) {
    return {
      amount: null,
      currency,
      isPlusTaxes,
      isValid: false,
      error: `Could not parse numeric price from "${raw}"`,
    };
  }

  return {
    amount: Math.round(parsed * 100) / 100,
    currency,
    isPlusTaxes,
    isValid: true,
  };
}
