'use client';

import React from 'react';
import { TajLogo3DLoader } from './TajLogo3DLoader';

interface TajLuxuryIconLoaderProps {
  size?: number;
  label?: string;
  sublabel?: string;
  autoReplay?: boolean;
}

/**
 * Standardized to official TajLogo3DLoader — Piece-by-piece, zero shadows, zero glows.
 */
export const TajLuxuryIconLoader: React.FC<TajLuxuryIconLoaderProps> = ({
  size = 76,
  label,
  sublabel,
  autoReplay = true,
}) => {
  return (
    <TajLogo3DLoader
      size={size}
      label={label}
      sublabel={sublabel}
      autoReassemble={autoReplay}
    />
  );
};
