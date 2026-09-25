/**
 * Policy Extractor Subsystem (docs/03-DATA-AND-AGENT.md §3.3)
 * Normalizes meal plans and cancellation policies from raw booking text.
 */

export interface ParsedMealPlan {
  canonicalMealPlan: string;
  hasBreakfast: boolean;
  hasDinner: boolean;
}

export function extract_meal_plan(rawText?: string): ParsedMealPlan {
  if (!rawText || !rawText.trim()) {
    return {
      canonicalMealPlan: 'Room only',
      hasBreakfast: false,
      hasDinner: false,
    };
  }

  const text = rawText.toLowerCase();

  const hasDinner = /dinner|half board|map\b/i.test(text);
  const hasBreakfast = /breakfast|bed & breakfast|buffet|cp\b/i.test(text);

  if (hasDinner && hasBreakfast) {
    return {
      canonicalMealPlan: 'Breakfast & Dinner included',
      hasBreakfast: true,
      hasDinner: true,
    };
  }

  if (hasBreakfast) {
    return {
      canonicalMealPlan: 'Breakfast included',
      hasBreakfast: true,
      hasDinner: false,
    };
  }

  if (/room only|ep\b|european plan/i.test(text)) {
    return {
      canonicalMealPlan: 'Room only',
      hasBreakfast: false,
      hasDinner: false,
    };
  }

  // Preserve descriptive raw text if recognized
  return {
    canonicalMealPlan: rawText.trim(),
    hasBreakfast: false,
    hasDinner: false,
  };
}

export interface ParsedCancellationPolicy {
  canonicalPolicy: string;
  isFlexible: boolean;
}

export function extract_cancellation(rawText?: string): ParsedCancellationPolicy {
  if (!rawText || !rawText.trim()) {
    return {
      canonicalPolicy: 'Flexible cancellation',
      isFlexible: true,
    };
  }

  const text = rawText.toLowerCase();

  if (/non-refundable|non refundable|no refund|100% cancellation fee/i.test(text)) {
    return {
      canonicalPolicy: 'Non-refundable',
      isFlexible: false,
    };
  }

  if (/free cancellation|refundable|flexible/i.test(text)) {
    // Check cutoff hours if available
    const hoursMatch = text.match(/(\d+)\s*(?:hours|hrs)/i);
    if (hoursMatch) {
      return {
        canonicalPolicy: `Free cancellation up to ${hoursMatch[1]}h prior`,
        isFlexible: true,
      };
    }
    const daysMatch = text.match(/(\d+)\s*(?:days|day)/i);
    if (daysMatch) {
      return {
        canonicalPolicy: `Free cancellation up to ${daysMatch[1]} days prior`,
        isFlexible: true,
      };
    }
    return {
      canonicalPolicy: 'Flexible cancellation',
      isFlexible: true,
    };
  }

  return {
    canonicalPolicy: rawText.trim(),
    isFlexible: !/non-refundable/i.test(text),
  };
}
