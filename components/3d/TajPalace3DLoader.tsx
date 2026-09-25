'use client';

import React from 'react';
import { TajLogo3DLoader } from './TajLogo3DLoader';

interface TajPalace3DLoaderProps {
  onComplete?: () => void;
  autoRotate?: boolean;
}

/**
 * Standardized to official TajLogo3DLoader — Piece-by-piece, zero shadows, zero glows.
 */
export const TajPalace3DLoader: React.FC<TajPalace3DLoaderProps> = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <TajLogo3DLoader size={88} autoReassemble={true} />
    </div>
  );
};
