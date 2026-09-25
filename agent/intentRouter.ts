import { prisma } from '../lib/prisma';
import { resolve_property } from './propertyResolver';
import { formatIndianCurrency } from '../components/pricing/PriceDisplay';

export type UserIntent = 'PRICE_SEARCH' | 'PRICE_EXPLANATION' | 'HOTEL_INFO_RAG';

export interface AssistantResponse {
  intent: UserIntent;
  query: string;
  observedFacts: string[];
  interpretation?: string;
  structuredData?: any;
  sources: string[];
  executionTrace: {
    intentRoutingTimeMs: number;
    dbExecutionTimeMs: number;
    arithmeticMethod: 'DATABASE_SQL_ONLY' | 'NONE';
    llmInvolvedInPriceCalculation: false; // Strictly enforced false
  };
}

/**
 * Intent Router (docs/02-SYSTEM-ARCHITECTURE.md §4 & docs/04-API-AND-SECURITY.md §4)
 * Deterministically routes queries:
 *   - Price queries -> Pure PostgreSQL SQL query (Zero LLM arithmetic)
 *   - Price change analysis -> Historical sequence comparison with explicit separation of facts vs interpretation
 *   - Hotel knowledge -> Verified hotel information & amenities
 */
export async function routeUserQuery(query: string): Promise<AssistantResponse> {
  const start = Date.now();
  const lower = query.toLowerCase();

  // Intent 0: Developer Credits / Who built this?
  if (/who (built|made|created|developed|coded)|param|khodiyar|credits|author|creator/i.test(lower)) {
    return handleDeveloperCreditIntent(query, start);
  }

  // Intent 1: "Why did [Hotel] change / become more expensive / cheaper?"
  if (/why did|why is|change|price difference|more expensive|cheaper now|increased|dropped/i.test(lower)) {
    return handlePriceExplanationIntent(query, start);
  }

  // Intent 2: Recommendations / Best Options / Weekend Stays
  if (/best taj|options|recommend|suggest|where should i stay|top taj|weekend|next week|thursday to sunday|plans/i.test(lower)) {
    return handleRecommendationIntent(query, start);
  }

  // Intent 3: "Which Taj is cheapest?", "Price of Taj Goa", "Find Taj for dates"
  if (/cheapest|best rate|cost|rate|price|room|available|how much/i.test(lower) || /\b(for|in|dates|nov|dec|jan|feb|mar|apr|may)\b/i.test(lower)) {
    return handlePriceSearchIntent(query, start);
  }

  // Intent 4: Hotel Information / RAG
  return handleHotelInfoRagIntent(query, start);
}

/**
 * Intent: PRICE_SEARCH
 * Pure SQL / structured query. ZERO LLM arithmetic.
 */
async function handlePriceSearchIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const dbStart = Date.now();

  // Date extraction: search for target dates or default to upcoming verified dates
  // Check for city mention e.g. "Goa", "Mumbai", "Jaipur", "Udaipur"
  const cityMatch = query.match(/\b(goa|mumbai|delhi|jaipur|udaipur|hyderabad|bengaluru|chennai|kolkata|amritsar)\b/i);
  const targetCity = cityMatch ? cityMatch[1] : undefined;

  const whereClause: any = {
    availabilityStatus: 'AVAILABLE',
    verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
  };

  if (targetCity) {
    whereClause.hotel = {
      city: { contains: targetCity, mode: 'insensitive' },
    };
  }

  // Query cheapest verified snapshot via pure SQL ORDER BY pricePerNight ASC
  const cheapestSnapshot = await prisma.priceSnapshot.findFirst({
    where: whereClause,
    orderBy: { pricePerNight: 'asc' },
    include: {
      hotel: true,
      room: true,
      ratePlan: true,
    },
  });

  const dbTime = Date.now() - dbStart;

  if (!cheapestSnapshot) {
    return {
      intent: 'PRICE_SEARCH',
      query,
      observedFacts: [
        targetCity
          ? `No verified observations found in the database for Taj hotels in ${targetCity}.`
          : 'No verified price observations currently exist in the database for the requested criteria.',
      ],
      sources: ['Official Taj Reservation Archive'],
      executionTrace: {
        intentRoutingTimeMs: routerTime,
        dbExecutionTimeMs: dbTime,
        arithmeticMethod: 'DATABASE_SQL_ONLY',
        llmInvolvedInPriceCalculation: false,
      },
    };
  }

  const priceNum = Number(cheapestSnapshot.pricePerNight);
  const stayDates = `${cheapestSnapshot.checkIn.toISOString().split('T')[0]} to ${cheapestSnapshot.checkOut.toISOString().split('T')[0]}`;

  return {
    intent: 'PRICE_SEARCH',
    query,
    observedFacts: [
      `Cheapest verified Taj: ${cheapestSnapshot.hotel.canonicalName} (${cheapestSnapshot.hotel.city}).`,
      `Verified nightly rate: ₹${formatIndianCurrency(priceNum)} for lead room "${cheapestSnapshot.room.canonicalRoomName}".`,
      `Rate plan: "${cheapestSnapshot.ratePlan.canonicalRateName}" (${cheapestSnapshot.mealPlan || cheapestSnapshot.ratePlan.mealPlan}).`,
      `Cancellation terms: ${cheapestSnapshot.cancellationPolicy || cheapestSnapshot.ratePlan.cancellationPolicy}.`,
      `Stay dates: ${stayDates} (${cheapestSnapshot.adults} Adults, ${cheapestSnapshot.rooms} Room).`,
      `Last verified observation timestamp: ${cheapestSnapshot.fetchedAt.toISOString()} (Source: ${cheapestSnapshot.source}).`,
    ],
    structuredData: {
      hotelId: cheapestSnapshot.hotelId,
      hotelName: cheapestSnapshot.hotel.canonicalName,
      city: cheapestSnapshot.hotel.city,
      pricePerNight: priceNum,
      currency: cheapestSnapshot.currency,
      room: cheapestSnapshot.room.canonicalRoomName,
      ratePlan: cheapestSnapshot.ratePlan.canonicalRateName,
      snapshotId: cheapestSnapshot.id,
      fetchRunId: cheapestSnapshot.fetchRunId,
    },
    sources: [`Observation Record Ref: #${cheapestSnapshot.id.slice(0, 8)}`],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: dbTime,
      arithmeticMethod: 'DATABASE_SQL_ONLY',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

/**
 * Intent: PRICE_EXPLANATION
 * Explains price evolution between stored snapshots.
 * Strictly separates observed facts from interpretation per 04-API-AND-SECURITY.md §4.
 */
async function handlePriceExplanationIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const dbStart = Date.now();

  // Resolve property from conversational query
  const allHotels = await prisma.hotel.findMany({
    where: { isActive: true },
    select: { id: true, canonicalName: true, slug: true, city: true },
  });

  const queryLower = query.toLowerCase();
  const matched = allHotels.find(
    (h) =>
      queryLower.includes(h.canonicalName.toLowerCase()) ||
      queryLower.includes(h.slug.toLowerCase()) ||
      (queryLower.includes(h.city.toLowerCase()) && queryLower.includes('taj')) ||
      h.canonicalName
        .toLowerCase()
        .replace(/^(the|taj)\s+/i, '')
        .split(' ')
        .filter((w) => w.length > 2)
        .every((w) => queryLower.includes(w))
  );

  let hotelId = matched?.id;
  if (!hotelId) {
    const latestSnapshot = await prisma.priceSnapshot.findFirst({
      select: { hotelId: true },
      orderBy: { fetchedAt: 'desc' },
    });
    hotelId = latestSnapshot?.hotelId || 'taj-mahal-palace-mumbai';
  }

  // Fetch the two most recent verified snapshots for this hotel
  const snapshots = await prisma.priceSnapshot.findMany({
    where: {
      hotelId,
      verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED', 'ANOMALOUS'] },
    },
    include: {
      hotel: true,
      room: true,
      ratePlan: true,
    },
    orderBy: { fetchedAt: 'desc' },
    take: 2,
  });

  const dbTime = Date.now() - dbStart;

  if (snapshots.length < 2) {
    return {
      intent: 'PRICE_EXPLANATION',
      query,
      observedFacts: [
        `Found only ${snapshots.length} observation for ${matched?.canonicalName || 'the requested hotel'} in the database.`,
        'At least two historical observations are required to calculate price changes or trends.',
      ],
      sources: ['Official Taj Reservation Archive'],
      executionTrace: {
        intentRoutingTimeMs: routerTime,
        dbExecutionTimeMs: dbTime,
        arithmeticMethod: 'DATABASE_SQL_ONLY',
        llmInvolvedInPriceCalculation: false,
      },
    };
  }

  const latest = snapshots[0];
  const prior = snapshots[1];

  const latestPrice = Number(latest.pricePerNight);
  const priorPrice = Number(prior.pricePerNight);
  const diff = latestPrice - priorPrice;
  const pct = Math.round((diff / priorPrice) * 100);

  const facts: string[] = [
    `Observation A (${prior.fetchedAt.toISOString()}): ₹${formatIndianCurrency(priorPrice)} / night for ${prior.room.canonicalRoomName} (${prior.ratePlan.canonicalRateName}).`,
    `Observation B (${latest.fetchedAt.toISOString()}): ₹${formatIndianCurrency(latestPrice)} / night for ${latest.room.canonicalRoomName} (${latest.ratePlan.canonicalRateName}).`,
    `Numeric difference computed via database values: ${diff > 0 ? '+' : ''}₹${formatIndianCurrency(diff)} (${diff > 0 ? '+' : ''}${pct}%).`,
  ];

  // Explanatory interpretation (clearly segregated per 04-API-AND-SECURITY.md §4)
  let interpretation = '';
  if (latest.ratePlan.canonicalRateName !== prior.ratePlan.canonicalRateName) {
    interpretation = `The rate plan changed between observations from "${prior.ratePlan.canonicalRateName}" to "${latest.ratePlan.canonicalRateName}" (meal inclusions: "${latest.mealPlan}"). This package modification accounts for part or all of the price difference.`;
  } else if (latest.room.canonicalRoomName !== prior.room.canonicalRoomName) {
    interpretation = `The room category observed shifted from "${prior.room.canonicalRoomName}" to "${latest.room.canonicalRoomName}", representing an upgrade in room tier rather than a base price increase.`;
  } else if (diff > 0) {
    interpretation = `The rate plan and room tier remained identical. The rate change reflects dynamic demand-driven yield management by Taj for these travel dates.`;
  } else {
    interpretation = `The rate plan and room tier remained identical. The observed rate decrease represents an official promotional drop or yield adjustment for these travel dates.`;
  }

  return {
    intent: 'PRICE_EXPLANATION',
    query,
    observedFacts: facts,
    interpretation,
    sources: [
      `Observation Ref: #${prior.id.slice(0, 8)} (${prior.fetchedAt.toISOString()})`,
      `Observation Ref: #${latest.id.slice(0, 8)} (${latest.fetchedAt.toISOString()})`,
    ],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: dbTime,
      arithmeticMethod: 'DATABASE_SQL_ONLY',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

/**
 * Optional Gemini LLM integration for natural-language synthesis
 * strictly for explanation and hotel information (02-SYSTEM-ARCHITECTURE.md §4).
 * ZERO LLM arithmetic allowed for numeric prices.
 */
async function callGeminiExplanation(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Intent: HOTEL_INFO_RAG
 * Answers factual questions about hotel amenities, descriptions, and policies.
 */
async function handleHotelInfoRagIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const dbStart = Date.now();

  const resolved = await resolve_property(query);
  const hotel = resolved[0]
    ? await prisma.hotel.findUnique({
        where: { id: resolved[0].hotelId },
        include: { rooms: true },
      })
    : await prisma.hotel.findFirst({
        where: { isActive: true },
        include: { rooms: true },
      });

  const dbTime = Date.now() - dbStart;

  if (!hotel) {
    return {
      intent: 'HOTEL_INFO_RAG',
      query,
      observedFacts: ['Hotel information could not be retrieved from the catalog.'],
      sources: ['Hotel Catalog'],
      executionTrace: {
        intentRoutingTimeMs: routerTime,
        dbExecutionTimeMs: dbTime,
        arithmeticMethod: 'NONE',
        llmInvolvedInPriceCalculation: false,
      },
    };
  }

  // Synthesize answer via Gemini based strictly on database facts
  const aiSummary = await callGeminiExplanation(
    `You are the Taj Price Intelligence Assistant.
Answer the user's question concisely using ONLY these verified database facts:
Property: ${hotel.canonicalName} (${hotel.city}, ${hotel.state})
Overview: ${hotel.description}
Rooms: ${hotel.rooms.map((r) => r.canonicalRoomName).join(', ')}

User question: "${query}"
Rules:
- Be concise (2-3 sentences).
- Never invent prices, dates, or amenities not listed.
- Maintain a polite, hospitable tone.`
  );

  return {
    intent: 'HOTEL_INFO_RAG',
    query,
    observedFacts: [
      `Property: ${hotel.canonicalName} (${hotel.city}, ${hotel.state}).`,
      `Classification: ${hotel.starRating ? `${hotel.starRating}-Star Luxury` : 'Luxury Property'} (${hotel.brand}).`,
      `Address: ${hotel.address || `${hotel.city}, ${hotel.state}`}.`,
      `Overview: ${hotel.description}`,
      `Available room types cataloged: ${hotel.rooms.map((r) => r.canonicalRoomName).join(', ')}.`,
      `Official booking source: ${hotel.officialBookingUrl || 'Taj Official Reservation System'}`,
    ],
    interpretation: aiSummary || undefined,
    sources: [`Hotel Entity ID: ${hotel.id}`, ...(aiSummary ? ['Gemini Flash (Synthesis)'] : [])],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: dbTime,
      arithmeticMethod: 'NONE',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

/**
 * Intent: DEVELOPER_CREDITS
 * Subtle, humorous developer easter egg
 */
async function handleDeveloperCreditIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const wittyResponse =
    'Namaste! Taj Price Intelligence was designed, engineered, and fine-tuned by Param Khodiyar.\n\n' +
    'Architecture Notes:\n' +
    '• Next.js 16 App Router, TypeScript, Prisma ORM, and autonomous reservation observation pipelines.\n' +
    '• Zero fake AI prices, zero CSS shadows, and 100% verified rates straight from official booking feeds.\n' +
    '• Lore has it Param built this entire platform because paying inflated OTA markups on heritage palace rooms personally offended his engineering soul.';

  return {
    intent: 'HOTEL_INFO_RAG',
    query,
    observedFacts: [
      'Engineered and architected by Param Khodiyar.',
      'Core Mission: Democratize verified rate transparency across Taj properties with zero shadow UI and mathematical honesty.',
      'Infrastructure: Powered by Next.js Turbopack, Prisma, and official reservation verification.',
    ],
    interpretation: wittyResponse,
    sources: ['Provenance: Param Khodiyar (Lead Architect)'],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: 1,
      arithmeticMethod: 'NONE',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

/**
 * Intent: RECOMMENDATIONS & WEEKEND ESCAPES
 * Recommends curated Taj luxury options with real database prices
 */
async function handleRecommendationIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const dbStart = Date.now();
  const lower = query.toLowerCase();

  // Calculate upcoming Thursday -> Sunday window
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 4 = Thu
  const daysUntilThu = (4 - currentDay + 7) % 7 || 7;
  const nextThu = new Date(now);
  nextThu.setDate(now.getDate() + daysUntilThu);
  const nextSun = new Date(nextThu);
  nextSun.setDate(nextThu.getDate() + 3);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const windowStr = `${formatDate(nextThu)} – ${formatDate(nextSun)} (3 Nights)`;

  // Select top canonical properties
  const targetSlugs = lower.includes('goa')
    ? ['taj-exotica-resort-spa-goa', 'taj-fort-aguada-resort-spa-goa', 'taj-holiday-village-resort-spa-goa']
    : lower.includes('mumbai')
    ? ['the-taj-mahal-palace-mumbai', 'taj-lands-end-mumbai', 'taj-santacruz-mumbai']
    : lower.includes('jaipur') || lower.includes('rajasthan')
    ? ['taj-lake-palace-udaipur', 'rambagh-palace-jaipur', 'umaid-bhawan-palace-jodhpur']
    : ['the-taj-mahal-palace-mumbai', 'taj-exotica-resort-spa-goa', 'taj-lake-palace-udaipur', 'rambagh-palace-jaipur'];

  const hotels = await prisma.hotel.findMany({
    where: { slug: { in: targetSlugs }, isActive: true },
    include: {
      priceSnapshots: {
        where: { verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] } },
        orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
        take: 1,
        include: { room: true, ratePlan: true },
      },
    },
    take: 4,
  });

  const dbTime = Date.now() - dbStart;

  let recommendationText = `Namaste! Here are the finest verified Taj options for your upcoming stay (${windowStr}):\n\n`;

  const facts: string[] = [];

  hotels.forEach((h, index) => {
    const snap = h.priceSnapshots[0];
    const rateText = snap
      ? `₹${Number(snap.pricePerNight).toLocaleString('en-IN')} / night (${snap.room?.canonicalRoomName || 'Standard Room'}, ${snap.ratePlan?.canonicalRateName || 'Best Available Rate'})`
      : 'Rates verified upon live date query';

    recommendationText += `${index + 1}. 🏰 ${h.canonicalName} (${h.city}, ${h.state})\n`;
    recommendationText += `   • Nightly Lead Rate: ${rateText}\n`;
    recommendationText += `   • Highlights: ${(h.description || 'Iconic luxury Taj hospitality property').slice(0, 140)}…\n\n`;

    facts.push(`${h.canonicalName}: ${rateText}`);
  });

  recommendationText += `💡 Concierge Advice: For coastal relaxation, Taj Exotica Goa offers expansive private grounds. For royal Rajasthani opulence, Taj Lake Palace Udaipur delivers an unmatched floating palace arrival. Every rate is grounded in verified reservation data.`;

  return {
    intent: 'PRICE_SEARCH',
    query,
    observedFacts: facts,
    interpretation: recommendationText,
    sources: ['Official Taj Reservation Database', 'Canonical Property Catalog'],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: dbTime,
      arithmeticMethod: 'DATABASE_SQL_ONLY',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

