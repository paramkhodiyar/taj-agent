import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authenticate operator per 04-API-AND-SECURITY.md §3
    const adminKey = req.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Operator credentials required for admin routes' },
        { status: 401 }
      );
    }

    const [
      totalHotels,
      activeHotels,
      totalSnapshots,
      recentSnapshots,
      fetchRunsCount,
      failedRunsCount,
      recentErrors,
    ] = await Promise.all([
      prisma.hotel.count(),
      prisma.hotel.count({ where: { isActive: true } }),
      prisma.priceSnapshot.count(),
      prisma.priceSnapshot.count({
        where: {
          fetchedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.fetchRun.count(),
      prisma.fetchRun.count({ where: { status: 'FAILED' } }),
      prisma.agentError.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: {
          hotel: { select: { canonicalName: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        status: failedRunsCount === 0 ? 'HEALTHY' : 'DEGRADED',
        totalHotels,
        activeHotels,
        totalHistoricalSnapshots: totalSnapshots,
        snapshotsLast24Hours: recentSnapshots,
        totalFetchRuns: fetchRunsCount,
        failedFetchRuns: failedRunsCount,
      },
      recentErrors: recentErrors.map((e) => ({
        id: e.id,
        hotel: e.hotel?.canonicalName ?? 'All',
        errorCode: e.errorCode,
        message: e.message,
        timestamp: e.timestamp.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal health check error' },
      { status: 500 }
    );
  }
}
