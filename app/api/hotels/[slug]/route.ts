import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Hotel slug or ID is required' }, { status: 400 });
    }

    const hotel = await prisma.hotel.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        assets: true,
        rooms: {
          orderBy: { canonicalRoomName: 'asc' },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hotel details' },
      { status: 500 }
    );
  }
}
