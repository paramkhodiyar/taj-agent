import React from 'react';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDataHealthPage() {
  const [
    totalHotels,
    activeHotels,
    totalSnapshots,
    recentSnapshots,
    totalFetchRuns,
    failedFetchRuns,
    anomalousSnapshots,
    recentErrors,
  ] = await Promise.all([
    prisma.hotel.count(),
    prisma.hotel.count({ where: { isActive: true } }),
    prisma.priceSnapshot.count(),
    prisma.priceSnapshot.count({
      where: {
        fetchedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.fetchRun.count(),
    prisma.fetchRun.count({ where: { status: 'FAILED' } }),
    prisma.priceSnapshot.count({ where: { verificationState: 'ANOMALOUS' } }),
    prisma.agentError.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        hotel: { select: { canonicalName: true, city: true } },
      },
    }),
  ]);

  const failureRate =
    totalFetchRuns > 0 ? Math.round((failedFetchRuns / totalFetchRuns) * 100) : 0;

  // Determine System Status per 06-DEPLOYMENT-AND-OPERATIONS.md §5
  let systemStatus: 'HEALTHY' | 'DEGRADED' | 'INCIDENT' = 'HEALTHY';
  let statusReason = 'All data acquisition pipelines operating normally with high verification fidelity.';

  if (failureRate > 25) {
    systemStatus = 'INCIDENT';
    statusReason = `Elevated failure rate detected: ${failureRate}% of fetch runs failed. Check Runbook 1 or 2.`;
  } else if (failureRate > 0 || anomalousSnapshots > 0) {
    systemStatus = 'DEGRADED';
    statusReason = `${failedFetchRuns} failed runs recorded. Prior historical data remains fully preserved and queryable.`;
  }

  const statusColors = {
    HEALTHY: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    DEGRADED: 'bg-amber-50 text-amber-800 border-amber-300',
    INCIDENT: 'bg-red-50 text-red-800 border-red-300',
  };

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Top Header */}
        <div className="border border-taj-gray-border bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
              Operator Operations & Infrastructure Health
            </span>
            <h1 className="text-3xl font-serif text-taj-burgundy">
              Data Pipeline & System Health
            </h1>
            <p className="text-xs text-taj-charcoal-muted">
              Live observability signals and runbook links. Zero raw log inspection needed for ordinary health checks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/fetch-runs"
              className="px-4 py-2.5 text-xs uppercase tracking-wider text-taj-charcoal border border-taj-gray-border hover:bg-taj-cream transition-colors"
            >
              Inspect /fetch-runs →
            </Link>
          </div>
        </div>

        {/* Primary Health Banner */}
        <div className={`p-6 border ${statusColors[systemStatus]} space-y-2`}>
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                systemStatus === 'HEALTHY'
                  ? 'bg-emerald-600'
                  : systemStatus === 'DEGRADED'
                  ? 'bg-amber-600'
                  : 'bg-red-600'
              }`}
            />
            <h2 className="text-lg font-serif font-bold uppercase tracking-wider">
              System Status: {systemStatus}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">{statusReason}</p>
        </div>

        {/* Key Health Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block">
              Properties Monitored
            </span>
            <p className="text-2xl font-serif text-taj-burgundy font-medium">
              {activeHotels} / {totalHotels}
            </p>
            <span className="text-[10px] text-taj-gray-warm block">All active Taj catalog properties</span>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block">
              Total Price Snapshots
            </span>
            <p className="text-2xl font-serif text-taj-charcoal font-medium">
              {totalSnapshots.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 block font-medium">
              +{recentSnapshots} in last 24 hours
            </span>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block">
              Agent Runs Executed
            </span>
            <p className="text-2xl font-serif text-taj-charcoal font-medium">
              {totalFetchRuns}
            </p>
            <span className="text-[10px] text-taj-gray-warm block">
              Failure rate: {failureRate}% ({failedFetchRuns} failed)
            </span>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-taj-gray-warm block">
              Flagged Anomalies
            </span>
            <p className="text-2xl font-serif text-taj-charcoal font-medium">
              {anomalousSnapshots}
            </p>
            <span className="text-[10px] text-taj-gray-warm block">
              Prevented from polluting baseline
            </span>
          </div>
        </div>

        {/* Living Runbooks Quick-Reference per 06-DEPLOYMENT-AND-OPERATIONS.md §7 */}
        <div className="border border-taj-gray-border bg-white p-6 space-y-4">
          <div className="border-b border-taj-gray-border pb-3">
            <h3 className="text-base font-serif text-taj-burgundy font-medium">
              Operational Living Runbooks
            </h3>
            <p className="text-xs text-taj-charcoal-muted mt-0.5">
              Follow established runbooks when investigating errors. Historical rows are never deleted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 border border-taj-gray-border bg-taj-cream/30 space-y-2">
              <span className="font-semibold text-taj-burgundy block">Runbook 1: Site / Markup Changes</span>
              <p className="text-taj-charcoal-muted leading-relaxed">
                Add fixture to golden suite &rarr; reproduce &rarr; update extractor &rarr; bump extractorVersion &rarr; test &amp; deploy.
              </p>
            </div>

            <div className="p-4 border border-taj-gray-border bg-taj-cream/30 space-y-2">
              <span className="font-semibold text-taj-burgundy block">Runbook 2: Rate Limit / CAPTCHA</span>
              <p className="text-taj-charcoal-muted leading-relaxed">
                Prior data is safe. Back off until next scheduled cycle. Do not hammer booking flow. Adjust AGENT_CONCURRENCY.
              </p>
            </div>

            <div className="p-4 border border-taj-gray-border bg-taj-cream/30 space-y-2">
              <span className="font-semibold text-taj-burgundy block">Runbook 3: Reported Anomalies</span>
              <p className="text-taj-charcoal-muted leading-relaxed">
                Audit rawRecordHash in FetchRun. If source published promo, confirm. If parser bug, patch extractor; do not edit DB row.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Error Log */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-taj-burgundy">
            Recent Pipeline Errors ({recentErrors.length})
          </h3>

          {recentErrors.length === 0 ? (
            <div className="border border-taj-gray-border bg-white p-8 text-center text-xs text-emerald-800">
              Zero errors recorded. All agent pipelines running clean.
            </div>
          ) : (
            <div className="border border-taj-gray-border bg-white divide-y divide-taj-gray-border text-xs">
              {recentErrors.map((err) => (
                <div key={err.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-800 border border-red-200 font-mono text-[10px]">
                        {err.errorCode}
                      </span>
                      <span className="font-medium text-taj-charcoal">
                        {err.hotel ? `${err.hotel.canonicalName} (${err.hotel.city})` : 'All Properties'}
                      </span>
                    </div>
                    <p className="text-taj-charcoal-muted text-[11px]">{err.message}</p>
                  </div>

                  <span className="text-[11px] text-taj-gray-warm shrink-0">
                    {new Date(err.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })} IST
                  </span>
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
