import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Backfill endpoint - fake and seeded generation has been completely removed.
 * All rates must come from authentic extractions only.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return NextResponse.json({
    success: true,
    totalSnapshotsPersisted: 0,
    message: 'Mock and seeded backfill has been disabled. Only authentic live rates are recorded.',
  });
}
