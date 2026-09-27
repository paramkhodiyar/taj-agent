'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedCheapestCard } from '@/components/hotels/FeaturedCheapestCard';
import { HotelCard } from '@/components/hotels/HotelCard';
import { EmptySearchState } from '@/components/search/EmptySearchState';
import { AgentLivePipeline } from '@/components/agent/AgentLivePipeline';
import { MobileResultsView } from '@/components/mobile/MobileResultsView';
import { TajPageLoader } from '@/components/layout/TajPageLoader';

function ResultsContent() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get('searchId');
  const autoFetch = searchParams.get('autoFetch') === 'true';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters per 01-PRODUCT-AND-UI.md §8.8
  const [mealFilter, setMealFilter] = useState<'all' | 'breakfast'>('all');
  const [flexibleOnly, setFlexibleOnly] = useState(false);

  const autoFetchedRef = React.useRef(false);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  const loadResults = async () => {
    if (!searchId) return;
    setLoading(true);
    setError(null);

    try {
      let url = `/api/searches/${searchId}/results`;
      const queryParams = new URLSearchParams();
      if (mealFilter === 'breakfast') queryParams.set('meal', 'breakfast');
      if (flexibleOnly) queryParams.set('flexible', 'true');

      const qs = queryParams.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load search results');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error loading results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [searchId, mealFilter, flexibleOnly]);

  // Automatically launch the live agentic fetch once when user arrives with autoFetch=true
  useEffect(() => {
    if (autoFetch && searchId && !autoFetchedRef.current) {
      autoFetchedRef.current = true;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('autoFetch');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
      handleFetchLatest();
    }
  }, [searchId, autoFetch]);

  // "Resume where you left off" scroll persistence per 01-PRODUCT-AND-UI.md §8.5
  useEffect(() => {
    if (!searchId || loading) return;
    try {
      const savedPos = sessionStorage.getItem(`scroll_results_${searchId}`);
      if (savedPos) {
        window.scrollTo({ top: Number(savedPos), behavior: 'smooth' });
      }
    } catch (e) {}

    const handleScroll = () => {
      try {
        sessionStorage.setItem(`scroll_results_${searchId}`, String(window.scrollY));
      } catch (e) {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchId, loading]);

  const handleFetchLatest = async () => {
    if (!searchId || fetching) return;
    setFetching(true);
    setFetchCompleted(false);
    setError(null);
    setFetchProgress('Taj Intelligence Agent: Extracting official verified inventory across properties…');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s safety limit

      const res = await fetch(`/api/searches/${searchId}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to refresh prices');
      }

      setFetchCompleted(true);
      setFetchProgress(
        `Completed: ${json.successfulHotels}/${json.requestedHotels} properties verified. ${json.totalSnapshotsPersisted} snapshots persisted.`
      );

      // Reload results from DB
      await loadResults();
    } catch (err: any) {
      setError(
        err.name === 'AbortError'
          ? 'Live rate verification took longer than expected. Please try refreshing again.'
          : (err.message || 'Fetch request failed')
      );
    } finally {
      setTimeout(() => {
        setFetching(false);
        setFetchCompleted(false);
        setFetchProgress(null);
      }, 1600);
    }
  };

  if (!searchId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-taj-gray-warm">No search parameters provided.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-taj-burgundy text-white text-xs uppercase tracking-wider"
        >
          Start a Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      {data?.search && (
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-semibold block">
              Official Rate Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy font-medium">
              Taj Availability & Verified Public Tariffs
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-taj-charcoal-muted pt-1">
              <span>{data.search.checkIn} to {data.search.checkOut}</span>
              <span>·</span>
              <span>{data.search.adults} Adults, {data.search.rooms} Room</span>
              <span>·</span>
              <span className="text-taj-burgundy font-medium">Non-Member Public Rates · 18% GST Included</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleFetchLatest}
              disabled={fetching}
              className="px-5 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50 text-center shadow-xs"
            >
              {fetching ? 'Checking Taj Booking Systems…' : 'Refresh Live Rates'}
            </button>
            <Link
              href="/"
              className="px-4 py-3 text-xs uppercase tracking-widest text-taj-charcoal hover:text-taj-burgundy border border-taj-gray-border hover:border-taj-burgundy transition-colors text-center"
            >
              Modify Stay
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-taj-status-failed">
          {error}
        </div>
      )}

      {loading ? (
        <TajPageLoader
          title="Finding Verified Taj Rates"
          subtitle="Checking official rates and real-time availability across properties…"
          type="results"
        />
      ) : fetching ? (
        /* Dedicated Live Agent Pipeline view while fetching is active */
        <AgentLivePipeline
          statusText={fetchProgress}
          checkIn={data?.search?.checkIn}
          checkOut={data?.search?.checkOut}
          isCompleted={fetchCompleted}
        />
      ) : !data ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-sm font-serif text-taj-charcoal-muted">
            {error || 'No search session found or query is loading.'}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-taj-burgundy text-white text-xs font-serif font-medium uppercase tracking-wider rounded-xl"
          >
            Start New Search →
          </Link>
        </div>
      ) : data.summary?.propertiesWithVerifiedData === 0 ? (
        /* Honest Empty State per User Instruction: No Mock Results */
        <EmptySearchState
          searchId={searchId}
          checkIn={data.search?.checkIn || ''}
          checkOut={data.search?.checkOut || ''}
          totalProperties={data.summary?.totalPropertiesMonitored || 31}
          onTriggerFetch={handleFetchLatest}
          isFetching={fetching}
        />
      ) : (
        <>
          {/* Mobile-Only Dedicated Layout */}
          <MobileResultsView
            data={data}
            searchId={searchId || ''}
            onRefresh={handleFetchLatest}
            isRefreshing={fetching}
            mealFilter={mealFilter}
            setMealFilter={setMealFilter}
            flexibleOnly={flexibleOnly}
            setFlexibleOnly={setFlexibleOnly}
          />

          {/* Desktop Layout */}
          <div className="hidden md:block space-y-10">
          {/* Featured Lowest Available Card */}
          {data?.cheapestAvailable && (
            <section className="space-y-3">
              <FeaturedCheapestCard
                hotel={data.cheapestAvailable}
                searchId={searchId}
              />
            </section>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taj-gray-border/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-taj-gray-warm uppercase tracking-wider font-medium">
                Filter:
              </span>
              <button
                onClick={() => setMealFilter(mealFilter === 'breakfast' ? 'all' : 'breakfast')}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  mealFilter === 'breakfast'
                    ? 'bg-taj-burgundy text-white border-taj-burgundy'
                    : 'bg-white text-taj-charcoal border-taj-gray-border hover:bg-taj-cream'
                }`}
              >
                Breakfast Included
              </button>
              <button
                onClick={() => setFlexibleOnly(!flexibleOnly)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  flexibleOnly
                    ? 'bg-taj-burgundy text-white border-taj-burgundy'
                    : 'bg-white text-taj-charcoal border-taj-gray-border hover:bg-taj-cream'
                }`}
              >
                Flexible Cancellation Only
              </button>
            </div>

            <div className="text-xs text-taj-gray-warm">
              Showing {(data.results || []).length} verified Taj properties
            </div>
          </div>

          {/* Results Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.results || []).map((hotel: any) => (
              <HotelCard
                key={hotel.hotelId}
                hotel={hotel}
                searchId={searchId}
              />
            ))}
          </section>

          {/* Unverified Hotels Section */}
          {(data.unverifiedHotels || []).length > 0 && (
            <section className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-4">
              <div className="border-b border-taj-gray-border/60 pb-3">
                <h4 className="text-base font-serif text-taj-burgundy font-medium">
                  Other Taj Properties Available ({(data.unverifiedHotels || []).length})
                </h4>
                <p className="text-xs text-taj-charcoal-muted mt-0.5">
                  Select any property below to explore rooms or check live rates directly.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-taj-charcoal">
                {data.unverifiedHotels.map((h: any) => (
                  <Link
                    key={h.hotelId}
                    href={`/hotel/${h.slug}?searchId=${searchId}`}
                    className="p-3 border border-taj-gray-border/60 bg-taj-cream/20 hover:border-taj-burgundy hover:bg-taj-cream/50 transition-colors group"
                  >
                    <p className="font-serif font-medium text-taj-charcoal group-hover:text-taj-burgundy truncate">{h.canonicalName}</p>
                    <p className="text-[11px] text-taj-gray-warm mt-0.5">{h.city}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <TajPageLoader
              title="Initializing Search"
              subtitle="Accessing verified observation logs and historical property rates…"
              type="results"
            />
          }
        >
          <ResultsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
