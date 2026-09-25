import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hotel = await prisma.hotel.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, canonicalName: true },
    });

    if (!hotel) {
      return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
    }

    const rooms = await prisma.room.findMany({
      where: { hotelId: hotel.id },
      orderBy: { canonicalRoomName: 'asc' },
    });

    return NextResponse.json({
      success: true,
      hotelId: hotel.id,
      hotelName: hotel.canonicalName,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
