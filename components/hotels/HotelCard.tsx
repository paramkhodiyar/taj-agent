import React from 'react';
import Link from 'next/link';
import { PriceDisplay } from '../pricing/PriceDisplay';
import { FreshnessBadge } from '../pricing/FreshnessBadge';

interface HotelCardProps {
  hotel: {
    hotelId: string;
    canonicalName: string;
    slug: string;
    city: string;
    state: string;
    starRating: number | null;
    heroImage: string | null;
    officialBookingUrl?: string | null;
    freshness: any;
    cheapestOption: {
      snapshotId: string;
      pricePerNight: number;
      totalPrice: number | null;
      room: string;
      ratePlan: string;
      mealPlan: string;
      cancellationPolicy: string;
      isFlexible: boolean;
      low30D: number | null;
      isNearLow: boolean;
    } | null;
  };
  searchId: string;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, searchId }) => {
  const opt = hotel.cheapestOption;

  return (
    <div className="border border-taj-gray-border bg-white flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Imagery */}
        <div className="aspect-[16/10] bg-taj-cream relative overflow-hidden border-b border-taj-gray-border">
          {hotel.heroImage ? (
            <img
              src={hotel.heroImage}
              alt={hotel.canonicalName}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-taj-gray-warm">
              Taj Official Photography
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-taj-gold-muted font-medium">
                {hotel.city}, {hotel.state}
              </p>
              <h4 className="text-lg font-serif text-taj-burgundy font-medium leading-snug mt-0.5">
                {hotel.canonicalName}
              </h4>
            </div>
            {hotel.starRating && (
              <span className="text-[11px] text-taj-gold tracking-widest">
                {'★'.repeat(hotel.starRating)}
              </span>
            )}
          </div>

          <FreshnessBadge freshness={hotel.freshness} />

          {opt ? (
            <div className="border-t border-taj-gray-border pt-3 space-y-2 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-taj-gray-warm">Lead Room:</span>
                <span className="font-medium text-taj-charcoal text-right truncate max-w-[160px]">
                  {opt.room}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-taj-gray-warm">Plan:</span>
                <span className="text-taj-charcoal-muted text-right truncate max-w-[160px]">
                  {opt.mealPlan}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-taj-gray-warm">Cancellation:</span>
                <span className="text-taj-charcoal-muted text-right truncate max-w-[160px]">
                  {opt.cancellationPolicy}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-xs text-taj-gray-warm italic border-t border-taj-gray-border">
              No historical price observation recorded for these dates yet.
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-5 pt-0 border-t border-taj-gray-border/60 mt-2 flex items-center justify-between">
        <div>
          {opt ? (
            <div>
              <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">
                From
              </span>
              <PriceDisplay amount={opt.pricePerNight} size="md" />
              {opt.isNearLow && (
                <span className="text-[10px] text-emerald-700 block font-medium">
                  ↓ near 30D low
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-taj-gray-warm">Pending verification</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hotel.officialBookingUrl && (
            <a
              href={hotel.officialBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-wider text-taj-gold-muted hover:text-taj-burgundy font-medium px-2 py-2"
              title={`Visit official reservation page for ${hotel.canonicalName}`}
            >
              Taj ↗
            </a>
          )}
          <Link
            href={`/hotel/${hotel.slug}?searchId=${searchId}`}
            className="text-xs uppercase tracking-wider font-medium text-taj-burgundy hover:text-taj-burgundy-deep border border-taj-burgundy/30 px-3 py-2 hover:bg-taj-burgundy/5 transition-colors"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
};
