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

    const message =
      response.interpretation ||
      response.observedFacts.join('\n\n') ||
      'I have reviewed our verified hotel records for your request.';

    return NextResponse.json({
      success: true,
      message,
      sourceConfidence: response.sources.length > 0 ? 'VERIFIED_DATABASE' : 'OFFICIAL_CATALOG',
      citedHotels: response.structuredData?.hotelName ? [response.structuredData.hotelName] : undefined,
      data: {
        ...response,
        message,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Assistant routing failed' },
      { status: 500 }
    );
  }
}
