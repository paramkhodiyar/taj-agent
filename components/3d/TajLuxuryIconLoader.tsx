'use client';

import React, { useState, useEffect } from 'react';

interface TajLuxuryIconLoaderProps {
  size?: number; // Default 88px
  label?: string;
  sublabel?: string;
  autoReplay?: boolean;
}

/**
 * TajLuxuryIconLoader — Ultra-Elegant 3D Taj Royal Emblem Assembly
 * 
 * Design Architecture:
 * - Compact loader icon (88px–100px) fitting natively into luxury interfaces.
 * - Hardware-accelerated CSS 3D perspective (translate3d, rotate3d, preserve-3d).
 * - The 6 delicate gold facets of the iconic Taj Royal Mandala scatter in randomized 3D space
 *   (displaced across X, Y, and Z depth planes) and converge into the royal rosette.
 * - The iconic Taj Saracenic palace dome arch and minaret spires draw themselves in razor-sharp gold hairline.
 * - A delicate 3D metallic gold orbital ring tilts and rotates around the crest with radiant particle gleams.
 * - Harmonizes perfectly with the authentic Taj palette: Ivory (#fbf9f5), Royal Gold (#b88e2e), Deep Burgundy (#4a1521).
 */
export const TajLuxuryIconLoader: React.FC<TajLuxuryIconLoaderProps> = ({
  size = 96,
  label = 'Taj Price Intelligence',
  sublabel = 'Verifying Official Rates…',
  autoReplay = true,
}) => {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<'scattered' | 'assembling' | 'settled'>('scattered');

  useEffect(() => {
    // Start assembly immediately
    const startTimer = setTimeout(() => {
      setPhase('assembling');
    }, 50);

    const settleTimer = setTimeout(() => {
      setPhase('settled');
    }, 1200);

    let loopTimer: NodeJS.Timeout;
    if (autoReplay) {
      loopTimer = setTimeout(() => {
        setPhase('scattered');
        setCycle((c) => c + 1);
      }, 5000);
    }

    return () => {
      clearTimeout(startTimer);
      clearTimeout(settleTimer);
      if (loopTimer) clearTimeout(loopTimer);
    };
  }, [cycle, autoReplay]);

  // 6 Radial Taj Mandala Petals with randomized 3D scatter vectors
  const petals = [
    { id: 0, angle: 0, scatterX: -45, scatterY: -55, scatterZ: 90, rotX: 60, rotY: -45, rotZ: 120, delay: 0.05 },
    { id: 1, angle: 60, scatterX: 55, scatterY: -45, scatterZ: -70, rotX: -45, rotY: 60, rotZ: -80, delay: 0.12 },
    { id: 2, angle: 120, scatterX: 65, scatterY: 35, scatterZ: 80, rotX: 30, rotY: -70, rotZ: 140, delay: 0.18 },
    { id: 3, angle: 180, scatterX: -30, scatterY: 65, scatterZ: -90, rotX: -60, rotY: 45, rotZ: -110, delay: 0.08 },
    { id: 4, angle: 240, scatterX: -65, scatterY: 30, scatterZ: 60, rotX: 45, rotY: -30, rotZ: 90, delay: 0.22 },
    { id: 5, angle: 300, scatterX: 35, scatterY: -60, scatterZ: -80, rotX: -30, rotY: 75, rotZ: -60, delay: 0.15 },
  ];

  const isScattered = phase === 'scattered';
  const isSettled = phase === 'settled';

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      {/* 3D Perspective Stage Container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: '600px',
        }}
      >
        {/* Soft Radial Gold Aura Breathing in Background */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-taj-gold/15 via-taj-gold/25 to-taj-gold/15 blur-xl transition-all duration-1000 ${
            isSettled ? 'scale-125 opacity-80 animate-pulse' : 'scale-75 opacity-30'
          }`}
        />

        {/* 3D Tilting Orbital Gold Ring */}
        <div
          className="absolute inset-0 rounded-full border border-taj-gold/40 pointer-events-none transition-opacity duration-700"
          style={{
            transform: 'rotateX(68deg) rotateZ(35deg)',
            transformStyle: 'preserve-3d',
            opacity: isSettled ? 0.75 : 0.25,
            boxShadow: '0 0 12px rgba(184, 142, 46, 0.25)',
          }}
        >
          {/* Orbiting Light Glimmer Particle */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-taj-gold shadow-[0_0_8px_#ffd700] animate-spin"
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* 3D Assembling Architectural Stage */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isSettled ? 'rotateY(0deg) rotateX(0deg)' : 'rotateY(15deg) rotateX(10deg)',
          }}
        >
          {/* Architectural Taj Dome Arch Wireframe (Hairline Gold) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              transform: isScattered ? 'translateZ(-60px) scale(0.6)' : 'translateZ(0px) scale(1)',
              opacity: isScattered ? 0 : 0.85,
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Base Plinth */}
            <path
              d="M 24 82 L 76 82"
              fill="none"
              stroke="#b88e2e"
              strokeWidth="0.8"
              strokeDasharray={isScattered ? '52' : '0'}
              className="transition-all duration-1000"
            />
            {/* Saracenic Onion Arch Silhouette */}
            <path
              d="M 32 80 C 32 60, 42 48, 50 36 C 58 48, 68 60, 68 80"
              fill="none"
              stroke="#b88e2e"
              strokeWidth="0.9"
              strokeOpacity="0.75"
            />
            {/* Flanking Minaret Spire Lines */}
            <line x1="26" y1="80" x2="26" y2="48" stroke="#b88e2e" strokeWidth="0.7" strokeOpacity="0.5" />
            <line x1="74" y1="80" x2="74" y2="48" stroke="#b88e2e" strokeWidth="0.7" strokeOpacity="0.5" />
            <circle cx="26" cy="46" r="1.2" fill="#b88e2e" opacity="0.8" />
            <circle cx="74" cy="46" r="1.2" fill="#b88e2e" opacity="0.8" />
          </svg>

          {/* Central 3D Sovereign Mandala Rosette (6 Converging Gold Facets) */}
          <div
            className="relative w-12 h-12 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {petals.map((p) => {
              const transformStyle = isScattered
                ? `translate3d(${p.scatterX}px, ${p.scatterY}px, ${p.scatterZ}px) rotateX(${p.rotX}deg) rotateY(${p.rotY}deg) rotateZ(${p.rotZ}deg) scale(0.4)`
                : `rotate(${p.angle}deg) translateY(-8px) translateZ(8px) scale(1)`;

              return (
                <div
                  key={p.id}
                  className="absolute w-3.5 h-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: transformStyle,
                    opacity: isScattered ? 0 : 1,
                    transitionDelay: isScattered ? '0ms' : `${p.delay}s`,
                    transformOrigin: '50% 100%',
                  }}
                >
                  {/* Facet Geometry: Sharp Razor Gold Diamond Petal */}
                  <svg viewBox="0 0 14 24" className="w-full h-full drop-shadow-[0_1px_3px_rgba(184,142,46,0.3)]">
                    <polygon
                      points="7,0 14,12 7,24 0,12"
                      fill="url(#goldGradient)"
                      stroke="#96721e"
                      strokeWidth="0.4"
                    />
                    <line x1="7" y1="0" x2="7" y2="24" stroke="#ffd700" strokeWidth="0.3" strokeOpacity="0.8" />
                  </svg>
                </div>
              );
            })}

            {/* Central Royal Finial Jewel (Center Core) */}
            <div
              className={`absolute w-3 h-3 rounded-full bg-gradient-to-tr from-taj-gold via-[#ffd700] to-white shadow-[0_0_8px_#b88e2e] transition-all duration-700 ease-out ${
                isSettled ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              style={{ transform: 'translateZ(14px)' }}
            />
          </div>

          {/* SVG Gradient Definitions */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#b88e2e" />
                <stop offset="100%" stopColor="#8a681c" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Understated Luxury Typography Labels */}
      {(label || sublabel) && (
        <div className="mt-4 text-center space-y-1">
          {label && (
            <h4
              className={`font-serif text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-taj-burgundy transition-all duration-700 ${
                isSettled ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'
              }`}
            >
              {label}
            </h4>
          )}
          {sublabel && (
            <p className="text-[11px] text-taj-charcoal-muted font-sans font-medium flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{sublabel}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
