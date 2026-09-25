/**
 * Data Freshness Model (docs/03-DATA-AND-AGENT.md §18 & docs/01-PRODUCT-AND-UI.md §3.5 & §7)
 */

export type FreshnessCategory = 'FRESH' | 'RECENT' | 'STALE' | 'OLD';

export interface FreshnessInfo {
  category: FreshnessCategory;
  ageMinutes: number;
  label: string; // Plain-language copy matching 01-PRODUCT-AND-UI.md §7
  timestamp: string; // ISO string
  isStale: boolean;
}

export function computeFreshness(date: Date | string | null | undefined): FreshnessInfo {
  if (!date) {
    return {
      category: 'OLD',
      ageMinutes: Infinity,
      label: 'Not verified yet',
      timestamp: '',
      isStale: true,
    };
  }

  const observationTime = new Date(date).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.round((now - observationTime) / 60000));

  let category: FreshnessCategory = 'FRESH';
  let label = '';

  if (diffMinutes < 1) {
    category = 'FRESH';
    label = 'Verified just now';
  } else if (diffMinutes <= 15) {
    category = 'FRESH';
    label = `Verified ${diffMinutes} min ago`;
  } else if (diffMinutes <= 120) {
    category = 'RECENT';
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    label = hours > 0 ? `Verified ${hours}h ${mins}m ago` : `Verified ${mins} min ago`;
  } else if (diffMinutes <= 1440) {
    category = 'STALE';
    const hours = Math.round(diffMinutes / 60);
    label = `Last verified ${hours} hours ago`;
  } else {
    category = 'OLD';
    const days = Math.round(diffMinutes / 1440);
    label = `Last verified ${days} day${days > 1 ? 's' : ''} ago`;
  }

  return {
    category,
    ageMinutes: diffMinutes,
    label,
    timestamp: new Date(observationTime).toISOString(),
    isStale: category === 'STALE' || category === 'OLD',
  };
}
