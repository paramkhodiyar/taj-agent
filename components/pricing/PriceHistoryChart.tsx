'use client';

import React, { useState } from 'react';
import { formatIndianCurrency } from './PriceDisplay';

export interface SnapshotHistoryPoint {
  id: string;
  fetchedAt: string; // ISO string
  pricePerNight: number;
  basePrice: number | null;
  taxAmount: number | null;
  totalPrice: number | null;
  currency: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  room: string;
  sourceRoomName: string;
  ratePlan: string;
  mealPlan: string;
  cancellationPolicy: string;
  availabilityStatus: string;
  verificationState: string;
  source: string;
  fetchRunId: string | null;
}

interface PriceHistoryChartProps {
  snapshots: SnapshotHistoryPoint[];
  low30D?: number | null;
  high30D?: number | null;
  median30D?: number | null;
  officialBookingUrl?: string | null;
  hotelName?: string | null;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  snapshots,
  low30D,
  high30D,
  median30D,
  officialBookingUrl,
  hotelName,
}) => {
  const [activePoint, setActivePoint] = useState<SnapshotHistoryPoint | null>(null);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="border border-taj-gray-border bg-white p-8 text-center text-xs text-taj-gray-warm">
        No historical price observations available to plot.
      </div>
    );
  }

  // Sort chronological (oldest to newest for plotting left-to-right)
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime()
  );

  const prices = sorted.map((s) => s.pricePerNight);
  const minPrice = Math.min(...prices, low30D ?? Infinity);
  const maxPrice = Math.max(...prices, high30D ?? -Infinity);

  // Add 10% breathing padding to Y axis
  const yPadding = (maxPrice - minPrice) * 0.1 || 2000;
  const yMin = Math.max(0, minPrice - yPadding);
  const yMax = maxPrice + yPadding;
  const yRange = yMax - yMin || 1;

  // Chart Dimensions
  const width = 800;
  const height = 300;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 48; // comfortable space for X-axis ticks
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index: number) => {
    if (sorted.length === 1) return padLeft + chartW / 2;
    return padLeft + (index / (sorted.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const norm = (val - yMin) / yRange;
    return padTop + chartH - norm * chartH;
  };

  // Build segments and detect rate-plan changes
  const segments: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    hasRateChange: boolean;
    fromRate: string;
    toRate: string;
  }> = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    const hasRateChange =
      cur.ratePlan !== next.ratePlan || cur.mealPlan !== next.mealPlan;

    segments.push({
      x1: getX(i),
      y1: getY(cur.pricePerNight),
      x2: getX(i + 1),
      y2: getY(next.pricePerNight),
      hasRateChange,
      fromRate: cur.ratePlan,
      toRate: next.ratePlan,
    });
  }

  const hasAnyRateChange = segments.some((s) => s.hasRateChange);

  // Generate max 5 clean, non-overlapping tick positions for the X-axis
  const tickCount = Math.min(5, sorted.length);
  const tickIndices = sorted.length <= 5
    ? sorted.map((_, i) => i)
    : Array.from(
        new Set([
          0,
          Math.round((sorted.length - 1) * 0.25),
          Math.round((sorted.length - 1) * 0.5),
          Math.round((sorted.length - 1) * 0.75),
          sorted.length - 1,
        ])
      );

  const selectedPt = activePoint || sorted[sorted.length - 1];

  const formatSourceBadge = (src: string) => {
    if (src === 'taj_official' || src === 'taj_playwright_fetcher') {
      return 'Official Taj Reservation System';
    }
    return src.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="border border-taj-gray-border bg-white p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taj-gray-border pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            Exact Observation Timeline
          </span>
          <h3 className="text-xl font-serif text-taj-burgundy mt-0.5">
            Verified Price History Chart
          </h3>
          <p className="text-xs text-taj-charcoal-muted mt-1">
            Select or hover any point along the timeline to inspect verified historical rates.
          </p>
        </div>

        {hasAnyRateChange && (
          <div className="bg-amber-50 border border-amber-300 px-3 py-1.5 text-xs text-amber-900 flex items-center gap-2">
            <span className="font-bold">⚠️ Rate Plan Change Detected</span>
            <span className="text-[11px] text-amber-800">
              Dashed lines indicate observations differing in meal plans or room inclusions.
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[350px] font-sans select-none"
        >
          {/* Subtle horizontal reference grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const val = yMin + pct * yRange;
            const y = padTop + chartH - pct * chartH;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2DDD8"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-taj-gray-warm text-[10px] tabular-nums"
                >
                  ₹{formatIndianCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* 30D Median Reference Line if present */}
          {median30D && (
            <g>
              <line
                x1={padLeft}
                y1={getY(median30D)}
                x2={width - padRight}
                y2={getY(median30D)}
                stroke="#B88E2E"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={width - padRight}
                y={getY(median30D) - 5}
                textAnchor="end"
                className="fill-taj-gold-muted text-[10px] font-medium"
              >
                30D Median: ₹{formatIndianCurrency(median30D)}
              </text>
            </g>
          )}

          {/* Vertical guideline for active/inspected point */}
          {selectedPt && (
            <line
              x1={getX(sorted.findIndex((s) => s.id === selectedPt.id))}
              y1={padTop}
              x2={getX(sorted.findIndex((s) => s.id === selectedPt.id))}
              y2={padTop + chartH}
              stroke="#4A1521"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.35"
            />
          )}

          {/* Plot Segments */}
          {segments.map((seg, idx) => (
            <line
              key={idx}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={seg.hasRateChange ? '#B45309' : '#4A1521'}
              strokeWidth="2"
              strokeDasharray={seg.hasRateChange ? '4,4' : undefined}
            />
          ))}

          {/* Clean, Non-Crowded X Axis Ticks (Max 5 evenly distributed) */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={width - padRight}
            y2={padTop + chartH}
            stroke="#D1CDC7"
            strokeWidth="1"
          />
          {tickIndices.map((idx) => {
            const point = sorted[idx];
            if (!point) return null;
            const cx = getX(idx);
            const dateObj = new Date(point.fetchedAt);
            const dateStr = dateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            });
            const timeStr = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return (
              <g key={`tick-${idx}`}>
                <line
                  x1={cx}
                  y1={padTop + chartH}
                  x2={cx}
                  y2={padTop + chartH + 5}
                  stroke="#8C827A"
                  strokeWidth="1"
                />
                <text
                  x={cx}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  className="fill-taj-charcoal-light text-[10px] font-medium"
                >
                  {dateStr}
                </text>
                <text
                  x={cx}
                  y={height - padBottom + 30}
                  textAnchor="middle"
                  className="fill-taj-gray-warm text-[9px] tabular-nums"
                >
                  {timeStr}
                </text>
              </g>
            );
          })}

          {/* Plot Points (Clickable & Hoverable without overlapping text labels) */}
          {sorted.map((point, idx) => {
            const cx = getX(idx);
            const cy = getY(point.pricePerNight);
            const isLatest = idx === sorted.length - 1;
            const isHovered = selectedPt?.id === point.id;

            return (
              <g
                key={point.id}
                className="cursor-pointer group"
                onMouseEnter={() => setActivePoint(point)}
                onClick={() => setActivePoint(point)}
              >
                {/* Hit target extension for easy hovering */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="14"
                  fill="transparent"
                />
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="none"
                    stroke="#B88E2E"
                    strokeWidth="1.5"
                    className="opacity-75"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : isLatest ? 5 : 4}
                  fill={isLatest ? '#4A1521' : isHovered ? '#B88E2E' : '#FFFFFF'}
                  stroke="#4A1521"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Observation Inspection Panel */}
      <div className="border border-taj-gray-border bg-taj-cream p-5 text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-taj-gray-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-taj-burgundy uppercase tracking-wider text-[11px]">
              {activePoint ? 'Inspecting Selected Observation' : 'Latest Verified Observation'}
            </span>
            <span className="text-[10px] text-taj-gray-warm font-mono bg-white/70 px-2 py-0.5 border border-taj-gray-border">
              Ref: #{selectedPt.id.slice(0, 10)}
            </span>
          </div>

          {/* Direct Taj Official Booking & Visit Link */}
          {officialBookingUrl ? (
            <a
              href={officialBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-taj-burgundy text-white hover:bg-taj-burgundy-deep text-[11px] font-medium tracking-wider uppercase transition-colors"
              title={`Visit official reservation page for ${hotelName || 'this Taj property'}`}
            >
              <span>Visit Official Taj Website</span>
              <span className="text-xs">↗</span>
            </a>
          ) : (
            <a
              href="https://www.tajhotels.com/en-in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-taj-burgundy text-white hover:bg-taj-burgundy-deep text-[11px] font-medium tracking-wider uppercase transition-colors"
            >
              <span>Visit Taj Hotels ↗</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div>
            <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">Exact Timestamp</span>
            <span className="font-mono font-medium text-taj-charcoal text-[11px] block mt-0.5">
              {new Date(selectedPt.fetchedAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })} IST
            </span>
          </div>

          <div>
            <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">Price / Night</span>
            <span className="font-mono font-bold text-taj-burgundy text-sm block mt-0.5">
              ₹{formatIndianCurrency(selectedPt.pricePerNight)}
            </span>
            {selectedPt.totalPrice && (
              <span className="text-[10px] text-taj-gray-warm block">
                Total: ₹{formatIndianCurrency(selectedPt.totalPrice)}
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">Room & Rate Plan</span>
            <span className="font-medium text-taj-charcoal block truncate mt-0.5">{selectedPt.room}</span>
            <span className="text-[11px] text-taj-charcoal-muted block truncate">{selectedPt.ratePlan}</span>
          </div>

          <div>
            <span className="text-[10px] text-taj-gray-warm block uppercase tracking-wider">Verification Source</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                {selectedPt.verificationState}
              </span>
            </div>
            <span className="text-[11px] text-taj-charcoal-muted block mt-1 font-medium">
              {formatSourceBadge(selectedPt.source)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
