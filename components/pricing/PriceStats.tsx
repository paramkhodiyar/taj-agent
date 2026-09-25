import React from 'react';
import { PriceDisplay } from './PriceDisplay';

interface PriceStatsProps {
  stats: {
    observationCount: number;
    daysWindow: number;
    current: number;
    low: number;
    high: number;
    mean: number;
    median: number;
    pctFromMedian: number;
    positionLabel: string;
  } | null;
}

export const PriceStats: React.FC<PriceStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="border border-taj-gray-border bg-white p-6 text-center text-xs text-taj-gray-warm">
        Insufficient historical observations to compute 30-day analytics.
      </div>
    );
  }

  return (
    <div className="border border-taj-gray-border bg-white p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taj-gray-border pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            Historical Price Intelligence
          </span>
          <h3 className="text-xl font-serif text-taj-burgundy mt-0.5">
            30-Day Range & Market Position
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs bg-taj-cream border border-taj-gray-border px-3 py-1 text-taj-charcoal font-medium">
            {stats.positionLabel}
          </span>
          <span className="text-[11px] text-taj-gray-warm block mt-1">
            Calculated across {stats.observationCount} verified observations
          </span>
        </div>
      </div>

      {/* Grid of Distinguishable Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {/* Current Observed */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-taj-burgundy font-semibold block">
            Current Verified Price
          </span>
          <PriceDisplay amount={stats.current} size="lg" />
          <span className="text-[10px] text-taj-gray-warm block">
            Verified lead tariff
          </span>
        </div>

        {/* 30D Low (Calculated Statistic) */}
        <div className="space-y-1 border-l border-taj-gray-border/60 pl-6">
          <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold block">
            30-Day Low
          </span>
          <PriceDisplay amount={stats.low} size="lg" />
          <span className="text-[10px] text-emerald-700 block font-medium">
            Lowest recorded rate
          </span>
        </div>

        {/* 30D Median (Calculated Statistic) */}
        <div className="space-y-1 border-l border-taj-gray-border/60 pl-6">
          <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm font-semibold block">
            30-Day Median
          </span>
          <PriceDisplay amount={stats.median} size="lg" />
          <span className="text-[10px] text-taj-gray-warm block">
            Historical benchmark
          </span>
        </div>

        {/* 30D High (Calculated Statistic) */}
        <div className="space-y-1 border-l border-taj-gray-border/60 pl-6">
          <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm font-semibold block">
            30-Day High
          </span>
          <PriceDisplay amount={stats.high} size="lg" />
          <span className="text-[10px] text-taj-gray-warm block">
            Peak recorded rate
          </span>
        </div>
      </div>
    </div>
  );
};
