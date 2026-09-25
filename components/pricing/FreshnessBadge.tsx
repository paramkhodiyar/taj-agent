import React from 'react';
import { FreshnessInfo } from '@/lib/freshness';

interface FreshnessBadgeProps {
  freshness: FreshnessInfo;
  source?: string;
  className?: string;
}

import Link from 'next/link';

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  freshness,
  source = 'Official Taj booking data',
  className = '',
}) => {
  const categoryStyles = {
    FRESH: 'bg-emerald-50 text-taj-status-verified border-emerald-200 hover:border-emerald-300',
    RECENT: 'bg-stone-50 text-taj-status-recent border-stone-200 hover:border-stone-300',
    STALE: 'bg-amber-50 text-taj-status-stale border-amber-200 hover:border-amber-300',
    OLD: 'bg-red-50 text-taj-status-failed border-red-200 hover:border-red-300',
  };

  const dotColors = {
    FRESH: 'bg-emerald-600',
    RECENT: 'bg-stone-600',
    STALE: 'bg-amber-600',
    OLD: 'bg-red-600',
  };

  return (
    <Link
      href="/transparency"
      title="How we verify Taj prices (tap to view pipeline)"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border transition-colors cursor-pointer ${categoryStyles[freshness.category]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[freshness.category]}`} />
      <span className="font-medium">{freshness.label}</span>
      <span className="text-taj-gray-warm">·</span>
      <span className="text-taj-gray-warm text-[11px] truncate hover:text-taj-burgundy">{source}</span>
      <span className="text-[10px] text-taj-gray-warm opacity-60 ml-0.5 hover:opacity-100">ⓘ</span>
    </Link>
  );
};
