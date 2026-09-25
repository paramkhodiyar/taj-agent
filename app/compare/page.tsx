'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PriceDisplay } from '@/components/pricing/PriceDisplay';
import { FreshnessBadge } from '@/components/pricing/FreshnessBadge';
import { TajPageLoader } from '@/components/layout/TajPageLoader';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const hotelSlugsParam = searchParams.get('hotels') || 'taj-mahal-palace-mumbai,taj-lake-palace-udaipur';
  const checkIn = searchParams.get('checkIn') || '2026-11-20';
  const checkOut = searchParams.get('checkOut') || '2026-11-22';

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComparison() {
      setLoading(true);
      const slugs = hotelSlugsParam.split(',').filter(Boolean);

      const loaded = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const hRes = await fetch(`/api/hotels/${slug}`);
            const hData = await hRes.json();
            if (!hData.success) return null;

            const pRes = await fetch(
              `/api/hotels/${slug}/price-history?checkIn=${checkIn}&checkOut=${checkOut}`
            );
            const pData = await pRes.json();

            let targetSnapshot = null;
            const snapshotsParam = searchParams.get('snapshots');
            if (snapshotsParam && pData.snapshots) {
              const ids = snapshotsParam.split(',');
              targetSnapshot = pData.snapshots.find((s: any) => ids.includes(s.id)) || null;
            }

            const latest = targetSnapshot || pData.snapshots?.[0] || null;

            return {
              hotel: hData.data,
              stats: pData.stats,
              latest,
            };
          } catch (e) {
            return null;
          }
        })
      );

      setHotels(loaded.filter(Boolean));
      setLoading(false);
    }

    loadComparison();
  }, [hotelSlugsParam, checkIn, checkOut]);

  // Check like-for-like consistency per 01-PRODUCT-AND-UI.md §3.3 & §5.5
  const hasVaryingMealPlans =
    hotels.length > 1 &&
    new Set(hotels.map((h) => h.latest?.mealPlan).filter(Boolean)).size > 1;

  const hasVaryingCancellation =
    hotels.length > 1 &&
    new Set(hotels.map((h) => h.latest?.isFlexible)).size > 1;

  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const snapshotIds = hotels.map((h) => h.latest?.id).filter(Boolean);
    const url = new URL(window.location.href);
    if (snapshotIds.length > 0) {
      url.searchParams.set('snapshots', snapshotIds.join(','));
    }
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
              Side-By-Side Intelligence Matrix
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy">
              Hotel & Rate Comparison
            </h1>
            <p className="text-xs text-taj-charcoal-muted mt-0.5">
              Like-for-like comparison across stay dates {checkIn} to {checkOut}.
            </p>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="self-start sm:self-auto px-4 py-2.5 bg-taj-cream hover:bg-taj-cream/80 text-taj-burgundy border border-taj-burgundy/40 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
          >
            {copied ? '✓ Shareable Link Copied' : 'Copy Shareable Link'}
          </button>
        </div>

        {(hasVaryingMealPlans || hasVaryingCancellation) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
            <span className="font-semibold block">⚠️ Package & Inclusions Notice:</span>
            <p>
              These rates reflect differing product terms ({hasVaryingMealPlans ? 'meal inclusions vary' : ''}
              {hasVaryingMealPlans && hasVaryingCancellation ? '; ' : ''}
              {hasVaryingCancellation ? 'cancellation flexibility differs' : ''}). Compare carefully.
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <TajPageLoader
          title="Building Comparison Matrix"
          subtitle="Aligning room tiers, inclusions, and historical rates across selected properties…"
        />
      ) : hotels.length === 0 ? (
        <div className="border border-taj-gray-border bg-white p-12 text-center text-xs text-taj-gray-warm">
          No properties selected for comparison. Add hotel slugs to the URL parameters.
        </div>
      ) : (
        <div className="border border-taj-gray-border bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-taj-gray-border bg-taj-cream text-taj-charcoal">
                <th className="py-4 px-5 font-serif text-sm w-48 bg-white border-r border-taj-gray-border">
                  Comparison Criteria
                </th>
                {hotels.map((item) => (
                  <th key={item.hotel.id} className="py-4 px-5 font-serif text-base min-w-[260px]">
                    <div className="space-y-1">
                      <p className="text-taj-burgundy font-medium">{item.hotel.canonicalName}</p>
                      <p className="text-[11px] font-sans text-taj-gray-warm font-normal">
                        {item.hotel.city}, {item.hotel.state}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-taj-gray-border">
              {/* Verified Nightly Rate */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  Verified Nightly Rate
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5">
                    {item.latest ? (
                      <PriceDisplay amount={item.latest.pricePerNight} size="lg" />
                    ) : (
                      <span className="text-taj-gray-warm italic">Not verified yet</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Lead Room */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  Lead Room
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5 font-medium text-taj-charcoal">
                    {item.latest?.room || '—'}
                  </td>
                ))}
              </tr>

              {/* Rate Plan */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  Rate Plan
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5 text-taj-charcoal-muted">
                    {item.latest?.ratePlan || '—'}
                  </td>
                ))}
              </tr>

              {/* Meal Inclusions */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  Meal Plan
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] border ${
                        item.latest?.mealPlan?.toLowerCase().includes('breakfast')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {item.latest?.mealPlan || '—'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Cancellation Policy */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  Cancellation Terms
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5 text-taj-charcoal">
                    {item.latest?.cancellationPolicy || '—'}
                  </td>
                ))}
              </tr>

              {/* 30D Low */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  30-Day Low
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5 text-emerald-800 font-medium">
                    {item.stats?.low ? `₹${item.stats.low.toLocaleString('en-IN')}` : '—'}
                  </td>
                ))}
              </tr>

              {/* 30D High */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  30-Day High
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5 text-taj-charcoal-muted">
                    {item.stats?.high ? `₹${item.stats.high.toLocaleString('en-IN')}` : '—'}
                  </td>
                ))}
              </tr>

              {/* 30D Median */}
              <tr>
                <td className="py-3.5 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  30-Day Median
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-3.5 px-5 text-taj-gold-muted font-medium">
                    {item.stats?.median ? `₹${item.stats.median.toLocaleString('en-IN')}` : '—'}
                  </td>
                ))}
              </tr>

              {/* Provenance & Action */}
              <tr>
                <td className="py-4 px-5 font-semibold text-taj-charcoal bg-taj-cream/30 border-r border-taj-gray-border">
                  Detail & History
                </td>
                {hotels.map((item) => (
                  <td key={item.hotel.id} className="py-4 px-5">
                    <Link
                      href={`/hotel/${item.hotel.slug}`}
                      className="inline-block px-4 py-2 text-xs uppercase tracking-wider text-taj-burgundy border border-taj-burgundy/40 hover:bg-taj-burgundy hover:text-white transition-colors"
                    >
                      View Full Details →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Suspense
          fallback={
            <TajPageLoader
              title="Loading Comparison"
              subtitle="Aligning room tiers, inclusions, and historical rates across selected properties…"
            />
          }
        >
          <CompareContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
