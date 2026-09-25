import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { runAgentOrchestrator } from '@/agent/agentOrchestrator';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate limiting per 04-API-AND-SECURITY.md §3:
    // Rate-limit fetch-triggering endpoints specifically (5 requests per minute)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimitKey = `fetch:${ip}:${id}`;
    const limit = checkRateLimit(rateLimitKey, { windowMs: 60000, maxRequests: 5 });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Too many price fetch requests. Please wait before refreshing again.',
          resetMs: limit.resetMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(limit.resetMs / 1000)),
          },
        }
      );
    }

    const search = await prisma.search.findUnique({
      where: { id },
    });

    if (!search) {
      return NextResponse.json({ success: false, error: 'Search not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const targetHotelId = body.hotelId ? String(body.hotelId) : undefined;

    // Trigger deterministic Agent Orchestrator
    const result = await runAgentOrchestrator(
      {
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        adults: search.adults,
        children: search.children,
        rooms: search.rooms,
        hotelId: targetHotelId,
      },
      {
        searchId: search.id,
      }
    );

    return NextResponse.json({
      success: true,
      fetchRunId: result.fetchRunId,
      status: result.status,
      requestedHotels: result.requestedHotels,
      successfulHotels: result.successfulHotels,
      failedHotels: result.failedHotels,
      totalSnapshotsPersisted: result.totalSnapshotsPersisted,
      hotelOutcomes: result.hotelOutcomes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to trigger agent fetch' },
      { status: 500 }
    );
  }
}
