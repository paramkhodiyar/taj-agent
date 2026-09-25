import React from 'react';
import { TajPageLoader } from '@/components/layout/TajPageLoader';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HotelLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1">
        <TajPageLoader
          title="Loading Verified Property Intelligence"
          subtitle="Gathering authoritative room inventories, rate plans, and 30-day historical medians…"
          type="hotel"
        />
      </main>
      <Footer />
    </div>
  );
}
