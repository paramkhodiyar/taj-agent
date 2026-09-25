'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TajPageLoader } from '@/components/layout/TajPageLoader';
import Link from 'next/link';
import type { CompareApiResponse, HotelCompareResult } from '@/app/api/compare/route';

// ─── All Taj properties for the picker ──────────────────────────────────────
const ALL_TAJ_HOTELS = [
  { slug: 'taj-mahal-palace-mumbai', name: 'The Taj Mahal Palace', city: 'Mumbai' },
  { slug: 'taj-lands-end-mumbai', name: 'Taj Lands End', city: 'Mumbai' },
  { slug: 'taj-santacruz-mumbai', name: 'Taj Santacruz', city: 'Mumbai' },
  { slug: 'taj-lake-palace-udaipur', name: 'Taj Lake Palace', city: 'Udaipur' },
  { slug: 'taj-fateh-prakash-palace-udaipur', name: 'Taj Fateh Prakash Palace', city: 'Udaipur' },
  { slug: 'rambagh-palace-jaipur', name: 'Rambagh Palace', city: 'Jaipur' },
  { slug: 'taj-jai-mahal-palace-jaipur', name: 'Jai Mahal Palace', city: 'Jaipur' },
  { slug: 'umaid-bhawan-palace-jodhpur', name: 'Umaid Bhawan Palace', city: 'Jodhpur' },
  { slug: 'taj-exotica-resort-spa-goa', name: 'Taj Exotica Resort & Spa', city: 'Goa' },
  { slug: 'taj-fort-aguada-resort-spa-goa', name: 'Taj Fort Aguada Resort & Spa', city: 'Goa' },
  { slug: 'taj-holiday-village-resort-spa-goa', name: 'Taj Holiday Village Resort & Spa', city: 'Goa' },
  { slug: 'taj-palace-new-delhi', name: 'Taj Palace', city: 'New Delhi' },
  { slug: 'taj-mahal-hotel-new-delhi', name: 'The Taj Mahal Hotel (Taj Mansingh)', city: 'New Delhi' },
  { slug: 'taj-falaknuma-palace-hyderabad', name: 'Taj Falaknuma Palace', city: 'Hyderabad' },
  { slug: 'taj-krishna-hyderabad', name: 'Taj Krishna', city: 'Hyderabad' },
  { slug: 'taj-west-end-bengaluru', name: 'Taj West End', city: 'Bengaluru' },
  { slug: 'taj-coromandel-chennai', name: 'Taj Coromandel', city: 'Chennai' },
  { slug: 'taj-fishermans-cove-resort-spa-chennai', name: "Taj Fisherman's Cove Resort & Spa", city: 'Chennai' },
  { slug: 'taj-bengal-kolkata', name: 'Taj Bengal', city: 'Kolkata' },
  { slug: 'taj-ganges-varanasi', name: 'Taj Ganges', city: 'Varanasi' },
  { slug: 'taj-rishikesh-resort-spa-uttarakhand', name: 'Taj Rishikesh Resort & Spa', city: 'Rishikesh' },
  { slug: 'taj-bekal-resort-spa-kerala', name: 'Taj Bekal Resort & Spa', city: 'Bekal' },
  { slug: 'taj-green-cove-resort-spa-kovalam', name: 'Taj Green Cove Resort & Spa', city: 'Kovalam' },
  { slug: 'taj-madikeri-resort-spa-coorg', name: 'Taj Madikeri Resort & Spa', city: 'Coorg' },
  { slug: 'taj-swarna-amritsar', name: 'Taj Swarna', city: 'Amritsar' },
  { slug: 'taj-city-centre-gurugram', name: 'Taj City Centre', city: 'Gurugram' },
  { slug: 'taj-chandigarh', name: 'Taj Chandigarh', city: 'Chandigarh' },
  { slug: 'taj-hotel-convention-centre-agra', name: 'Taj Hotel & Convention Centre', city: 'Agra' },
  { slug: 'taj-corbett-resort-spa-uttarakhand', name: 'Taj Corbett Resort & Spa', city: 'Corbett' },
  { slug: 'taj-theog-resort-spa-shimla', name: 'Taj Theog Resort & Spa', city: 'Shimla' },
  { slug: 'taj-chia-kutir-resort-spa-darjeeling', name: 'Taj Chia Kutir Resort & Spa', city: 'Darjeeling' },
];

// ─── Amenity config ──────────────────────────────────────────────────────────
const AMENITY_LABELS: Record<string, string> = {
  pool: 'Swimming Pool',
  spa: 'Jiva Spa',
  gym: 'Fitness Centre',
  restaurant: 'Fine Dining',
  bar: 'Bar & Lounge',
  businessCenter: 'Business Centre',
  kidsClub: "Children's Club",
  beachAccess: 'Private Beach',
  airportTransfer: 'Airport Transfer',
  butler: 'Butler Service',
  concierge: '24h Concierge',
  roomService24h: '24h Room Service',
};

// ─── Helper components ───────────────────────────────────────────────────────

function AmenityDot({ value }: { value: boolean | null }) {
  if (value === null)
    return <span className="inline-block w-4 h-4 rounded-full bg-stone-200 border border-stone-300" title="Not confirmed" />;
  if (value)
    return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold" title="Available">✓</span>;
  return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-300 text-stone-600 text-[9px] font-bold" title="Not available">✗</span>;
}

function ConfidenceBadge({ confidence }: { confidence: HotelCompareResult['dataConfidence'] }) {
  const map = {
    HIGH: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Data Verified' },
    MEDIUM: { cls: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Partial Data' },
    LOW: { cls: 'bg-stone-100 text-stone-600 border-stone-200', label: 'Limited Data' },
  };
  const { cls, label } = map[confidence];
  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 border font-medium ${cls}`}>
      {label}
    </span>
  );
}

function SourceBadge({ urls }: { urls: string[] }) {
  const tajUrls = urls.filter((u) => u.includes('tajhotels.com') || u.includes('ihcl.com'));
  if (tajUrls.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tajUrls.slice(0, 2).map((u, i) => (
        <a
          key={i}
          href={u}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-taj-gold-muted hover:underline truncate max-w-[180px]"
          title={u}
        >
          {u.replace('https://www.', '').split('/').slice(0, 3).join('/')}…
        </a>
      ))}
    </div>
  );
}

// ─── Hotel Picker ────────────────────────────────────────────────────────────

function HotelPicker({
  label,
  value,
  exclude,
  onChange,
}: {
  label: string;
  value: string;
  exclude: string;
  onChange: (slug: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const selected = ALL_TAJ_HOTELS.find((h) => h.slug === value);
  const filtered = ALL_TAJ_HOTELS.filter(
    (h) =>
      h.slug !== exclude &&
      (search === '' ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative flex-1 min-w-[260px]">
      <label className="block text-[10px] uppercase tracking-widest text-taj-gold-muted font-medium mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left border border-taj-gray-border bg-white px-4 py-3 text-xs font-medium text-taj-charcoal flex items-center justify-between hover:border-taj-burgundy transition-colors focus:outline-none focus:ring-1 focus:ring-taj-burgundy"
      >
        <span>
          {selected ? (
            <>
              <span className="font-serif text-taj-burgundy">{selected.name}</span>
              <span className="text-taj-gray-warm ml-2">— {selected.city}</span>
            </>
          ) : (
            <span className="text-taj-gray-warm italic">Select a Taj property…</span>
          )}
        </span>
        <span className="text-taj-gray-warm ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-taj-gray-border shadow-xl mt-0.5 max-h-72 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-taj-gray-border p-2">
            <input
              type="text"
              placeholder="Search by name or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-taj-gray-border focus:outline-none focus:ring-1 focus:ring-taj-burgundy"
              autoFocus
            />
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-taj-gray-warm">No properties found</div>
          ) : (
            filtered.map((h) => (
              <button
                key={h.slug}
                type="button"
                onClick={() => {
                  onChange(h.slug);
                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-4 py-3 text-xs hover:bg-taj-cream/60 flex items-center justify-between transition-colors ${
                  h.slug === value ? 'bg-taj-cream text-taj-burgundy font-medium' : 'text-taj-charcoal'
                }`}
              >
                <span className="font-medium">{h.name}</span>
                <span className="text-taj-gray-warm text-[11px]">{h.city}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Compare Table Row ───────────────────────────────────────────────────────

function CompareRow({
  label,
  cells,
  highlight = false,
  sub = false,
}: {
  label: string;
  cells: React.ReactNode[];
  highlight?: boolean;
  sub?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-taj-cream/40' : ''}>
      <td
        className={`py-3.5 px-5 border-r border-taj-gray-border ${
          sub
            ? 'text-taj-charcoal-muted text-[11px] pl-8'
            : 'font-semibold text-taj-charcoal text-xs'
        } bg-taj-cream/20 border-r border-taj-gray-border`}
        style={{ width: '220px', minWidth: '180px' }}
      >
        {label}
      </td>
      {cells.map((cell, i) => (
        <td
          key={i}
          className="py-3.5 px-5 text-xs text-taj-charcoal border-r border-taj-gray-border/40 last:border-r-0"
          style={{ minWidth: '260px' }}
        >
          {cell ?? <span className="text-stone-400 italic text-[11px]">Not confirmed</span>}
        </td>
      ))}
    </tr>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={99}
        className="py-2 px-5 bg-taj-burgundy/5 border-t-2 border-b border-taj-gray-border text-[10px] uppercase tracking-widest font-semibold text-taj-burgundy"
      >
        {label}
      </td>
    </tr>
  );
}

// ─── Main Compare Content ────────────────────────────────────────────────────

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 14);
  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckIn.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const [hotelA, setHotelA] = useState(searchParams.get('a') || 'taj-mahal-palace-mumbai');
  const [hotelB, setHotelB] = useState(searchParams.get('b') || 'taj-lake-palace-udaipur');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || fmt(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || fmt(defaultCheckOut));
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2', 10));

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCompare = useCallback(async () => {
    if (!hotelA || !hotelB || hotelA === hotelB) {
      setError('Please select two different Taj properties to compare.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    const hotelAName = ALL_TAJ_HOTELS.find((h) => h.slug === hotelA)?.name || hotelA;
    const hotelBName = ALL_TAJ_HOTELS.find((h) => h.slug === hotelB)?.name || hotelB;

    try {
      setLoadingStage(`Searching tajhotels.com for ${hotelAName}…`);
      await new Promise((r) => setTimeout(r, 800));
      setLoadingStage(`Searching tajhotels.com for ${hotelBName}…`);
      await new Promise((r) => setTimeout(r, 600));
      setLoadingStage('Cross-referencing amenities, rates & policies…');

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlugs: [hotelA, hotelB], checkIn, checkOut, adults }),
      });

      setLoadingStage('Generating comparison analysis…');
      const data: CompareApiResponse = await res.json();

      if (!data.success) throw new Error(data.error || 'Comparison failed');
      setResult(data);

      // Update URL params
      const params = new URLSearchParams({ a: hotelA, b: hotelB, checkIn, checkOut, adults: String(adults) });
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  }, [hotelA, hotelB, checkIn, checkOut, adults, router]);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const hotels = result?.hotels || [];
  const analysis = result?.aiAnalysis;
  const rateLimitWarning = (result as any)?.rateLimitWarning;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-2">
        <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
          Live Intelligence Matrix
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-taj-burgundy">
          Compare Taj Properties
        </h1>
        <p className="text-xs text-taj-charcoal-muted max-w-2xl">
          Select any two Taj properties. Our platform searches the official Taj Hotels website in real
          time — rates, amenities, dining, and policies — and generates a verified side-by-side analysis.
          No estimates. No guesswork. <span className="font-medium text-taj-charcoal">Real data only.</span>
        </p>
      </div>

      {/* ── Picker Panel ── */}
      <div className="border border-taj-gray-border bg-white p-6 space-y-6">
        <div className="flex flex-wrap gap-4 items-end">
          <HotelPicker label="Property A" value={hotelA} exclude={hotelB} onChange={setHotelA} />

          <div className="flex flex-col items-center justify-end pb-0.5">
            <button
              type="button"
              title="Swap hotels"
              onClick={() => { setHotelA(hotelB); setHotelB(hotelA); }}
              className="w-9 h-9 flex items-center justify-center border border-taj-gray-border bg-taj-cream hover:bg-taj-cream/70 text-taj-burgundy text-base transition-colors"
            >
              ⇄
            </button>
          </div>

          <HotelPicker label="Property B" value={hotelB} exclude={hotelA} onChange={setHotelB} />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-taj-gold-muted font-medium mb-2">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              min={fmt(today)}
              onChange={(e) => setCheckIn(e.target.value)}
              className="border border-taj-gray-border bg-white px-4 py-2.5 text-xs text-taj-charcoal focus:outline-none focus:ring-1 focus:ring-taj-burgundy"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-taj-gold-muted font-medium mb-2">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="border border-taj-gray-border bg-white px-4 py-2.5 text-xs text-taj-charcoal focus:outline-none focus:ring-1 focus:ring-taj-burgundy"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-taj-gold-muted font-medium mb-2">
              Adults
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              className="border border-taj-gray-border bg-white px-4 py-2.5 text-xs text-taj-charcoal focus:outline-none focus:ring-1 focus:ring-taj-burgundy"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || !hotelA || !hotelB || hotelA === hotelB}
            className="px-8 py-2.5 bg-taj-burgundy text-white text-xs uppercase tracking-wider font-medium hover:bg-taj-burgundy-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching…
              </>
            ) : (
              '⚡ Compare Now'
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* ── Loading Stage ── */}
      {loading && (
        <TajPageLoader
          title="Fetching Live Data"
          subtitle={loadingStage || 'Searching official Taj Hotels website for real rates and property details…'}
        />
      )}

      {/* ── Results ── */}
      {!loading && result && hotels.length >= 2 && (
        <div className="space-y-6">
          {/* Rate Limit Warning */}
          {rateLimitWarning && (
            <div className="p-4 bg-amber-50 border border-amber-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">⏳</span>
                <span className="text-xs font-semibold text-amber-900">Temporary Search Limit Reached</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">{rateLimitWarning}</p>
              <button
                onClick={handleCompare}
                className="mt-1 px-4 py-1.5 bg-amber-700 text-white text-xs uppercase tracking-wider hover:bg-amber-800 transition-colors"
              >
                Retry Now
              </button>
            </div>
          )}

          {/* AI Verdict Banner */}
          {analysis && (
            <div className="border border-taj-burgundy/30 bg-gradient-to-r from-taj-cream to-white p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-taj-gold-muted font-medium block">
                    AI-Generated Analysis · Real Data Only
                  </span>
                  <h2 className="text-xl font-serif text-taj-burgundy mt-0.5">Verdict</h2>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-white border border-taj-gray-border text-xs text-taj-charcoal hover:border-taj-burgundy transition-colors"
                >
                  {copied ? '✓ Link Copied' : 'Share Comparison'}
                </button>
              </div>

              <p className="text-sm text-taj-charcoal leading-relaxed font-medium">
                {analysis.verdict}
              </p>

              {analysis.priceDifference && (
                <div className="inline-block px-3 py-1.5 bg-taj-burgundy/10 border border-taj-burgundy/20 text-xs text-taj-burgundy font-medium">
                  💰 {analysis.priceDifference}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {[
                  { label: 'Best Value', value: analysis.bestForBudget },
                  { label: 'Most Luxurious', value: analysis.bestForLuxury },
                  { label: 'Best for Families', value: analysis.bestForFamily },
                  { label: 'Best for Couples', value: analysis.bestForCouple },
                ].map(({ label, value }) => (
                  value && (
                    <div key={label} className="bg-white border border-taj-gray-border p-3 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted block">{label}</span>
                      <p className="text-xs text-taj-charcoal">{value}</p>
                    </div>
                  )
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {analysis.uniqueToA && analysis.uniqueToA.length > 0 && (
                  <div className="bg-white border border-taj-gray-border p-4 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted block">
                      Unique to {hotels[0].canonicalName}
                    </span>
                    <ul className="space-y-1">
                      {analysis.uniqueToA.map((u, i) => (
                        <li key={i} className="text-xs text-taj-charcoal flex items-start gap-2">
                          <span className="text-taj-gold-muted mt-0.5">→</span> {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.uniqueToB && analysis.uniqueToB.length > 0 && (
                  <div className="bg-white border border-taj-gray-border p-4 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted block">
                      Unique to {hotels[1].canonicalName}
                    </span>
                    <ul className="space-y-1">
                      {analysis.uniqueToB.map((u, i) => (
                        <li key={i} className="text-xs text-taj-charcoal flex items-start gap-2">
                          <span className="text-taj-gold-muted mt-0.5">→</span> {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {analysis.recommendation && (
                <div className="border-t border-taj-gray-border pt-4">
                  <span className="text-[10px] uppercase tracking-wider text-taj-gold-muted block mb-1">Our Recommendation</span>
                  <p className="text-xs text-taj-charcoal-light leading-relaxed">{analysis.recommendation}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Comparison Table ── */}
          <div className="border border-taj-gray-border bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-taj-gray-border bg-taj-cream">
                  <th
                    className="py-4 px-5 font-serif text-sm text-taj-charcoal bg-white border-r border-taj-gray-border"
                    style={{ width: '220px', minWidth: '180px' }}
                  >
                    Comparison Criteria
                  </th>
                  {hotels.map((h) => (
                    <th key={h.hotelId} className="py-4 px-5 font-serif text-base min-w-[260px]">
                      <div className="space-y-1.5">
                        <p className="text-taj-burgundy font-medium">{h.canonicalName}</p>
                        <p className="text-[11px] font-sans text-taj-gray-warm font-normal">{h.city}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <ConfidenceBadge confidence={h.dataConfidence} />
                          <span className="text-[10px] text-taj-gray-warm">
                            {new Date(h.extractionTimestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} live
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-taj-gray-border">

                {/* ── RATES ── */}
                <SectionHeader label="Live Rates (sourced from tajhotels.com)" />
                <CompareRow
                  label="Lowest Available"
                  cells={hotels.map((h) =>
                    h.currentRates.lowestAvailable ? (
                      <span className="text-base font-bold text-taj-burgundy font-mono">
                        {h.currentRates.lowestAvailable}
                        {h.currentRates.rateNote && (
                          <span className="text-[10px] text-taj-gray-warm font-normal block">{h.currentRates.rateNote}</span>
                        )}
                      </span>
                    ) : null
                  )}
                  highlight
                />
                <CompareRow
                  label="Deluxe Room"
                  sub
                  cells={hotels.map((h) => (
                    <span className="font-medium text-taj-charcoal">{h.currentRates.deluxeRoom || null}</span>
                  ))}
                />
                <CompareRow
                  label="Luxury Room"
                  sub
                  cells={hotels.map((h) => (
                    <span className="font-medium text-taj-charcoal">{h.currentRates.luxuryRoom || null}</span>
                  ))}
                />
                <CompareRow
                  label="Suite"
                  sub
                  cells={hotels.map((h) => (
                    <span className="font-medium text-taj-charcoal">{h.currentRates.suite || null}</span>
                  ))}
                />
                <CompareRow
                  label="Rate Note"
                  sub
                  cells={hotels.map((h) => h.currentRates.rateNote)}
                />
                <CompareRow
                  label="Cancellation Policy"
                  cells={hotels.map((h) => h.cancellationPolicy)}
                />
                <CompareRow
                  label="Meal Plans"
                  cells={hotels.map((h) =>
                    h.mealPlans.length > 0 ? (
                      <div className="space-y-1">
                        {h.mealPlans.map((m) => (
                          <span key={m} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-stone-50 border border-stone-200 text-[10px] text-stone-700">
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : null
                  )}
                />

                {/* ── PROPERTY ── */}
                <SectionHeader label="Property Details" />
                <CompareRow
                  label="Heritage & Style"
                  cells={hotels.map((h) => h.propertyDetails.heritage)}
                  highlight
                />
                <CompareRow
                  label="Location"
                  cells={hotels.map((h) => h.propertyDetails.location)}
                />
                <CompareRow
                  label="Views"
                  cells={hotels.map((h) => h.propertyDetails.views)}
                />
                <CompareRow
                  label="Total Rooms"
                  cells={hotels.map((h) =>
                    h.propertyDetails.totalRooms ? `${h.propertyDetails.totalRooms} keys` : null
                  )}
                />
                <CompareRow
                  label="Year Built"
                  cells={hotels.map((h) => h.propertyDetails.yearBuilt)}
                />
                <CompareRow
                  label="Last Renovated"
                  cells={hotels.map((h) => h.propertyDetails.yearRenovated)}
                />

                {/* ── ROOM TYPES ── */}
                <SectionHeader label="Room Categories" />
                <CompareRow
                  label="Available Room Types"
                  cells={hotels.map((h) =>
                    h.roomTypes.length > 0 ? (
                      <ul className="space-y-0.5 list-disc list-inside">
                        {h.roomTypes.map((r) => (
                          <li key={r} className="text-taj-charcoal-light">{r}</li>
                        ))}
                      </ul>
                    ) : null
                  )}
                />

                {/* ── AMENITIES ── */}
                <SectionHeader label="Amenities & Facilities" />
                {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                  <CompareRow
                    key={key}
                    label={label}
                    cells={hotels.map((h) => (
                      <div className="flex items-center gap-2">
                        <AmenityDot value={(h.amenities as any)[key]} />
                        <span className={`text-[11px] ${(h.amenities as any)[key] === true ? 'text-emerald-700 font-medium' : (h.amenities as any)[key] === false ? 'text-stone-500' : 'text-stone-400 italic'}`}>
                          {(h.amenities as any)[key] === true ? 'Available' : (h.amenities as any)[key] === false ? 'Not available' : 'Not confirmed'}
                        </span>
                      </div>
                    ))}
                  />
                ))}

                {/* ── DINING ── */}
                <SectionHeader label="Dining & Restaurants" />
                <CompareRow
                  label="Dining Venues"
                  cells={hotels.map((h) =>
                    h.diningOptions.length > 0 ? (
                      <ul className="space-y-0.5">
                        {h.diningOptions.map((d) => (
                          <li key={d} className="text-taj-charcoal-light">• {d}</li>
                        ))}
                      </ul>
                    ) : null
                  )}
                  highlight
                />

                {/* ── EVENTS & LOYALTY ── */}
                <SectionHeader label="Events, Loyalty & Sustainability" />
                <CompareRow
                  label="Event Spaces"
                  cells={hotels.map((h) => h.eventSpaces)}
                />
                <CompareRow
                  label="Loyalty Benefits"
                  cells={hotels.map((h) => h.loyaltyBenefits)}
                />
                <CompareRow
                  label="Sustainability"
                  cells={hotels.map((h) => h.sustainabilityInitiatives)}
                />

                {/* ── HIGHLIGHTS ── */}
                <SectionHeader label="Why Stay Here" />
                <CompareRow
                  label="Unique Highlights"
                  cells={hotels.map((h) =>
                    h.highlights.length > 0 ? (
                      <ul className="space-y-1">
                        {h.highlights.map((hl) => (
                          <li key={hl} className="flex items-start gap-2">
                            <span className="text-taj-gold-muted mt-0.5">★</span>
                            <span className="text-taj-charcoal-light">{hl}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null
                  )}
                  highlight
                />

                {/* ── DATA PROVENANCE ── */}
                <SectionHeader label="Data Provenance & Transparency" />
                <CompareRow
                  label="Sources"
                  cells={hotels.map((h) => <SourceBadge urls={h.sourceUrls} />)}
                />
                <CompareRow
                  label="Missing Data"
                  cells={hotels.map((h) =>
                    h.missingFields.length > 0 ? (
                      <span className="text-[11px] text-stone-500 italic">
                        {h.missingFields.join(', ')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-700">All fields found ✓</span>
                    )
                  )}
                />
                <CompareRow
                  label="View Full Details"
                  cells={hotels.map((h) => (
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/hotel/${h.slug}`}
                        className="inline-block px-3 py-1.5 text-[11px] uppercase tracking-wider text-taj-burgundy border border-taj-burgundy/40 hover:bg-taj-burgundy hover:text-white transition-colors"
                      >
                        Price History →
                      </Link>
                      <a
                        href={h.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1.5 text-[11px] uppercase tracking-wider text-taj-gold-muted border border-taj-gold-muted/40 hover:bg-taj-gold-muted hover:text-white transition-colors"
                      >
                        Book on Taj.com ↗
                      </a>
                    </div>
                  ))}
                />
              </tbody>
            </table>
          </div>

          {/* Data Transparency Footer */}
          <div className="text-[11px] text-taj-gray-warm border-t border-taj-gray-border pt-4 flex items-start gap-2">
            <span className="text-taj-gold-muted">ℹ</span>
            <span>
              All data above was fetched live from the official Taj Hotels website and verified public sources using Gemini AI with Google Search grounding.
              Fields marked "Not confirmed" could not be independently verified — they are not estimates.
              Rates are indicative and subject to change. Always verify before booking.
              {/* Built by Param Khodiyar — who clearly had too much free time and too much love for Taj Hotels. */}
            </span>
          </div>
        </div>
      )}

      {/* Empty state — before first compare */}
      {!loading && !result && !error && (
        <div className="border border-taj-gray-border bg-white p-12 text-center space-y-3">
          <div className="text-4xl mb-4">🏛</div>
          <p className="text-sm font-serif text-taj-burgundy">Select two properties above to begin</p>
          <p className="text-xs text-taj-gray-warm max-w-sm mx-auto">
            Our platform will search tajhotels.com in real time and generate a verified, data-backed comparison — no mock data, ever.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Suspense
          fallback={
            <TajPageLoader
              title="Loading Compare"
              subtitle="Preparing the property comparison tool…"
            />
          }
        >
          <CompareContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
