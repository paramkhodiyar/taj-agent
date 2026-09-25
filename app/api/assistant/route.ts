import { NextRequest, NextResponse } from 'next/server';
import { routeUserQuery } from '@/agent/intentRouter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query ? String(body.query).trim() : '';

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await routeUserQuery(query);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Assistant routing failed' },
      { status: 500 }
    );
  }
}
