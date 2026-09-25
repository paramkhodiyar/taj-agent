'use client';

import React from 'react';
import { TajLogo3DLoader } from '@/components/3d/TajLogo3DLoader';

interface TajPageLoaderProps {
  title?: string;
  subtitle?: string;
  type?: 'default' | 'results' | 'hotel' | 'history';
}

/**
 * TajPageLoader — Clean, Restrained Loading Screen & Wireframe Skeleton
 * 
 * Strict Standards:
 * - Zero shadows, zero glows, zero blur, zero shimmers, zero pulse.
 * - Solid, architectural piece-by-piece emblem assembly.
 */
export const TajPageLoader: React.FC<TajPageLoaderProps> = ({
  title = 'Accessing Verified Intelligence',
  subtitle = 'Retrieving official property inventory and rate histories…',
  type = 'default',
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Official Taj Logo Assembling Piece by Piece */}
      <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
        <TajLogo3DLoader
          size={76}
          theme="light"
          label=""
          sublabel=""
          autoReassemble={true}
          replayIntervalMs={4200}
        />

        <div className="space-y-1">
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-taj-burgundy tracking-wide">
            {title}
          </h2>
          <p className="text-xs text-taj-charcoal-muted max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Clean Hairline Gold Divider - Zero Shimmer, Zero Glow */}
        <div className="w-24 h-[1px] bg-taj-gold/40 mt-1" />
      </div>

      {/* Contextual Wireframe Skeletons - Zero Glow, Zero Pulse */}
      {type === 'hotel' ? (
        /* Hotel Detail Wireframe */
        <div className="space-y-6">
          <div className="h-64 sm:h-96 w-full bg-taj-cream-warm/70 rounded-2xl border border-taj-gray-border" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-white rounded-xl border border-taj-gray-border" />
            <div className="h-32 bg-white rounded-xl border border-taj-gray-border" />
            <div className="h-32 bg-white rounded-xl border border-taj-gray-border" />
          </div>
          <div className="h-64 bg-white rounded-xl border border-taj-gray-border" />
        </div>
      ) : type === 'results' ? (
        /* Search Results Wireframe */
        <div className="space-y-6">
          {/* Featured Card Wireframe */}
          <div className="h-72 w-full bg-white rounded-2xl border border-taj-gold/40 p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 h-full bg-taj-cream-warm rounded-xl" />
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-6 w-3/4 bg-taj-cream-warm rounded" />
              <div className="h-4 w-1/2 bg-taj-cream-warm rounded" />
              <div className="h-20 w-full bg-taj-cream-warm rounded" />
              <div className="h-10 w-full bg-taj-cream-warm rounded" />
            </div>
          </div>

          {/* Cards Grid Wireframe */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-taj-gray-border overflow-hidden h-96 flex flex-col"
              >
                <div className="h-48 w-full bg-taj-cream-warm" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-taj-cream-warm rounded" />
                    <div className="h-3 w-1/3 bg-taj-cream-warm rounded" />
                  </div>
                  <div className="h-12 w-full bg-taj-cream-warm rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Default Page Wireframe */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-taj-gray-border p-6 space-y-4 h-60"
            >
              <div className="h-6 w-2/3 bg-taj-cream-warm rounded" />
              <div className="h-4 w-1/2 bg-taj-cream-warm rounded" />
              <div className="h-24 w-full bg-taj-cream-warm rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

