'use client';

import React from 'react';
import { TajLogo3DLoader } from './TajLogo3DLoader';

interface Taj2DHotel3DLoaderProps {
  onComplete?: () => void;
  replayIntervalMs?: number;
}

/**
 * Standardized to official TajLogo3DLoader — Piece-by-piece, zero shadows, zero glows.
 */
export const Taj2DHotel3DLoader: React.FC<Taj2DHotel3DLoaderProps> = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <TajLogo3DLoader size={88} autoReassemble={true} />
    </div>
  );
};
