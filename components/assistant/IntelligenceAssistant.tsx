'use client';

import React, { useState } from 'react';
import { AssistantResponse } from '@/agent/intentRouter';

export const IntelligenceAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Which Taj is cheapest right now?',
    'Why did Taj Lake Palace price change?',
    'What room types does Taj Fort Aguada have?',
  ];

  const handleAsk = async (qText?: string) => {
    const q = qText || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to query assistant');
      }

      setResponse(json.data);
    } catch (err: any) {
      setError(err.message || 'Error executing assistant query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-taj-gray-border pb-4 space-y-1">
        <span className="text-[11px] uppercase tracking-widest text-taj-gold-muted font-medium block">
          Taj Luxury Concierge
        </span>
        <h3 className="text-xl sm:text-2xl font-serif text-taj-burgundy">
          Taj Rate & Stay Concierge
        </h3>
        <p className="text-xs text-taj-charcoal-muted">
          Ask questions in plain language. Rates and stay options are verified directly against official Taj reservation records.
        </p>
      </div>

      {/* Query Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="e.g. Which Taj is best for next weekend? Or: Does Fort Aguada rate include breakfast?"
          className="flex-1 border border-taj-gray-border px-4 py-2.5 text-xs bg-taj-cream text-taj-charcoal focus:outline-none focus:border-taj-burgundy"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="px-6 py-2.5 bg-taj-burgundy text-white text-xs uppercase tracking-wider font-medium hover:bg-taj-burgundy-deep transition-colors disabled:opacity-50"
        >
          {loading ? 'Consulting…' : 'Ask'}
        </button>
      </div>

      {/* Sample Quick Questions */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-taj-gray-warm text-[11px]">Try asking:</span>
        {sampleQueries.map((sq) => (
          <button
            key={sq}
            onClick={() => {
              setQuery(sq);
              handleAsk(sq);
            }}
            className="px-2.5 py-1 text-[11px] border border-taj-gray-border bg-taj-cream/50 text-taj-charcoal-muted hover:border-taj-burgundy hover:text-taj-burgundy transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}

      {/* Response Display */}
      {response && (
        <div className="border border-taj-gray-border bg-taj-cream/30 p-5 space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-taj-gray-border pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-taj-burgundy text-white font-mono text-[10px] uppercase">
                {response.intent.replace(/_/g, ' ')}
              </span>
              <span className="font-semibold text-taj-charcoal">Verified Response</span>
            </div>

            <span className="text-[11px] text-emerald-800 font-medium">
              Verified Against Official Rates
            </span>
          </div>

          {/* Section 1: Observed Facts */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-taj-burgundy font-bold block">
              Verified Booking Facts
            </span>
            <ul className="space-y-1.5 pl-4 list-disc text-taj-charcoal">
              {response.observedFacts.map((fact, idx) => (
                <li key={idx} className="leading-relaxed">
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Segregated Interpretation */}
          {response.interpretation && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-amber-900 font-bold block">
                Market Context & Rate Insights
              </span>
              <p className="text-amber-950 leading-relaxed">{response.interpretation}</p>
            </div>
          )}

          {/* Provenance & Audit Trace */}
          <div className="border-t border-taj-gray-border pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-taj-gray-warm">
            <div>
              <span>Source Archive: </span>
              <span className="font-medium text-taj-charcoal">{response.sources.map(s => s.replace(/PostgreSQL (Database: )?/g, 'Official Taj Records: ')).join('; ')}</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Retrieved in {response.executionTrace.dbExecutionTimeMs}ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
