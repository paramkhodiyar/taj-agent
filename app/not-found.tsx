import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Compass, Search, ArrowLeftRight, Clock, ExternalLink } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
        {/* Taj Crest */}
        <div className="w-16 h-16 rounded-full bg-white border border-taj-gold/40 flex items-center justify-center mb-6">
          <img
            src="/taj-logo.svg"
            alt="Taj Official Crest"
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* 404 Title */}
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-taj-gold-muted block mb-2">
          Observation Registry — Error 404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-taj-burgundy mb-4">
          Destination Not Found
        </h1>
        <p className="text-xs sm:text-sm text-taj-charcoal-muted max-w-md mx-auto leading-relaxed mb-8">
          The property, observation record, or rate search you are seeking is not present in our database. It may have expired or been relocated.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="px-6 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs font-serif font-medium uppercase tracking-wider rounded-xl active:scale-95 transition-all"
          >
            ← Discover Verified Rates
          </Link>
          <Link
            href="/history"
            className="px-6 py-3 bg-white hover:bg-taj-cream-warm text-taj-burgundy border border-taj-gray-border text-xs font-serif font-medium uppercase tracking-wider rounded-xl active:scale-95 transition-all"
          >
            Browse Past Searches
          </Link>
        </div>

        {/* Quick Directory Grid */}
        <div className="w-full max-w-2xl border border-taj-gray-border/80 bg-white rounded-2xl p-6 text-left space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-taj-gold-muted block">
            Direct Navigation Shortcuts
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/"
              className="p-3 rounded-xl border border-taj-gray-border/60 hover:border-taj-burgundy hover:bg-taj-cream transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-taj-gold" />
                <span className="font-serif text-xs font-bold text-taj-burgundy">Search</span>
              </div>
              <p className="text-[11px] text-taj-charcoal-light">Query Indian properties by date.</p>
            </Link>

            <Link
              href="/compare"
              className="p-3 rounded-xl border border-taj-gray-border/60 hover:border-taj-burgundy hover:bg-taj-cream transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <ArrowLeftRight className="w-4 h-4 text-taj-gold" />
                <span className="font-serif text-xs font-bold text-taj-burgundy">Compare</span>
              </div>
              <p className="text-[11px] text-taj-charcoal-light">Side-by-side palace intelligence.</p>
            </Link>

            <Link
              href="/history"
              className="p-3 rounded-xl border border-taj-gray-border/60 hover:border-taj-burgundy hover:bg-taj-cream transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-taj-gold" />
                <span className="font-serif text-xs font-bold text-taj-burgundy">History</span>
              </div>
              <p className="text-[11px] text-taj-charcoal-light">View and reopen past queries.</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
