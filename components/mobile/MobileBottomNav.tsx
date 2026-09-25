'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Search, ArrowLeftRight, Clock, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAssistant?: () => void;
  assistantActive?: boolean;
}

/**
 * MobileBottomNav — Ergonomic Floating Thumb-Zone Navigation Bar
 * 
 * Research-backed UX design:
 * - Steven Hoober / Luke Wroblewski "Thumb Zone" optimization: placed in the natural bottom 15% sweep.
 * - Touch target sizing: 48x48px minimum per Apple HIG & Google Material Design 3.
 * - Micro-interaction feedback: active:scale-95 tactile spring.
 * - Safe area inset: pb-[max(0.75rem,env(safe-area-inset-bottom))] for modern iOS/Android bezels.
 * - Visual hierarchy: Taj burgundy active state with gold indicator dot.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAssistant,
  assistantActive = false,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Explore',
      href: '/',
      icon: Compass,
      isActive: pathname === '/',
    },
    {
      label: 'Search',
      href: '/search',
      icon: Search,
      isActive: pathname === '/search' || pathname?.startsWith('/results'),
    },
    {
      label: 'Compare',
      href: '/compare',
      icon: ArrowLeftRight,
      isActive: pathname === '/compare',
    },
    {
      label: 'History',
      href: '/history',
      icon: Clock,
      isActive: pathname === '/history',
    },
  ];

  return (
    <aside
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto px-3.5">
        <nav
          className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-taj-gray-border/90 rounded-2xl px-2 py-1.5 shadow-[0_10px_35px_rgba(36,8,15,0.14)] flex items-center justify-between"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={true}
                className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] min-w-[48px] py-1 rounded-xl transition-all duration-150 active:scale-95 ${
                  active
                    ? 'text-taj-burgundy font-semibold'
                    : 'text-taj-charcoal-light hover:text-taj-charcoal'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      active ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                    }`}
                  />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-taj-gold shadow-sm" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight leading-none ${
                    active ? 'font-semibold text-taj-burgundy' : 'font-normal text-taj-charcoal-muted'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* AI Intelligence Concierge Floating Button */}
          <button
            type="button"
            onClick={onOpenAssistant}
            aria-label="Open Taj AI Price Intelligence Concierge"
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] min-w-[48px] py-1 rounded-xl transition-all duration-150 active:scale-95 ${
              assistantActive
                ? 'text-taj-burgundy font-semibold'
                : 'text-taj-charcoal-light hover:text-taj-charcoal'
            }`}
          >
            <div className="relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  assistantActive
                    ? 'bg-taj-burgundy text-white'
                    : 'bg-taj-cream-warm text-taj-burgundy'
                }`}
              >
                <Sparkles className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight leading-none ${
                assistantActive ? 'font-semibold text-taj-burgundy' : 'font-normal text-taj-charcoal-muted'
              }`}
            >
              Concierge
            </span>
          </button>
        </nav>
      </div>
    </aside>
  );
};
