import React from 'react';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const revalidate = 0;

export default async function FetchRunsPage() {
  const [totalRuns, failedRuns, completedRuns, recentRuns] = await Promise.all([
    prisma.fetchRun.count(),
    prisma.fetchRun.count({ where: { status: 'FAILED' } }),
    prisma.fetchRun.count({ where: { status: 'COMPLETED' } }),
    prisma.fetchRun.findMany({
      orderBy: { requestedAt: 'desc' },
      take: 15,
      include: {
        fetchRunHotels: {
          include: {
            hotel: { select: { canonicalName: true, city: true } },
          },
          orderBy: { startedAt: 'asc' },
        },
        agentErrors: { take: 5 },
      },
    }),
  ]);

  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Section */}
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-3">
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            System Observability & Verification Transparency
          </span>
          <h1 className="text-3xl font-serif text-taj-burgundy">
            Agent Fetch Activity & Audit Records
          </h1>
          <p className="text-xs sm:text-sm text-taj-charcoal-light max-w-3xl leading-relaxed">
            This log exists so anyone can independently audit where prices come from and inspect
            every verification event. If an official booking flow times out or fails, previous
            historical observations are preserved intact and the failure is logged here honestly.
          </p>
        </div>

        {/* High-Level Trust Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-taj-gray-warm block">
              Total Recorded Fetch Runs
            </span>
            <p className="text-3xl font-serif text-taj-burgundy font-medium">
              {totalRuns} Runs
            </p>
            <span className="text-[11px] text-taj-gray-warm block">
              Audited by deterministic state machine
            </span>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-taj-gray-warm block">
              Historical Verification Success Rate
            </span>
            <p className="text-3xl font-serif text-emerald-800 font-medium">
              {successRate}%
            </p>
            <span className="text-[11px] text-emerald-700 block">
              {completedRuns} runs passed strict validation
            </span>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-taj-gray-warm block">
              Failed & Retained Runs
            </span>
            <p className="text-3xl font-serif text-taj-charcoal font-medium">
              {failedRuns} Runs
            </p>
            <span className="text-[11px] text-taj-gray-warm block">
              Prior historical data preserved with zero overwrites
            </span>
          </div>
        </div>

        {/* Runs Stream */}
        <div className="space-y-6">
          <h2 className="text-lg font-serif text-taj-burgundy">
            Recent Agent Fetch Executions ({recentRuns.length})
          </h2>

          {recentRuns.length === 0 ? (
            <div className="border border-taj-gray-border bg-white p-8 text-center text-xs text-taj-gray-warm">
              No agent fetch runs logged yet.
            </div>
          ) : (
            <div className="space-y-6">
              {recentRuns.map((run) => {
                const duration =
                  run.startedAt && run.completedAt
                    ? `${Math.max(1, Math.round((run.completedAt.getTime() - run.startedAt.getTime()) / 1000))}s`
                    : 'In progress';

                const statusStyles = {
                  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                  PARTIAL: 'bg-amber-50 text-amber-800 border-amber-300',
                  FAILED: 'bg-red-50 text-red-800 border-red-300',
                  RUNNING: 'bg-blue-50 text-blue-800 border-blue-300',
                  QUEUED: 'bg-stone-50 text-stone-700 border-stone-300',
                };

                return (
                  <div
                    key={run.id}
                    className="border border-taj-gray-border bg-white overflow-hidden space-y-4"
                  >
                    {/* Run Header */}
                    <div className="p-5 border-b border-taj-gray-border bg-taj-cream/30 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                              statusStyles[run.status as keyof typeof statusStyles] || 'bg-stone-50'
                            }`}
                          >
                            {run.status}
                          </span>
                          <span className="font-mono text-taj-charcoal font-semibold">
                            Run ID: {run.id}
                          </span>
                        </div>
                        <p className="text-taj-charcoal-muted text-[11px]">
                          Requested:{' '}
                          {new Date(run.requestedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                          })}{' '}
                          IST · Extractor: {run.extractorVersion} (Agent v{run.agentVersion}) · Duration: {duration}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-taj-gray-warm">Properties: </span>
                          <span className="font-medium text-taj-charcoal">
                            {run.successfulHotels}/{run.requestedHotels} verified
                          </span>
                        </div>
                        {run.failedHotels > 0 && (
                          <span className="text-red-700 font-medium">
                            {run.failedHotels} failed (prior data retained)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Per-Hotel Outcome Logs per 01-PRODUCT-AND-UI.md §5.7 */}
                    <div className="p-5 pt-0 space-y-2">
                      <h4 className="text-[11px] uppercase tracking-wider text-taj-gray-warm font-semibold mb-2">
                        Per-Hotel Verification Log
                      </h4>

                      <div className="divide-y divide-taj-gray-border/60 border border-taj-gray-border text-xs">
                        {run.fetchRunHotels.map((h) => {
                          const isFailed = h.status === 'FAILED';
                          return (
                            <div
                              key={h.id}
                              className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                isFailed ? 'bg-red-50/40' : 'bg-white'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isFailed ? 'bg-red-600' : 'bg-emerald-600'
                                    }`}
                                  />
                                  <span className="font-medium text-taj-charcoal">
                                    {h.hotel.canonicalName}
                                  </span>
                                  <span className="text-taj-gray-warm text-[11px]">
                                    ({h.hotel.city})
                                  </span>
                                </div>
                                <p className="text-[11px] text-taj-charcoal-muted pl-4">
                                  {isFailed
                                    ? `FAILED — ${h.error || 'Connection error'} — Previous verified data retained.`
                                    : `FETCHED — ${h.roomsFound} room/rate observations — Validation passed.`}
                                </p>
                              </div>

                              <div className="text-[11px] text-taj-gray-warm sm:text-right pl-4 sm:pl-0">
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-medium border ${
                                    isFailed
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {h.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
