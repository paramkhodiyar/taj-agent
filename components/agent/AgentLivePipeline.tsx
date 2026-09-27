'use client';

import React, { useState, useEffect } from 'react';
import { TajLogo3DLoader } from '@/components/3d/TajLogo3DLoader';

interface AgentLivePipelineProps {
  statusText?: string | null;
  checkIn?: string;
  checkOut?: string;
  isCompleted?: boolean;
}

export const AgentLivePipeline: React.FC<AgentLivePipelineProps> = ({
  statusText,
  checkIn,
  checkOut,
  isCompleted = false,
}) => {
  // Step progression:
  // Step 1: Target properties identified
  // Step 2: Reviewing live room categories & tariffs
  // Step 3: Confirming meal options, cancellation flexibility & 18% GST
  // Step 4: Preserving verified rates
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isCompleted) {
      setCurrentStep(4);
      return;
    }

    // Step 1 is in progress initially, completes after 1.2s -> advances to Step 2
    const t1 = setTimeout(() => setCurrentStep(2), 1200);
    // Step 2 completes after ~2.8s -> advances to Step 3
    const t2 = setTimeout(() => setCurrentStep(3), 2800);
    // Step 3 completes after ~4.6s -> advances to Step 4
    const t3 = setTimeout(() => setCurrentStep(4), 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isCompleted]);

  const steps = [
    {
      id: 1,
      label: 'Target properties identified across palaces, resorts, and city landmarks',
      activeText: 'Identifying official properties across palaces, resorts, and city landmarks…',
    },
    {
      id: 2,
      label: 'Reviewing live room categories & public tariffs',
      activeText: 'Querying official reservation channels for room categories and nightly tariffs…',
    },
    {
      id: 3,
      label: 'Confirming breakfast inclusions, cancellation flexibility, and 18% GST',
      activeText: 'Validating meal inclusions, cancellation policies, and 18% GST breakdown…',
    },
    {
      id: 4,
      label: 'Preserving verified rates to property intelligence',
      activeText: 'Saving immutable rate snapshots and finalizing search results…',
    },
  ];

  return (
    <div className="border-2 border-taj-gold/50 bg-white p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 my-8 rounded-2xl shadow-sm">
      {/* Official Taj Emblem Assembling */}
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
            Stay Window: {checkIn} → {checkOut} · Live Inquiry Across Taj Properties
          </p>
        )}
      </div>

      {/* Dynamic Progress Status Card */}
      <div className="bg-taj-cream border border-taj-gray-border p-5 text-left space-y-3.5 rounded-xl">
        <div className="flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isCompleted ? 'bg-emerald-600' : 'bg-taj-gold animate-pulse'
            }`}
          />
          <p className="text-xs font-medium text-taj-charcoal truncate">
            {statusText ||
              (isCompleted
                ? 'Rate verification complete. Displaying official tariffs.'
                : steps[currentStep - 1]?.activeText)}
          </p>
        </div>

        {/* Step-by-Step Checkpoints */}
        <div className="space-y-2.5 pt-3 border-t border-taj-gray-border/60 text-xs">
          {steps.map((step) => {
            const isDone = currentStep > step.id || (isCompleted && currentStep >= step.id);
            const isActive = currentStep === step.id && !isCompleted;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-2.5 transition-all duration-300 ${
                  isDone
                    ? 'text-emerald-900'
                    : isActive
                    ? 'text-taj-charcoal font-medium'
                    : 'text-taj-gray-warm'
                }`}
              >
                {/* Checkmark icon with smooth transition */}
                <span className="shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
                  {isDone ? (
                    <span className="text-emerald-700 font-bold text-sm leading-none animate-in fade-in zoom-in duration-200">
                      ✓
                    </span>
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-taj-gold animate-ping inline-block" />
                  ) : (
                    <span className="text-taj-gray-warm text-xs leading-none">○</span>
                  )}
                </span>

                <span
                  className={`text-[12px] leading-snug ${
                    isDone
                      ? 'font-medium text-emerald-950'
                      : isActive
                      ? 'font-semibold text-taj-burgundy'
                      : 'text-taj-charcoal-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-taj-gray-warm italic">
        Every displayed tariff is directly verified against official Taj reservation systems.
      </p>
    </div>
  );
};
