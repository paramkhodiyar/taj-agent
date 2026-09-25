import fs from 'fs';
import path from 'path';
import { normalize_inventory } from '../agent/normalization';
import { validate_inventory } from '../agent/validationEngine';

export async function testGoldenSuite() {
  console.log('Running Golden Data Fixture Suite (05-TESTING-AND-RELIABILITY.md §3)...');

  const fixturePath = path.join(process.cwd(), 'test/fixtures/golden-bookings.json');
  const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  for (const f of fixtures) {
    console.log(`\nEvaluating Golden Fixture: "${f.name}"...`);

    const normalized = normalize_inventory(f.raw, f.hotelId, f.search);

    // Verify normalization
    if (normalized.canonicalRoomName !== f.expected.canonicalRoomName) {
      throw new Error(
        `Room mapping failed. Expected "${f.expected.canonicalRoomName}", got "${normalized.canonicalRoomName}"`
      );
    }
    if (normalized.canonicalRateName !== f.expected.canonicalRateName) {
      throw new Error(
        `Rate mapping failed. Expected "${f.expected.canonicalRateName}", got "${normalized.canonicalRateName}"`
      );
    }
    if (normalized.currency !== f.expected.currency) {
      throw new Error(`Currency mismatch: expected ${f.expected.currency}, got ${normalized.currency}`);
    }
    if (normalized.pricePerNight !== f.expected.pricePerNight) {
      throw new Error(
        `Nightly price mismatch: expected ${f.expected.pricePerNight}, got ${normalized.pricePerNight}`
      );
    }
    if (f.expected.totalPrice && normalized.totalPrice !== f.expected.totalPrice) {
      throw new Error(
        `Total price mismatch: expected ${f.expected.totalPrice}, got ${normalized.totalPrice}`
      );
    }
    if (normalized.isFlexible !== f.expected.isFlexible) {
      throw new Error(
        `Flexibility mismatch: expected ${f.expected.isFlexible}, got ${normalized.isFlexible}`
      );
    }

    // Verify validation engine output
    const validation = await validate_inventory([normalized], { checkHistoricalAnomalies: false });
    if (!validation.allValid) {
      throw new Error(`Validation failed for golden fixture: ${validation.items[0]?.reason}`);
    }
    if (validation.items[0].state !== f.expected.verificationState) {
      throw new Error(
        `Verification state mismatch: expected ${f.expected.verificationState}, got ${validation.items[0].state}`
      );
    }

    console.log(`✓ Fixture "${f.name}" passed all expectations:`);
    console.log(`  - Room: ${normalized.canonicalRoomName} (${normalized.sourceRoomName})`);
    console.log(`  - Rate: ${normalized.canonicalRateName}`);
    console.log(`  - Nightly: ₹${normalized.pricePerNight}, Total: ₹${normalized.totalPrice}`);
    console.log(`  - State: ${validation.items[0].state}`);
  }

  console.log('\n✓ All golden fixtures passed regression harness.');
}

if (process.argv[1]?.includes('golden-suite.test')) {
  testGoldenSuite().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
