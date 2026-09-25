'use client';

import React, { useState } from 'react';
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
    images?: string[];
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
  const images = hotel.images && hotel.images.length > 0
    ? hotel.images
    : hotel.heroImage
    ? [hotel.heroImage]
    : [];

  const [imgIndex, setImgIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const hasBreakfast = opt?.mealPlan?.toLowerCase().includes('breakfast');

  return (
    <div className="border border-taj-gray-border bg-white flex flex-col justify-between overflow-hidden group hover:border-taj-gold/60 transition-colors">
      <div>
        {/* Imagery with Carousel if multiple images exist */}
        <div className="aspect-[16/10] bg-taj-cream relative overflow-hidden border-b border-taj-gray-border">
          {images.length > 0 ? (
            <img
              src={images[imgIndex] || images[0]}
              alt={hotel.canonicalName}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-taj-gray-warm">
              Taj Official Photography
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label="Next photo"
              >
                ›
              </button>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                {imgIndex + 1}/{images.length}
              </div>
            </>
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
              <span className="text-[11px] text-taj-gold tracking-widest shrink-0">
                {'★'.repeat(hotel.starRating)}
              </span>
            )}
          </div>

          <FreshnessBadge freshness={hotel.freshness} />

          {opt ? (
            <div className="border-t border-taj-gray-border pt-3 space-y-2.5 text-xs">
              {/* Meal Inclusions Checklist */}
              <div className="flex items-start gap-1.5">
                <span className={`text-[11px] font-bold mt-0.5 shrink-0 ${hasBreakfast ? 'text-emerald-700' : 'text-taj-gold'}`}>
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-taj-gray-warm uppercase block font-medium">
                    Meal Inclusions
                  </span>
                  <span className={`font-medium block truncate ${hasBreakfast ? 'text-emerald-800' : 'text-taj-charcoal'}`}>
                    {opt.mealPlan || 'Room Only'}
                  </span>
                </div>
              </div>

              {/* Cancellation Checklist */}
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 text-[11px] font-bold mt-0.5 shrink-0">✓</span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-taj-gray-warm uppercase block font-medium">
                    Cancellation
                  </span>
                  <span className="text-taj-charcoal-muted block truncate">
                    {opt.cancellationPolicy}
                  </span>
                </div>
              </div>

              {/* Lead Room Category */}
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 text-[11px] font-bold mt-0.5 shrink-0">✓</span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-taj-gray-warm uppercase block font-medium">
                    Room Category
                  </span>
                  <span className="font-medium text-taj-charcoal block truncate">
                    {opt.room}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-xs text-taj-gray-warm italic border-t border-taj-gray-border">
              No verified rates recorded for these dates yet.
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA (Robust, cleanly partitioned, zero overlap) */}
      <div className="p-5 pt-3 border-t border-taj-gray-border/60 mt-2 flex items-center justify-between gap-3">
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

        <div className="flex items-center gap-2 shrink-0">
          {hotel.officialBookingUrl && (
            <a
              href={hotel.officialBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-wider text-taj-gold-muted hover:text-taj-burgundy font-medium px-2 py-1.5 border border-taj-gray-border hover:border-taj-burgundy transition-colors"
              title={`Visit official reservation page for ${hotel.canonicalName}`}
            >
              Taj ↗
            </a>
          )}
          <Link
            href={`/hotel/${hotel.slug}?searchId=${searchId}`}
            className="text-xs uppercase tracking-wider font-medium text-taj-burgundy hover:text-taj-burgundy-deep border border-taj-burgundy/40 px-3 py-1.5 hover:bg-taj-burgundy hover:text-white transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
};
