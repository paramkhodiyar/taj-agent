'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TajLogo3DLoader } from '@/components/3d/TajLogo3DLoader';
import { Sparkles, RotateCcw, ArrowLeft, Layers, ShieldCheck, Moon, Sun } from 'lucide-react';

export default function Preview3DLoaderPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [key, setKey] = useState<number>(0);
  const [size, setSize] = useState<number>(88);

  const handleReassemble = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#140408] text-taj-cream'
          : 'bg-taj-cream text-taj-charcoal'
      } flex flex-col font-sans selection:bg-taj-burgundy selection:text-white`}
    >
      {/* Top Header */}
      <header
        className={`w-full border-b sticky top-0 z-40 transition-colors ${
          theme === 'dark'
            ? 'border-taj-gold/20 bg-black/50 backdrop-blur-md'
            : 'border-taj-gray-border bg-white/90 backdrop-blur-md'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-taj-gold'
                  : 'bg-taj-cream hover:bg-taj-cream-warm text-taj-burgundy border border-taj-gray-border'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className={`border-l pl-3 ${theme === 'dark' ? 'border-taj-gold/30' : 'border-taj-gray-border'}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`font-serif tracking-[0.18em] text-xs sm:text-sm font-bold block ${
                    theme === 'dark' ? 'text-taj-gold' : 'text-taj-burgundy'
                  }`}
                >
                  OFFICIAL TAJ LOGO • 3D ASSEMBLY LOADER
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-taj-gold/15 text-taj-gold border border-taj-gold/40">
                  REFINED
                </span>
              </div>
              <span className={`text-[10px] block ${theme === 'dark' ? 'text-taj-cream/60' : 'text-taj-charcoal-light'}`}>
                Official 6-Facet Crest Rosette &amp; T-A-J Letters flying in from 3D space
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'border-taj-gold/30 bg-white/5 text-taj-gold hover:bg-white/10'
                  : 'border-taj-gray-border bg-white text-taj-charcoal hover:bg-taj-cream'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Taj Ivory Light' : 'Velvet Dark'}</span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-1.5 bg-taj-burgundy text-white rounded-xl text-xs font-medium hover:bg-taj-burgundy-deep transition-all"
            >
              Back to App →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Compact Loader Showcase Card */}
        <div className="flex-1 w-full space-y-6">
          <div
            className={`rounded-3xl border p-8 flex flex-col items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-[#1e070c] border-taj-gold/30'
                : 'bg-white border-taj-gray-border/90'
            }`}
          >
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-taj-gold-muted block mb-1">
                Official Brand Emblem Loader
              </span>
              <h3
                className={`font-serif text-lg font-bold ${
                  theme === 'dark' ? 'text-taj-cream' : 'text-taj-burgundy'
                }`}
              >
                Official Taj Logo Piece-by-Piece 3D Assembly
              </h3>
              <p
                className={`text-xs mt-1 max-w-md ${
                  theme === 'dark' ? 'text-taj-cream/60' : 'text-taj-charcoal-muted'
                }`}
              >
                Zero shadows, zero glows, zero extraneous geometry. The 6 royal crest facets assemble clockwise piece-by-piece, followed by the classic T-A-J lettering.
              </p>
            </div>

            {/* The Compact Logo Loader */}
            <div
              className={`p-8 rounded-2xl border transition-all ${
                theme === 'dark'
                  ? 'bg-black/40 border-taj-gold/20'
                  : 'bg-taj-cream border-taj-gray-border/80'
              }`}
            >
              <TajLogo3DLoader
                key={key}
                size={size}
                theme={theme}
                autoReassemble={true}
                replayIntervalMs={3800}
                label="Taj Price Intelligence"
                sublabel="Querying Verified Observations…"
              />
            </div>

            {/* Trigger Button & Size Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReassemble}
                className="px-5 py-2.5 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs font-serif font-medium tracking-wider uppercase rounded-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.25] text-taj-gold" />
                <span>Scatter &amp; Reassemble Piece-by-Piece</span>
              </button>

              <div className="flex items-center gap-2">
                {[
                  { label: 'Small (64px)', val: 64 },
                  { label: 'Standard (88px)', val: 88 },
                  { label: 'Large (112px)', val: 112 },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => {
                      setSize(s.val);
                      handleReassemble();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                      size === s.val
                        ? 'bg-taj-gold text-white border-taj-gold font-bold'
                        : theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-taj-cream hover:bg-white/10'
                        : 'bg-white border-taj-gray-border text-taj-charcoal hover:bg-taj-cream'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Practical In-App Context Banner */}
          <div
            className={`rounded-2xl border p-5 transition-all ${
              theme === 'dark' ? 'bg-[#1a060b] border-taj-gold/20' : 'bg-white border-taj-gray-border'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-taj-gold-muted uppercase tracking-wider">
                In-App Streaming Loader Appearance
              </span>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center gap-4 ${
                theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
              }`}
            >
              <TajLogo3DLoader
                size={56}
                theme={theme}
                autoReassemble={true}
                replayIntervalMs={4500}
              />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-xs font-bold text-taj-burgundy">
                    Accessing Verified Observation Pipeline
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-taj-charcoal-muted leading-relaxed">
                  Streaming official rate plans across Taj properties…
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Breakdown of Logo Pieces */}
        <aside className="w-full md:w-72 space-y-4">
          <div
            className={`rounded-3xl border p-5 space-y-4 ${
              theme === 'dark' ? 'bg-[#1e070c] border-taj-gold/30' : 'bg-white border-taj-gray-border'
            }`}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-taj-gray-border/60">
              <Layers className="w-4 h-4 text-taj-gold" />
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-taj-gold-muted">
                9 Exact Vector Pieces
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
                }`}
              >
                <strong className="block text-taj-burgundy font-serif font-bold text-xs mb-0.5">
                  6 Crest Facets
                </strong>
                <p className="text-[10px] text-taj-charcoal-muted">
                  The hexagonal floral mandala facets scatter in 3D depth and converge into the royal crest rosette.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
                }`}
              >
                <strong className="block text-taj-burgundy font-serif font-bold text-xs mb-0.5">
                  3 Typography Characters
                </strong>
                <p className="text-[10px] text-taj-charcoal-muted">
                  The letters &apos;T&apos;, &apos;A&apos;, and &apos;J&apos; fly in from separate 3D trajectories and lock onto the baseline.
                </p>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
                }`}
              >
                <strong className="block text-taj-burgundy font-serif font-bold text-xs mb-0.5">
                  Authentic Taj Gold Palette
                </strong>
                <p className="text-[10px] text-taj-charcoal-muted">
                  Imperial Gold (#b88e2e / #d4af37) with subtle ambient drop shadows. Zero extraneous shapes.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-2 bg-taj-cream-warm hover:bg-taj-gray-border/60 text-taj-burgundy text-center block rounded-xl text-xs font-semibold border border-taj-gray-border transition-colors"
              >
                ← Return to Search App
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
