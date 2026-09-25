import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-taj-gray-border mt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-taj-gray-warm">
          <div className="space-y-3">
            <p className="font-serif font-semibold uppercase tracking-wider text-taj-burgundy text-sm">
              Historical Integrity Principle
            </p>
            <p className="leading-relaxed">
              Every displayed rate is traceable to a timestamped, verified reservation record
              from official Taj booking systems. Official records are our sole source of truth; conversational
              intelligence serves strictly to assist and explain — never to fabricate or guess prices.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-serif font-semibold uppercase tracking-wider text-taj-burgundy text-sm">
              Observability & Verification
            </p>
            <p className="leading-relaxed">
              Freshness is always stated explicitly in plain language. If a rate inquiry encounters a temporary
              network delay, prior verified historical rates remain intact and status is transparently reported.
            </p>
            <Link
              href="/fetch-runs"
              className="inline-block text-taj-gold-muted font-medium hover:underline pt-1"
            >
              View Verification Records →
            </Link>
          </div>

          <div className="space-y-3">
            <p className="font-serif font-semibold uppercase tracking-wider text-taj-burgundy text-sm">
              Portfolio Coverage
            </p>
            <p className="leading-relaxed">
              Monitoring 31 canonical palaces, safari lodges, and luxury city hotels across India.
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px]">
              <Link href="/admin/data-health" className="hover:text-taj-burgundy">
                Operator Data Health
              </Link>
              <span>·</span>
              <span>IST (UTC+5:30)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-taj-gray-border pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-taj-gray-warm gap-2 text-center sm:text-left">
          <div>
            <p>© {new Date().getFullYear()} Taj Price Intelligence. Private Family Intelligence Application.</p>
            <p className="text-[10px] text-taj-charcoal-muted mt-0.5">
              Engineered with stubborn precision by <strong className="text-taj-burgundy font-semibold">Param Khodiyar</strong> — who apparently refuses to let anyone overpay for a royal suite.
            </p>
          </div>
          <p className="text-[10px] text-taj-gold-muted font-medium">Restrained luxury · Zero shadows · 100% Verified provenance</p>
        </div>
      </div>
    </footer>
  );
};
