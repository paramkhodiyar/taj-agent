'use client';

import React, { useState, useEffect } from 'react';

interface Taj2DHotel3DLoaderProps {
  size?: number; // default 120px
  theme?: 'light' | 'dark';
  autoReassemble?: boolean;
  replayIntervalMs?: number;
  label?: string;
  sublabel?: string;
}

interface PieceConfig {
  id: string;
  name: string;
  // Final 2D coordinate offsets (px relative to 120x120 frame)
  targetX: number;
  targetY: number;
  // Randomized initial 3D scatter transforms
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  delay: number;
  renderSvg: (theme: 'light' | 'dark') => React.ReactNode;
}

/**
 * Taj2DHotel3DLoader
 * 
 * 2D Flat Architectural Asset with 3D Spatial Movement:
 * - The hotel itself is an authentic, elegant 2D figure (the iconic Taj Palace silhouette & crest).
 * - The movement occurs in 3D: each 2D architectural layer begins scattered along randomized
 *   3D vectors (displaced across X, Y, Z depth planes with 3D rotational pitch/yaw/roll).
 * - The pieces fly in through 3D perspective and seamlessly assemble into the pristine 2D Taj Palace.
 * - Once assembled, the flat 2D figure performs a gentle 3D parallax hover.
 */
export const Taj2DHotel3DLoader: React.FC<Taj2DHotel3DLoaderProps> = ({
  size = 120,
  theme = 'light',
  autoReassemble = true,
  replayIntervalMs = 4500,
  label = 'Taj Price Intelligence',
  sublabel = 'Verifying Official Rates…',
}) => {
  const [phase, setPhase] = useState<'scattered' | 'assembling' | 'settled'>('scattered');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    // 1. Start assembly
    const startTimeout = setTimeout(() => {
      setPhase('assembling');
    }, 60);

    // 2. Lock into 2D figure
    const settleTimeout = setTimeout(() => {
      setPhase('settled');
    }, 1200);

    // 3. Optional loop for loader experience
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

  // 8 Discrete 2D Architectural Pieces that fly from 3D space:
  const pieces: PieceConfig[] = [
    // 1. Foundation Podium (Bottom Ground Layer)
    {
      id: 'foundation',
      name: 'Podium Terrace',
      targetX: 10,
      targetY: 88,
      scatterX: -70,
      scatterY: 80,
      scatterZ: -120,
      rotX: 65,
      rotY: -35,
      rotZ: 40,
      delay: 0.05,
      renderSvg: (t) => (
        <svg width="100" height="14" viewBox="0 0 100 14" fill="none">
          <rect x="0" y="8" width="100" height="4" rx="1" fill="#b88e2e" />
          <rect x="4" y="3" width="92" height="4" rx="0.5" fill={t === 'dark' ? '#3d121c' : '#4a1521'} />
          <line x1="8" y1="5" x2="92" y2="5" stroke="#b88e2e" strokeWidth="0.6" strokeDasharray="3 2" />
        </svg>
      ),
    },

    // 2. Center Palace Colonnade & Grand Arch
    {
      id: 'center-colonnade',
      name: 'Grand Arch Facade',
      targetX: 42,
      targetY: 52,
      scatterX: 0,
      scatterY: -90,
      scatterZ: 140,
      rotX: -55,
      rotY: 20,
      rotZ: -25,
      delay: 0.12,
      renderSvg: (t) => (
        <svg width="36" height="38" viewBox="0 0 36 38" fill="none">
          {/* Main Center Building */}
          <rect x="0" y="0" width="36" height="38" rx="1" fill={t === 'dark' ? '#4a1521' : '#4a1521'} stroke="#b88e2e" strokeWidth="0.8" />
          {/* Grand Entrance Arch Portal */}
          <path d="M 10 38 L 10 24 C 10 18, 26 18, 26 24 L 26 38 Z" fill="#b88e2e" fillOpacity="0.3" stroke="#b88e2e" strokeWidth="0.8" />
          {/* Upper Window Tier */}
          <rect x="4" y="6" width="6" height="8" rx="3" fill="#ffd700" fillOpacity="0.85" />
          <rect x="15" y="6" width="6" height="8" rx="3" fill="#ffd700" fillOpacity="0.85" />
          <rect x="26" y="6" width="6" height="8" rx="3" fill="#ffd700" fillOpacity="0.85" />
        </svg>
      ),
    },

    // 3. Left Wing (Victorian Colonnade)
    {
      id: 'left-wing',
      name: 'Left Palace Wing',
      targetX: 12,
      targetY: 58,
      scatterX: -90,
      scatterY: 20,
      scatterZ: 90,
      rotX: 30,
      rotY: 60,
      rotZ: -45,
      delay: 0.18,
      renderSvg: (t) => (
        <svg width="30" height="32" viewBox="0 0 30 32" fill="none">
          <rect x="0" y="0" width="30" height="32" rx="1" fill={t === 'dark' ? '#330c15' : '#3d121c'} stroke="#b88e2e" strokeWidth="0.6" />
          {/* Arched Windows */}
          <rect x="4" y="6" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="13" y="6" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="21" y="6" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="4" y="18" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="13" y="18" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="21" y="18" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
        </svg>
      ),
    },

    // 4. Right Wing (Victorian Colonnade)
    {
      id: 'right-wing',
      name: 'Right Palace Wing',
      targetX: 78,
      targetY: 58,
      scatterX: 95,
      scatterY: 30,
      scatterZ: -80,
      rotX: -40,
      rotY: -50,
      rotZ: 35,
      delay: 0.22,
      renderSvg: (t) => (
        <svg width="30" height="32" viewBox="0 0 30 32" fill="none">
          <rect x="0" y="0" width="30" height="32" rx="1" fill={t === 'dark' ? '#330c15' : '#3d121c'} stroke="#b88e2e" strokeWidth="0.6" />
          {/* Arched Windows */}
          <rect x="4" y="6" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="13" y="6" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="21" y="6" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="4" y="18" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="13" y="18" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
          <rect x="21" y="18" width="5" height="7" rx="2.5" fill="#b88e2e" fillOpacity="0.7" />
        </svg>
      ),
    },

    // 5. Left Victorian Turret Tower & Mini Dome
    {
      id: 'left-turret',
      name: 'Left Turret Dome',
      targetX: 14,
      targetY: 38,
      scatterX: -80,
      scatterY: -70,
      scatterZ: 100,
      rotX: 45,
      rotY: 45,
      rotZ: -60,
      delay: 0.28,
      renderSvg: () => (
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          {/* Mini Dome */}
          <path d="M 2 16 C 2 8, 9 2, 9 2 C 9 2, 16 8, 16 16 Z" fill="#b88e2e" stroke="#96721e" strokeWidth="0.6" />
          {/* Spire */}
          <line x1="9" y1="2" x2="9" y2="0" stroke="#ffd700" strokeWidth="1" />
          <circle cx="9" cy="0" r="0.8" fill="#ffd700" />
          {/* Base Trim */}
          <rect x="0" y="16" width="18" height="5" fill="#4a1521" stroke="#b88e2e" strokeWidth="0.5" />
        </svg>
      ),
    },

    // 6. Right Victorian Turret Tower & Mini Dome
    {
      id: 'right-turret',
      name: 'Right Turret Dome',
      targetX: 88,
      targetY: 38,
      scatterX: 80,
      scatterY: -70,
      scatterZ: 110,
      rotX: -45,
      rotY: -45,
      rotZ: 60,
      delay: 0.32,
      renderSvg: () => (
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          {/* Mini Dome */}
          <path d="M 2 16 C 2 8, 9 2, 9 2 C 9 2, 16 8, 16 16 Z" fill="#b88e2e" stroke="#96721e" strokeWidth="0.6" />
          {/* Spire */}
          <line x1="9" y1="2" x2="9" y2="0" stroke="#ffd700" strokeWidth="1" />
          <circle cx="9" cy="0" r="0.8" fill="#ffd700" />
          {/* Base Trim */}
          <rect x="0" y="16" width="18" height="5" fill="#4a1521" stroke="#b88e2e" strokeWidth="0.5" />
        </svg>
      ),
    },

    // 7. Central Iconic Grand Onion Dome
    {
      id: 'center-dome',
      name: 'Grand Central Dome',
      targetX: 43,
      targetY: 26,
      scatterX: 0,
      scatterY: -110,
      scatterZ: -140,
      rotX: 70,
      rotY: 0,
      rotZ: -30,
      delay: 0.38,
      renderSvg: () => (
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none">
          {/* Drum Base */}
          <rect x="2" y="22" width="30" height="5" rx="0.5" fill="#b88e2e" />
          {/* Iconic Taj Onion Dome Curve */}
          <path
            d="M 3 22 C 3 12, 17 2, 17 2 C 17 2, 31 12, 31 22 Z"
            fill="#5a1827"
            stroke="#b88e2e"
            strokeWidth="0.8"
          />
          {/* Gold Rib Accent */}
          <path d="M 17 2 C 12 12, 12 18, 12 22" stroke="#ffd700" strokeWidth="0.6" fill="none" opacity="0.8" />
          <path d="M 17 2 C 22 12, 22 18, 22 22" stroke="#ffd700" strokeWidth="0.6" fill="none" opacity="0.8" />
          <line x1="17" y1="2" x2="17" y2="22" stroke="#ffd700" strokeWidth="0.8" opacity="0.9" />
        </svg>
      ),
    },

    // 8. The Official Sovereign Taj Crest Finial
    {
      id: 'taj-crest',
      name: 'Taj Royal Crest',
      targetX: 52,
      targetY: 8,
      scatterX: 20,
      scatterY: -130,
      scatterZ: 180,
      rotX: -60,
      rotY: 80,
      rotZ: 90,
      delay: 0.45,
      renderSvg: () => (
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          {/* Spire Stem */}
          <line x1="8" y1="20" x2="8" y2="10" stroke="#ffd700" strokeWidth="1.2" />
          {/* Golden Trefoil / Royal Rosette Crest */}
          <circle cx="8" cy="7" r="4.5" fill="#b88e2e" stroke="#ffd700" strokeWidth="0.8" />
          {/* Center Jewel */}
          <circle cx="8" cy="7" r="1.5" fill="#ffffff" />
          {/* Royal Finial Spire Point */}
          <polygon points="8,0 6.5,5 9.5,5" fill="#ffd700" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      {/* 3D Perspective Stage Container */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: '700px',
        }}
      >
        {/* Soft Gold Radiance Glow in Background */}
        <div
          className={`absolute inset-4 rounded-full bg-taj-gold/15 blur-xl transition-all duration-1000 ${
            isSettled ? 'scale-110 opacity-70 animate-pulse' : 'scale-75 opacity-20'
          }`}
        />

        {/* 3D Floating Stage Assembly: holds all 2D layers */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isSettled
              ? 'rotateY(-6deg) rotateX(4deg)'
              : 'rotateY(16deg) rotateX(-8deg)',
          }}
        >
          {pieces.map((p) => {
            const transformStyle = isScattered
              ? `translate3d(${p.scatterX}px, ${p.scatterY}px, ${p.scatterZ}px) rotateX(${p.rotX}deg) rotateY(${p.rotY}deg) rotateZ(${p.rotZ}deg) scale(0.6)`
              : `translate3d(${p.targetX}px, ${p.targetY}px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)`;

            return (
              <div
                key={p.id}
                className="absolute top-0 left-0 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: transformStyle,
                  opacity: isScattered ? 0 : 1,
                  transitionDelay: isScattered ? '0ms' : `${p.delay}s`,
                  // Flat 2D rendering guaranteed:
                  backfaceVisibility: 'visible',
                  filter: isSettled ? 'drop-shadow(0 2px 4px rgba(36, 8, 15, 0.15))' : 'none',
                }}
              >
                {p.renderSvg(theme)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Luxury Labels */}
      {(label || sublabel) && (
        <div className="mt-2 text-center space-y-0.5">
          {label && (
            <h4
              className={`font-serif text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-500 ${
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
