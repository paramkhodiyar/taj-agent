'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon } from 'lucide-react';

interface LuxuryDatePickerProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onChange: (checkIn: string, checkOut: string) => void;
}

/**
 * LuxuryDatePicker — Custom Taj Royal Calendar Date Picker
 * 
 * Research & Design Highlights:
 * - Eliminates ugly browser-native <input type="date"> popups.
 * - When Check-In is selected, Check-Out is automatically updated to Check-In + 1 night.
 * - Prevents Check-Out from ever being less than or equal to Check-In.
 * - Royal Taj Burgundy, Gold accents, and Cinzel serif typography.
 * - Quick-duration stay chips (1 Night, 2 Nights Weekend, 3 Nights, 5 Nights).
 * - Multi-month navigation with disablement of past dates.
 */
export const LuxuryDatePicker: React.FC<LuxuryDatePickerProps> = ({
  checkIn,
  checkOut,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<'checkIn' | 'checkOut'>('checkIn');
  
  // Current view month & year (defaults to checkIn's month)
  const initialDate = checkIn ? new Date(checkIn + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseDate = (str: string) => new Date(str + 'T00:00:00');

  const addDays = (str: string, days: number) => {
    const d = parseDate(str);
    d.setDate(d.getDate() + days);
    return formatDateStr(d);
  };

  // Format luxury display label e.g. "Thu, 15 Oct"
  const formatDisplay = (str: string) => {
    if (!str) return 'Select Date';
    const d = parseDate(str);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate nights count
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = parseDate(checkOut).getTime() - parseDate(checkIn).getTime();
    const nights = Math.round(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  // Month navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sun
  };

  const todayStr = formatDateStr(new Date());

  // Handle day click
  const handleDayClick = (dayNum: number) => {
    const selectedDate = new Date(viewYear, viewMonth, dayNum);
    const selectedStr = formatDateStr(selectedDate);

    if (activeField === 'checkIn') {
      // User clicked Check-In:
      // Auto-set Check-Out to +1 day per requirement!
      const autoCheckOut = addDays(selectedStr, 1);
      onChange(selectedStr, autoCheckOut);
      // Seamlessly advance to check-out selection
      setActiveField('checkOut');
    } else {
      // User clicked Check-Out:
      // Must not be less than or equal to checkIn!
      if (selectedStr <= checkIn) {
        // If user picked a date on or before check-in, treat this as the new check-in date
        // and auto-set check-out to +1!
        const autoCheckOut = addDays(selectedStr, 1);
        onChange(selectedStr, autoCheckOut);
        setActiveField('checkOut');
      } else {
        onChange(checkIn, selectedStr);
        setIsOpen(false);
      }
    }
  };

  // Quick duration helper
  const handleQuickDuration = (nights: number) => {
    const newCheckOut = addDays(checkIn, nights);
    onChange(checkIn, newCheckOut);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  return (
    <div ref={containerRef} className="relative w-full col-span-1 sm:col-span-2">
      {/* Two Luxury Trigger Fields: Check-In & Check-Out */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Check-In Field */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveField('checkIn');
            setIsOpen(true);
            const d = parseDate(checkIn);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setActiveField('checkIn');
              setIsOpen(true);
            }
          }}
          className={`cursor-pointer p-3 border rounded-xl bg-taj-cream transition-all duration-150 ${
            isOpen && activeField === 'checkIn'
              ? 'border-taj-burgundy ring-2 ring-taj-burgundy/20 bg-white'
              : 'border-taj-gray-border hover:border-taj-gold/80 hover:bg-white'
          }`}
        >
          <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-taj-gold-muted">
            Check-In
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs sm:text-sm font-semibold text-taj-charcoal font-sans">
              {formatDisplay(checkIn)}
            </span>
            <CalendarIcon className="w-3.5 h-3.5 text-taj-gold stroke-[2]" />
          </div>
        </div>

        {/* Check-Out Field */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveField('checkOut');
            setIsOpen(true);
            const d = parseDate(checkOut);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setActiveField('checkOut');
              setIsOpen(true);
            }
          }}
          className={`cursor-pointer p-3 border rounded-xl bg-taj-cream transition-all duration-150 ${
            isOpen && activeField === 'checkOut'
              ? 'border-taj-burgundy ring-2 ring-taj-burgundy/20 bg-white'
              : 'border-taj-gray-border hover:border-taj-gold/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-taj-gold-muted">
              Check-Out
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-taj-burgundy bg-taj-cream-warm px-1.5 py-0.2 rounded-full border border-taj-gold/30">
              <Moon className="w-2.5 h-2.5 text-taj-gold" />
              {getNights()} {getNights() === 1 ? 'Night' : 'Nights'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs sm:text-sm font-semibold text-taj-charcoal font-sans">
              {formatDisplay(checkOut)}
            </span>
            <CalendarIcon className="w-3.5 h-3.5 text-taj-gold stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Popover Custom Luxury Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[350px] mt-2 z-50 bg-white border border-taj-gray-border/90 rounded-2xl shadow-[0_18px_50px_rgba(36,8,15,0.18)] p-4 animate-fade-in">
          {/* Header Month / Year & Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-taj-gray-border/60">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-taj-cream text-taj-charcoal active:scale-90 transition-transform"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.25]" />
            </button>

            <div className="text-center">
              <h4 className="font-serif font-semibold text-sm text-taj-burgundy tracking-wide">
                {monthNames[viewMonth]} {viewYear}
              </h4>
              <p className="text-[10px] text-taj-charcoal-light">
                {activeField === 'checkIn' ? 'Select Check-In Date' : 'Select Check-Out Date'}
              </p>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-taj-cream text-taj-charcoal active:scale-90 transition-transform"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.25]" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-semibold text-taj-gold-muted uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="w-full h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(viewYear, viewMonth, dayNum);
              const dateStr = formatDateStr(dateObj);

              const isPast = dateStr < todayStr;
              const isStart = dateStr === checkIn;
              const isEnd = dateStr === checkOut;
              const isInRange = dateStr > checkIn && dateStr < checkOut;
              const isBlockedCheckOut = activeField === 'checkOut' && dateStr <= checkIn;

              let cellClasses = 'w-full h-8 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center ';

              if (isPast) {
                cellClasses += 'text-gray-300 cursor-not-allowed';
              } else if (isStart || isEnd) {
                cellClasses += 'bg-taj-burgundy text-white font-bold shadow-xs scale-105 z-10';
              } else if (isInRange) {
                cellClasses += 'bg-taj-cream-warm text-taj-burgundy font-semibold rounded-none';
              } else if (isBlockedCheckOut) {
                cellClasses += 'text-gray-400 hover:bg-taj-cream/50 cursor-pointer';
              } else {
                cellClasses += 'text-taj-charcoal hover:bg-taj-cream hover:text-taj-burgundy hover:border hover:border-taj-gold/40 cursor-pointer';
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDayClick(dayNum)}
                  className={cellClasses}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Stay Presets */}
          <div className="mt-3 pt-3 border-t border-taj-gray-border/60">
            <span className="block text-[9px] uppercase tracking-wider text-taj-charcoal-light font-semibold mb-1.5">
              Quick Stay Duration:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '1 Night', nights: 1 },
                { label: '2 Nights', nights: 2 },
                { label: '3 Nights', nights: 3 },
                { label: '5 Nights', nights: 5 },
              ].map((preset) => {
                const isActive = getNights() === preset.nights;
                return (
                  <button
                    key={preset.nights}
                    type="button"
                    onClick={() => handleQuickDuration(preset.nights)}
                    className={`py-1 text-[10px] font-medium rounded-lg border transition-all ${
                      isActive
                        ? 'bg-taj-burgundy text-white border-taj-burgundy font-semibold'
                        : 'bg-taj-cream border-taj-gray-border text-taj-charcoal hover:bg-white hover:border-taj-burgundy'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-taj-gray-border/60">
            <span className="text-[11px] text-taj-charcoal-muted">
              {formatDisplay(checkIn)} → {formatDisplay(checkOut)}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-taj-burgundy text-white text-xs font-medium rounded-lg hover:bg-taj-burgundy-deep active:scale-95 transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
