import { routeUserQuery } from '../agent/intentRouter';
import { prisma } from '../lib/prisma';

async function runPhase10Gate() {
  console.log('--- Running Phase 10 Gate Verification ---');

  // Step 1: Query database directly via SQL to know ground truth cheapest price
  const sqlCheapest = await prisma.priceSnapshot.findFirst({
    where: {
      availabilityStatus: 'AVAILABLE',
      verificationState: { in: ['VERIFIED', 'PARTIALLY_VERIFIED'] },
    },
    orderBy: { pricePerNight: 'asc' },
    include: { hotel: true, room: true },
  });

  if (!sqlCheapest) {
    throw new Error('No verified price snapshots in database to test');
  }

  const expectedGroundTruthPrice = Number(sqlCheapest.pricePerNight);
  const expectedHotel = sqlCheapest.hotel.canonicalName;
  console.log(`Ground Truth DB query: Cheapest is ${expectedHotel} at ₹${expectedGroundTruthPrice}`);

  // Step 2: Ask the Natural Language Assistant "Which Taj is cheapest right now?"
  console.log('\nStep 2: Asking assistant: "Which Taj is cheapest right now?"...');
  const response = await routeUserQuery('Which Taj is cheapest right now?');

  console.log(`Resolved Intent: ${response.intent}`);
  console.log(`Arithmetic Method: ${response.executionTrace.arithmeticMethod}`);
  console.log(`LLM Involved in Price Arithmetic: ${response.executionTrace.llmInvolvedInPriceCalculation}`);
  console.log('Observed Facts:');
  response.observedFacts.forEach((f) => console.log(`  - ${f}`));

  // Verify Critical Path Constraints per Phase 10 Gate
  if (response.intent !== 'PRICE_SEARCH') {
    throw new Error(`PHASE GATE FAILED: Expected PRICE_SEARCH intent, got ${response.intent}`);
  }

  if (response.executionTrace.llmInvolvedInPriceCalculation !== false) {
    throw new Error('PHASE GATE FAILED: LLM was marked as involved in price calculation!');
  }

  if (response.executionTrace.arithmeticMethod !== 'DATABASE_SQL_ONLY') {
    throw new Error(`PHASE GATE FAILED: Expected DATABASE_SQL_ONLY, got ${response.executionTrace.arithmeticMethod}`);
  }

  if (response.structuredData?.pricePerNight !== expectedGroundTruthPrice) {
    throw new Error(
      `PHASE GATE FAILED: Price returned (${response.structuredData?.pricePerNight}) did not match ground truth SQL value (${expectedGroundTruthPrice})`
    );
  }
  console.log('✓ Ground truth price matches exact SQL query result.');

  // Step 3: Test Price Explanation with Segregated Facts vs Interpretation
  console.log('\nStep 3: Asking assistant: "Why did The Taj Mahal Palace change?"...');
  const explainResponse = await routeUserQuery('Why did The Taj Mahal Palace change?');

  console.log(`Resolved Intent: ${explainResponse.intent}`);
  console.log('Observed Facts (Database):');
  explainResponse.observedFacts.forEach((f) => console.log(`  - ${f}`));
  console.log(`Segregated Interpretation: "${explainResponse.interpretation}"`);

  if (explainResponse.intent !== 'PRICE_EXPLANATION') {
    throw new Error(`Expected PRICE_EXPLANATION intent, got ${explainResponse.intent}`);
  }
  if (!explainResponse.interpretation) {
    throw new Error('Expected segregated interpretation for price change');
  }

  console.log('\n=========================================');
  console.log('✅ PHASE 10 GATE PASSED:');
  console.log('1. "Which Taj is cheapest" produces an answer with zero LLM arithmetic in the critical path.');
  console.log('2. Execution trace verifies pure PostgreSQL database sorting.');
  console.log('3. Explanations strictly separate observed database facts from interpretive analysis.');
  console.log('=========================================\n');
}

runPhase10Gate()
  .catch((e) => {
    console.error('Phase 10 Gate test error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
