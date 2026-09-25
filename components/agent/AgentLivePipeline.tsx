import React from 'react';
import { TajLogo3DLoader } from '@/components/3d/TajLogo3DLoader';

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
    <div className="border-2 border-taj-gold/50 bg-white p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 my-8 rounded-2xl">
      {/* Official Taj Emblem Assembling Piece by Piece */}
      <div className="flex justify-center">
        <TajLogo3DLoader
          size={84}
          theme="light"
          autoReassemble={true}
          replayIntervalMs={4200}
        />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-taj-gold-muted block">
          Official Rate Verification Active
        </span>
        <h3 className="text-2xl sm:text-3xl font-serif text-taj-burgundy font-medium">
          Retrieving Official Taj Rates
        </h3>
        {checkIn && checkOut && (
          <p className="text-xs text-taj-charcoal-muted font-medium">
            Stay Window: {checkIn} → {checkOut} · Live Inquiry Across 31 Iconic Taj Properties
          </p>
        )}
      </div>

      {/* Progress status card */}
      <div className="bg-taj-cream border border-taj-gray-border p-4 text-left space-y-3 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
          <p className="text-xs font-medium text-taj-charcoal">
            {statusText || 'Consulting official Taj reservation systems and verifying availability…'}
          </p>
        </div>

        {/* Verification checkpoints */}
        <div className="space-y-1.5 pt-2 border-t border-taj-gray-border/60 text-[11px] text-taj-charcoal-muted">
          <div className="flex items-center gap-2 text-emerald-800">
            <span>✓</span>
            <span>Target properties identified across palaces, resorts, and city landmarks</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-800">
            <span>✓</span>
            <span>Reviewing live room categories & nightly tariffs</span>
          </div>
          <div className="flex items-center gap-2 text-taj-gold-muted font-medium">
            <span className="text-xs text-taj-gold font-bold">●</span>
            <span>Confirming breakfast inclusions, cancellation flexibility, and member privileges</span>
          </div>
          <div className="flex items-center gap-2 text-taj-gray-warm">
            <span>○</span>
            <span>Preserving verified rates to your private history</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-taj-gray-warm italic">
        Every displayed tariff is directly verified against official Taj reservation systems.
      </p>
    </div>
  );
};
