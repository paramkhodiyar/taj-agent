import React from 'react';
import Link from 'next/link';
import { PriceDisplay } from '../pricing/PriceDisplay';
import { FreshnessBadge } from '../pricing/FreshnessBadge';

interface FeaturedCheapestCardProps {
  hotel: {
    hotelId: string;
    canonicalName: string;
    slug: string;
    city: string;
    state: string;
    heroImage: string | null;
    officialBookingUrl?: string | null;
    freshness: any;
    cheapestOption: {
      snapshotId: string;
      pricePerNight: number;
      totalPrice: number | null;
      basePrice: number | null;
      taxAmount: number | null;
      currency: string;
      room: string;
      ratePlan: string;
      mealPlan: string;
      cancellationPolicy: string;
      isFlexible: boolean;
      fetchedAt: string;
      low30D: number | null;
      isNearLow: boolean;
    };
  };
  searchId: string;
}

export const FeaturedCheapestCard: React.FC<FeaturedCheapestCardProps> = ({ hotel, searchId }) => {
  const opt = hotel.cheapestOption;

  return (
    <div className="border border-taj-gold/50 bg-white overflow-hidden p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taj-gray-border pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-taj-gold-muted block">
            Cheapest Verified Taj for Your Dates
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif text-taj-burgundy mt-1">
            {hotel.canonicalName}
          </h3>
          <p className="text-xs text-taj-charcoal-muted mt-0.5">
            {hotel.city}, {hotel.state}
          </p>
        </div>

        <FreshnessBadge freshness={hotel.freshness} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Hero Photography */}
        <div className="lg:col-span-7 aspect-[16/10] bg-taj-cream relative overflow-hidden border border-taj-gray-border">
          {hotel.heroImage ? (
            <img
              src={hotel.heroImage}
              alt={hotel.canonicalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-taj-gray-warm">
              Taj Official Photography
            </div>
          )}
        </div>

        {/* Pricing & Terms Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-taj-gray-warm block">
              Lead Available Room
            </span>
            <p className="text-lg font-medium text-taj-charcoal">{opt.room}</p>
            <p className="text-xs text-taj-charcoal-muted">{opt.ratePlan}</p>
          </div>

          <div className="border-t border-b border-taj-gray-border py-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-taj-gray-warm">Meal Plan:</span>
              <span className="font-medium text-taj-charcoal">{opt.mealPlan}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-taj-gray-warm">Cancellation:</span>
              <span className="font-medium text-taj-charcoal text-right max-w-[200px]">
                {opt.cancellationPolicy}
              </span>
            </div>
            {opt.isNearLow && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">
                <span>Historical Context:</span>
                <span className="font-medium">Within 5% of 30-day low</span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-taj-gray-warm block">
                Verified Nightly Rate
              </span>
              <PriceDisplay amount={opt.pricePerNight} size="xl" />
              {opt.totalPrice && (
                <span className="text-xs text-taj-gray-warm block mt-0.5">
                  Total stay: ₹{opt.totalPrice.toLocaleString('en-IN')} (incl. taxes)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hotel.officialBookingUrl && (
                <a
                  href={hotel.officialBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 border border-taj-burgundy text-taj-burgundy hover:bg-taj-burgundy/5 text-xs uppercase tracking-wider font-medium transition-colors"
                >
                  Book on Taj Official ↗
                </a>
              )}
              <Link
                href={`/hotel/${hotel.slug}?searchId=${searchId}`}
                className="px-6 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-wider font-medium transition-colors"
              >
                View All Rooms & History →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
