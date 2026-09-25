import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="border border-taj-gray-border bg-white p-6 sm:p-10 space-y-4">
          <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
            Provenance & Integrity Standards
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-taj-burgundy">
            How We Get and Verify Taj Prices
          </h1>
          <p className="text-xs sm:text-sm text-taj-charcoal-muted leading-relaxed">
            Taj Price Intelligence was designed from the ground up on one inviolable principle:{' '}
            <strong className="text-taj-charcoal">We never fabricate, estimate, or hallucinate a price.</strong>{' '}
            Here is the transparent step-by-step pipeline behind every number on this screen.
          </p>
        </div>

        {/* Step-by-Step Architecture Explanation */}
        <div className="space-y-6">
          <div className="border border-taj-gray-border bg-white p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-taj-burgundy text-white flex items-center justify-center text-xs font-mono">
                1
              </span>
              <h2 className="text-base font-serif text-taj-burgundy font-medium">
                Step 1: Direct Acquisition from Official Booking Flow
              </h2>
            </div>
            <p className="text-xs text-taj-charcoal-muted leading-relaxed pl-9">
              When a price verification runs, our Booking Fetcher opens permitted official Taj booking
              channels for specific travel dates and occupancy. We obtain raw, unmodified room and rate
              records directly from the source.
            </p>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-taj-burgundy text-white flex items-center justify-center text-xs font-mono">
                2
              </span>
              <h2 className="text-base font-serif text-taj-burgundy font-medium">
                Step 2: Deterministic Normalization & Label Preservation
              </h2>
            </div>
            <p className="text-xs text-taj-charcoal-muted leading-relaxed pl-9">
              Raw rate names and room descriptions are normalized into canonical categories (e.g. &quot;Deluxe Room&quot;)
              while <em>strictly retaining the original source label</em> so that any mapping can be audited.
              Meal plans and cancellation terms are extracted as first-class structured attributes.
            </p>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-taj-burgundy text-white flex items-center justify-center text-xs font-mono">
                3
              </span>
              <h2 className="text-base font-serif text-taj-burgundy font-medium">
                Step 3: Multi-Stage Validation & Anomaly Detection
              </h2>
            </div>
            <p className="text-xs text-taj-charcoal-muted leading-relaxed pl-9">
              Before any record touches the database, our Validation Engine verifies date order, occupancy
              matches, INR currency formatting, and checks that base rate plus taxes equals total price.
              Unrealistic price swings (&gt;70% drops) are flagged as ANOMALOUS for verification, never
              silently treated as verified drops.
            </p>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-taj-burgundy text-white flex items-center justify-center text-xs font-mono">
                4
              </span>
              <h2 className="text-base font-serif text-taj-burgundy font-medium">
                Step 4: Immutable Append-Only Archival
              </h2>
            </div>
            <p className="text-xs text-taj-charcoal-muted leading-relaxed pl-9">
              Every verified observation is saved as a permanent record. System-level audit triggers
              strictly prohibit overwriting or deleting historical price observations. Historical observations
              are preserved forever with complete fidelity.
            </p>
          </div>

          <div className="border border-taj-gray-border bg-white p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-taj-burgundy text-white flex items-center justify-center text-xs font-mono">
                5
              </span>
              <h2 className="text-base font-serif text-taj-burgundy font-medium">
                Step 5: Observable Freshness & Audit Logs
              </h2>
            </div>
            <p className="text-xs text-taj-charcoal-muted leading-relaxed pl-9">
              Every price on screen displays its exact timestamp and freshness state (Verified just now,
              Verified 4 min ago, Last verified 18 hours ago). If a refresh fails, we display honest
              human copy: &quot;Latest refresh failed — showing last verified observation&quot;.
            </p>
            <div className="pl-9 pt-2">
              <Link
                href="/fetch-runs"
                className="inline-block text-xs uppercase tracking-wider text-taj-burgundy font-medium hover:underline"
              >
                Inspect Live Agent Activity & Audit Records →
              </Link>
            </div>
          </div>

          {/* Developer Provenance */}
          <div className="border border-taj-gold/50 bg-taj-cream p-6 space-y-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-taj-gold-muted block">
                Engineering Provenance &amp; Developer Notes
              </span>
            </div>
            <p className="text-xs text-taj-charcoal leading-relaxed">
              Designed &amp; engineered by <strong className="text-taj-burgundy font-semibold">Param Khodiyar</strong>. Built under the sacred oath that no traveler shall be subjected to fake AI discounts, manufactured scarcity countdowns, or inflated third-party OTA commissions when reserving India&apos;s greatest royal heritage hotels.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
