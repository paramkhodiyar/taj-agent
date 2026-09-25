import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tracked = await prisma.trackedSearch.findUnique({ where: { id } });

    if (!tracked) {
      return NextResponse.json({ success: false, error: 'Tracked search not found' }, { status: 404 });
    }

    await prisma.trackedSearch.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Tracked search removed successfully',
      id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete tracked search' },
      { status: 500 }
    );
  }
}
