'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface MobileStickyActionBarProps {
  hotelName: string;
  pricePerNight: number;
  currency?: string;
  isPlusTaxes?: boolean;
  bookingUrl: string;
  breakfastIncluded?: boolean;
}

/**
 * MobileStickyActionBar — Thumb-Zone Sticky Booking Bar
 * 
 * Positioned in the optimal thumb reach zone (bottom of viewport),
 * maximizing clickability and reducing drop-off per mobile e-commerce UX studies.
 * Touch target adheres strictly to Apple HIG (44pt) / Material (48dp) standards.
 */
export const MobileStickyActionBar: React.FC<MobileStickyActionBarProps> = ({
  hotelName,
  pricePerNight,
  currency = '₹',
  isPlusTaxes = false,
  bookingUrl,
  breakfastIncluded,
}) => {
  return (
    <div
      aria-label="Quick Booking Bar"
      className="fixed bottom-[64px] left-0 right-0 z-40 md:hidden px-3 pointer-events-none pb-1"
    >
      <div className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-md border border-taj-gray-border/90 rounded-2xl p-3 shadow-[0_12px_36px_rgba(36,8,15,0.18)] flex items-center justify-between gap-3">
        {/* Price & Inclusion Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-taj-gold-muted tracking-wider truncate">
              {hotelName}
            </span>
            {breakfastIncluded && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                Breakfast
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold font-serif text-taj-burgundy tabular-nums leading-tight">
              {currency}{pricePerNight.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-taj-charcoal-light">
              {isPlusTaxes ? '/ night + taxes' : '/ night total'}
            </span>
          </div>
        </div>

        {/* Primary 48px Thumb Action Button */}
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] px-5 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all duration-150 flex-shrink-0"
        >
          <span>Book Official</span>
          <ExternalLink className="w-3.5 h-3.5 text-taj-gold stroke-[2.25]" />
        </a>
      </div>
    </div>
  );
};
