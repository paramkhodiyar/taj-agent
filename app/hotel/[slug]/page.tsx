import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PriceDisplay } from '@/components/pricing/PriceDisplay';
import { FreshnessBadge } from '@/components/pricing/FreshnessBadge';
import { RoomRateTable } from '@/components/pricing/RoomRateTable';
import { PriceStats } from '@/components/pricing/PriceStats';
import { PriceHistoryChart, SnapshotHistoryPoint } from '@/components/pricing/PriceHistoryChart';
import { computeFreshness } from '@/lib/freshness';
import { MobileStickyActionBar } from '@/components/mobile/MobileStickyActionBar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ searchId?: string }>;
}) {
  const { slug } = await params;
  const { searchId } = await searchParams;

  const hotel = await prisma.hotel.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      assets: true,
      rooms: true,
    },
  });

  if (!hotel) {
    notFound();
  }

  // Load search context if provided
  let searchRecord = null;
  if (searchId) {
    searchRecord = await prisma.search.findUnique({ where: { id: searchId } });
  }

  // Fetch the latest verified price snapshots for this hotel
  const whereSnapshots: any = { hotelId: hotel.id };
  if (searchRecord) {
    whereSnapshots.checkIn = searchRecord.checkIn;
    whereSnapshots.checkOut = searchRecord.checkOut;
  }

  const latestSnapshots = await prisma.priceSnapshot.findMany({
    where: whereSnapshots,
    include: {
      room: true,
      ratePlan: true,
    },
    orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
    take: 20,
  });

  // Fetch full 30-day historical snapshot sequence for chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const historySnapshots = await prisma.priceSnapshot.findMany({
    where: {
      hotelId: hotel.id,
      fetchedAt: { gte: thirtyDaysAgo },
      verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED', 'ANOMALOUS'] },
    },
    include: {
      room: true,
      ratePlan: true,
    },
    orderBy: { fetchedAt: 'asc' },
    take: 100,
  });

  // Check latest fetch run execution status for graceful degradation copy
  const latestFetchRunHotel = await prisma.fetchRunHotel.findFirst({
    where: { hotelId: hotel.id },
    orderBy: { startedAt: 'desc' },
  });
  const latestRefreshFailed = latestFetchRunHotel?.status === 'FAILED';

  // Calculate Authoritative Historical Statistics
  const validPrices = historySnapshots
    .map((s) => Number(s.pricePerNight))
    .filter((p) => p > 0);

  let stats = null;
  if (validPrices.length > 0) {
    const sorted = [...validPrices].sort((a, b) => a - b);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    const sum = sorted.reduce((acc, p) => acc + p, 0);
    const mean = Math.round(sum / sorted.length);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    const current = Number(latestSnapshots[0]?.pricePerNight ?? sorted[sorted.length - 1]);

    const diffFromMedian = current - median;
    const pctFromMedian = Math.round((diffFromMedian / median) * 100);

    stats = {
      observationCount: historySnapshots.length,
      daysWindow: 30,
      current,
      low,
      high,
      mean,
      median,
      pctFromMedian,
      positionLabel:
        diffFromMedian < 0
          ? `${Math.abs(pctFromMedian)}% below 30-day median`
          : diffFromMedian > 0
          ? `${pctFromMedian}% above 30-day median`
          : 'Matching 30-day median',
    };
  }

  const leadSnapshot = latestSnapshots[0] || null;
  const heroImage = hotel.assets.find((a) => a.type === 'hero')?.url || hotel.assets[0]?.url;
  const freshness = computeFreshness(leadSnapshot?.fetchedAt ?? null);

  // Map to RoomRateTable items
  const matrixItems = latestSnapshots.map((s) => ({
    id: s.id,
    room: s.room.canonicalRoomName,
    sourceRoomName: s.room.sourceRoomName,
    ratePlan: s.ratePlan.canonicalRateName,
    mealPlan: s.mealPlan || s.ratePlan.mealPlan,
    cancellationPolicy: s.cancellationPolicy || s.ratePlan.cancellationPolicy,
    isFlexible: s.ratePlan.isFlexible,
    pricePerNight: Number(s.pricePerNight),
    totalPrice: s.totalPrice ? Number(s.totalPrice) : null,
    availabilityStatus: s.availabilityStatus,
    verificationState: s.verificationState,
    fetchedAt: s.fetchedAt.toISOString(),
  }));

  // Map to Chart points
  const chartPoints: SnapshotHistoryPoint[] = historySnapshots.map((s) => ({
    id: s.id,
    fetchedAt: s.fetchedAt.toISOString(),
    pricePerNight: Number(s.pricePerNight),
    basePrice: s.basePrice ? Number(s.basePrice) : null,
    taxAmount: s.taxAmount ? Number(s.taxAmount) : null,
    totalPrice: s.totalPrice ? Number(s.totalPrice) : null,
    currency: s.currency,
    checkIn: s.checkIn.toISOString().split('T')[0],
    checkOut: s.checkOut.toISOString().split('T')[0],
    adults: s.adults,
    children: s.children,
    rooms: s.rooms,
    room: s.room.canonicalRoomName,
    sourceRoomName: s.room.sourceRoomName,
    ratePlan: s.ratePlan.canonicalRateName,
    mealPlan: s.mealPlan || s.ratePlan.mealPlan,
    cancellationPolicy: s.cancellationPolicy || s.ratePlan.cancellationPolicy,
    availabilityStatus: s.availabilityStatus,
    verificationState: s.verificationState,
    source: s.source,
    fetchRunId: s.fetchRunId,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-taj-cream text-taj-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-taj-charcoal-muted">
          <Link href="/" className="hover:text-taj-burgundy">Search</Link>
          <span>/</span>
          {searchId ? (
            <>
              <Link href={`/results?searchId=${searchId}`} className="hover:text-taj-burgundy">
                Results
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-taj-burgundy font-medium">{hotel.canonicalName}</span>
        </div>

        {/* Graceful Degradation Notice per 01-PRODUCT-AND-UI.md §7 & §8.10 */}
        {latestRefreshFailed && leadSnapshot && (
          <div className="p-4 bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
            <span className="font-semibold block">⚠️ Refresh Notice:</span>
            <p>
              We couldn&apos;t reach Taj&apos;s booking system for this property during the most recent refresh attempt.
              Your last verified price from {freshness.label.toLowerCase()} is retained with 100% fidelity and shown below.
            </p>
          </div>
        )}

        {/* Section 1: Hero per 01-PRODUCT-AND-UI.md §5.3 */}
        <section className="border border-taj-gray-border bg-white overflow-hidden">
          <div className="aspect-[21/9] w-full bg-taj-cream relative overflow-hidden border-b border-taj-gray-border">
            {heroImage ? (
              <img
                src={heroImage}
                alt={hotel.canonicalName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-taj-gray-warm">
                Taj Official Photography
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-taj-gold-muted font-medium">
                {hotel.city}, {hotel.state} · Official Taj Property
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif text-taj-burgundy">
                {hotel.canonicalName}
              </h1>
              <p className="text-xs text-taj-charcoal-light max-w-2xl leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <div className="space-y-3 md:text-right shrink-0">
              <FreshnessBadge freshness={freshness} />
              <div>
                <span className="text-[11px] uppercase tracking-wider text-taj-gray-warm block">
                  Lead Verified Nightly Rate
                </span>
                <PriceDisplay amount={leadSnapshot ? Number(leadSnapshot.pricePerNight) : null} size="xl" />
              </div>
              {hotel.officialBookingUrl && (
                <div className="pt-1">
                  <a
                    href={hotel.officialBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-taj-burgundy text-white hover:bg-taj-burgundy-deep text-xs uppercase tracking-wider font-medium transition-colors"
                  >
                    <span>Book on Official Taj Website</span>
                    <span className="text-sm">↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Room/Rate Matrix */}
        <section className="space-y-4">
          <RoomRateTable items={matrixItems} />
        </section>

        {/* Section 3: Price History Chart */}
        <section className="space-y-4">
          <PriceHistoryChart
            snapshots={chartPoints}
            low30D={stats?.low}
            high30D={stats?.high}
            median30D={stats?.median}
            officialBookingUrl={hotel.officialBookingUrl}
            hotelName={hotel.canonicalName}
          />
        </section>

        {/* Section 4: Authoritative Historical Stats */}
        <section className="space-y-4">
          <PriceStats stats={stats} />
        </section>

        {/* Section 5: Hotel Information & Location */}
        <section className="border border-taj-gray-border bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-taj-gray-border pb-4">
            <h3 className="text-xl font-serif text-taj-burgundy">
              Hotel Information & Booking Provenance
            </h3>
            <p className="text-xs text-taj-charcoal-muted mt-0.5">
              Verified official property details and reservation access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-taj-charcoal block">Location & Address</span>
              <p className="text-taj-charcoal-muted leading-relaxed">{hotel.address || `${hotel.city}, ${hotel.state}`}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-taj-charcoal block">Property Classification</span>
              <p className="text-taj-charcoal-muted">{hotel.starRating ? `${hotel.starRating}-Star Luxury Hotel` : 'Luxury Property'}</p>
              <p className="text-taj-gray-warm">Brand: {hotel.brand}</p>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-taj-charcoal block">Official Booking Link</span>
              {hotel.officialBookingUrl ? (
                <a
                  href={hotel.officialBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs uppercase tracking-wider text-taj-gold-muted hover:underline font-medium"
                >
                  Visit Taj Official Website ↗
                </a>
              ) : (
                <span className="text-taj-gray-warm">Official Portal</span>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Sticky Thumb-Zone Action Bar */}
        {leadSnapshot && (
          <MobileStickyActionBar
            hotelName={hotel.canonicalName}
            pricePerNight={Number(leadSnapshot.pricePerNight)}
            isPlusTaxes={!leadSnapshot.taxAmount || Number(leadSnapshot.taxAmount) === 0}
            bookingUrl={hotel.officialBookingUrl || `https://www.tajhotels.com/en-in/hotels/${hotel.slug}/`}
            breakfastIncluded={
              leadSnapshot.mealPlan?.toLowerCase().includes('breakfast') ||
              leadSnapshot.ratePlan?.canonicalRateName.toLowerCase().includes('breakfast') ||
              leadSnapshot.ratePlan?.canonicalRateName.toLowerCase().includes('bed and breakfast') ||
              leadSnapshot.ratePlan?.canonicalRateName.toLowerCase().includes('map')
            }
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
