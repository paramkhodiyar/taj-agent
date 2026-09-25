import { RawBookingRecord } from '../types';
import { extract_meal_plan, extract_cancellation } from './policyExtractor';

/**
 * Rate Extractor Subsystem (docs/03-DATA-AND-AGENT.md §3.3 & §5)
 * Extracts canonical rate plan, meal plan, and cancellation terms.
 */

export interface ExtractedRatePlan {
  canonicalRateName: string;
  sourceRateName: string;
  rateCode?: string;
  mealPlan: string;
  cancellationPolicy: string;
  isFlexible: boolean;
}

export function extract_rates(raw: RawBookingRecord): ExtractedRatePlan {
  const sourceName = raw.sourceRateName || 'Standard Rate';
  const lower = sourceName.toLowerCase();

  const meal = extract_meal_plan(raw.rawMealPlan || raw.sourceRateName);
  const cancellation = extract_cancellation(raw.rawCancellationPolicy || raw.sourceRateName);

  let canonicalRateName = 'Best Available Rate';
  let rateCode: string | undefined = 'BAR';

  if (/advance purchase|early bird|non-refundable/i.test(lower)) {
    canonicalRateName = 'Advance Purchase Non-Refundable';
    rateCode = 'NREF';
  } else if (/experiential|dinner|map|half board/i.test(lower) || meal.hasDinner) {
    canonicalRateName = 'Taj Experiential Dining Rate';
    rateCode = 'MAP';
  } else if (/breakfast|bed & breakfast|cp/i.test(lower) || meal.hasBreakfast) {
    canonicalRateName = 'Breakfast Inclusive Rate';
    rateCode = 'CP';
  } else if (/member|neupass/i.test(lower)) {
    canonicalRateName = 'Taj NeuPass Member Rate';
    rateCode = 'MEMBER';
  }

  return {
    canonicalRateName,
    sourceRateName: sourceName.trim(),
    rateCode,
    mealPlan: meal.canonicalMealPlan,
    cancellationPolicy: cancellation.canonicalPolicy,
    isFlexible: cancellation.isFlexible,
  };
}
