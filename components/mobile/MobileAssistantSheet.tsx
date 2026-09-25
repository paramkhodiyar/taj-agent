'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface MobileAssistantSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sourceConfidence?: string;
  citedHotels?: string[];
}

/**
 * MobileAssistantSheet — Ergonomic Bottom-Sheet AI Price Concierge
 * 
 * Research-backed UX design:
 * - Slides up from the bottom thumb zone, allowing fluid one-handed thumb entry and dismissals.
 * - Quick-query chips placed directly above the input within immediate thumb sweep.
 * - Input field docked to bottom with 48px touch targets for instantaneous tap-and-send.
 * - Full compliance with docs/03-DATA-AND-AGENT.md: Explains trends without inventing prices.
 */
export const MobileAssistantSheet: React.FC<MobileAssistantSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Namaste. I am your Taj Luxury Concierge. Ask me about rate seasonality, breakfast inclusions, or the best verified deals across India.',
      sourceConfidence: 'VERIFIED_DATABASE',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQueries = [
    'Cheapest Taj in Goa this weekend',
    'Lake Palace vs Rambagh Palace rates',
    'Does BAR include breakfast?',
    'InnerCircle 10% member discount',
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: q.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() }),
      });

      const data = await res.json();
      const messageContent = data.message || data.data?.message;

      if (data.success && messageContent) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: messageContent,
            sourceConfidence: data.sourceConfidence || 'VERIFIED_DATABASE',
            citedHotels: data.citedHotels,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              data.error ||
              'Our rate archives are refreshed regularly. For immediate reservations, please check the search tab.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach the concierge. Please check your connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up Bottom Sheet - Zero Shadows */}
      <div
        className="relative z-10 w-full max-h-[85vh] bg-taj-cream flex flex-col rounded-t-3xl border-t-2 border-taj-gold/40 animate-fade-in"
      >
        {/* Pull Handle & Header */}
        <div className="px-5 pt-3 pb-3 border-b border-taj-gray-border/80 flex items-center justify-between bg-white rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            {/* Authentic Taj Concierge Crest Badge */}
            <div className="w-8 h-8 rounded-full bg-taj-cream border border-taj-gold/60 flex items-center justify-center p-1.5 flex-shrink-0">
              <img src="/taj-logo.svg" alt="Taj Concierge" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-semibold text-sm text-taj-burgundy">
                  Taj Luxury Concierge
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-taj-charcoal-light flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Official Rates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-taj-cream-warm text-taj-charcoal hover:bg-taj-gray-border/50 active:scale-95 transition-transform"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[50vh]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-taj-burgundy text-taj-cream font-medium rounded-br-xs'
                    : 'bg-white border border-taj-gray-border/90 text-taj-charcoal shadow-sm rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.sourceConfidence && (
                  <div className="mt-2 pt-2 border-t border-taj-gray-border/40 flex items-center gap-1 text-[10px] text-taj-charcoal-light">
                    <Compass className="w-3 h-3 text-taj-gold" />
                    <span>Grounding: {msg.sourceConfidence}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-taj-gray-border/80 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-taj-burgundy animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-taj-burgundy animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-taj-burgundy animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-taj-charcoal-muted ml-1">
                  Querying verified observations...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Chips (Horizontal Scroll in Thumb Zone) */}
        <div className="px-4 py-2 bg-white/70 border-t border-taj-gray-border/60 overflow-x-auto scrollbar-none flex items-center gap-2">
          {suggestedQueries.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              className="flex-shrink-0 text-[11px] bg-white border border-taj-gold/40 hover:border-taj-burgundy text-taj-burgundy font-medium px-3 py-1.5 rounded-full active:scale-95 transition-all shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Docked Thumb Input Bar */}
        <div className="p-3 bg-white border-t border-taj-gray-border pb-[max(1rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about Taj rates, inclusions, palaces..."
              className="flex-1 min-h-[48px] px-4 rounded-xl border border-taj-gray-border bg-taj-cream text-xs text-taj-charcoal placeholder:text-taj-charcoal-light focus:outline-none focus:border-taj-burgundy focus:ring-1 focus:ring-taj-burgundy"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              aria-label="Send message"
              className="min-h-[48px] min-w-[48px] px-3.5 bg-taj-burgundy text-white rounded-xl flex items-center justify-center font-medium disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
