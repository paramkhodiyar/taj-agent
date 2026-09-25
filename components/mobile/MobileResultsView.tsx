'use client';

import React, { useState } from 'react';
import { MobileHotelCard } from './MobileHotelCard';
import { MobileStickyActionBar } from './MobileStickyActionBar';
import { SlidersHorizontal, Check, RefreshCw, Sparkles } from 'lucide-react';

interface MobileResultsViewProps {
  data: any;
  searchId: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  mealFilter: 'all' | 'breakfast';
  setMealFilter: (f: 'all' | 'breakfast') => void;
  flexibleOnly: boolean;
  setFlexibleOnly: (f: boolean) => void;
}

/**
 * MobileResultsView — Dedicated Native-Style App Results Layout
 * 
 * Mobile ergonomics:
 * - Fixed/sticky filter pill header in thumb reach.
 * - Single-column card feed with full-width swipeable galleries.
 * - Sticky bottom quick-booking bar anchored to the lowest rate found.
 * - 48px touch targets for all interactive toggles.
 */
export const MobileResultsView: React.FC<MobileResultsViewProps> = ({
  data,
  searchId,
  onRefresh,
  isRefreshing,
  mealFilter,
  setMealFilter,
  flexibleOnly,
  setFlexibleOnly,
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  if (!data) return null;

  const cheapest = data.cheapestAvailable;

  return (
    <div className="w-full md:hidden space-y-4 pb-20">
      {/* Sticky Mobile Filter Pill Bar */}
      <div className="sticky top-16 z-30 bg-taj-cream/95 backdrop-blur-md py-2.5 px-3 border-b border-taj-gray-border/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {/* Quick Breakfast Filter Chip */}
          <button
            type="button"
            onClick={() => setMealFilter(mealFilter === 'breakfast' ? 'all' : 'breakfast')}
            className={`min-h-[40px] px-3 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 ${
              mealFilter === 'breakfast'
                ? 'bg-taj-burgundy text-white shadow-xs'
                : 'bg-white border border-taj-gray-border text-taj-charcoal'
            }`}
          >
            {mealFilter === 'breakfast' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>Breakfast Included</span>
          </button>

          {/* Quick Flexible Filter Chip */}
          <button
            type="button"
            onClick={() => setFlexibleOnly(!flexibleOnly)}
            className={`min-h-[40px] px-3 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 ${
              flexibleOnly
                ? 'bg-taj-burgundy text-white shadow-xs'
                : 'bg-white border border-taj-gray-border text-taj-charcoal'
            }`}
          >
            {flexibleOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>Free Cancellation</span>
          </button>
        </div>

        {/* Live Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh rates"
          className="min-h-[40px] min-w-[40px] px-2.5 rounded-full bg-taj-cream-warm border border-taj-gray-border text-taj-burgundy flex items-center justify-center active:scale-90 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Results Header Count */}
      <div className="px-3 pt-1 flex items-center justify-between text-xs text-taj-charcoal-light">
        <span>
          Showing <strong className="text-taj-burgundy">{data.results.length}</strong> verified properties
        </span>
        <span className="text-[11px] text-taj-gold-muted font-medium">
          Official Taj Best Rates
        </span>
      </div>

      {/* Featured Lowest Rate Card (if available) */}
      {cheapest && (
        <div className="px-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-taj-gold-muted">
            <Sparkles className="w-3.5 h-3.5 text-taj-gold" />
            <span>Best Observed Deal</span>
          </div>
          <MobileHotelCard
            id={cheapest.hotelId}
            name={cheapest.canonicalName}
            slug={cheapest.slug}
            city={cheapest.city}
            images={cheapest.images || []}
            lowestPrice={cheapest.lowestPrice}
            totalPrice={cheapest.totalPrice}
            isPlusTaxes={cheapest.isPlusTaxes}
            ratePlanName={cheapest.ratePlanName}
            roomName={cheapest.roomName}
            bookingUrl={cheapest.officialBookingUrl || `https://www.tajhotels.com/en-in/hotels/${cheapest.slug}/`}
            freshnessLabel={cheapest.freshnessLabel}
            freshnessColor={cheapest.freshnessColor}
            isCheapestOverall={true}
          />
        </div>
      )}

      {/* Property Cards Feed */}
      <div className="px-3 space-y-4">
        {data.results
          .filter((h: any) => !cheapest || h.hotelId !== cheapest.hotelId)
          .map((hotel: any) => (
            <MobileHotelCard
              key={hotel.hotelId}
              id={hotel.hotelId}
              name={hotel.canonicalName}
              slug={hotel.slug}
              city={hotel.city}
              images={hotel.images || []}
              lowestPrice={hotel.lowestPrice}
              totalPrice={hotel.totalPrice}
              isPlusTaxes={hotel.isPlusTaxes}
              ratePlanName={hotel.ratePlanName}
              roomName={hotel.roomName}
              bookingUrl={hotel.officialBookingUrl || `https://www.tajhotels.com/en-in/hotels/${hotel.slug}/`}
              freshnessLabel={hotel.freshnessLabel}
              freshnessColor={hotel.freshnessColor}
            />
          ))}
      </div>

      {/* Sticky Bottom Action Dock anchored to the Lowest Rate property */}
      {cheapest && (
        <MobileStickyActionBar
          hotelName={cheapest.canonicalName}
          pricePerNight={cheapest.lowestPrice}
          isPlusTaxes={cheapest.isPlusTaxes}
          bookingUrl={cheapest.officialBookingUrl || `https://www.tajhotels.com/en-in/hotels/${cheapest.slug}/`}
          breakfastIncluded={
            cheapest.ratePlanName?.toLowerCase().includes('breakfast') ||
            cheapest.ratePlanName?.toLowerCase().includes('bed and breakfast') ||
            cheapest.ratePlanName?.toLowerCase().includes('map')
          }
        />
      )}
    </div>
  );
};
