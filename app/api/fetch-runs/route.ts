import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const runs = await prisma.fetchRun.findMany({
      orderBy: { requestedAt: 'desc' },
      take: limit,
      include: {
        fetchRunHotels: {
          include: {
            hotel: { select: { canonicalName: true, city: true } },
          },
          orderBy: { startedAt: 'asc' },
        },
        agentErrors: {
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: runs.length,
      data: runs.map((r) => {
        const durationSeconds =
          r.startedAt && r.completedAt
            ? Math.round((r.completedAt.getTime() - r.startedAt.getTime()) / 1000)
            : null;

        return {
          id: r.id,
          status: r.status,
          requestedAt: r.requestedAt.toISOString(),
          startedAt: r.startedAt?.toISOString() ?? null,
          completedAt: r.completedAt?.toISOString() ?? null,
          durationSeconds,
          agentVersion: r.agentVersion,
          extractorVersion: r.extractorVersion,
          requestedHotels: r.requestedHotels,
          successfulHotels: r.successfulHotels,
          failedHotels: r.failedHotels,
          searchParameters: r.searchParameters,
          hotels: r.fetchRunHotels.map((h) => ({
            hotelId: h.hotelId,
            canonicalName: h.hotel.canonicalName,
            city: h.hotel.city,
            status: h.status,
            roomsFound: h.roomsFound,
            ratesFound: h.ratesFound,
            validationPassed: h.validationPassed,
            validationMessage: h.validationMessage,
            error: h.error,
            startedAt: h.startedAt?.toISOString() ?? null,
            completedAt: h.completedAt?.toISOString() ?? null,
          })),
        };
      }),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list fetch runs' },
      { status: 500 }
    );
  }
}
