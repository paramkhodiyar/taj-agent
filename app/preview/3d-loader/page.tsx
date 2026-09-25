'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Taj2DHotel3DLoader } from '@/components/3d/Taj2DHotel3DLoader';
import { Sparkles, RotateCcw, ArrowLeft, Layers, ShieldCheck, Moon, Sun } from 'lucide-react';

export default function Preview3DLoaderPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [key, setKey] = useState<number>(0);
  const [size, setSize] = useState<number>(140);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
                  TAJ 2D HOTEL • 3D SPATIAL LOADER
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-taj-gold/15 text-taj-gold border border-taj-gold/40">
                  REFINED PROTOTYPE
                </span>
              </div>
              <span className={`text-[10px] block ${theme === 'dark' ? 'text-taj-cream/60' : 'text-taj-charcoal-light'}`}>
                2D Hotel Flat Graphic assembling through 3D Depth &amp; Perspective Vectors
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Real-Life Compact Loader Showcase Card */}
        <div className="flex-1 w-full space-y-6">
          <div
            className={`rounded-3xl border p-8 flex flex-col items-center justify-center transition-all shadow-sm ${
              theme === 'dark'
                ? 'bg-[#1e070c] border-taj-gold/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                : 'bg-white border-taj-gray-border/90 shadow-[0_12px_36px_rgba(36,8,15,0.06)]'
            }`}
          >
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-taj-gold-muted block mb-1">
                Compact Icon Presentation
              </span>
              <h3
                className={`font-serif text-lg font-bold ${
                  theme === 'dark' ? 'text-taj-cream' : 'text-taj-burgundy'
                }`}
              >
                2D Hotel Asset assembling in 3D Motion
              </h3>
              <p
                className={`text-xs mt-1 max-w-md ${
                  theme === 'dark' ? 'text-taj-cream/60' : 'text-taj-charcoal-muted'
                }`}
              >
                The building itself is a clean 2D vector silhouette of the iconic Taj Palace.
                Its architectural segments fly in from randomized 3D directions and snap into a flat 2D figure.
              </p>
            </div>

            {/* The Compact 3D Loader Component */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                theme === 'dark'
                  ? 'bg-black/30 border-taj-gold/20'
                  : 'bg-taj-cream border-taj-gray-border/80'
              }`}
            >
              <Taj2DHotel3DLoader
                key={key}
                size={size}
                theme={theme}
                autoReassemble={true}
                replayIntervalMs={4200}
                label="The Taj Mahal Palace"
                sublabel="Assembling Verified Rates…"
              />
            </div>

            {/* Scatter & Reassemble Button */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReassemble}
                className="px-5 py-2.5 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white text-xs font-serif font-medium tracking-wider uppercase rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.25] text-taj-gold" />
                <span>Trigger Scatter &amp; Reassemble</span>
              </button>

              <div className="flex items-center gap-2">
                {[
                  { label: 'Small (100px)', val: 100 },
                  { label: 'Standard (140px)', val: 140 },
                  { label: 'Hero (180px)', val: 180 },
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
                        ? 'bg-taj-gold text-white border-taj-gold font-bold shadow-xs'
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

          {/* Practical Integration Example (Inside a mock Page Loading Banner) */}
          <div
            className={`rounded-2xl border p-5 transition-all ${
              theme === 'dark' ? 'bg-[#1a060b] border-taj-gold/20' : 'bg-white border-taj-gray-border'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-taj-gold-muted uppercase tracking-wider">
                How It Appears In-App (Replacing Clunky Loaders)
              </span>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center gap-4 ${
                theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
              }`}
            >
              <Taj2DHotel3DLoader
                size={80}
                theme={theme}
                autoReassemble={true}
                replayIntervalMs={5000}
                label=""
                sublabel=""
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-sm font-semibold text-taj-burgundy">
                    Loading Room Inventory &amp; Verified Rates
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-taj-charcoal-muted leading-relaxed">
                  Connecting to Taj official booking infrastructure across Mumbai, Goa, Udaipur, and Delhi…
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Architectural 2D Layers Specification */}
        <aside className="w-full md:w-80 space-y-4">
          <div
            className={`rounded-3xl border p-5 space-y-4 ${
              theme === 'dark' ? 'bg-[#1e070c] border-taj-gold/30' : 'bg-white border-taj-gray-border'
            }`}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-taj-gray-border/60">
              <Layers className="w-4 h-4 text-taj-gold" />
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-taj-gold-muted">
                2D Asset • 3D Movement Spec
              </h4>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div
                className={`p-3 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
                }`}
              >
                <strong className="block text-taj-burgundy font-serif font-bold text-xs mb-0.5">
                  1. Asset is 100% 2D Flat Vector
                </strong>
                <p className="text-[11px] text-taj-charcoal-muted">
                  No blocky 3D voxels or heavy meshes. Razor-sharp vector shapes: Saracenic grand onion dome, Victorian flanking turrets, arched colonnades, and the Taj royal crest.
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
                }`}
              >
                <strong className="block text-taj-burgundy font-serif font-bold text-xs mb-0.5">
                  2. Movement is in Full 3D Space
                </strong>
                <p className="text-[11px] text-taj-charcoal-muted">
                  Each 2D layer originates displaced along random 3D vectors (X, Y, and Z depth planes up to 140px in space) with rotational pitch, yaw, and roll.
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-taj-cream border-taj-gray-border/60'
                }`}
              >
                <strong className="block text-taj-burgundy font-serif font-bold text-xs mb-0.5">
                  3. Precision Assembly Snap
                </strong>
                <p className="text-[11px] text-taj-charcoal-muted">
                  Smooth cubic physics pull all 2D layers simultaneously out of 3D depth, locking them seamlessly into the unified 2D Taj Palace silhouette.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-2.5 bg-taj-cream-warm hover:bg-taj-gray-border/60 text-taj-burgundy text-center block rounded-xl text-xs font-semibold border border-taj-gray-border transition-colors"
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
