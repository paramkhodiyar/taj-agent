import { testMalformedPrices } from './malformed-prices.test';
import { testGoldenSuite } from './golden-suite.test';
import { testAnomalyAndDuplicates } from './anomaly-and-duplicates.test';
import { testLintLiveCopy } from './lint-live-copy.test';

async function runAllTests() {
  console.log('=====================================================');
  console.log('Taj Price Intelligence — Comprehensive Test Suite');
  console.log('Enforcing docs/03-DATA-AND-AGENT.md & docs/05-TESTING-AND-RELIABILITY.md');
  console.log('=====================================================\n');

  try {
    // 1. UI Copy Lint
    await testLintLiveCopy();
    console.log('');

    // 2. Malformed Price Formats
    await testMalformedPrices();
    console.log('');

    // 3. Golden Data Fixtures
    await testGoldenSuite();
    console.log('');

    // 4. Anomaly Swing & Duplicate Detection
    await testAnomalyAndDuplicates();
    console.log('');

    console.log('=====================================================');
    console.log('✅ ALL RELIABILITY & ACCURACY TESTS PASSED CLEANLY');
    console.log('=====================================================');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILURE:', error.message);
    process.exit(1);
  }
}

runAllTests();
