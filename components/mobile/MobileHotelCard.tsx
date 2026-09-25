'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Check, ChevronLeft, ChevronRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export interface MobileHotelCardProps {
  id: string;
  name: string;
  slug: string;
  city: string;
  images: string[];
  lowestPrice: number;
  totalPrice?: number;
  isPlusTaxes?: boolean;
  ratePlanName?: string;
  roomName?: string;
  bookingUrl: string;
  freshnessLabel?: string;
  freshnessColor?: string;
  isCheapestOverall?: boolean;
  isBreakfastIncluded?: boolean;
  isFreeCancellation?: boolean;
}

/**
 * MobileHotelCard — Mobile-First Hotel Intelligence Card
 * 
 * Touch-optimized layout adhering to ergonomic thumb-zone principles:
 * - Edge-to-edge photo carousel with 48px touch targets for navigation.
 * - Checklist-style inclusions (Breakfast, Cancellation) with clear iconography.
 * - Thumb-accessible action buttons: 48px minimum touch height with tactile active:scale-98 feedback.
 * - Zero overlap between pricing metrics and interactive CTAs.
 */
export const MobileHotelCard: React.FC<MobileHotelCardProps> = ({
  id,
  name,
  slug,
  city,
  images,
  lowestPrice,
  totalPrice,
  isPlusTaxes = false,
  ratePlanName = 'Best Available Rate',
  roomName,
  bookingUrl,
  freshnessLabel,
  freshnessColor = 'text-emerald-700 bg-emerald-50 border-emerald-200',
  isCheapestOverall = false,
  isBreakfastIncluded = false,
  isFreeCancellation = false,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const validImages = images && images.length > 0 ? images : ['/taj-logo.svg'];

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  // Derive breakfast and cancellation status from rate plan if not explicitly flagged
  const hasBreakfast =
    isBreakfastIncluded ||
    ratePlanName.toLowerCase().includes('breakfast') ||
    ratePlanName.toLowerCase().includes('bed and breakfast') ||
    ratePlanName.toLowerCase().includes('map') ||
    ratePlanName.toLowerCase().includes('ap ');

  const hasFreeCancel =
    isFreeCancellation ||
    ratePlanName.toLowerCase().includes('flexible') ||
    ratePlanName.toLowerCase().includes('best available') ||
    !ratePlanName.toLowerCase().includes('non-refundable');

  return (
    <article className="w-full bg-white rounded-2xl border border-taj-gray-border/90 shadow-sm overflow-hidden flex flex-col transition-all duration-200 active:shadow-md">
      {/* Photo Carousel Header */}
      <div className="relative aspect-[16/10] w-full bg-taj-cream-warm overflow-hidden select-none">
        <img
          src={validImages[photoIndex]}
          alt={`${name} - official photo ${photoIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {isCheapestOverall ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-taj-gold text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
              Lowest Rate Found
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-black/60 text-white backdrop-blur-xs">
              Taj Official
            </span>
          )}

          {freshnessLabel && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border backdrop-blur-xs shadow-xs ${freshnessColor}`}
            >
              <ShieldCheck className="w-3 h-3" />
              {freshnessLabel}
            </span>
          )}
        </div>

        {/* Touch Carousel Controls (min 44x44px touch targets) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 active:scale-90 transition-transform"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
            {validImages.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`block rounded-full transition-all ${
                  idx === photoIndex
                    ? 'w-4 h-1.5 bg-taj-gold'
                    : 'w-1.5 h-1.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Hotel City Pill */}
        <div className="absolute bottom-2.5 left-3 text-white flex items-center gap-1 text-[11px] font-medium drop-shadow-sm pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-taj-gold" />
          <span>{city}, India</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/hotel/${slug}`} className="group block">
            <h3 className="font-serif text-base font-bold text-taj-burgundy group-hover:text-taj-burgundy-deep leading-snug">
              {name}
            </h3>
          </Link>

          {/* Room Name */}
          {roomName && (
            <p className="text-xs text-taj-charcoal-muted mt-0.5 line-clamp-1">
              {roomName}
            </p>
          )}

          {/* Inclusions Checklist */}
          <div className="mt-3 py-2.5 px-3 bg-taj-cream rounded-xl border border-taj-gray-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-taj-charcoal-light text-[11px]">Meal Plan:</span>
              <span className="font-medium text-taj-charcoal text-[11px] truncate max-w-[65%] text-right">
                {ratePlanName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-taj-gray-border/40">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    hasBreakfast
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-taj-cream-warm text-taj-charcoal-light'
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    hasBreakfast ? 'text-emerald-800' : 'text-taj-charcoal-muted'
                  }`}
                >
                  {hasBreakfast ? 'Breakfast Incl.' : 'Room Only'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    hasFreeCancel
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    hasFreeCancel ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  {hasFreeCancel ? 'Free Cancel' : 'Non-Refundable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Block & Thumb Actions */}
        <div className="mt-4 pt-3 border-t border-taj-gray-border/70">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-taj-charcoal-light block">
                Nightly Rate
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-xl font-bold text-taj-burgundy tabular-nums">
                  {typeof lowestPrice === 'number' && !isNaN(lowestPrice)
                    ? `₹${lowestPrice.toLocaleString('en-IN')}`
                    : 'Check Rates'}
                </span>
                {typeof lowestPrice === 'number' && !isNaN(lowestPrice) && (
                  <span className="text-[11px] text-taj-charcoal-light">
                    {isPlusTaxes ? '/ night + taxes' : '/ night total'}
                  </span>
                )}
              </div>
            </div>

            {typeof totalPrice === 'number' && !isNaN(totalPrice) && typeof lowestPrice === 'number' && totalPrice > lowestPrice && (
              <div className="text-right">
                <span className="text-[10px] text-taj-charcoal-light block">
                  Stay Total
                </span>
                <span className="text-xs font-semibold text-taj-charcoal tabular-nums">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* High-Clickability Ergonomic Touch Action Buttons (Min 48px height) */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/hotel/${slug}`}
              className="min-h-[48px] px-3 rounded-xl border border-taj-gray-border bg-taj-cream hover:bg-taj-cream-warm text-taj-burgundy font-medium text-xs flex items-center justify-center text-center transition-transform active:scale-95"
            >
              Rate History
            </Link>

            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-3 rounded-xl bg-taj-burgundy hover:bg-taj-burgundy-deep text-white font-medium text-xs flex items-center justify-center gap-1.5 text-center active:scale-95 transition-all"
            >
              <span>Book Taj</span>
              <ExternalLink className="w-3.5 h-3.5 text-taj-gold stroke-[2]" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
