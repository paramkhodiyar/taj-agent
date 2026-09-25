import React from 'react';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PriceDisplay } from '@/components/pricing/PriceDisplay';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, X, Clock, Calendar, Users, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HistoryPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { q, page } = await searchParams;

  const searchQuery = (q || '').trim();
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);
  const pageSize = 10;

  // Build Prisma filter
  const whereClause: any = {};
  if (searchQuery) {
    whereClause.OR = [
      {
        id: { contains: searchQuery, mode: 'insensitive' },
      },
      {
        snapshots: {
          some: {
            hotel: {
              OR: [
                { canonicalName: { contains: searchQuery, mode: 'insensitive' } },
                { city: { contains: searchQuery, mode: 'insensitive' } },
                { state: { contains: searchQuery, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
    ];
  }

  // Fetch paginated searches & total count in parallel
  const [totalCount, searches] = await Promise.all([
    prisma.search.count({ where: whereClause }),
    prisma.search.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        snapshots: {
          include: {
            hotel: { select: { canonicalName: true, city: true, slug: true } },
            room: { select: { canonicalRoomName: true } },
          },
          orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
          take: 1,
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Page Banner */}
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            Saved Searches &amp; Observation Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy">
            Search History &amp; Retained Queries
          </h1>
          <p className="text-xs text-taj-charcoal-muted">
            Search past rate discoveries by city or hotel, inspect verified observations, and re-open live pricing feeds.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="border border-taj-gray-border bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Form */}
          <form method="GET" action="/history" className="w-full sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-taj-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search history by city (e.g. Mumbai, Goa) or hotel…"
                className="w-full pl-9 pr-8 py-2 text-xs bg-taj-cream border border-taj-gray-border rounded-lg text-taj-charcoal placeholder:text-taj-charcoal-light focus:outline-none focus:border-taj-burgundy"
              />
              {searchQuery && (
                <Link
                  href="/history"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-taj-charcoal-light hover:text-taj-charcoal"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs font-serif font-medium uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Results Summary Counter */}
          <div className="text-xs text-taj-charcoal-muted whitespace-nowrap self-start sm:self-center">
            {totalCount === 0 ? (
              '0 records found'
            ) : (
              <span>
                Showing <strong className="text-taj-burgundy font-semibold">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)}</strong> of {totalCount} queries
              </span>
            )}
          </div>
        </div>

        {/* Empty States */}
        {searches.length === 0 ? (
          <div className="border border-taj-gray-border bg-white p-12 text-center space-y-3">
            <Clock className="w-8 h-8 text-taj-gold-muted mx-auto" />
            <p className="text-sm font-serif text-taj-burgundy">
              {searchQuery
                ? `No past searches match "${searchQuery}".`
                : 'No saved searches recorded in your history yet.'}
            </p>
            {searchQuery ? (
              <Link
                href="/history"
                className="inline-block px-4 py-2 bg-taj-cream border border-taj-gray-border text-taj-burgundy text-xs font-medium rounded-lg hover:bg-white transition-colors"
              >
                Clear Search Filter
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-taj-burgundy text-white text-xs font-serif font-medium uppercase tracking-wider rounded-lg hover:bg-taj-burgundy-deep transition-colors"
              >
                Start Your First Search →
              </Link>
            )}
          </div>
        ) : (
          /* Searches Feed */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searches.map((s) => {
              const bestSnap = s.snapshots[0] || null;
              const checkInStr = s.checkIn.toISOString().split('T')[0];
              const checkOutStr = s.checkOut.toISOString().split('T')[0];

              return (
                <div
                  key={s.id}
                  className="border border-taj-gray-border bg-white p-6 flex flex-col justify-between space-y-4 rounded-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-taj-gold-muted font-semibold">
                          <Calendar className="w-3 h-3 text-taj-gold" />
                          <span>Stay Window</span>
                        </div>
                        <h3 className="text-lg font-serif text-taj-burgundy font-medium mt-0.5">
                          {checkInStr} → {checkOutStr}
                        </h3>
                        <p className="text-xs text-taj-charcoal-muted mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3 text-taj-charcoal-light" />
                          <span>{s.adults} Adults · {s.rooms} Room{s.rooms > 1 ? 's' : ''}</span>
                        </p>
                      </div>

                      <span className="text-[11px] text-taj-charcoal-light">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {bestSnap ? (
                      <div className="border-t border-taj-gray-border pt-3 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-taj-charcoal-light block">
                          Lowest Verified Lead
                        </span>
                        <p className="text-sm font-medium text-taj-charcoal flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-taj-gold flex-shrink-0" />
                          <span>{bestSnap.hotel.canonicalName}</span>
                          <span className="text-xs text-taj-charcoal-light">({bestSnap.hotel.city})</span>
                        </p>
                        <div className="flex items-baseline gap-2 pt-1">
                          <PriceDisplay amount={Number(bestSnap.pricePerNight)} size="md" />
                          <span className="text-[11px] text-taj-charcoal-light truncate max-w-[200px]">
                            · {bestSnap.room.canonicalRoomName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-taj-gray-border pt-3 text-xs text-taj-charcoal-light italic">
                        Cold search — initial price extraction pending
                      </div>
                    )}
                  </div>

                  <div className="border-t border-taj-gray-border/60 pt-4 flex items-center justify-between">
                    <span className="text-[10px] text-taj-charcoal-light font-mono">
                      REF: {s.id.slice(0, 12)}…
                    </span>

                    <Link
                      href={`/results?searchId=${s.id}`}
                      className="px-4 py-2 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-wider font-medium rounded-lg transition-colors"
                    >
                      Open Results →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Navigation Bar */}
        {totalPages > 1 && (
          <div className="border border-taj-gray-border bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl">
            <span className="text-xs text-taj-charcoal-muted">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Button */}
              {hasPrev ? (
                <Link
                  href={`/history?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), page: String(currentPage - 1) }).toString()}`}
                  className="px-3 py-1.5 rounded-lg border border-taj-gray-border text-xs text-taj-charcoal hover:bg-taj-cream flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-taj-gray-border/40 text-xs text-taj-charcoal-light/40 flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              {/* Page Number Chips */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = Math.min(totalPages - 4 + i, Math.max(1, currentPage - 2 + i));
                }
                const isActive = pageNum === currentPage;

                return (
                  <Link
                    key={pageNum}
                    href={`/history?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), page: String(pageNum) }).toString()}`}
                    className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-taj-burgundy text-white font-bold'
                        : 'border border-taj-gray-border text-taj-charcoal hover:bg-taj-cream'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {/* Next Page Button */}
              {hasNext ? (
                <Link
                  href={`/history?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), page: String(currentPage + 1) }).toString()}`}
                  className="px-3 py-1.5 rounded-lg border border-taj-gray-border text-xs text-taj-charcoal hover:bg-taj-cream flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-taj-gray-border/40 text-xs text-taj-charcoal-light/40 flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
