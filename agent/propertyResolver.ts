import { prisma } from '@/lib/prisma';
import { ResolvedProperty } from './types';

/**
 * Property Resolver Subsystem (docs/03-DATA-AND-AGENT.md §3.1 & docs/04-API-AND-SECURITY.md §2)
 * Maps ambiguous hotel names, user inputs, or slugs to canonical Taj property records.
 */
export async function resolve_property(
  identifier?: string | { hotelName?: string; hotelId?: string; slug?: string; city?: string }
): Promise<ResolvedProperty[]> {
  // If no identifier, return all active canonical properties
  if (!identifier) {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      orderBy: { canonicalName: 'asc' },
    });
    return hotels.map(toResolved);
  }

  if (typeof identifier === 'string') {
    const trimmed = identifier.trim().toLowerCase();
    // Direct ID match
    const byId = await prisma.hotel.findUnique({ where: { id: trimmed } });
    if (byId) return [toResolved(byId)];

    // Direct slug match
    const bySlug = await prisma.hotel.findUnique({ where: { slug: trimmed } });
    if (bySlug) return [toResolved(bySlug)];

    // Fuzzy / ILIKE name or city match
    const matches = await prisma.hotel.findMany({
      where: {
        isActive: true,
        OR: [
          { canonicalName: { contains: trimmed, mode: 'insensitive' } },
          { city: { contains: trimmed, mode: 'insensitive' } },
          { slug: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
    });

    if (matches.length > 0) return matches.map(toResolved);

    // Fallback: strip common prefixes like "the", "hotel", "taj"
    const cleaned = trimmed.replace(/\b(the|taj|hotel|resort|spa|palace)\b/gi, '').trim();
    if (cleaned.length > 2) {
      const fallbackMatches = await prisma.hotel.findMany({
        where: {
          isActive: true,
          OR: [
            { canonicalName: { contains: cleaned, mode: 'insensitive' } },
            { city: { contains: cleaned, mode: 'insensitive' } },
          ],
        },
      });
      if (fallbackMatches.length > 0) return fallbackMatches.map(toResolved);
    }

    return [];
  }

  // Object identifier
  if (identifier.hotelId) {
    const hotel = await prisma.hotel.findUnique({ where: { id: identifier.hotelId } });
    return hotel ? [toResolved(hotel)] : [];
  }

  if (identifier.slug) {
    const hotel = await prisma.hotel.findUnique({ where: { slug: identifier.slug } });
    return hotel ? [toResolved(hotel)] : [];
  }

  if (identifier.hotelName) {
    return resolve_property(identifier.hotelName);
  }

  if (identifier.city) {
    const hotels = await prisma.hotel.findMany({
      where: {
        isActive: true,
        city: { contains: identifier.city, mode: 'insensitive' },
      },
    });
    return hotels.map(toResolved);
  }

  return [];
}

function toResolved(hotel: {
  id: string;
  canonicalName: string;
  slug: string;
  city: string;
  state: string;
  officialBookingUrl: string | null;
}): ResolvedProperty {
  return {
    hotelId: hotel.id,
    canonicalName: hotel.canonicalName,
    slug: hotel.slug,
    city: hotel.city,
    state: hotel.state,
    officialBookingUrl: hotel.officialBookingUrl,
    source: 'taj_official',
  };
}
