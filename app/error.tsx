'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for internal monitoring
    console.error('Taj App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
        {/* Crest & Warning */}
        <div className="w-16 h-16 rounded-full bg-white border border-taj-gold/40 shadow-sm flex items-center justify-center mb-6">
          <img
            src="/taj-logo.svg"
            alt="Taj Official Crest"
            className="w-10 h-10 object-contain opacity-90"
          />
        </div>

        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-taj-gold-muted block mb-2">
          System Notice
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-taj-burgundy mb-3">
          Temporary Interruption
        </h1>
        <p className="text-xs sm:text-sm text-taj-charcoal-muted max-w-md mx-auto leading-relaxed mb-6">
          The intelligence engine encountered an unexpected condition while fulfilling this request.
          No historical price records or saved searches were impacted.
        </p>

        {/* Digest Info */}
        {error.digest && (
          <div className="mb-8 px-4 py-2 bg-white border border-taj-gray-border rounded-xl text-[11px] font-mono text-taj-charcoal-light">
            Reference Incident: {error.digest}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs font-serif font-medium uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-taj-gold" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-white hover:bg-taj-cream-warm text-taj-burgundy border border-taj-gray-border text-xs font-serif font-medium uppercase tracking-wider rounded-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4 text-taj-gold" />
            <span>Return to Discovery</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
