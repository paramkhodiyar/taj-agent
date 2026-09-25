import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const search = await prisma.search.findUnique({
      where: { id },
    });

    if (!search) {
      return NextResponse.json({ success: false, error: 'Search not found' }, { status: 404 });
    }

    const snapshots = await prisma.priceSnapshot.findMany({
      where: {
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        adults: search.adults,
      },
      include: {
        hotel: { select: { canonicalName: true, city: true } },
        room: { select: { canonicalRoomName: true } },
        ratePlan: { select: { canonicalRateName: true } },
      },
      orderBy: { fetchedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      searchId: id,
      count: snapshots.length,
      data: snapshots.map((s) => ({
        id: s.id,
        hotelId: s.hotelId,
        hotelName: s.hotel.canonicalName,
        city: s.hotel.city,
        room: s.room.canonicalRoomName,
        ratePlan: s.ratePlan.canonicalRateName,
        pricePerNight: Number(s.pricePerNight),
        totalPrice: s.totalPrice ? Number(s.totalPrice) : null,
        currency: s.currency,
        verificationState: s.verificationState,
        fetchedAt: s.fetchedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}
