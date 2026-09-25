'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Taj Global Root Error Boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbf9f5] text-[#1f1d1d] flex flex-col items-center justify-center p-6 selection:bg-[#4a1521] selection:text-white font-sans">
        <main className="max-w-lg w-full bg-white border-2 border-[#b88e2e]/40 rounded-2xl p-8 text-center space-y-6">
          {/* Official Taj Crest */}
          <div className="w-16 h-16 rounded-full bg-[#fbf9f5] border border-[#b88e2e]/40 flex items-center justify-center mx-auto">
            <img
              src="/taj-logo.svg"
              alt="Taj Official Crest"
              className="w-10 h-10 object-contain"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#96721e] block">
              Core Runtime Recovery
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a1521]">
              System Interruption
            </h1>
            <p className="text-xs text-[#57524e] leading-relaxed">
              A root-level exception was encountered. Historical rate data and cached search records remain intact and secure.
            </p>
          </div>

          {error.digest && (
            <div className="p-2.5 bg-[#fbf9f5] border border-[#e2ddd8] rounded-xl text-[10px] font-mono text-[#78716c]">
              Digest: {error.digest}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 bg-[#4a1521] hover:bg-[#360e17] text-white text-xs font-serif font-medium uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              Reload Application
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-[#fbf9f5] hover:bg-[#f5efe6] text-[#4a1521] border border-[#e2ddd8] text-xs font-serif font-medium uppercase tracking-wider rounded-xl active:scale-95 transition-all"
            >
              Return Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
