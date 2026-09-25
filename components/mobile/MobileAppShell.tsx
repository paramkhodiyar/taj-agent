'use client';

import React, { useState } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileAssistantSheet } from './MobileAssistantSheet';

interface MobileAppShellProps {
  children?: React.ReactNode;
}

/**
 * MobileAppShell — Dedicated Native-Style Mobile Shell
 * 
 * Separates mobile UX cleanly from desktop:
 * - Floating thumb-zone bottom navigation bar.
 * - Bottom-sheet conversational AI Price Concierge.
 * - Automatically injects bottom padding on mobile to prevent floating bar occlusion.
 * - Completely hidden on desktop viewports (`md:hidden`).
 */
export const MobileAppShell: React.FC<MobileAppShellProps> = ({ children }) => {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <>
      {/* Mobile-only bottom spacing spacer to guarantee zero content occlusion */}
      <div className="h-20 md:hidden pointer-events-none" aria-hidden="true" />

      {/* Floating Bottom Nav (Mobile Only) */}
      <MobileBottomNav
        assistantActive={assistantOpen}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      {/* Slide-Up Mobile Assistant Bottom Sheet */}
      <MobileAssistantSheet
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />

      {children}
    </>
  );
};
