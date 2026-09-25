'use client';

import React from 'react';

import { Taj2DHotel3DLoader } from '@/components/3d/Taj2DHotel3DLoader';

interface TajPageLoaderProps {
  title?: string;
  subtitle?: string;
  type?: 'default' | 'results' | 'hotel' | 'history';
}

/**
 * TajPageLoader — Opulent Streaming Loading Screen & Skeleton
 * 
 * Provides instantaneous visual feedback on Next.js page transitions,
 * eliminating perception of latency during serverless database queries.
 */
export const TajPageLoader: React.FC<TajPageLoaderProps> = ({
  title = 'Accessing Verified Intelligence',
  subtitle = 'Retrieving official property inventory and rate histories…',
  type = 'default',
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* 2D Hotel Figure Assembling in 3D Motion */}
      <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
        <Taj2DHotel3DLoader
          size={110}
          theme="light"
          label=""
          sublabel=""
          autoReassemble={true}
          replayIntervalMs={4500}
        />

        <div className="space-y-1">
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-taj-burgundy tracking-wide">
            {title}
          </h2>
          <p className="text-xs text-taj-charcoal-muted max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Linear Gold Shimmer Progress Bar */}
        <div className="w-48 h-1 bg-taj-gray-border/80 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-taj-gold rounded-full w-1/3 animate-[shimmer_1.4s_infinite]" />
        </div>
      </div>

      {/* Contextual Skeletons */}
      {type === 'hotel' ? (
        /* Hotel Detail Skeleton */
        <div className="space-y-6">
          <div className="h-64 sm:h-96 w-full bg-gradient-to-r from-taj-cream-warm via-white to-taj-cream-warm animate-pulse rounded-2xl border border-taj-gray-border/60" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-white rounded-xl border border-taj-gray-border/60 animate-pulse" />
            <div className="h-32 bg-white rounded-xl border border-taj-gray-border/60 animate-pulse" />
            <div className="h-32 bg-white rounded-xl border border-taj-gray-border/60 animate-pulse" />
          </div>
          <div className="h-64 bg-white rounded-xl border border-taj-gray-border/60 animate-pulse" />
        </div>
      ) : type === 'results' ? (
        /* Search Results Skeleton */
        <div className="space-y-6">
          {/* Featured Card Skeleton */}
          <div className="h-72 w-full bg-white rounded-2xl border-2 border-taj-gold/20 p-6 flex flex-col md:flex-row gap-6 animate-pulse">
            <div className="w-full md:w-1/2 h-full bg-taj-cream-warm rounded-xl" />
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-6 w-3/4 bg-taj-cream-warm rounded" />
              <div className="h-4 w-1/2 bg-taj-cream-warm rounded" />
              <div className="h-20 w-full bg-taj-cream-warm rounded" />
              <div className="h-10 w-full bg-taj-cream-warm rounded" />
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-taj-gray-border overflow-hidden h-96 animate-pulse flex flex-col"
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
        /* Default Page Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-taj-gray-border p-6 space-y-4 animate-pulse h-60"
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
