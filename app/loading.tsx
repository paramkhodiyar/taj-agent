import React from 'react';
import { TajPageLoader } from '@/components/layout/TajPageLoader';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <TajPageLoader
          title="Connecting to Taj Price Intelligence"
          subtitle="Verifying official rates and current availability…"
          type="default"
        />
      </main>
      <Footer />
    </div>
  );
}
