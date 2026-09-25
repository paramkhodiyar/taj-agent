'use client';

import React, { useState, useEffect } from 'react';

interface TajLogo3DLoaderProps {
  size?: number; // default 76px
  theme?: 'light' | 'dark';
  autoReassemble?: boolean;
  replayIntervalMs?: number;
  label?: string;
  sublabel?: string;
}

interface LogoPiece {
  id: string;
  name: string;
  pathD: string;
  startX: number; // Mechanical entry trajectory X offset in px
  startY: number; // Mechanical entry trajectory Y offset in px
  order: number;  // 1 to 9: exact piece-by-piece sequential assembly
}

/**
 * TajLogo3DLoader — Crisp, Zero-Shadow, Piece-by-Piece Logo Assembly
 * 
 * Strict Standards:
 * - ZERO shadows (no box-shadow, no drop-shadow, no text-shadow, no canvas shadow).
 * - ZERO blur, ZERO glows, ZERO pulsating animations, ZERO gradients.
 * - Solid, architectural piece-by-piece mechanical lock-in:
 *   1. Facet 1 (Top crest) snaps into place.
 *   2. Facet 2 (Top right) snaps into place.
 *   3. Facet 3 (Mid right) snaps into place.
 *   4. Facet 4 (Bottom right) snaps into place.
 *   5. Facet 5 (Bottom left) snaps into place.
 *   6. Facet 6 (Mid left) snaps into place.
 *   7. Letter 'T' locks onto baseline.
 *   8. Letter 'A' locks onto baseline.
 *   9. Letter 'J' locks onto baseline.
 * - Crisp solid Imperial Taj Gold (#b88e2e) on faint architectural blueprint outline.
 */
export const TajLogo3DLoader: React.FC<TajLogo3DLoaderProps> = ({
  size = 76,
  theme = 'light',
  autoReassemble = true,
  replayIntervalMs = 4200,
  label,
  sublabel,
}) => {
  // Active step: 0 = empty blueprint, 1..9 = piece 1..9 locked in, 9 = fully assembled
  const [activeStep, setActiveStep] = useState<number>(0);
  const [cycle, setCycle] = useState<number>(0);

  // Exact 9 vector paths from official taj-logo.svg in sequential assembly order
  const pieces: LogoPiece[] = [
    // 1. Crest Facet 1 (Top)
    {
      id: 'facet-1',
      name: 'Crest Top',
      pathD: 'm 103.0001,170.3791 -0.72249,-0.39476 0.36089,-0.19791 z m 0.21378,-0.90664 v 0.78811 l -0.35983,-0.59055 z m -0.24765,1.05692 0.40323,-0.22013 v -1.27071 l -1.56563,0.85584',
      startX: 0,
      startY: -36,
      order: 1,
    },
    // 2. Crest Facet 2 (Top Right)
    {
      id: 'facet-2',
      name: 'Crest Top Right',
      pathD: 'm 104.34806,169.78646 0.36124,0.19826 -0.72248,0.39441 z m -0.57609,-0.31468 0.3609,0.19826 -0.3609,0.59196 z m 1.41182,0.42263 -1.56633,-0.85619 v 1.27106 l 0.40322,0.22013',
      startX: 32,
      startY: -20,
      order: 2,
    },
    // 3. Crest Facet 3 (Mid Right)
    {
      id: 'facet-3',
      name: 'Crest Mid Right',
      pathD: 'm 104.988,170.8363 h -0.72108 l 0.72108,-0.39441 z m 0,0.62936 -0.72284,-0.39476 h 0.72284 z m -0.84314,-0.73202 v 0.44062 l 1.1624,0.635 v -1.71168',
      startX: 36,
      startY: 0,
      order: 3,
    },
    // 4. Crest Facet 4 (Bottom Right)
    {
      id: 'facet-4',
      name: 'Crest Bottom Right',
      pathD: 'm 104.34806,172.1197 -0.36019,-0.5909 0.72038,0.39476 z m -0.57644,0.31609 v -0.79022 l 0.36125,0.59231 z m -0.15416,-0.83785 v 1.27035 l 1.56598,-0.85619 -1.16276,-0.63429',
      startX: 32,
      startY: 20,
      order: 4,
    },
    // 5. Crest Facet 5 (Bottom Left)
    {
      id: 'facet-5',
      name: 'Crest Bottom Left',
      pathD: 'm 102.63815,172.12005 -0.36019,-0.1965 0.72179,-0.3944 z m 0.57573,0.31503 -0.36018,-0.1972 0.36018,-0.5909 z m -1.41005,-0.42227 1.56528,0.85583 v -1.2707 l -0.40288,-0.22013',
      startX: -32,
      startY: 20,
      order: 5,
    },
    // 6. Crest Facet 6 (Mid Left)
    {
      id: 'facet-6',
      name: 'Crest Mid Left',
      pathD: 'm 101.99892,171.46569 v -0.39476 h 0.72214 z m 0,-1.02376 0.72108,0.3944 h -0.72108 z m 0.84349,0.29139 -1.1624,-0.63535 v 1.71133 l 1.1624,-0.635',
      startX: -36,
      startY: 0,
      order: 6,
    },
    // 7. Letter 'T'
    {
      id: 'letter-T',
      name: "Letter 'T'",
      pathD: 'm 94.763797,176.35589 c 0,0.61172 0,1.13665 -0.03528,1.41711 -0.02152,0.19226 -0.06385,0.33866 -0.206728,0.36548 -0.0635,0.0134 -0.148519,0.0265 -0.255411,0.0265 -0.08537,0 -0.113594,0.0201 -0.113594,0.0536 0,0.0455 0.04974,0.067 0.141817,0.067 0.284338,0 0.732366,-0.0201 0.895702,-0.0201 0.198967,0 0.646995,0.0201 1.116189,0.0201 0.07796,0 0.134409,-0.0215 0.134409,-0.067 0,-0.0335 -0.03528,-0.0536 -0.113242,-0.0536 -0.106892,0 -0.263172,-0.013 -0.362656,-0.0265 -0.21343,-0.0268 -0.255411,-0.17322 -0.27693,-0.35984 -0.03598,-0.2861 -0.03598,-0.81103 -0.03598,-1.42275 v -2.72697 l 0.896056,0.0198 c 0.632531,0.0138 0.824442,0.19968 0.8382,0.37254 l 0.0071,0.073 c 0.0074,0.0998 0.02187,0.13265 0.07832,0.13265 0.04304,0 0.05715,-0.0392 0.06421,-0.10548 0,-0.17322 0.02152,-0.63253 0.02152,-0.77153 0,-0.0998 -0.0071,-0.1404 -0.05715,-0.1404 -0.05644,0 -0.227189,0.067 -0.681919,0.067 h -2.815167 c -0.234244,0 -0.504472,-0.0138 -0.710847,-0.0332 -0.176742,-0.0138 -0.248708,-0.0804 -0.305506,-0.0804 -0.04233,0 -0.06421,0.0395 -0.08537,0.12665 -0.01411,0.0533 -0.149225,0.65863 -0.149225,0.76482 0,0.073 0.01446,0.10618 0.06385,0.10618 0.04269,0 0.0642,-0.0265 0.07832,-0.0797 0.01411,-0.0529 0.05009,-0.13265 0.121355,-0.23248 0.106539,-0.14676 0.276578,-0.17992 0.689328,-0.19297 l 1.058686,-0.0265',
      startX: -40,
      startY: 16,
      order: 7,
    },
    // 8. Letter 'A'
    {
      id: 'letter-A',
      name: "Letter 'A'",
      pathD: 'm 98.73678,176.21792 c -0.02822,0 -0.03457,-0.0198 -0.02822,-0.0469 l 0.638175,-1.63583 c 0.0067,-0.0265 0.02152,-0.06 0.04163,-0.06 0.02081,0 0.02822,0.0335 0.03493,0.06 l 0.623715,1.64218 c 0.007,0.0208 0,0.0406 -0.0342,0.0406 z m 1.40758,0.33267 c 0.0346,0 0.0554,0.0127 0.0688,0.0459 l 0.55492,1.41076 c 0.0349,0.0794 -0.0137,0.1397 -0.0621,0.1531 -0.0695,0.006 -0.0974,0.0198 -0.0974,0.0596 0,0.0466 0.0836,0.0466 0.20814,0.0547 0.55492,0.0127 1.06115,0.0127 1.31092,0.0127 0.25682,0 0.31926,-0.0127 0.31926,-0.0674 0,-0.0469 -0.0346,-0.0536 -0.0903,-0.0536 -0.0836,0 -0.18732,-0.006 -0.29104,-0.0265 -0.14605,-0.0332 -0.34678,-0.12629 -0.61066,-0.72531 -0.44344,-1.01035 -1.553278,-3.72427 -1.720142,-4.09046 -0.06879,-0.15275 -0.110419,-0.21237 -0.173214,-0.21237 -0.0695,0 -0.110419,0.073 -0.193322,0.266 l -1.740958,4.17653 c -0.1397,0.33338 -0.270933,0.55845 -0.591256,0.59867 -0.05539,0.007 -0.1524,0.0134 -0.214841,0.0134 -0.05539,0 -0.08326,0.0138 -0.08326,0.0536 0,0.0547 0.04198,0.0674 0.131586,0.0674 0.362303,0 0.743656,-0.0194 0.820209,-0.0194 0.214841,0 0.512938,0.0194 0.734836,0.0194 0.07655,0 0.117827,-0.0127 0.117827,-0.0674 0,-0.0399 -0.02152,-0.0536 -0.104422,-0.0536 h -0.103716 c -0.214842,0 -0.277284,-0.0868 -0.277284,-0.20602 0,-0.0797 0.03457,-0.23918 0.10407,-0.40605 l 0.373944,-0.95073 c 0.01411,-0.0402 0.02822,-0.0529 0.06279,-0.0529',
      startX: 0,
      startY: 32,
      order: 8,
    },
    // 9. Letter 'J'
    {
      id: 'letter-J',
      name: "Letter 'J'",
      pathD: 'm 103.15285,177.12562 c 0,1.30528 0.007,1.96956 -0.50941,2.48214 -0.13653,0.13335 -0.23813,0.20567 -0.32703,0.25224 -0.115,0.0603 -0.14922,0.0871 -0.14922,0.1203 0,0.0335 0.0275,0.0529 0.0547,0.0529 0.0339,0 0.0875,-0.013 0.13617,-0.0395 0.14217,-0.0663 0.25118,-0.12029 0.33973,-0.17321 0.65228,-0.39194 1.01212,-0.85125 1.15429,-1.25695 0.13723,-0.37324 0.16404,-0.79975 0.16404,-1.17863 0,-0.33231 -0.0208,-0.65123 -0.0208,-0.93839 v -1.22978 c 0,-1.01071 0,-1.19698 0.0134,-1.4097 0.0141,-0.23354 0.0677,-0.34643 0.25188,-0.37888 0.0819,-0.0138 0.12242,-0.0205 0.19756,-0.0205 0.0815,0 0.12206,-0.0134 0.12206,-0.0596 0,-0.0462 -0.0476,-0.06 -0.14323,-0.06 -0.26494,0 -0.69321,0.0198 -0.85619,0.0198 -0.17639,0 -0.60466,-0.0198 -0.96485,-0.0198 -0.1016,0 -0.14993,0.0138 -0.14993,0.06 0,0.0462 0.0409,0.0596 0.11607,0.0596 0.0953,0 0.2099,0.007 0.26458,0.0205 0.22472,0.0459 0.27869,0.1524 0.29245,0.37888 0.0138,0.21272 0.0138,0.39899 0.0138,1.4097',
      startX: 40,
      startY: 16,
      order: 9,
    },
  ];

  // Distinct piece-by-piece assembly: each piece completes before next begins
  useEffect(() => {
    setActiveStep(0);

    const stepInterval = 180; // ms per piece
    const timers: NodeJS.Timeout[] = [];

    // Trigger each piece 1 to 9 sequentially
    for (let step = 1; step <= 9; step++) {
      timers.push(
        setTimeout(() => {
          setActiveStep(step);
        }, step * stepInterval)
      );
    }

    // Optional loop replay
    let loopTimer: NodeJS.Timeout;
    if (autoReassemble) {
      loopTimer = setTimeout(() => {
        setCycle((c) => c + 1);
      }, replayIntervalMs);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (loopTimer) clearTimeout(loopTimer);
    };
  }, [cycle, autoReassemble, replayIntervalMs]);

  const isAllAssembled = activeStep >= 9;

  // Blueprint stroke color based on theme
  const blueprintStroke = theme === 'dark' ? '#3d2027' : '#dcd6ce';

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      {/* Assembly Stage - ZERO SHADOWS, ZERO GLOWS, ZERO ROTATION TILT */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: `${size}px`,
          height: `${Math.round(size * 0.9)}px`,
        }}
      >
        {/* Layer 1: Hairline Architectural Blueprint (Socket Outlines) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg
            viewBox="0 0 12.819528 11.259563"
            className="w-full h-full"
            fill="none"
          >
            <g transform="translate(-92.752315,-168.77364)">
              <g transform="translate(0.1322915,-0.13228958)">
                {pieces.map((p) => (
                  <path
                    key={`socket-${p.id}`}
                    d={p.pathD}
                    fill="none"
                    stroke={blueprintStroke}
                    strokeWidth="0.08"
                    strokeLinejoin="round"
                    style={{ fillRule: 'nonzero' }}
                  />
                ))}
              </g>
            </g>
          </svg>
        </div>

        {/* Layer 2: Solid Gold Inlay Pieces Assembling Piece by Piece */}
        {pieces.map((piece) => {
          const hasLanded = activeStep >= piece.order;
          const isEntering = activeStep === piece.order;

          // Crisp, mechanical slide-in directly into the socket
          const transform = hasLanded
            ? 'translate(0px, 0px)'
            : `translate(${piece.startX}px, ${piece.startY}px)`;

          // Solid object: 0% before turn, 100% solid upon entering
          const opacity = hasLanded ? 1 : 0;

          return (
            <div
              key={piece.id}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transform,
                opacity,
                // Mechanical precision transition: crisp, physical lock-in, zero blur
                transition: 'transform 170ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 30ms linear',
                willChange: 'transform, opacity',
              }}
            >
              <svg
                viewBox="0 0 12.819528 11.259563"
                className="w-full h-full"
                fill="none"
              >
                <g transform="translate(-92.752315,-168.77364)">
                  <g style={{ fill: '#b88e2e', fillOpacity: 1 }} transform="translate(0.1322915,-0.13228958)">
                    <path
                      d={piece.pathD}
                      fill="#b88e2e"
                      stroke="#a07a22"
                      strokeWidth="0.04"
                      style={{ fillRule: 'nonzero' }}
                    />
                  </g>
                </g>
              </svg>
            </div>
          );
        })}
      </div>

      {/* Discrete Assembly Pips - Real time piece count, zero glow */}
      <div className="mt-2.5 flex items-center justify-center gap-1">
        {pieces.map((p) => {
          const filled = activeStep >= p.order;
          return (
            <div
              key={`pip-${p.id}`}
              className="w-1 h-1 rounded-full transition-colors duration-150"
              style={{
                backgroundColor: filled
                  ? '#b88e2e'
                  : theme === 'dark'
                  ? '#3d2027'
                  : '#dcd6ce',
              }}
            />
          );
        })}
      </div>

      {/* Crisp Understated Typography Labels - Zero Shadows */}
      {(label || sublabel) && (
        <div className="mt-2 text-center space-y-0.5">
          {label && (
            <h4
              className={`font-serif text-[11px] font-bold tracking-[0.2em] uppercase transition-opacity duration-200 ${
                theme === 'dark' ? 'text-taj-gold' : 'text-taj-burgundy'
              } ${isAllAssembled ? 'opacity-100' : 'opacity-70'}`}
            >
              {label}
            </h4>
          )}
          {sublabel && (
            <p
              className={`text-[10px] font-sans ${
                theme === 'dark' ? 'text-taj-cream/60' : 'text-taj-charcoal-muted'
              }`}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

