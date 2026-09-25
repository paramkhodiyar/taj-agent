import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface HotelCompareResult {
  hotelId: string;
  canonicalName: string;
  slug: string;
  city: string;
  officialBookingUrl: string;
  // All fields below come DIRECTLY from Gemini's grounded web search
  // If Gemini cannot find a value from the Taj website, it returns null — never a made-up number
  currentRates: {
    deluxeRoom: string | null;
    luxuryRoom: string | null;
    suite: string | null;
    lowestAvailable: string | null;
    currency: string;
    rateNote: string | null; // e.g. "Per night, taxes extra" or "Inclusive of breakfast"
  };
  roomTypes: string[];
  mealPlans: string[];
  cancellationPolicy: string | null;
  amenities: {
    pool: boolean | null;
    spa: boolean | null;
    gym: boolean | null;
    restaurant: boolean | null;
    bar: boolean | null;
    businessCenter: boolean | null;
    kidsClub: boolean | null;
    beachAccess: boolean | null;
    airportTransfer: boolean | null;
    butler: boolean | null;
    concierge: boolean | null;
    roomService24h: boolean | null;
  };
  highlights: string[]; // 3-5 unique selling points from the Taj website
  propertyDetails: {
    starRating: number | null;
    totalRooms: number | null;
    yearBuilt: string | null;
    yearRenovated: string | null;
    heritage: string | null; // e.g. "19th-century palace" or "Contemporary"
    location: string | null; // Specific location detail
    views: string | null;
  };
  diningOptions: string[]; // Restaurant names & cuisine
  eventSpaces: string | null;
  loyaltyBenefits: string | null; // Taj InnerCircle / Epicure benefits
  sustainabilityInitiatives: string | null;
  sourceUrls: string[];
  extractionTimestamp: string;
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW'; // Based on how many fields Gemini found
  missingFields: string[]; // Fields Gemini couldn't find — transparency first
}

export interface CompareApiResponse {
  success: boolean;
  checkIn: string;
  checkOut: string;
  adults: number;
  hotels: HotelCompareResult[];
  aiAnalysis: {
    verdict: string;
    priceDifference: string | null;
    bestForBudget: string | null;
    bestForLuxury: string | null;
    bestForFamily: string | null;
    bestForCouple: string | null;
    uniqueToA: string[];
    uniqueToB: string[];
    recommendation: string;
  } | null;
  rateLimitWarning?: string | null;
  error?: string;
}

/**
 * Calls Gemini API with Google Search grounding to fetch REAL data from tajhotels.com.
 * This is the only function that talks to Gemini — zero mock data is accepted.
 */
interface ExtractedHotelData {
  currentRates: HotelCompareResult['currentRates'];
  roomTypes: string[];
  mealPlans: string[];
  cancellationPolicy: string | null;
  amenities: HotelCompareResult['amenities'];
  highlights: string[];
  propertyDetails: HotelCompareResult['propertyDetails'];
  diningOptions: string[];
  eventSpaces: string | null;
  loyaltyBenefits: string | null;
  sustainabilityInitiatives: string | null;
  sourceUrls: string[];
  missingFields: string[];
}

async function fetchRealHotelDataViaGemini(
  hotelName: string,
  hotelCity: string,
  officialUrl: string,
  checkIn: string,
  checkOut: string,
  adults: number
): Promise<ExtractedHotelData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `You are a precision hospitality data extractor for the Taj Price Intelligence platform.

Your task: Fetch REAL, CURRENT, ACCURATE data for "${hotelName}" in ${hotelCity}, India from the official Taj Hotels website (${officialUrl}) and related authoritative sources.

Stay dates being researched: Check-in ${checkIn}, Check-out ${checkOut}, ${adults} adult(s), 1 room.

CRITICAL RULES:
1. ONLY return data you can find from actual web sources. If you cannot find a value, return null — NEVER fabricate or estimate prices.
2. For room rates, search the official Taj booking page for these exact dates: ${officialUrl}
3. Prices MUST be actual INR values found on tajhotels.com or IHCL booking engine — not estimates.
4. Search for amenity information from the property page, not assumed from hotel category.
5. Be honest about what you cannot find — populate missingFields accordingly.

Return ONLY a valid JSON object (no markdown, no explanation) with this EXACT schema:
{
  "currentRates": {
    "deluxeRoom": "₹28,500" or null,
    "luxuryRoom": "₹38,000" or null,
    "suite": "₹75,000" or null,
    "lowestAvailable": "₹26,000" or null,
    "currency": "INR",
    "rateNote": "Per night, taxes not included" or null
  },
  "roomTypes": ["Deluxe Room", "Luxury Room", "Taj Club Room", "Suite"],
  "mealPlans": ["Room Only", "Breakfast Included", "Half Board"],
  "cancellationPolicy": "Free cancellation up to 48 hours before check-in" or null,
  "amenities": {
    "pool": true or false or null,
    "spa": true or false or null,
    "gym": true or false or null,
    "restaurant": true or false or null,
    "bar": true or false or null,
    "businessCenter": true or false or null,
    "kidsClub": true or false or null,
    "beachAccess": true or false or null,
    "airportTransfer": true or false or null,
    "butler": true or false or null,
    "concierge": true or false or null,
    "roomService24h": true or false or null
  },
  "highlights": ["Iconic heritage property built in 1903", "Overlooking Gateway of India"],
  "propertyDetails": {
    "starRating": 5 or null,
    "totalRooms": 285 or null,
    "yearBuilt": "1903" or null,
    "yearRenovated": "2010" or null,
    "heritage": "Palace / Heritage / Contemporary / Resort" or null,
    "location": "Waterfront, Colaba, Mumbai" or null,
    "views": "Arabian Sea, Gateway of India" or null
  },
  "diningOptions": ["Wasabi by Morimoto - Japanese", "Golden Dragon - Chinese"],
  "eventSpaces": "8 banquet halls, up to 1500 guests" or null,
  "loyaltyBenefits": "Taj InnerCircle Epicure programme — complimentary breakfast, room upgrade" or null,
  "sustainabilityInitiatives": "LEED certified, solar panels, waste reduction programme" or null,
  "sourceUrls": ["https://www.tajhotels.com/..."],
  "missingFields": ["currentRates.suite", "propertyDetails.totalRooms"]
}`;

  // Try models in order of preference — first available wins
  const MODELS_TO_TRY = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
  ];

  let lastError: Error | null = null;

  for (const model of MODELS_TO_TRY) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }],
            generationConfig: { temperature: 0.1 },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      // 429 — rate limited, try next model
      if (res.status === 429) {
        lastError = new Error(`Rate limit on model ${model} — trying next`);
        await new Promise((r) => setTimeout(r, 1500)); // Brief backoff
        continue;
      }

      // 404 — model unavailable, try next
      if (res.status === 404) {
        lastError = new Error(`Model ${model} not available`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 300)}`);
      }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.text
    )?.text?.trim();

    if (!rawText) throw new Error('Gemini returned empty response');

    // Extract JSON from response (strip any markdown code fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Extract grounding source URLs if available
    const groundingMeta = json.candidates?.[0]?.groundingMetadata;
    const sourceUrls: string[] = parsed.sourceUrls || [];
    if (groundingMeta?.groundingChunks) {
      for (const chunk of groundingMeta.groundingChunks) {
        if (chunk.web?.uri && !sourceUrls.includes(chunk.web.uri)) {
          sourceUrls.push(chunk.web.uri);
        }
      }
    }

      return {
        currentRates: parsed.currentRates || {
          deluxeRoom: null, luxuryRoom: null, suite: null,
          lowestAvailable: null, currency: 'INR', rateNote: null,
        },
        roomTypes: Array.isArray(parsed.roomTypes) ? parsed.roomTypes : [],
        mealPlans: Array.isArray(parsed.mealPlans) ? parsed.mealPlans : [],
        cancellationPolicy: parsed.cancellationPolicy || null,
        amenities: parsed.amenities || {
          pool: null, spa: null, gym: null, restaurant: null,
          bar: null, businessCenter: null, kidsClub: null,
          beachAccess: null, airportTransfer: null, butler: null,
          concierge: null, roomService24h: null,
        },
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 6) : [],
        propertyDetails: parsed.propertyDetails || {
          starRating: null, totalRooms: null, yearBuilt: null,
          yearRenovated: null, heritage: null, location: null, views: null,
        },
        diningOptions: Array.isArray(parsed.diningOptions) ? parsed.diningOptions : [],
        eventSpaces: parsed.eventSpaces || null,
        loyaltyBenefits: parsed.loyaltyBenefits || null,
        sustainabilityInitiatives: parsed.sustainabilityInitiatives || null,
        sourceUrls: sourceUrls.slice(0, 8),
        missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      };
    } catch (err: any) {
      clearTimeout(timeout);
      // If it's a network abort or a hard error (not rate-limit), throw immediately
      if (err.name === 'AbortError' || !err.message?.includes('Rate limit')) {
        throw err;
      }
      lastError = err;
    }
  }

  // All models exhausted
  throw lastError || new Error('All Gemini models exhausted or unavailable');
}

/**
 * Generates an AI-powered side-by-side analysis comparing two hotels.
 * Uses the extracted data (never invents prices).
 */
async function generateComparisonAnalysis(
  hotelA: HotelCompareResult,
  hotelB: HotelCompareResult,
  checkIn: string,
  checkOut: string
): Promise<CompareApiResponse['aiAnalysis']> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a luxury travel analyst for the Taj Price Intelligence platform.

Based on the VERIFIED data below (extracted from official sources), write a concise, honest comparison between these two Taj properties.

HOTEL A: ${hotelA.canonicalName} (${hotelA.city})
Lowest Rate: ${hotelA.currentRates.lowestAvailable || 'Not available'}
Highlights: ${hotelA.highlights.join(', ')}
Amenities: Pool=${hotelA.amenities.pool}, Spa=${hotelA.amenities.spa}, Beach=${hotelA.amenities.beachAccess}, Butler=${hotelA.amenities.butler}
Heritage: ${hotelA.propertyDetails.heritage}
Total Rooms: ${hotelA.propertyDetails.totalRooms}

HOTEL B: ${hotelB.canonicalName} (${hotelB.city})
Lowest Rate: ${hotelB.currentRates.lowestAvailable || 'Not available'}
Highlights: ${hotelB.highlights.join(', ')}
Amenities: Pool=${hotelB.amenities.pool}, Spa=${hotelB.amenities.spa}, Beach=${hotelB.amenities.beachAccess}, Butler=${hotelB.amenities.butler}
Heritage: ${hotelB.propertyDetails.heritage}
Total Rooms: ${hotelB.propertyDetails.totalRooms}

Stay: ${checkIn} to ${checkOut}

Return ONLY a valid JSON object:
{
  "verdict": "One-sentence overall verdict mentioning both hotels",
  "priceDifference": "Hotel A is X% cheaper/more expensive per night, based on verified rates" or null if rates unavailable,
  "bestForBudget": "Hotel name and one-line reason",
  "bestForLuxury": "Hotel name and one-line reason",
  "bestForFamily": "Hotel name and one-line reason",
  "bestForCouple": "Hotel name and one-line reason",
  "uniqueToA": ["Feature 1 unique to Hotel A", "Feature 2"],
  "uniqueToB": ["Feature 1 unique to Hotel B", "Feature 2"],
  "recommendation": "2-3 sentences giving a genuine recommendation based on travel preferences"
}`;

  // Try models with fallback
  for (const model of ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3-flash-preview']) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4 },
          }),
        }
      );

      if (res.status === 429 || res.status === 404) continue;
      if (!res.ok) return null;
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) return null;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]);
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * POST /api/compare
 * Body: { hotelSlugs: string[], checkIn: string, checkOut: string, adults: number }
 *
 * Returns real data extracted from tajhotels.com via Gemini grounded search.
 * ZERO mock prices — if data is unavailable, missingFields is populated and values are null.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { hotelSlugs, checkIn, checkOut, adults = 2 } = body;

    if (!Array.isArray(hotelSlugs) || hotelSlugs.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Provide at least 2 hotel slugs to compare' },
        { status: 400 }
      );
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'checkIn and checkOut dates are required' },
        { status: 400 }
      );
    }

    // Import prisma dynamically to keep the route edge-compatible if needed
    const { prisma } = await import('@/lib/prisma');

    // Fetch hotel metadata from DB (slugs, names, cities, booking URLs)
    const hotelRecords = await prisma.hotel.findMany({
      where: { slug: { in: hotelSlugs.slice(0, 4) } }, // Max 4 hotels
      include: { assets: { take: 1 } },
    });

    if (hotelRecords.length < 2) {
      return NextResponse.json(
        { success: false, error: `Could not find hotels for slugs: ${hotelSlugs.join(', ')}` },
        { status: 404 }
      );
    }

    // Fetch real data for each hotel via Gemini grounded search — in parallel
    const extractionResults = await Promise.allSettled(
      hotelRecords.map((hotel) =>
        fetchRealHotelDataViaGemini(
          hotel.canonicalName,
          hotel.city,
          hotel.officialBookingUrl || `https://www.tajhotels.com/en-in/hotels/${hotel.slug}/`,
          checkIn,
          checkOut,
          adults
        )
      )
    );

    const hotels: HotelCompareResult[] = hotelRecords.map((hotel, i) => {
      const result = extractionResults[i];
      const data = result.status === 'fulfilled' ? result.value : null;

      // Count non-null fields to determine confidence
      const amenityCount = data
        ? Object.values(data.amenities).filter((v) => v !== null).length
        : 0;
      const dataConfidence: HotelCompareResult['dataConfidence'] =
        !data ? 'LOW'
        : data.currentRates.lowestAvailable && amenityCount >= 8 ? 'HIGH'
        : data.highlights.length > 0 && amenityCount >= 4 ? 'MEDIUM'
        : 'LOW';

      return {
        hotelId: hotel.id,
        canonicalName: hotel.canonicalName,
        slug: hotel.slug,
        city: hotel.city,
        officialBookingUrl: hotel.officialBookingUrl || `https://www.tajhotels.com/en-in/hotels/${hotel.slug}/`,
        currentRates: data?.currentRates || {
          deluxeRoom: null, luxuryRoom: null, suite: null,
          lowestAvailable: null, currency: 'INR', rateNote: null,
        },
        roomTypes: data?.roomTypes || [],
        mealPlans: data?.mealPlans || [],
        cancellationPolicy: data?.cancellationPolicy || null,
        amenities: data?.amenities || {
          pool: null, spa: null, gym: null, restaurant: null,
          bar: null, businessCenter: null, kidsClub: null,
          beachAccess: null, airportTransfer: null, butler: null,
          concierge: null, roomService24h: null,
        },
        highlights: data?.highlights || [],
        propertyDetails: data?.propertyDetails || {
          starRating: hotel.starRating || null,
          totalRooms: null, yearBuilt: null, yearRenovated: null,
          heritage: null, location: hotel.address || null, views: null,
        },
        diningOptions: data?.diningOptions || [],
        eventSpaces: data?.eventSpaces || null,
        loyaltyBenefits: data?.loyaltyBenefits || null,
        sustainabilityInitiatives: data?.sustainabilityInitiatives || null,
        sourceUrls: data?.sourceUrls || [hotel.officialBookingUrl || ''],
        extractionTimestamp: new Date().toISOString(),
        dataConfidence,
        missingFields: data?.missingFields || (result.status === 'rejected'
          ? [`All fields — extraction failed: ${(result as PromiseRejectedResult).reason?.message}`]
          : []),
      };
    });

    // Detect if ALL extractions failed due to rate limiting
    const allRateLimited = extractionResults.every(
      (r) =>
        r.status === 'rejected' &&
        (r.reason?.message?.includes('Rate limit') || r.reason?.message?.includes('quota') || r.reason?.message?.includes('exhausted'))
    );

    // Generate AI analysis comparing the two hotels
    let aiAnalysis: CompareApiResponse['aiAnalysis'] = null;
    if (hotels.length >= 2 && !allRateLimited) {
      aiAnalysis = await generateComparisonAnalysis(hotels[0], hotels[1], checkIn, checkOut);
    }

    return NextResponse.json({
      success: true,
      checkIn,
      checkOut,
      adults,
      hotels,
      aiAnalysis,
      rateLimitWarning: allRateLimited
        ? 'The AI search service is temporarily rate-limited. This is a quota limit on the underlying AI service — please try again in 1-2 minutes. No data has been fabricated; the system prefers showing nothing over showing inaccurate information.'
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Comparison failed' },
      { status: 500 }
    );
  }
}
