import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchForm } from '@/components/search/SearchForm';

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <SearchForm />
      </main>
      <Footer />
    </div>
  );
}
