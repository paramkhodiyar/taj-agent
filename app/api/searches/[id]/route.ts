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
      include: {
        fetchRuns: {
          orderBy: { requestedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!search) {
      return NextResponse.json({ success: false, error: 'Search not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: search.id,
        checkIn: search.checkIn.toISOString().split('T')[0],
        checkOut: search.checkOut.toISOString().split('T')[0],
        adults: search.adults,
        children: search.children,
        rooms: search.rooms,
        createdAt: search.createdAt.toISOString(),
        recentFetchRuns: search.fetchRuns,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch search' },
      { status: 500 }
    );
  }
}
