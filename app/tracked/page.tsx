'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PriceDisplay } from '@/components/pricing/PriceDisplay';

export default function TrackedPage() {
  const [tracked, setTracked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<string | null>(null);

  // Form states for creating a new tracked search
  const [checkIn, setCheckIn] = useState('2026-11-20');
  const [checkOut, setCheckOut] = useState('2026-11-22');
  const [adults, setAdults] = useState(2);
  const [threshold, setThreshold] = useState('25000');
  const [email, setEmail] = useState('family@taj-intelligence.local');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTracked = async () => {
    try {
      const res = await fetch('/api/tracked-searches');
      const data = await res.json();
      if (data.success) {
        setTracked(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracked();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/tracked-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn,
          checkOut,
          adults: Number(adults),
          rooms: 1,
          targetPriceThreshold: parseFloat(threshold),
          notifyEmail: email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create tracked search');
      }

      await loadTracked();
    } catch (err: any) {
      setError(err.message || 'Error creating tracked search');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tracked-searches/${id}`, { method: 'DELETE' });
      await loadTracked();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunScheduler = async () => {
    setRunningScheduler(true);
    setSchedulerStatus('Running scheduled collection cycle across all tracked searches…');

    try {
      const res = await fetch('/api/scheduled/run', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Scheduler cycle failed');
      }

      const d = json.data;
      setSchedulerStatus(
        `Scheduler cycle complete: ${d.trackedSearchesProcessed} tracked searches processed, ${d.newSnapshotsCount} new snapshots, ${d.digestsGenerated.length} meaningful digests generated.`
      );
      await loadTracked();
    } catch (err: any) {
      setSchedulerStatus(`Scheduler failed: ${err.message}`);
    } finally {
      setTimeout(() => setRunningScheduler(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
              Automated Surveillance & Notifications
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy">
              Tracked Searches & Daily Collection
            </h1>
            <p className="text-xs text-taj-charcoal-muted">
              Automated price surveillance scheduled daily at 09:00 IST. Alerts trigger exclusively on significant tariff changes.
            </p>
          </div>

          <button
            onClick={handleRunScheduler}
            disabled={runningScheduler}
            className="px-5 py-3 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs uppercase tracking-wider font-medium transition-colors disabled:opacity-50"
          >
            {runningScheduler ? 'Running Cycle…' : 'Execute Scheduler Cycle Now'}
          </button>
        </div>

        {schedulerStatus && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{schedulerStatus}</span>
          </div>
        )}

        {/* Create Tracked Search Form */}
        <div className="border border-taj-gray-border bg-white p-6 space-y-4">
          <h3 className="text-base font-serif text-taj-burgundy font-medium">
            Track a New Stay Window
          </h3>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[11px] text-taj-gray-warm uppercase">Check-In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full border border-taj-gray-border px-3 py-2 text-xs bg-taj-cream"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-taj-gray-warm uppercase">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full border border-taj-gray-border px-3 py-2 text-xs bg-taj-cream"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-taj-gray-warm uppercase">Alert Under (₹/night)</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full border border-taj-gray-border px-3 py-2 text-xs bg-taj-cream"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-taj-gray-warm uppercase">Digest Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-taj-gray-border px-3 py-2 text-xs bg-taj-cream"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 bg-taj-burgundy text-white text-xs uppercase tracking-wider font-medium hover:bg-taj-burgundy-deep transition-colors"
            >
              {creating ? 'Saving…' : 'Track Search'}
            </button>
          </form>
        </div>

        {/* Active Tracked Searches List */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-taj-burgundy">
            Active Tracked Searches ({tracked.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-taj-gray-warm">Loading tracked searches…</div>
          ) : tracked.length === 0 ? (
            <div className="border border-taj-gray-border bg-white p-8 text-center text-xs text-taj-gray-warm">
              No active tracked searches. Add a stay window above to begin accumulating scheduled historical snapshots.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracked.map((t) => (
                <div key={t.id} className="border border-taj-gray-border bg-white p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted font-semibold block">
                        Target Property: {t.hotelName}
                      </span>
                      <h4 className="text-base font-serif text-taj-burgundy font-medium mt-0.5">
                        {t.checkIn} → {t.checkOut}
                      </h4>
                      <p className="text-xs text-taj-gray-warm">
                        {t.adults} Adults · Threshold: ₹{t.targetPriceThreshold?.toLocaleString('en-IN') ?? 'Any drop'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs text-taj-gray-warm hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="border-t border-taj-gray-border pt-3 text-[11px] text-taj-charcoal-muted space-y-1">
                    <p>
                      Last checked:{' '}
                      {t.lastCheckedAt
                        ? new Date(t.lastCheckedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) + ' IST'
                        : 'Pending first scheduled cycle'}
                    </p>
                    {t.lastNotifiedAt && (
                      <p className="text-emerald-800 font-medium">
                        Last meaningful digest sent:{' '}
                        {new Date(t.lastNotifiedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    )}
                    <p className="text-taj-gray-warm">Alert recipient: {t.notifyEmail || 'In-app only'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
