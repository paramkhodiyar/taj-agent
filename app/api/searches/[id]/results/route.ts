import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeFreshness } from '@/lib/freshness';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const mealFilter = searchParams.get('meal'); // Optional filter e.g. "breakfast"
    const cancellationFilter = searchParams.get('flexible'); // Optional filter e.g. "true"

    const search = await prisma.search.findUnique({
      where: { id },
    });

    if (!search) {
      return NextResponse.json({ success: false, error: 'Search not found' }, { status: 404 });
    }

    // Load canonical active hotels with their official assets
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      include: {
        assets: {
          orderBy: { type: 'asc' }, // 'hero' comes before 'gallery'
          take: 6,
        },
      },
      orderBy: { canonicalName: 'asc' },
    });

    // DB-First Query: For each hotel, find the most recent verified PriceSnapshot for these exact dates/occupancy
    const hotelResults = await Promise.all(
      hotels.map(async (hotel) => {
        const whereClause: any = {
          hotelId: hotel.id,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          adults: search.adults,
          availabilityStatus: 'AVAILABLE',
          verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
        };

        if (mealFilter === 'breakfast') {
          whereClause.mealPlan = { contains: 'breakfast', mode: 'insensitive' };
        }

        if (cancellationFilter === 'true') {
          whereClause.ratePlan = { isFlexible: true };
        }

        // Fetch cheapest room/rate among the latest observations
        const latestObservation = await prisma.priceSnapshot.findFirst({
          where: whereClause,
          orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
          include: {
            room: true,
            ratePlan: true,
          },
        });

        if (!latestObservation) {
          return {
            hotelId: hotel.id,
            canonicalName: hotel.canonicalName,
            slug: hotel.slug,
            city: hotel.city,
            state: hotel.state,
            starRating: hotel.starRating,
            heroImage: hotel.assets.find((a) => a.type === 'hero')?.url || hotel.assets[0]?.url || null,
            images: hotel.assets.map((a) => a.url),
            officialBookingUrl: hotel.officialBookingUrl,
            hasObservation: false,
            freshness: computeFreshness(null),
            cheapestOption: null,
          };
        }

        const freshness = computeFreshness(latestObservation.fetchedAt);

        // Also query 30D low for this hotel/room to render sparkline/indicator
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const lowAgg = await prisma.priceSnapshot.aggregate({
          where: {
            hotelId: hotel.id,
            roomId: latestObservation.roomId,
            ratePlanId: latestObservation.ratePlanId,
            fetchedAt: { gte: thirtyDaysAgo },
          },
          _min: { pricePerNight: true },
          _max: { pricePerNight: true },
        });

        const low30D = lowAgg._min.pricePerNight ? Number(lowAgg._min.pricePerNight) : null;
        const high30D = lowAgg._max.pricePerNight ? Number(lowAgg._max.pricePerNight) : null;
        const currentPrice = Number(latestObservation.pricePerNight);
        const isNearLow = low30D !== null && currentPrice <= low30D * 1.05;

        return {
          hotelId: hotel.id,
          canonicalName: hotel.canonicalName,
          slug: hotel.slug,
          city: hotel.city,
          state: hotel.state,
          starRating: hotel.starRating,
          heroImage: hotel.assets.find((a) => a.type === 'hero')?.url || hotel.assets[0]?.url || null,
          images: hotel.assets.map((a) => a.url),
          officialBookingUrl: hotel.officialBookingUrl,
          hasObservation: true,
          freshness,
          cheapestOption: {
            snapshotId: latestObservation.id,
            pricePerNight: currentPrice,
            totalPrice: latestObservation.totalPrice ? Number(latestObservation.totalPrice) : null,
            basePrice: latestObservation.basePrice ? Number(latestObservation.basePrice) : null,
            taxAmount: latestObservation.taxAmount ? Number(latestObservation.taxAmount) : null,
            currency: latestObservation.currency,
            room: latestObservation.room.canonicalRoomName,
            sourceRoomName: latestObservation.room.sourceRoomName,
            ratePlan: latestObservation.ratePlan.canonicalRateName,
            mealPlan: latestObservation.mealPlan || latestObservation.ratePlan.mealPlan,
            cancellationPolicy: latestObservation.cancellationPolicy || latestObservation.ratePlan.cancellationPolicy,
            isFlexible: latestObservation.ratePlan.isFlexible,
            verificationState: latestObservation.verificationState,
            source: latestObservation.source,
            fetchedAt: latestObservation.fetchedAt.toISOString(),
            low30D,
            high30D,
            isNearLow,
          },
        };
      })
    );

    // Filter available hotels and sort by price ascending
    const available = hotelResults
      .filter((h) => h.hasObservation && h.cheapestOption !== null)
      .sort((a, b) => (a.cheapestOption!.pricePerNight) - (b.cheapestOption!.pricePerNight));

    const pending = hotelResults.filter((h) => !h.hasObservation);

    const cheapestAvailable = available.length > 0 ? available[0] : null;

    return NextResponse.json({
      success: true,
      search: {
        id: search.id,
        checkIn: search.checkIn.toISOString().split('T')[0],
        checkOut: search.checkOut.toISOString().split('T')[0],
        adults: search.adults,
        children: search.children,
        rooms: search.rooms,
      },
      summary: {
        totalPropertiesMonitored: hotels.length,
        propertiesWithVerifiedData: available.length,
        pendingProperties: pending.length,
      },
      cheapestAvailable,
      results: available,
      unverifiedHotels: pending.map((h) => ({
        hotelId: h.hotelId,
        canonicalName: h.canonicalName,
        slug: h.slug,
        city: h.city,
        state: h.state,
        heroImage: h.heroImage,
        status: 'No observation recorded yet for these dates',
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get search results' },
      { status: 500 }
    );
  }
}
