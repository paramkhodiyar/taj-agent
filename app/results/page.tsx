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

  // Automatically launch the live agentic fetch when user triggers a search
  useEffect(() => {
    if (autoFetch && searchId && !fetching) {
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
    if (!searchId) return;
    setFetching(true);
    setFetchProgress('Taj Intelligence Agent: Extracting official verified inventory across properties…');

    try {
      const res = await fetch(`/api/searches/${searchId}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to refresh prices');
      }

      setFetchProgress(
        `Completed: ${json.successfulHotels}/${json.requestedHotels} properties verified. ${json.totalSnapshotsPersisted} snapshots persisted.`
      );

      // Reload results from DB
      await loadResults();
    } catch (err: any) {
      setError(err.message || 'Fetch request failed');
    } finally {
      setTimeout(() => {
        setFetching(false);
        setFetchProgress(null);
      }, 2500);
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
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-taj-gold-muted font-medium block">
              Stay Parameters & Intelligence Scope
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy">
              Taj Availability & Verified Rates
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-taj-charcoal-light pt-1">
              <span>Check-in: <strong>{data.search.checkIn}</strong></span>
              <span>·</span>
              <span>Check-out: <strong>{data.search.checkOut}</strong></span>
              <span>·</span>
              <span>{data.search.adults} Adults, {data.search.rooms} Room</span>
              <span>·</span>
              <span>{data.summary.totalPropertiesMonitored} Properties Monitored</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleFetchLatest}
              disabled={fetching}
              className="px-5 py-3 bg-white hover:bg-taj-cream text-taj-burgundy text-xs uppercase tracking-wider font-medium border border-taj-burgundy transition-colors disabled:opacity-50"
            >
              {fetching ? 'Checking Taj Booking Systems…' : 'Fetch Latest Verified Prices'}
            </button>
            <Link
              href="/"
              className="px-4 py-3 text-xs uppercase tracking-wider text-taj-charcoal-muted hover:text-taj-burgundy border border-taj-gray-border"
            >
              Modify Dates
            </Link>
          </div>
        </div>
      )}

      {/* Live Agent Fetch Pipeline per 01-PRODUCT-AND-UI.md §8.1 */}
      {fetching && (
        <AgentLivePipeline
          statusText={fetchProgress}
          checkIn={data?.search?.checkIn}
          checkOut={data?.search?.checkOut}
        />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-taj-status-failed">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-taj-gold border-t-transparent animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-taj-gold-muted">
            Querying Historical Database…
          </p>
        </div>
      ) : data?.summary.propertiesWithVerifiedData === 0 ? (
        /* Honest Empty State per 01-PRODUCT-AND-UI.md §8.1 & Phase 4 Gate */
        <EmptySearchState
          searchId={searchId}
          checkIn={data.search.checkIn}
          checkOut={data.search.checkOut}
          totalProperties={data.summary.totalPropertiesMonitored}
          onTriggerFetch={handleFetchLatest}
          isFetching={fetching}
        />
      ) : (
        <div className="space-y-10">
          {/* Featured Cheapest Available Card */}
          {data?.cheapestAvailable && (
            <section className="space-y-3">
              <FeaturedCheapestCard
                hotel={data.cheapestAvailable}
                searchId={searchId}
              />
            </section>
          )}

          {/* Filter Bar per 01-PRODUCT-AND-UI.md §8.8 */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taj-gray-border pb-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-taj-gray-warm uppercase tracking-wider">
                Filter By Terms:
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
              Showing {data.results.length} eligible properties
            </div>
          </div>

          {/* Results Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.results.map((hotel: any) => (
              <HotelCard
                key={hotel.hotelId}
                hotel={hotel}
                searchId={searchId}
              />
            ))}
          </section>

          {/* Unverified Hotels Section */}
          {data.unverifiedHotels.length > 0 && (
            <section className="border border-taj-gray-border bg-white p-6 space-y-4">
              <div className="border-b border-taj-gray-border pb-3">
                <h4 className="text-sm font-serif text-taj-burgundy font-medium">
                  Properties Awaiting Initial Verification ({data.unverifiedHotels.length})
                </h4>
                <p className="text-xs text-taj-charcoal-muted mt-0.5">
                  These Taj properties have no cached observations recorded for these exact dates.
                  Tap 'Fetch Latest Verified Prices' above to query them.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-taj-charcoal">
                {data.unverifiedHotels.map((h: any) => (
                  <div key={h.hotelId} className="p-2 border border-taj-gray-border/60 bg-taj-cream/30">
                    <p className="font-medium truncate">{h.canonicalName}</p>
                    <p className="text-[11px] text-taj-gray-warm">{h.city}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
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
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-taj-gold border-t-transparent animate-spin mx-auto" />
              <p className="text-xs uppercase tracking-widest text-taj-gold-muted">
                Initializing search parameters…
              </p>
            </div>
          }
        >
          <ResultsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
