import { parse_price } from '../agent/extractors/priceExtractor';

export async function testMalformedPrices() {
  console.log('Testing malformed and edge-case price parsing (05-TESTING-AND-RELIABILITY.md §1)...');

  const cases: Array<{ input: string; expectedAmount: number; isPlusTaxes?: boolean }> = [
    { input: '₹25,000', expectedAmount: 25000 },
    { input: '25,000', expectedAmount: 25000 },
    { input: '25k', expectedAmount: 25000 },
    { input: '25.5k', expectedAmount: 25500 },
    { input: '₹25.000', expectedAmount: 25000 },
    { input: '₹25,000 + taxes', expectedAmount: 25000, isPlusTaxes: true },
    { input: '₹ 1,25,000', expectedAmount: 125000 },
    { input: '25000.50', expectedAmount: 25000.5 },
    { input: 'INR 35,000 / night', expectedAmount: 35000 },
    { input: '₹45,000 plus applicable taxes', expectedAmount: 45000, isPlusTaxes: true },
  ];

  for (const c of cases) {
    const res = parse_price(c.input);
    if (!res.isValid || res.amount !== c.expectedAmount) {
      throw new Error(
        `Price parsing failed for "${c.input}". Expected ${c.expectedAmount}, got ${res.amount}`
      );
    }
    if (c.isPlusTaxes !== undefined && res.isPlusTaxes !== c.isPlusTaxes) {
      throw new Error(`isPlusTaxes failed for "${c.input}". Expected ${c.isPlusTaxes}, got ${res.isPlusTaxes}`);
    }
    console.log(`✓ "${c.input}" -> ₹${res.amount} (isPlusTaxes: ${res.isPlusTaxes})`);
  }

  // Test invalid/empty inputs
  const invalidCases = ['', 'abc', '-500', null, undefined];
  for (const inv of invalidCases) {
    const res = parse_price(inv as any);
    if (res.isValid && res.amount !== null && res.amount > 0) {
      throw new Error(`Invalid price input "${inv}" was erroneously accepted!`);
    }
  }
  console.log('✓ Invalid and empty inputs safely rejected with amount=null.');
}

if (process.argv[1]?.includes('malformed-prices.test')) {
  testMalformedPrices().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
