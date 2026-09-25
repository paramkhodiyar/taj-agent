import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSearchInput } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const tracked = await prisma.trackedSearch.findMany({
      where: { isActive: true },
      include: {
        hotel: { select: { canonicalName: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: tracked.length,
      data: tracked.map((t) => ({
        id: t.id,
        hotelId: t.hotelId,
        hotelName: t.hotel?.canonicalName ?? 'All Taj Properties',
        city: t.hotel?.city ?? 'All India',
        checkIn: t.checkIn.toISOString().split('T')[0],
        checkOut: t.checkOut.toISOString().split('T')[0],
        adults: t.adults,
        children: t.children,
        rooms: t.rooms,
        targetPriceThreshold: t.targetPriceThreshold ? Number(t.targetPriceThreshold) : null,
        notifyEmail: t.notifyEmail,
        notifyPhone: t.notifyPhone,
        isActive: t.isActive,
        lastCheckedAt: t.lastCheckedAt?.toISOString() ?? null,
        lastNotifiedAt: t.lastNotifiedAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list tracked searches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = validateSearchInput(body);

    if (validation.error || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid tracked search input' },
        { status: 400 }
      );
    }

    const { checkIn, checkOut, adults, children, rooms, hotelId } = validation.data;
    const { targetPriceThreshold, notifyEmail, notifyPhone } = body;

    const tracked = await prisma.trackedSearch.create({
      data: {
        hotelId: hotelId ?? null,
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
        targetPriceThreshold: targetPriceThreshold ? parseFloat(targetPriceThreshold) : null,
        notifyEmail: notifyEmail ? String(notifyEmail).trim() : null,
        notifyPhone: notifyPhone ? String(notifyPhone).trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: tracked,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create tracked search' },
      { status: 500 }
    );
  }
}
