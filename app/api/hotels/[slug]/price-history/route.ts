import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const ratePlanId = searchParams.get('ratePlanId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const days = parseInt(searchParams.get('days') || '30', 10);

    const hotel = await prisma.hotel.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, canonicalName: true, city: true },
    });

    if (!hotel) {
      return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const where: any = {
      hotelId: hotel.id,
      fetchedAt: { gte: cutoff },
    };

    if (roomId) where.roomId = roomId;
    if (ratePlanId) where.ratePlanId = ratePlanId;
    if (checkIn) where.checkIn = new Date(checkIn);
    if (checkOut) where.checkOut = new Date(checkOut);

    const snapshots = await prisma.priceSnapshot.findMany({
      where,
      include: {
        room: { select: { canonicalRoomName: true, sourceRoomName: true } },
        ratePlan: { select: { canonicalRateName: true, mealPlan: true, cancellationPolicy: true } },
      },
      orderBy: { fetchedAt: 'desc' },
    });

    // Authoritative statistical calculations via array aggregation
    const prices = snapshots
      .map((s) => Number(s.pricePerNight))
      .filter((p) => p > 0);

    let stats = null;
    if (prices.length > 0) {
      const sorted = [...prices].sort((a, b) => a - b);
      const low = sorted[0];
      const high = sorted[sorted.length - 1];
      const sum = sorted.reduce((acc, p) => acc + p, 0);
      const mean = Math.round(sum / sorted.length);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
      const current = Number(snapshots[0].pricePerNight);

      // Position relative to median
      const diffFromMedian = current - median;
      const pctFromMedian = Math.round((diffFromMedian / median) * 100);

      stats = {
        observationCount: snapshots.length,
        daysWindow: days,
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

    return NextResponse.json({
      success: true,
      hotelId: hotel.id,
      hotelName: hotel.canonicalName,
      stats,
      snapshots: snapshots.map((s) => ({
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
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
