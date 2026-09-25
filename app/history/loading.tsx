import React from 'react';
import { TajPageLoader } from '@/components/layout/TajPageLoader';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HistoryLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1">
        <TajPageLoader
          title="Loading Observation Archives"
          subtitle="Querying historical searches and recorded price snapshots…"
          type="default"
        />
      </main>
      <Footer />
    </div>
  );
}
