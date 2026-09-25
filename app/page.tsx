import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchForm } from '@/components/search/SearchForm';
import { IntelligenceAssistant } from '@/components/assistant/IntelligenceAssistant';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Fresh DB reads

export default async function HomePage() {
  const [totalHotels, totalSnapshots, latestSnapshot] = await Promise.all([
    prisma.hotel.count({ where: { isActive: true } }),
    prisma.priceSnapshot.count(),
    prisma.priceSnapshot.findFirst({
      orderBy: { fetchedAt: 'desc' },
      include: {
        hotel: { select: { canonicalName: true, city: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1">
        {/* Hero / Search Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-taj-gray-border">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-taj-gold-muted font-medium">
                Luxury Hospitality Rate Intelligence
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif text-taj-burgundy font-normal tracking-tight">
                Discover the right Taj for your dates
              </h1>
              <p className="text-xs sm:text-sm text-taj-charcoal-muted max-w-xl mx-auto leading-relaxed">
                A bespoke intelligence service for discovering, comparing, and tracking verified Taj hotel rates.
                Every quote is verified directly from official Taj reservations.
              </p>
            </div>

            <SearchForm />

            <div className="pt-6">
              <IntelligenceAssistant />
            </div>
          </div>
        </section>

        {/* Quiet Intelligence Overview (Below the fold per 01-PRODUCT-AND-UI.md §5.1) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border border-taj-gray-border bg-white p-8">
            <div className="space-y-2 border-b md:border-b-0 md:border-r border-taj-gray-border pb-6 md:pb-0 md:pr-6">
              <span className="text-[11px] uppercase tracking-wider text-taj-gold-muted font-medium block">
                Portfolio Monitored
              </span>
              <p className="text-3xl font-serif text-taj-burgundy font-medium">
                {totalHotels} Iconic Properties
              </p>
              <p className="text-xs text-taj-charcoal-muted leading-relaxed">
                Full coverage across Rajasthan palaces, Goa beach resorts, Himalayan sanctuaries, and major metropolises.
              </p>
            </div>

            <div className="space-y-2 border-b md:border-b-0 md:border-r border-taj-gray-border pb-6 md:pb-0 md:pr-6">
              <span className="text-[11px] uppercase tracking-wider text-taj-gold-muted font-medium block">
                Verified Rate Archives
              </span>
              <p className="text-3xl font-serif text-taj-burgundy font-medium">
                {totalSnapshots.toLocaleString('en-IN')} Verified Records
              </p>
              <p className="text-xs text-taj-charcoal-muted leading-relaxed">
                Permanent historical rate records. Preserved without modification to provide genuine 30-day rate trends and authentic price histories.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-taj-gold-muted font-medium block">
                Most Recent Rate Check
              </span>
              {latestSnapshot ? (
                <div>
                  <p className="text-base font-serif text-taj-charcoal font-medium truncate">
                    {latestSnapshot.hotel.canonicalName}
                  </p>
                  <p className="text-xs text-taj-gray-warm mt-0.5">
                    ₹{Number(latestSnapshot.pricePerNight).toLocaleString('en-IN')} · {new Date(latestSnapshot.fetchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} IST
                  </p>
                  <Link
                    href="/fetch-runs"
                    className="inline-block text-[11px] text-taj-burgundy hover:underline mt-2 font-medium"
                  >
                    View verification log →
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-taj-gray-warm italic">
                  Awaiting initial rate verification
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
