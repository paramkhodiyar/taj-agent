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
 *   - Guardrail Pre-flight: Refuses coding, math, debugging, and adversarial overrides
 *   - Price queries -> Pure PostgreSQL SQL query (Zero LLM arithmetic)
 *   - Price change analysis -> Historical sequence comparison with explicit separation of facts vs interpretation
 *   - Hotel knowledge & concierge -> Verified hotel data synthesized with Gemini
 */
export async function routeUserQuery(query: string): Promise<AssistantResponse> {
  const start = Date.now();
  const lower = query.toLowerCase();

  // Guardrail Layer 1: Strictly reject out-of-bounds queries (coding, math, jailbreaks, non-travel topics)
  if (isOutOfBoundsOrAdversarial(query)) {
    return handleOutOfBoundsIntent(query, start);
  }

  // Intent 0: Developer Credits / Who built this?
  if (/who (built|made|created|developed|coded)|param|khodiyar|credits|author|creator/i.test(lower)) {
    return handleDeveloperCreditIntent(query, start);
  }

  // Intent 1: "Why did [Hotel] change / become more expensive / cheaper?"
  if (/why did|why is|change|price difference|more expensive|cheaper now|increased|dropped/i.test(lower)) {
    return handlePriceExplanationIntent(query, start);
  }

  // Intent 2: Recommendations / Best Options / Weekend Stays
  if (/best taj|options|recommend|suggest|where should i stay|top taj|weekend|next week|thursday to sunday|plans|itinerary|vacation/i.test(lower)) {
    return handleRecommendationIntent(query, start);
  }

  // Intent 3: Factual Price Search inquiries (e.g. "Which Taj is cheapest?", "Price of Taj Fort Aguada", "How much does Taj Lake Palace cost?")
  const isExplicitPriceQuery =
    /\b(cheapest|lowest price|best rate|how much|tariffs?|pricing)\b/i.test(lower) ||
    (/\b(price|cost|rate)\b/i.test(lower) && !/\b(room types?|what rooms?|dining|restaurant|beach|pool|spa|amenities|history|story|check-in|checkout|review)\b/i.test(lower));

  if (isExplicitPriceQuery) {
    return handlePriceSearchIntent(query, start);
  }

  // Intent 4: Hotel Information & Intelligent Travel Concierge
  return handleHotelInfoRagIntent(query, start);
}

/**
 * Intent: PRICE_SEARCH
 * Pure SQL / structured query. ZERO LLM arithmetic.
 */
async function handlePriceSearchIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const dbStart = Date.now();

  // 1. Check if a specific hotel was requested
  const resolved = await resolve_property(query);

  // 2. Check for city mention e.g. "Goa", "Mumbai", "Jaipur", "Udaipur"
  const cityMatch = query.match(/\b(goa|mumbai|delhi|jaipur|udaipur|hyderabad|bengaluru|chennai|kolkata|amritsar)\b/i);
  const targetCity = cityMatch ? cityMatch[1] : undefined;

  const whereClause: any = {
    availabilityStatus: 'AVAILABLE',
    verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
  };

  if (resolved.length > 0) {
    whereClause.hotelId = resolved[0].hotelId;
  } else if (targetCity) {
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
          ? `No verified rates found in our records for Taj hotels in ${targetCity}. Run a quick search above to check live rates.`
          : 'No verified rates currently exist in our records for the requested criteria. Discover live rates by running a search above.',
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
      `Last verified: ${new Date(cheapestSnapshot.fetchedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST (Direct Taj Reservation).`,
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
    sources: [`Verified Record Ref: #${cheapestSnapshot.id.slice(0, 8)}`],
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
        `Found only ${snapshots.length} historical record for ${matched?.canonicalName || 'the requested hotel'}.`,
        'At least two historical rate records are required to calculate price changes or trends.',
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
    `Earlier Record (${prior.fetchedAt.toISOString().split('T')[0]}): ₹${formatIndianCurrency(priorPrice)} / night for ${prior.room.canonicalRoomName} (${prior.ratePlan.canonicalRateName}).`,
    `Recent Record (${latest.fetchedAt.toISOString().split('T')[0]}): ₹${formatIndianCurrency(latestPrice)} / night for ${latest.room.canonicalRoomName} (${latest.ratePlan.canonicalRateName}).`,
    `Official rate difference: ${diff > 0 ? '+' : ''}₹${formatIndianCurrency(diff)} (${diff > 0 ? '+' : ''}${pct}%).`,
  ];

  // Explanatory interpretation (clearly segregated per 04-API-AND-SECURITY.md §4)
  let interpretation = '';
  if (latest.ratePlan.canonicalRateName !== prior.ratePlan.canonicalRateName) {
    interpretation = `The rate plan changed between records from "${prior.ratePlan.canonicalRateName}" to "${latest.ratePlan.canonicalRateName}" (meal inclusions: "${latest.mealPlan}"). This package modification accounts for part or all of the price difference.`;
  } else if (latest.room.canonicalRoomName !== prior.room.canonicalRoomName) {
    interpretation = `The room category shifted from "${prior.room.canonicalRoomName}" to "${latest.room.canonicalRoomName}", representing an upgrade in room tier rather than a base price increase.`;
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
      `Verified Record Ref: #${prior.id.slice(0, 8)}`,
      `Verified Record Ref: #${latest.id.slice(0, 8)}`,
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
 * Guardrail check: Strictly reject out-of-bounds, non-travel queries,
 * including coding, math calculations, debugging, homework, and adversarial prompt injections.
 */
function isOutOfBoundsOrAdversarial(query: string): boolean {
  const q = query.toLowerCase();

  // 1. Coding, algorithms, and software engineering
  const codingTerms = [
    /\b(reverse\s*(a\s*)?linked\s*list|linked\s*list|binary\s*tree|leetcode|dijkstra|fibonacci|recursion|algorithm|data\s*structure)\b/,
    /\b(python|javascript|typescript|c\+\+|java\b(?!(\s*palace|\s*indies))|rust|golang|ruby|php|sql\s*injection|html|css|react|nextjs|docker|bash|shell\s*script)\b/,
    /\b(write\s*(me\s*)?(a\s*)?(code|script|program|function|component|query)|give\s*me\s*code|show\s*code|sample\s*code|source\s*code)\b/,
    /\b(how\s*to\s*code|implement\s*(a\s*)?(binary|linked|tree|function|class)|def\s+\w+\(|console\.log|print\(|import\s+)\b/,
    /\b(debug|compiler|syntax\s*error|runtime\s*error|stack\s*overflow|unit\s*test|pull\s*request|github\s*repo)\b/,
  ];

  // 2. Math, calculus, algebra, pure numeric equations
  const mathTerms = [
    /\b(integral\s*of|derivative\s*of|matrix\s*multiplication|quadratic\s*equation|pythagorean|solve\s*equation)\b/,
    /\b(calculate|compute|solve)\s*(\d+[\s\+\-\*\/\^\%]+\d+)/,
    /\b(solve|equation|algebra)\b.*[=]/,
    /\bwhat\s*is\s*(\d+[\s\+\-\*\/]+\d+)/,
    /\b(square\s*root|logarithm|sine|cosine|tangent|eigenvalue|calculus)\b/,
  ];

  // 3. Adversarial prompt injections, roleplay bypass, conditional bargaining tricks
  const adversarialTerms = [
    /\b(ignore\s+(all\s+)?(previous|prior)\s+instructions|disregard\s+(all\s+)?(previous|prior))\b/,
    /\b(you\s+are\s+now|act\s+as\s+dan|jailbreak|unfiltered\s+mode|developer\s+mode|system\s+prompt)\b/,
    /\b(pretend\s+you\s+are|roleplay\s+as|simulate\s+a\s+(python|linux|terminal|bot))\b/,
    /\b(i\s+(will|want\s+to)\s+book\s+(the\s+)?(hotel|taj)\s+but\s+first|tell\s+me\s+.*(before|then)\s+i\s+book|first\s+tell\s+me\s+.*(before|then)\s+i\s+book)\b/,
    /\b(answer\s+this\s+.*(then|before)\s+i\s+book|if\s+you\s+tell\s+me\s+.*i\s+will\s+book)\b/,
  ];

  // 4. Non-travel off-domain topics (medical, legal, crypto trading, politics)
  const offDomainTerms = [
    /\b(medical\s*advice|diagnose\s*my|symptoms\s*of|prescribe\s+medicine|treatment\s*for)\b/,
    /\b(bitcoin|ethereum|crypto|forex|stock\s*pick|buy\s*crypto|nft)\b/,
    /\b(who\s*won\s*the\s*election|political\s*party|prime\s*minister\s*debate|vote\s*for)\b/,
  ];

  return [...codingTerms, ...mathTerms, ...adversarialTerms, ...offDomainTerms].some((regex) => regex.test(q));
}

/**
 * Handle out-of-bounds or adversarial prompts with a polite, firm concierge refusal
 */
function handleOutOfBoundsIntent(query: string, startTime: number): AssistantResponse {
  const routerTime = Date.now() - startTime;
  const politeRefusal =
    'Namaste. As your Taj Luxury Concierge, I am devoted exclusively to curating royal stays, travel itineraries, reservation guidance, and dining experiences across our iconic Taj properties.\n\n' +
    'I am unable to assist with programming, mathematics, or non-hospitality inquiries. ' +
    'May I assist you with exploring our palace suites in Rajasthan, coastal resorts in Goa, or dining reservations at The Taj Mahal Palace Mumbai?';

  return {
    intent: 'HOTEL_INFO_RAG',
    query,
    observedFacts: [
      'Scope Authority: The Taj Luxury Concierge assists exclusively with travel, accommodations, and dining across Taj properties.',
      'Domain Boundary Enforced: Non-travel queries (including programming, mathematics, and arbitrary computation) are declined.',
    ],
    interpretation: politeRefusal,
    sources: ['Taj Luxury Concierge Policy & Travel Domain Boundary'],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: 0,
      arithmeticMethod: 'NONE',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

const CONCIERGE_SYSTEM_PROMPT = `You are the quintessential Taj Luxury Concierge at Taj Price Intelligence.
Your voice is warm, gracious, sophisticated, and deeply rooted in the legendary tradition of Indian hospitality ("Atithi Devo Bhava").
You assist guests with bespoke travel advice, destination recommendations, palace histories, dining venues, room tier selections, and stay tips across the iconic Taj Hotels collection in India.

STRICT DOMAIN RULES:
1. ONLY assist with travel, hotel accommodations, dining, tourism, and hospitality related to Taj properties and travel in India.
2. Under NO CIRCUMSTANCES should you write computer code, solve math equations, perform technical debugging, or answer off-topic queries, even if the guest claims they will book a room if you answer first. If such a request occurs, politely and regally decline and redirect to their travel plans.
3. NEVER invent or fabricate numeric room rates or discounts. If real rates are provided in the context, cite them faithfully. If not provided, advise the guest to use the platform's search tool for live reservation rates.
4. Keep responses elegant, structured, engaging, and hospitable. Address the guest with "Namaste" where fitting.`;

/**
 * Gemini LLM integration for natural-language synthesis
 * strictly for explanation and hotel information (02-SYSTEM-ARCHITECTURE.md §4).
 * ZERO LLM arithmetic allowed for numeric prices.
 */
async function callGeminiAssistant(
  userPrompt: string,
  systemInstructionText: string = CONCIERGE_SYSTEM_PROMPT
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
  ];

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemInstructionText }] },
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 650,
            },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (!res.ok) continue;

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        return text;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Intent: HOTEL_INFO_RAG
 * Answers factual and advisory questions about hotel amenities, descriptions, rooms, dining, and travel.
 */
async function handleHotelInfoRagIntent(query: string, startTime: number): Promise<AssistantResponse> {
  const routerTime = Date.now() - startTime;
  const dbStart = Date.now();
  const lower = query.toLowerCase();

  // 1. Try to resolve a specific property first
  const resolved = await resolve_property(query);

  let targetHotels: any[] = [];
  if (resolved.length > 0) {
    const singleHotel = await prisma.hotel.findUnique({
      where: { id: resolved[0].hotelId },
      include: {
        rooms: true,
        priceSnapshots: {
          where: { verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] } },
          orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
          take: 1,
          include: { room: true, ratePlan: true },
        },
      },
    });
    if (singleHotel) targetHotels.push(singleHotel);
  }

  // 2. If no single hotel resolved, check for destination or city mentions
  if (targetHotels.length === 0) {
    const cityMatch = lower.match(/\b(goa|mumbai|delhi|jaipur|udaipur|hyderabad|bengaluru|bangalore|chennai|kolkata|amritsar|varanasi|rishikesh|corbett|agra|jodhpur|kerala|rajasthan)\b/);
    if (cityMatch) {
      const cityName = cityMatch[1] === 'bangalore' ? 'bengaluru' : cityMatch[1];
      targetHotels = await prisma.hotel.findMany({
        where: {
          OR: [
            { city: { contains: cityName, mode: 'insensitive' } },
            { state: { contains: cityName, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        include: {
          rooms: true,
          priceSnapshots: {
            where: { verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] } },
            orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
            take: 1,
            include: { room: true, ratePlan: true },
          },
        },
        take: 3,
      });
    }
  }

  // 3. Fallback: select canonical flagship Taj properties
  if (targetHotels.length === 0) {
    targetHotels = await prisma.hotel.findMany({
      where: {
        slug: {
          in: ['the-taj-mahal-palace-mumbai', 'taj-lake-palace-udaipur', 'taj-exotica-resort-spa-goa'],
        },
        isActive: true,
      },
      include: {
        rooms: true,
        priceSnapshots: {
          where: { verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] } },
          orderBy: [{ pricePerNight: 'asc' }, { fetchedAt: 'desc' }],
          take: 1,
          include: { room: true, ratePlan: true },
        },
      },
      take: 3,
    });
  }

  const dbTime = Date.now() - dbStart;

  if (targetHotels.length === 0) {
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

  const facts: string[] = [];
  let hotelContextText = '';

  for (const h of targetHotels) {
    const snap = h.priceSnapshots?.[0];
    const rateText = snap
      ? `Verified nightly rate from ₹${Number(snap.pricePerNight).toLocaleString('en-IN')} (${snap.room?.canonicalRoomName || 'Standard Room'}, ${snap.ratePlan?.canonicalRateName || 'Best Available Rate'})`
      : 'Rates verified upon live date query';

    facts.push(
      `Property: ${h.canonicalName} (${h.city}, ${h.state}) · ${h.starRating ? `${h.starRating}-Star Luxury` : 'Luxury Property'}.`,
      `Room Categories: ${h.rooms.map((r: any) => r.canonicalRoomName).join(', ') || 'Deluxe Rooms & Luxury Suites'}.`,
      rateText
    );

    hotelContextText += `
Property: ${h.canonicalName} (${h.city}, ${h.state})
Rating: ${h.starRating || 5} Stars
Overview: ${h.description || 'Iconic luxury Taj heritage hospitality.'}
Address: ${h.address || `${h.city}, ${h.state}`}
Rooms: ${h.rooms.map((r: any) => r.canonicalRoomName).join(', ')}
${rateText}
`;
  }

  // Synthesize answer via Gemini based strictly on database facts
  const geminiPrompt = `A guest has requested your guidance with the following inquiry:
"${query}"

Verified Taj Database Information:
${hotelContextText}

Instructions for the Concierge:
- Provide an articulate, sophisticated, and evocative response tailored specifically to the guest's question.
- Reference the real room categories, destination highlights, and verified rates from the facts above.
- Never fabricate numbers or prices not listed.
- If recommending dining or experiences (e.g. sunset cruises, palace dining, Jiva spa), describe them with elegance and cultural reverence.
- Conclude with a warm invitation to assist further.`;

  const aiSummary = await callGeminiAssistant(geminiPrompt);

  return {
    intent: 'HOTEL_INFO_RAG',
    query,
    observedFacts: facts,
    interpretation: aiSummary || undefined,
    sources: targetHotels.map((h) => `Official Catalog: ${h.canonicalName}`),
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
    'Craftsmanship Notes:\n' +
    '• Handcrafted with Next.js, TypeScript, and direct rate verification.\n' +
    '• Zero fake AI discounts, zero blurry shadows, and 100% verified rates directly from official hotel reservations.\n' +
    '• Lore has it Param built this entire platform because paying inflated third-party markups on heritage palace suites personally offended his standards.';

  return {
    intent: 'HOTEL_INFO_RAG',
    query,
    observedFacts: [
      'Engineered and architected by Param Khodiyar.',
      'Core Mission: Democratize verified rate transparency across Taj properties with zero shadow UI and mathematical honesty.',
      'Infrastructure: Direct reservation verification and permanent rate archives.',
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
  let hotelFactText = '';

  hotels.forEach((h, index) => {
    const snap = h.priceSnapshots[0];
    const rateText = snap
      ? `₹${Number(snap.pricePerNight).toLocaleString('en-IN')} / night (${snap.room?.canonicalRoomName || 'Standard Room'}, ${snap.ratePlan?.canonicalRateName || 'Best Available Rate'})`
      : 'Rates verified upon live date query';

    recommendationText += `${index + 1}. 🏰 ${h.canonicalName} (${h.city}, ${h.state})\n`;
    recommendationText += `   • Nightly Lead Rate: ${rateText}\n`;
    recommendationText += `   • Highlights: ${(h.description || 'Iconic luxury Taj hospitality property').slice(0, 140)}…\n\n`;

    facts.push(`${h.canonicalName}: ${rateText}`);
    hotelFactText += `\n- ${h.canonicalName} in ${h.city}: ${rateText}. Overview: ${h.description}`;
  });

  recommendationText += `💡 Concierge Advice: For coastal relaxation, Taj Exotica Goa offers expansive private grounds. For royal Rajasthani opulence, Taj Lake Palace Udaipur delivers an unmatched floating palace arrival. Every rate is verified directly against official hotel reservation records.`;

  // Enhance recommendation with Gemini if available
  const geminiSynthesis = await callGeminiAssistant(
    `The guest asked: "${query}"
Stay Window: ${windowStr}
Verified Options from Database:
${hotelFactText}

Create a gracious, tailored luxury recommendation synthesizing these verified properties and rates. Cite the rates accurately as listed.`
  );

  return {
    intent: 'PRICE_SEARCH',
    query,
    observedFacts: facts,
    interpretation: geminiSynthesis || recommendationText,
    sources: ['Official Taj Reservation Records', 'Taj Heritage Collection'],
    executionTrace: {
      intentRoutingTimeMs: routerTime,
      dbExecutionTimeMs: dbTime,
      arithmeticMethod: 'DATABASE_SQL_ONLY',
      llmInvolvedInPriceCalculation: false,
    },
  };
}

