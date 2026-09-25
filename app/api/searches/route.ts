import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSearchInput } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = validateSearchInput(body);

    if (validation.error || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid search input' },
        { status: 400 }
      );
    }

    const { checkIn, checkOut, adults, children, rooms } = validation.data;

    // Create search entity in database
    const search = await prisma.search.create({
      data: {
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: search.id,
          checkIn: search.checkIn.toISOString().split('T')[0],
          checkOut: search.checkOut.toISOString().split('T')[0],
          adults: search.adults,
          children: search.children,
          rooms: search.rooms,
          createdAt: search.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create search' },
      { status: 500 }
    );
  }
}
