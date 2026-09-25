import React from 'react';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PriceDisplay } from '@/components/pricing/PriceDisplay';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HistoryPage() {
  const searches = await prisma.search.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      snapshots: {
        include: {
          hotel: { select: { canonicalName: true, city: true } },
          room: { select: { canonicalRoomName: true } },
        },
        orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            Saved Searches & Observation Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy">
            Search History & Retained Queries
          </h1>
          <p className="text-xs text-taj-charcoal-muted">
            Inspect past queries and re-open verified price states.
          </p>
        </div>

        {searches.length === 0 ? (
          <div className="border border-taj-gray-border bg-white p-12 text-center text-xs text-taj-gray-warm">
            No saved searches recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searches.map((s) => {
              const bestSnap = s.snapshots[0] || null;

              return (
                <div
                  key={s.id}
                  className="border border-taj-gray-border bg-white p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted font-semibold block">
                          Stay Window
                        </span>
                        <h3 className="text-lg font-serif text-taj-burgundy font-medium">
                          {s.checkIn.toISOString().split('T')[0]} → {s.checkOut.toISOString().split('T')[0]}
                        </h3>
                        <p className="text-xs text-taj-gray-warm mt-0.5">
                          {s.adults} Adults · {s.rooms} Room{s.rooms > 1 ? 's' : ''}
                        </p>
                      </div>

                      <span className="text-[11px] text-taj-gray-warm">
                        Created {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {bestSnap ? (
                      <div className="border-t border-taj-gray-border pt-3 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block">
                          Cheapest Verified Lead
                        </span>
                        <p className="text-sm font-medium text-taj-charcoal">
                          {bestSnap.hotel.canonicalName} ({bestSnap.hotel.city})
                        </p>
                        <div className="flex items-baseline gap-2 pt-1">
                          <PriceDisplay amount={Number(bestSnap.pricePerNight)} size="md" />
                          <span className="text-[11px] text-taj-charcoal-light">
                            · {bestSnap.room.canonicalRoomName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-taj-gray-border pt-3 text-xs text-taj-gray-warm italic">
                        Cold search — awaiting initial price fetch
                      </div>
                    )}
                  </div>

                  <div className="border-t border-taj-gray-border/60 pt-4 flex items-center justify-between">
                    <span className="text-[11px] text-taj-gray-warm font-mono">
                      ID: {s.id.slice(0, 10)}…
                    </span>

                    <Link
                      href={`/results?searchId=${s.id}`}
                      className="px-4 py-2 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-wider font-medium transition-colors"
                    >
                      Open Results →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
