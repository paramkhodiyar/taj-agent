import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const q = searchParams.get('q');

    const where: any = { isActive: true };

    if (city) {
      where.city = { contains: city.trim(), mode: 'insensitive' };
    }

    if (q) {
      where.OR = [
        { canonicalName: { contains: q.trim(), mode: 'insensitive' } },
        { city: { contains: q.trim(), mode: 'insensitive' } },
        { state: { contains: q.trim(), mode: 'insensitive' } },
      ];
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        assets: {
          select: {
            id: true,
            type: true,
            url: true,
            altText: true,
          },
        },
      },
      orderBy: { canonicalName: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list hotels' },
      { status: 500 }
    );
  }
}
