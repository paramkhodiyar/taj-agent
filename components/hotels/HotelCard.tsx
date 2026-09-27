'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PriceDisplay } from '../pricing/PriceDisplay';
import { FreshnessBadge } from '../pricing/FreshnessBadge';
import { Coffee, Utensils, ExternalLink, ArrowRight } from 'lucide-react';

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
      priceWithGst?: number | null;
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
  const images =
    hotel.images && hotel.images.length > 0
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

  const mealLower = (opt?.mealPlan || '').toLowerCase();
  const hasBreakfast = mealLower.includes('breakfast');
  const gstInclusiveNightly = opt
    ? opt.priceWithGst || Math.round(opt.pricePerNight * 1.18)
    : null;

  return (
    <div className="bg-white border border-taj-gray-border flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-md hover:border-taj-gold/60">
      <div>
        {/* Imagery */}
        <div className="aspect-[16/10] bg-taj-cream relative overflow-hidden group">
          {images.length > 0 ? (
            <img
              src={images[imgIndex] || images[0]}
              alt={hotel.canonicalName}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
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
        <div className="p-5 space-y-3.5">
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
            <div className="border-t border-taj-gray-border/60 pt-3 space-y-2 text-xs">
              {/* Lead Room Category */}
              <p className="font-serif font-medium text-taj-charcoal truncate">
                {opt.room}
              </p>

              {/* Meal & Cancellation Pills */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium border ${
                    hasBreakfast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-taj-cream text-taj-charcoal border-taj-gray-border'
                  }`}
                >
                  {hasBreakfast ? (
                    <Coffee className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <Utensils className="w-3 h-3 text-stone-600" />
                  )}
                  <span>{opt.mealPlan || (hasBreakfast ? 'Breakfast Included' : 'Room Only')}</span>
                </span>

                {opt.cancellationPolicy && (
                  <span className="inline-block px-2 py-0.5 text-[11px] text-taj-charcoal-muted bg-taj-cream/60 border border-taj-gray-border/60 truncate max-w-[210px]">
                    {opt.cancellationPolicy}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-3 text-xs text-taj-gray-warm italic border-t border-taj-gray-border/60">
              No verified public rates recorded yet for these dates.
            </div>
          )}
        </div>
      </div>

      {/* Footer / Tariff & CTA */}
      <div className="p-5 pt-3 border-t border-taj-gray-border/60 mt-1 flex items-end justify-between gap-3">
        <div>
          {opt ? (
            <div>
              <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">
                From (Public Rate)
              </span>
              <PriceDisplay amount={opt.pricePerNight} size="md" />
              {gstInclusiveNightly && (
                <span className="text-[10px] text-taj-charcoal-muted block">
                  ₹{gstInclusiveNightly.toLocaleString('en-IN')} incl. 18% GST
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-taj-gray-warm">Awaiting verification</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hotel.officialBookingUrl && (
            <a
              href={hotel.officialBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-taj-gold-muted hover:text-taj-burgundy font-medium px-2.5 py-1.5 border border-taj-gray-border hover:border-taj-burgundy transition-colors"
              title={`Visit official reservation page for ${hotel.canonicalName}`}
            >
              <span>Taj</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link
            href={`/hotel/${hotel.slug}?searchId=${searchId}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-white bg-taj-burgundy hover:bg-taj-burgundy-deep px-3.5 py-1.5 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
