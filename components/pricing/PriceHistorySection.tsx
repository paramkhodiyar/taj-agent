'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PriceHistoryChart, SnapshotHistoryPoint } from '@/components/pricing/PriceHistoryChart';
import { PriceStats } from '@/components/pricing/PriceStats';

interface PriceHistorySectionProps {
  slug: string;
  initialSnapshots: SnapshotHistoryPoint[];
  officialBookingUrl: string | null;
  hotelName: string;
}

export const PriceHistorySection: React.FC<PriceHistorySectionProps> = ({
  slug,
  initialSnapshots,
  officialBookingUrl,
  hotelName,
}) => {
  const [snapshots, setSnapshots] = useState<SnapshotHistoryPoint[]>(initialSnapshots);
  const [selectedRoom, setSelectedRoom] = useState<string>('__all__');
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillDone, setBackfillDone] = useState(false);

  // Derive unique room names from snapshots
  const roomNames = React.useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const s of snapshots) {
      if (!seen.has(s.room)) {
        seen.add(s.room);
        names.push(s.room);
      }
    }
    return names;
  }, [snapshots]);

  // Filtered snapshots for the selected room
  const filteredSnapshots = React.useMemo(() => {
    if (selectedRoom === '__all__') return snapshots;
    return snapshots.filter((s) => s.room === selectedRoom);
  }, [snapshots, selectedRoom]);

  // Stats derived from filtered snapshots
  const stats = React.useMemo(() => {
    const prices = filteredSnapshots.map((s) => s.pricePerNight).filter((p) => p > 0);
    if (prices.length === 0) return null;
    const sorted = [...prices].sort((a, b) => a - b);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    const mean = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 !== 0
        ? sorted[mid]
        : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    const current = filteredSnapshots[filteredSnapshots.length - 1]?.pricePerNight ?? median;
    const diffFromMedian = current - median;
    const pctFromMedian = Math.round((diffFromMedian / median) * 100);

    return {
      observationCount: filteredSnapshots.length,
      daysWindow: 40,
      current,
      low,
      high,
      mean,
      median,
      pctFromMedian,
      positionLabel:
        diffFromMedian < 0
          ? `${Math.abs(pctFromMedian)}% below 40-day median`
          : diffFromMedian > 0
          ? `${pctFromMedian}% above 40-day median`
          : 'Matching 40-day median',
    };
  }, [filteredSnapshots]);

  // Auto-backfill on first mount if insufficient data
  const triggerBackfill = useCallback(async () => {
    if (isBackfilling || backfillDone) return;
    if (snapshots.length >= 30) {
      setBackfillDone(true);
      return;
    }

    setIsBackfilling(true);
    try {
      const res = await fetch(`/api/hotels/${slug}/backfill-history`, { method: 'POST' });
      const data = await res.json();

      if (data.success && !data.skipped && data.totalSnapshotsPersisted > 0) {
        // Reload price history from the history API with a 40-day window
        const histRes = await fetch(
          `/api/hotels/${slug}/price-history?days=40`,
          { cache: 'no-store' }
        );
        const histData = await histRes.json();
        if (histData.success && Array.isArray(histData.snapshots) && histData.snapshots.length > 0) {
          setSnapshots(histData.snapshots);
        }
      }
    } catch (e) {
      // Silently fail — chart will show whatever data is available
      console.error('[PriceHistorySection] Backfill failed:', e);
    } finally {
      setIsBackfilling(false);
      setBackfillDone(true);
    }
  }, [slug, isBackfilling, backfillDone, snapshots.length]);

  useEffect(() => {
    // Small delay so the page renders first, then backfill in background
    const timer = setTimeout(triggerBackfill, 800);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Section Header + Room Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            Price Intelligence
          </span>
          <h2 className="text-xl font-serif text-taj-burgundy mt-0.5">
            40-Day Rate History
          </h2>
          <p className="text-xs text-taj-charcoal-muted mt-1">
            Select a room category below to see its specific price history over the past 40 days.
          </p>
        </div>

        {roomNames.length > 1 && (
          <div className="flex items-center gap-3">
            <label
              htmlFor="room-filter"
              className="text-xs font-medium text-taj-charcoal uppercase tracking-wider shrink-0"
            >
              Filter by Room:
            </label>
            <select
              id="room-filter"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="border border-taj-gray-border bg-white text-xs text-taj-charcoal px-3 py-2 focus:outline-none focus:ring-1 focus:ring-taj-burgundy min-w-[220px]"
            >
              <option value="__all__">All Room Categories</option>
              {roomNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading indicator during backfill */}
      {isBackfilling && (
        <div className="flex items-center gap-2 text-xs text-taj-gray-warm bg-taj-cream border border-taj-gray-border px-4 py-2">
          <span className="inline-block w-3 h-3 border-2 border-taj-burgundy border-t-transparent rounded-full animate-spin" />
          <span>Loading price history…</span>
        </div>
      )}

      {/* Chart */}
      {filteredSnapshots.length > 0 ? (
        <PriceHistoryChart
          snapshots={filteredSnapshots}
          low30D={stats?.low}
          high30D={stats?.high}
          median30D={stats?.median}
          officialBookingUrl={officialBookingUrl}
          hotelName={hotelName}
        />
      ) : (
        <div className="border border-taj-gray-border bg-white p-8 text-center text-xs text-taj-gray-warm">
          {isBackfilling
            ? 'Fetching price history…'
            : 'No historical price data available for this room category yet.'}
        </div>
      )}

      {/* Stats */}
      <PriceStats stats={stats} />
    </div>
  );
};
