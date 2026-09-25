'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHolidaysInStayRange, getUpcomingLongWeekends } from '@/lib/holidays';

export const SearchForm: React.FC = () => {
  const router = useRouter();

  // Default to upcoming weekend (4 weeks out)
  const defaultCheckIn = new Date();
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 28);
  const day = defaultCheckIn.getDay();
  const diffToFriday = (5 - day + 7) % 7;
  defaultCheckIn.setDate(defaultCheckIn.getDate() + (diffToFriday === 0 ? 7 : diffToFriday));

  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(formatDate(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(formatDate(defaultCheckOut));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeHolidays = getHolidaysInStayRange(checkIn, checkOut);
  const upcomingLongWeekends = getUpcomingLongWeekends();

  const handleSelectLongWeekend = (hDateStr: string) => {
    const d = new Date(hDateStr);
    const dow = d.getDay();
    let start = new Date(d);
    let end = new Date(d);

    if (dow === 5) {
      end.setDate(d.getDate() + 2);
    } else if (dow === 1) {
      start.setDate(d.getDate() - 2);
    } else {
      end.setDate(d.getDate() + 2);
    }

    setCheckIn(formatDate(start));
    setCheckOut(formatDate(end));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn,
          checkOut,
          adults: Number(adults),
          children: Number(children),
          rooms: Number(rooms),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize search');
      }

      // Automatically launch the live agentic fetch on the results screen
      router.push(`/results?searchId=${data.data.id}&autoFetch=true`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating search');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-taj-gold/40 p-5 sm:p-6 transition-all duration-300 shadow-sm"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-taj-status-failed">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Check-In */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-taj-gold-muted">
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="w-full border border-taj-gray-border px-3.5 py-2.5 text-xs bg-taj-cream text-taj-charcoal font-medium focus:outline-none focus:border-taj-burgundy focus:ring-1 focus:ring-taj-burgundy transition-colors"
            />
          </div>

          {/* Check-Out */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-taj-gold-muted">
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full border border-taj-gray-border px-3.5 py-2.5 text-xs bg-taj-cream text-taj-charcoal font-medium focus:outline-none focus:border-taj-burgundy focus:ring-1 focus:ring-taj-burgundy transition-colors"
            />
          </div>

          {/* Adults */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-taj-gold-muted">
              Guests (Adults 12+)
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full border border-taj-gray-border px-3.5 py-2.5 text-xs bg-taj-cream text-taj-charcoal font-medium focus:outline-none focus:border-taj-burgundy focus:ring-1 focus:ring-taj-burgundy transition-colors"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Adult' : 'Adults'}
                </option>
              ))}
            </select>
          </div>

          {/* Rooms */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-taj-gold-muted">
              Rooms
            </label>
            <select
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              className="w-full border border-taj-gray-border px-3.5 py-2.5 text-xs bg-taj-cream text-taj-charcoal font-medium focus:outline-none focus:border-taj-burgundy focus:ring-1 focus:ring-taj-burgundy transition-colors"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Room' : 'Rooms'}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white font-serif font-medium text-xs tracking-[0.15em] uppercase border border-taj-burgundy transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Initiating Pipeline…' : 'Discover Rates →'}
            </button>
          </div>
        </div>

        {/* Holiday Banner if matching */}
        {activeHolidays.length > 0 && (
          <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <span className="font-semibold">🗓️ Holiday Alert:</span>
            <span>{activeHolidays.map((h) => `${h.name} (${h.date})`).join(', ')}. Peak demand period. Mid-week stays offer greater flexibility.</span>
          </div>
        )}
      </form>

      {/* Long Weekend Quick Picks */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-taj-gray-warm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted font-semibold">
            Suggested Long Weekends:
          </span>
          {upcomingLongWeekends.slice(0, 3).map((h) => (
            <button
              key={h.name}
              type="button"
              onClick={() => handleSelectLongWeekend(h.date)}
              className="text-[11px] px-2.5 py-0.5 border border-taj-gray-border bg-white hover:bg-taj-cream text-taj-charcoal hover:border-taj-burgundy transition-colors"
            >
              {h.name}
            </button>
          ))}
        </div>
        <span className="text-[11px] italic text-taj-charcoal-muted hidden sm:inline">
          Official Taj booking infrastructure query
        </span>
      </div>
    </div>
  );
};
