'use client';

import React, { useState, useEffect } from 'react';

interface Taj2DHotel3DLoaderProps {
  size?: number; // Compact loader icon: default 96px
  theme?: 'light' | 'dark';
  autoReassemble?: boolean;
  replayIntervalMs?: number;
  label?: string;
  sublabel?: string;
}

interface ArchitecturalLayer {
  id: string;
  name: string;
  targetX: number;
  targetY: number;
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  delay: number;
  renderSvg: (t: 'light' | 'dark') => React.ReactNode;
}

/**
 * Taj2DHotel3DLoader — Taj Luxury Hotel 2D Figure with 3D Spatial Assembly
 * 
 * Strict Design Adherence:
 * - NOT the Agra Taj Mahal mausoleum, but a stately TAJ LUXURY HOTEL.
 * - ZERO RED. ZERO ISLAMIC DOMES.
 * - Classical grand hotel architecture: grand columned entrance portico, multi-story suite balconies,
 *   classical triangular pediment, balustrade roofline, crowned by the official golden Taj rosette crest.
 * - Color Palette: Imperial Taj Gold (#b88e2e, #d4af37, #ffd700), Warm Ivory (#fbf9f5), and Deep Charcoal.
 * - Compact loader icon footprint (88px–100px).
 * - 2D Flat Vector asset whose pieces fly in from randomized 3D directions and snap into a flat 2D figure.
 */
export const Taj2DHotel3DLoader: React.FC<Taj2DHotel3DLoaderProps> = ({
  size = 96,
  theme = 'light',
  autoReassemble = true,
  replayIntervalMs = 4500,
  label = 'Taj Hotels',
  sublabel = 'Verifying Verified Rates…',
}) => {
  const [phase, setPhase] = useState<'scattered' | 'assembling' | 'settled'>('scattered');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    // Quick, smooth assembly
    const startTimeout = setTimeout(() => {
      setPhase('assembling');
    }, 50);

    const settleTimeout = setTimeout(() => {
      setPhase('settled');
    }, 1100);

    let loopTimeout: NodeJS.Timeout;
    if (autoReassemble) {
      loopTimeout = setTimeout(() => {
        setPhase('scattered');
        setCycle((c) => c + 1);
      }, replayIntervalMs);
    }

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(settleTimeout);
      if (loopTimeout) clearTimeout(loopTimeout);
    };
  }, [cycle, autoReassemble, replayIntervalMs]);

  const isScattered = phase === 'scattered';
  const isSettled = phase === 'settled';

  // 8 Symmetrical 2D Classical Hotel Architectural Pieces
  const layers: ArchitecturalLayer[] = [
    // 1. Grand Hotel Plinth / Base Promenade
    {
      id: 'plinth',
      name: 'Grand Base Plinth',
      targetX: 8,
      targetY: 76,
      scatterX: -70,
      scatterY: 85,
      scatterZ: -120,
      rotX: 60,
      rotY: -40,
      rotZ: 45,
      delay: 0.04,
      renderSvg: () => (
        <svg width="80" height="10" viewBox="0 0 80 10" fill="none">
          <rect x="0" y="6" width="80" height="3" rx="0.5" fill="#b88e2e" />
          <rect x="4" y="2" width="72" height="3" rx="0.5" fill="#d4af37" fillOpacity="0.8" />
          <line x1="8" y1="4" x2="72" y2="4" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.8" />
        </svg>
      ),
    },

    // 2. Central Grand Entrance Portico & Classical Columns
    {
      id: 'portico',
      name: 'Grand Portico & Columns',
      targetX: 33,
      targetY: 50,
      scatterX: 0,
      scatterY: -80,
      scatterZ: 140,
      rotX: -60,
      rotY: 25,
      rotZ: -30,
      delay: 0.1,
      renderSvg: (t) => (
        <svg width="30" height="28" viewBox="0 0 30 28" fill="none">
          {/* Main Entrance Hall */}
          <rect x="0" y="0" width="30" height="28" rx="0.5" fill={t === 'dark' ? '#25201b' : '#ffffff'} stroke="#b88e2e" strokeWidth="0.8" />
          {/* Grand Canopy / Architraves */}
          <rect x="2" y="0" width="26" height="3" fill="#b88e2e" />
          {/* Classical Hotel Columns (4 stately vertical pillars) */}
          <line x1="5" y1="3" x2="5" y2="28" stroke="#b88e2e" strokeWidth="1.2" />
          <line x1="11" y1="3" x2="11" y2="28" stroke="#b88e2e" strokeWidth="1.2" />
          <line x1="19" y1="3" x2="19" y2="28" stroke="#b88e2e" strokeWidth="1.2" />
          <line x1="25" y1="3" x2="25" y2="28" stroke="#b88e2e" strokeWidth="1.2" />
          {/* Warm Golden Hotel Foyer Entrance Light */}
          <rect x="8" y="14" width="14" height="14" rx="1" fill="#ffd700" fillOpacity="0.85" />
          <line x1="15" y1="14" x2="15" y2="28" stroke="#b88e2e" strokeWidth="0.6" />
        </svg>
      ),
    },

    // 3. Left Guest Suites Wing (Classical Hotel Windows)
    {
      id: 'left-wing',
      name: 'Left Suites Wing',
      targetX: 10,
      targetY: 52,
      scatterX: -85,
      scatterY: 20,
      scatterZ: 90,
      rotX: 35,
      rotY: 60,
      rotZ: -45,
      delay: 0.16,
      renderSvg: (t) => (
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
          <rect x="0" y="0" width="24" height="26" rx="0.5" fill={t === 'dark' ? '#1c1815' : '#fcfaf6'} stroke="#b88e2e" strokeWidth="0.6" />
          {/* Multi-Tier Suite Windows with Golden Warm Glow */}
          <rect x="3" y="4" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="10" y="4" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="17" y="4" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="3" y="14" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="10" y="14" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="17" y="14" width="4.5" height="6" rx="0.5" fill="#d4af37" />
        </svg>
      ),
    },

    // 4. Right Guest Suites Wing (Classical Hotel Windows)
    {
      id: 'right-wing',
      name: 'Right Suites Wing',
      targetX: 62,
      targetY: 52,
      scatterX: 85,
      scatterY: 25,
      scatterZ: -90,
      rotX: -40,
      rotY: -55,
      rotZ: 40,
      delay: 0.2,
      renderSvg: (t) => (
        <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
          <rect x="0" y="0" width="24" height="26" rx="0.5" fill={t === 'dark' ? '#1c1815' : '#fcfaf6'} stroke="#b88e2e" strokeWidth="0.6" />
          {/* Multi-Tier Suite Windows with Golden Warm Glow */}
          <rect x="3" y="4" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="10" y="4" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="17" y="4" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="3" y="14" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="10" y="14" width="4.5" height="6" rx="0.5" fill="#d4af37" />
          <rect x="17" y="14" width="4.5" height="6" rx="0.5" fill="#d4af37" />
        </svg>
      ),
    },

    // 5. Upper Executive Penthouse Suite Tier
    {
      id: 'penthouse-tier',
      name: 'Penthouse Suites Tier',
      targetX: 25,
      targetY: 34,
      scatterX: 0,
      scatterY: -95,
      scatterZ: -130,
      rotX: 65,
      rotY: 0,
      rotZ: -20,
      delay: 0.26,
      renderSvg: (t) => (
        <svg width="46" height="17" viewBox="0 0 46 17" fill="none">
          <rect x="0" y="0" width="46" height="17" rx="0.5" fill={t === 'dark' ? '#25201b' : '#ffffff'} stroke="#b88e2e" strokeWidth="0.7" />
          {/* Balustrade Balcony Line */}
          <line x1="0" y1="16" x2="46" y2="16" stroke="#b88e2e" strokeWidth="1" />
          {/* Luxury Penthouse Windows */}
          <rect x="5" y="4" width="6" height="8" rx="1" fill="#ffd700" />
          <rect x="15" y="4" width="6" height="8" rx="1" fill="#ffd700" />
          <rect x="25" y="4" width="6" height="8" rx="1" fill="#ffd700" />
          <rect x="35" y="4" width="6" height="8" rx="1" fill="#ffd700" />
        </svg>
      ),
    },

    // 6. Classical Triangular Hotel Pediment & Cornice
    {
      id: 'classical-pediment',
      name: 'Classical Hotel Pediment',
      targetX: 28,
      targetY: 20,
      scatterX: -20,
      scatterY: -110,
      scatterZ: 120,
      rotX: -55,
      rotY: 30,
      rotZ: -45,
      delay: 0.32,
      renderSvg: () => (
        <svg width="40" height="15" viewBox="0 0 40 15" fill="none">
          {/* Symmetrical Classical Triangular Pediment Roofline */}
          <polygon points="20,1 38,14 2,14" fill="#b88e2e" stroke="#96721e" strokeWidth="0.8" />
          <polygon points="20,4 34,13 6,13" fill="#d4af37" />
          {/* Center Royal Medallion */}
          <circle cx="20" cy="9.5" r="2.2" fill="#ffffff" stroke="#b88e2e" strokeWidth="0.5" />
        </svg>
      ),
    },

    // 7. Left & Right Roof Balustrades
    {
      id: 'balustrades',
      name: 'Roof Balustrades',
      targetX: 8,
      targetY: 46,
      scatterX: -60,
      scatterY: -60,
      scatterZ: -80,
      rotX: 45,
      rotY: -45,
      rotZ: 60,
      delay: 0.38,
      renderSvg: () => (
        <svg width="80" height="7" viewBox="0 0 80 7" fill="none">
          {/* Left Wing Roof Balustrade */}
          <line x1="2" y1="6" x2="26" y2="6" stroke="#b88e2e" strokeWidth="0.8" />
          <circle cx="2" cy="2" r="1.2" fill="#ffd700" />
          <circle cx="26" cy="2" r="1.2" fill="#ffd700" />
          {/* Right Wing Roof Balustrade */}
          <line x1="54" y1="6" x2="78" y2="6" stroke="#b88e2e" strokeWidth="0.8" />
          <circle cx="54" cy="2" r="1.2" fill="#ffd700" />
          <circle cx="78" cy="2" r="1.2" fill="#ffd700" />
        </svg>
      ),
    },

    // 8. The Official Sovereign Taj Rosette Crest (The Iconic 6-Facet Golden Mandala)
    {
      id: 'taj-crest',
      name: 'Official Taj Rosette Crest',
      targetX: 40,
      targetY: 4,
      scatterX: 15,
      scatterY: -125,
      scatterZ: 160,
      rotX: -50,
      rotY: 70,
      rotZ: 85,
      delay: 0.44,
      renderSvg: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]">
          {/* Outer Radiant Ring */}
          <circle cx="8" cy="8" r="7" stroke="#ffd700" strokeWidth="0.7" strokeDasharray="1.5 1" opacity="0.85" />
          {/* Central 6-Facet Taj Floral Rosette */}
          <circle cx="8" cy="8" r="4.5" fill="#b88e2e" stroke="#ffd700" strokeWidth="0.6" />
          {/* 6 Radial Diamond Petals */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <polygon
              key={deg}
              points="8,4.5 9.2,8 8,11.5 6.8,8"
              fill="#ffd700"
              transform={`rotate(${deg} 8 8)`}
              opacity="0.9"
            />
          ))}
          {/* Center Core Pearl */}
          <circle cx="8" cy="8" r="1.5" fill="#ffffff" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      {/* 3D Perspective Stage Container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: '650px',
        }}
      >
        {/* Soft Radial Gold Warmth Breathing in Background */}
        <div
          className={`absolute inset-2 rounded-full bg-gradient-to-r from-taj-gold/15 via-taj-gold/25 to-taj-gold/15 blur-lg transition-all duration-1000 ${
            isSettled ? 'scale-110 opacity-75 animate-pulse' : 'scale-70 opacity-20'
          }`}
        />

        {/* 3D Floating Stage Assembly: holds all 2D layers */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isSettled
              ? 'rotateY(-4deg) rotateX(3deg)'
              : 'rotateY(18deg) rotateX(-10deg)',
          }}
        >
          {layers.map((layer) => {
            const scaleRatio = size / 96;
            const targetX = layer.targetX * scaleRatio;
            const targetY = layer.targetY * scaleRatio;

            const transformStyle = isScattered
              ? `translate3d(${layer.scatterX}px, ${layer.scatterY}px, ${layer.scatterZ}px) rotateX(${layer.rotX}deg) rotateY(${layer.rotY}deg) rotateZ(${layer.rotZ}deg) scale(0.55)`
              : `translate3d(${targetX}px, ${targetY}px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(${scaleRatio})`;

            return (
              <div
                key={layer.id}
                className="absolute top-0 left-0 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: transformStyle,
                  opacity: isScattered ? 0 : 1,
                  transitionDelay: isScattered ? '0ms' : `${layer.delay}s`,
                  // Pure 2D Flat Vector Rendering
                  backfaceVisibility: 'visible',
                  filter: isSettled
                    ? theme === 'dark'
                      ? 'drop-shadow(0 2px 5px rgba(212, 175, 55, 0.25))'
                      : 'drop-shadow(0 2px 4px rgba(74, 21, 33, 0.12))'
                    : 'none',
                }}
              >
                {layer.renderSvg(theme)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Understated Luxury Labels */}
      {(label || sublabel) && (
        <div className="mt-2 text-center space-y-0.5">
          {label && (
            <h4
              className={`font-serif text-[11px] font-bold tracking-[0.18em] uppercase transition-all duration-500 ${
                theme === 'dark' ? 'text-taj-gold' : 'text-taj-burgundy'
              } ${isSettled ? 'opacity-100' : 'opacity-60'}`}
            >
              {label}
            </h4>
          )}
          {sublabel && (
            <p
              className={`text-[10px] font-sans flex items-center justify-center gap-1.5 ${
                theme === 'dark' ? 'text-taj-cream/60' : 'text-taj-charcoal-muted'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{sublabel}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
