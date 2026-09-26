'use client';

import React, { useState } from 'react';
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
  const [snapshots] = useState<SnapshotHistoryPoint[]>(initialSnapshots);
  const [selectedRoom, setSelectedRoom] = useState<string>('__all__');

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

  return (
    <div className="space-y-6">
      {/* Section Header with Room Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-taj-gray-border pb-4">
        <div>
          <h3 className="text-xl font-serif text-taj-burgundy font-medium">
            Historical Price Intelligence
          </h3>
          <p className="text-xs text-taj-charcoal-muted mt-0.5">
            Verified public observation trends for this property.
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
          No historical price data recorded for this room category yet. Rates will be tracked as verifications occur.
        </div>
      )}

      {/* Stats */}
      {stats && <PriceStats stats={stats} />}
    </div>
  );
};
