'use client';

import React from 'react';

interface AgentLivePipelineProps {
  statusText?: string | null;
  checkIn?: string;
  checkOut?: string;
}

export const AgentLivePipeline: React.FC<AgentLivePipelineProps> = ({
  statusText,
  checkIn,
  checkOut,
}) => {
  return (
    <div className="border-2 border-taj-gold/50 bg-white p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-8 my-8 shadow-sm">
      {/* Official Taj Crest with pulsing gold ring */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-taj-gold/30 animate-ping opacity-30" />
        <div className="w-16 h-16 rounded-full bg-taj-cream border border-taj-gold flex items-center justify-center p-2.5">
          <img src="/taj-logo.svg" alt="Taj Official Crest" className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-taj-gold-muted block">
          Agentic AI Verification Pipeline Active
        </span>
        <h3 className="text-2xl sm:text-3xl font-serif text-taj-burgundy font-medium">
          Extracting Official Taj Booking Data
        </h3>
        {checkIn && checkOut && (
          <p className="text-xs text-taj-charcoal-muted font-medium">
            Stay Window: {checkIn} → {checkOut} · Live Query Across 31 Taj Properties
          </p>
        )}
      </div>

      {/* Progress status card */}
      <div className="bg-taj-cream border border-taj-gray-border p-4 text-left space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <p className="text-xs font-medium text-taj-charcoal">
            {statusText || 'Querying official Taj reservation infrastructure & running multi-stage validation…'}
          </p>
        </div>

        {/* Pipeline checkpoints */}
        <div className="space-y-1.5 pt-2 border-t border-taj-gray-border/60 text-[11px] text-taj-charcoal-muted">
          <div className="flex items-center gap-2 text-emerald-800">
            <span>✓</span>
            <span>Target properties identified from canonical Taj catalog</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-800">
            <span>✓</span>
            <span>Agentic AI extractor analyzing live room tiers & nightly tariffs</span>
          </div>
          <div className="flex items-center gap-2 text-taj-gold-muted font-medium">
            <span className="animate-spin text-xs">⟳</span>
            <span>Validating meal plans, cancellation policies, and anomaly drop thresholds</span>
          </div>
          <div className="flex items-center gap-2 text-taj-gray-warm">
            <span>○</span>
            <span>Archiving verified observations to immutable historical records</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-taj-gray-warm italic">
        Every displayed tariff is directly verified against official Taj reservation systems.
      </p>
    </div>
  );
};
