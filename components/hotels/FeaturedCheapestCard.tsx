'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PriceDisplay } from '../pricing/PriceDisplay';
import { FreshnessBadge } from '../pricing/FreshnessBadge';
import { Coffee, Utensils, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

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
      priceWithGst?: number | null;
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

  const mealLower = (opt.mealPlan || '').toLowerCase();
  const hasBreakfast = mealLower.includes('breakfast');
  const hasDinner = mealLower.includes('dinner') || mealLower.includes('map');

  // Compute GST inclusive rate
  const gstInclusiveNightly = opt.priceWithGst || Math.round(opt.pricePerNight * 1.18);

  return (
    <div className="bg-white border border-taj-gold/50 shadow-sm overflow-hidden p-6 sm:p-8 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-taj-gray-border/60 pb-5">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-semibold">
            Lowest Public Tariff Found
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif text-taj-burgundy mt-1">
            {hotel.canonicalName}
          </h3>
          <p className="text-xs text-taj-charcoal-muted mt-0.5">
            {hotel.city}, {hotel.state}
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <FreshnessBadge freshness={hotel.freshness} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-6 items-stretch">
        {/* Left: Photography */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="aspect-[16/10] bg-taj-cream relative overflow-hidden group">
            {images.length > 0 ? (
              <img
                src={images[imgIndex] || images[0]}
                alt={hotel.canonicalName}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-base transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-base transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Next photo"
                >
                  ›
                </button>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded tracking-wide">
                  {imgIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Stay Inclusions & Tariff */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm font-medium">
                Featured Room Category
              </span>
              <h4 className="text-xl font-serif text-taj-charcoal font-medium mt-0.5">
                {opt.room}
              </h4>
            </div>

            {/* Inclusions Chips - Clean, comfortable, luxury presentation */}
            <div className="space-y-2.5 pt-1">
              {/* Meal Plan Highlight */}
              <div className="flex items-center gap-2.5 p-3 bg-taj-cream/50 border border-taj-gray-border/60">
                <span className="w-8 h-8 rounded-lg bg-white border border-taj-gray-border/80 flex items-center justify-center shrink-0">
                  {hasBreakfast ? (
                    <Coffee className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Utensils className="w-4 h-4 text-stone-600" />
                  )}
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm font-medium block">
                    Meal Option
                  </span>
                  <span className="text-xs font-medium text-taj-charcoal">
                    {opt.mealPlan || (hasBreakfast ? 'Breakfast Included' : 'Room Only')}
                  </span>
                </div>
              </div>

              {/* Cancellation & Policy */}
              <div className="flex items-center gap-2.5 p-3 bg-taj-cream/50 border border-taj-gray-border/60">
                <span className="w-8 h-8 rounded-lg bg-white border border-taj-gray-border/80 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm font-medium block">
                    Rate & Cancellation
                  </span>
                  <span className="text-xs text-taj-charcoal">
                    {opt.cancellationPolicy || 'Standard Taj Flexible Cancellation'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Reservation CTA */}
          <div className="border-t border-taj-gray-border/60 pt-4 space-y-4">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm font-medium block">
                    Public Non-Member Rate
                  </span>
                  <PriceDisplay amount={opt.pricePerNight} size="xl" />
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-taj-gray-warm uppercase tracking-wider block">
                    Total Incl. 18% GST
                  </span>
                  <span className="font-mono text-base font-bold text-taj-burgundy block">
                    ₹{gstInclusiveNightly.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-taj-gray-warm">per night incl. taxes</span>
                </div>
              </div>

              {opt.totalPrice && (
                <p className="text-[11px] text-taj-charcoal-muted mt-1 text-right">
                  Total stay: <span className="font-semibold text-taj-charcoal">₹{opt.totalPrice.toLocaleString('en-IN')}</span> (all taxes included)
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Link
                href={`/hotel/${hotel.slug}?searchId=${searchId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-widest font-medium transition-colors text-center"
              >
                <span>View All Rooms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {hotel.officialBookingUrl && (
                <a
                  href={hotel.officialBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-taj-burgundy/40 text-taj-burgundy hover:bg-taj-cream text-xs uppercase tracking-widest font-medium transition-colors text-center"
                >
                  <span>Taj Official</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
