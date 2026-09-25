import React from 'react';
import { TajPageLoader } from '@/components/layout/TajPageLoader';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ResultsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1">
        <TajPageLoader
          title="Aggregating Taj Verified Rates"
          subtitle="Loading authoritative observations across Indian luxury properties…"
          type="results"
        />
      </main>
      <Footer />
    </div>
  );
}
