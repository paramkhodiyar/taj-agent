'use client';

import React, { useState } from 'react';
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
    images?: string[];
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

  const hasBreakfast = opt.mealPlan?.toLowerCase().includes('breakfast');

  return (
    <div className="border-2 border-taj-gold/60 bg-white overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taj-gray-border pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-taj-gold-muted block">
            Lowest Verified Tariff for Your Dates
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif text-taj-burgundy mt-1">
            {hotel.canonicalName}
          </h3>
          <p className="text-xs text-taj-charcoal-muted mt-0.5">
            {hotel.city}, {hotel.state} · Official Taj Property
          </p>
        </div>

        <FreshnessBadge freshness={hotel.freshness} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Official Multi-Image Gallery */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="aspect-[16/10] bg-taj-cream relative overflow-hidden border border-taj-gray-border group">
            {images.length > 0 ? (
              <img
                src={images[imgIndex] || images[0]}
                alt={`${hotel.canonicalName} - Photo ${imgIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-taj-gray-warm">
                Official Taj Photography
              </div>
            )}

            {/* Gallery Navigation Controls if multiple images exist */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center text-lg transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
                  aria-label="Previous property image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center text-lg transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
                  aria-label="Next property image"
                >
                  ›
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] tracking-wider font-medium px-2.5 py-1 rounded">
                  {imgIndex + 1} / {images.length} Official Photos
                </div>

                {/* Carousel Indicator Dots */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === imgIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Jump to photo ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick thumbnails strip when multiple images exist */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImgIndex(idx)}
                  className={`w-16 h-11 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                    idx === imgIndex ? 'border-taj-burgundy ring-1 ring-taj-burgundy' : 'border-taj-gray-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Inclusions Checklist & Tariff Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted font-bold block">
                Selected Lowest Category
              </span>
              <h4 className="text-lg font-serif text-taj-burgundy font-semibold mt-0.5 leading-snug">
                {opt.room}
              </h4>
            </div>

            {/* Inclusions Checklist in Structured Grid (Zero Overflow/Collision) */}
            <div className="bg-taj-cream/60 border border-taj-gray-border p-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-taj-charcoal font-semibold block border-b border-taj-gray-border/60 pb-1.5">
                Verified Reservation Inclusions
              </span>

              <div className="space-y-2 text-xs">
                {/* Breakfast / Meal Plan Checklist Item */}
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-bold mt-0.5 ${hasBreakfast ? 'text-emerald-700' : 'text-taj-gold'}`}>
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block font-medium">
                      Meal Inclusions
                    </span>
                    <span className={`font-medium block leading-tight ${hasBreakfast ? 'text-emerald-900 font-semibold' : 'text-taj-charcoal'}`}>
                      {opt.mealPlan || 'Room Only (Breakfast not included)'}
                    </span>
                  </div>
                </div>

                {/* Cancellation Policy Checklist Item */}
                <div className="flex items-start gap-2">
                  <span className="text-emerald-700 text-xs font-bold mt-0.5">✓</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block font-medium">
                      Cancellation Terms
                    </span>
                    <span className="font-medium text-taj-charcoal block leading-tight">
                      {opt.cancellationPolicy || 'Standard Official Policy'}
                    </span>
                  </div>
                </div>

                {/* Rate Plan Title */}
                <div className="flex items-start gap-2">
                  <span className="text-emerald-700 text-xs font-bold mt-0.5">✓</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block font-medium">
                      Official Rate Plan
                    </span>
                    <span className="font-medium text-taj-charcoal block leading-tight">
                      {opt.ratePlan}
                    </span>
                  </div>
                </div>
              </div>

              {opt.isNearLow && (
                <div className="mt-2 pt-2 border-t border-taj-gray-border/60 flex items-center gap-2 text-xs text-emerald-800">
                  <span className="font-bold">↓</span>
                  <span className="font-medium">Within 5% of 30-day historical low</span>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Tariff and Action Section (Dedicated Rows, Zero Overlap) */}
          <div className="border-t border-taj-gray-border/60 pt-4 space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block font-medium">
                  Verified Nightly Tariff
                </span>
                <PriceDisplay amount={opt.pricePerNight} size="xl" />
              </div>

              {opt.totalPrice && (
                <div className="text-right">
                  <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">
                    Total Stay
                  </span>
                  <span className="font-mono text-base font-bold text-taj-burgundy block">
                    ₹{opt.totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-taj-gray-warm block">incl. taxes & fees</span>
                </div>
              )}
            </div>

            {/* Dedicated Action Buttons Grid (Full-width, cleanly partitioned) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {hotel.officialBookingUrl && (
                <a
                  href={hotel.officialBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-taj-burgundy text-taj-burgundy hover:bg-taj-burgundy hover:text-white text-xs uppercase tracking-wider font-medium transition-colors text-center"
                >
                  <span>Book on Taj Official</span>
                  <span className="text-sm">↗</span>
                </a>
              )}
              <Link
                href={`/hotel/${hotel.slug}?searchId=${searchId}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-wider font-medium transition-colors text-center"
              >
                <span>View All Rooms</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
