import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fetchRun = await prisma.fetchRun.findUnique({
      where: { id },
      include: {
        fetchRunHotels: {
          include: {
            hotel: { select: { canonicalName: true, city: true } },
          },
          orderBy: { startedAt: 'asc' },
        },
        agentEvents: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        agentErrors: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });

    if (!fetchRun) {
      return NextResponse.json({ success: false, error: 'Fetch run not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fetchRun.id,
        status: fetchRun.status,
        requestedAt: fetchRun.requestedAt.toISOString(),
        startedAt: fetchRun.startedAt?.toISOString() ?? null,
        completedAt: fetchRun.completedAt?.toISOString() ?? null,
        agentVersion: fetchRun.agentVersion,
        extractorVersion: fetchRun.extractorVersion,
        requestedHotels: fetchRun.requestedHotels,
        successfulHotels: fetchRun.successfulHotels,
        failedHotels: fetchRun.failedHotels,
        searchParameters: fetchRun.searchParameters,
        hotels: fetchRun.fetchRunHotels.map((h) => ({
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
        events: fetchRun.agentEvents.map((e) => ({
          eventType: e.eventType,
          severity: e.severity,
          message: e.message,
          timestamp: e.timestamp.toISOString(),
        })),
        errors: fetchRun.agentErrors.map((err) => ({
          errorCode: err.errorCode,
          message: err.message,
          timestamp: err.timestamp.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch run details' },
      { status: 500 }
    );
  }
}
