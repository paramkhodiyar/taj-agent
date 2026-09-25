import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-taj-cream border-b border-taj-gray-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <img
            src="/taj-logo.svg"
            alt="Taj Official Crest"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="border-l border-taj-gray-border/80 pl-3">
            <span className="font-serif tracking-[0.18em] text-sm font-semibold text-taj-burgundy block leading-none">
              TAJ
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-taj-gold-muted block mt-1 font-sans font-medium">
              Price Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-taj-charcoal-muted">
          <Link href="/" prefetch={true} className="hover:text-taj-burgundy transition-colors">
            Search
          </Link>
          <Link href="/compare" prefetch={true} className="hover:text-taj-burgundy transition-colors">
            Compare
          </Link>
          <Link href="/history" prefetch={true} className="hover:text-taj-burgundy transition-colors">
            Saved History
          </Link>
          <Link href="/tracked" prefetch={true} className="hover:text-taj-burgundy transition-colors">
            Tracked Searches
          </Link>
          <Link
            href="/fetch-runs"
            prefetch={true}
            className="text-taj-burgundy flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Agent Activity
          </Link>
        </nav>
      </div>
    </header>
  );
};
