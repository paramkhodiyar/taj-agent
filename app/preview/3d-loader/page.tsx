'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TajPalace3DLoader } from '@/components/3d/TajPalace3DLoader';
import { Sparkles, Eye, ArrowLeft, RotateCcw, Zap, Compass, CheckCircle2 } from 'lucide-react';

export default function Preview3DLoaderPage() {
  const [speed, setSpeed] = useState<number>(1);
  const [key, setKey] = useState<number>(0);
  const [assembledCount, setAssembledCount] = useState<number>(0);

  const handleReassemble = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#140408] text-taj-cream flex flex-col selection:bg-taj-gold selection:text-black">
      {/* Top Luxury Preview Navigation Bar */}
      <header className="w-full border-b border-taj-gold/20 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-taj-gold active:scale-95 transition-all"
              title="Return to Main Application"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="border-l border-taj-gold/30 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-[0.2em] text-xs sm:text-sm font-semibold text-taj-gold block">
                  TAJ 3D ARCHITECTURAL LOADER
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-taj-gold/20 text-taj-gold border border-taj-gold/40">
                  INTERACTIVE PROTOTYPE
                </span>
              </div>
              <span className="text-[10px] text-taj-cream/60 font-sans">
                Procedural Three.js Voxel Assembly from Randomized 3D Vectors
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-taj-gold/40 text-xs font-serif text-taj-gold hover:bg-taj-gold/10 transition-colors"
            >
              Return to App →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Showcase Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-stretch">
        {/* 3D Canvas Stage Card */}
        <section className="flex-1 bg-gradient-to-b from-[#24080f] to-[#120306] rounded-3xl border border-taj-gold/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative min-h-[520px]">
          <TajPalace3DLoader
            key={key}
            speedMultiplier={speed}
            onAssembled={() => setAssembledCount((c) => c + 1)}
          />
        </section>

        {/* Interactive Controls & Architecture Breakdown Sidebar */}
        <aside className="w-full lg:w-96 flex flex-col gap-4">
          {/* Controls Panel */}
          <div className="bg-[#1e070c] border border-taj-gold/30 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-taj-gold/20">
              <h3 className="font-serif text-sm font-semibold text-taj-gold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-taj-gold" />
                <span>Simulation Controls</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                {assembledCount > 0 ? `Assembled ${assembledCount}×` : 'In Assembly'}
              </span>
            </div>

            {/* Speed Selector */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider text-taj-cream/70 font-semibold block">
                Assembly Speed Multiplier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '0.6× Cinematic', val: 0.6 },
                  { label: '1.0× Realtime', val: 1.0 },
                  { label: '2.0× Rapid', val: 2.0 },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => {
                      setSpeed(s.val);
                      handleReassemble();
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-medium border transition-all ${
                      speed === s.val
                        ? 'bg-taj-gold text-black font-semibold border-taj-gold shadow-md'
                        : 'bg-white/5 border-taj-gold/20 text-taj-cream hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reassemble Button */}
            <button
              type="button"
              onClick={handleReassemble}
              className="w-full py-3 bg-gradient-to-r from-taj-gold to-[#96721e] hover:brightness-110 text-black font-serif font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.25]" />
              <span>Scatter & Reassemble Now</span>
            </button>
          </div>

          {/* Architectural Sequence Spec */}
          <div className="bg-[#1e070c] border border-taj-gold/30 rounded-3xl p-5 space-y-3 flex-1">
            <h4 className="font-serif text-xs font-semibold text-taj-gold uppercase tracking-wider">
              3D Vector Sequence Breakdown
            </h4>

            <div className="space-y-2.5 text-xs text-taj-cream/80">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-taj-gold mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block font-sans">Phase 1: Randomized 3D Sphere</strong>
                  <p className="text-[11px] text-taj-cream/60">
                    Over 150 blocks are scattered in a 30-unit spherical radius with randomized Euler rotations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-taj-gold mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block font-sans">Phase 2: Foundation & Colonnade</strong>
                  <p className="text-[11px] text-taj-cream/60">
                    Stone podium and Saracenic arched colonnades fly in and lock into ground coordinates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-taj-gold mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block font-sans">Phase 3: Domes & Turrets</strong>
                  <p className="text-[11px] text-taj-cream/60">
                    The iconic central onion dome and Victorian flanking turrets assemble seamlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-taj-gold mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block font-sans">Phase 4: Sovereign Taj Crest</strong>
                  <p className="text-[11px] text-taj-cream/60">
                    The golden Taj royal finial descends onto the dome crown with particle radiance.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Link to Test in Full App */}
            <div className="pt-2 border-t border-taj-gold/20">
              <p className="text-[11px] text-taj-cream/60 mb-2">
                Click and drag on the 3D model to orbit 360° in perspective.
              </p>
              <Link
                href="/results?searchId=demo&autoFetch=false"
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-taj-gold text-center block rounded-xl text-xs font-medium transition-colors"
              >
                View Search Results Page →
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
