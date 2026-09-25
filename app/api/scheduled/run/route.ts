import { NextRequest, NextResponse } from 'next/server';
import { runScheduledCollector } from '@/workers/scheduledCollector';

export async function POST(req: NextRequest) {
  try {
    const result = await runScheduledCollector();
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Scheduled collection failed' },
      { status: 500 }
    );
  }
}
