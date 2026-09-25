import fs from 'fs';
import path from 'path';

export async function testLintLiveCopy() {
  console.log("Enforcing UI Copy Rule: 'Never advertise Live Price unless a fresh fetch is active' (05-TESTING-AND-RELIABILITY.md §5)...");

  const scanDirs = ['components', 'app'];
  const disallowedPatterns = [
    /\blive\s+price\b/i,
    /\blive\s+prices\b/i,
    /\blive\s+rate\b/i,
    /\blive\s+rates\b/i,
  ];

  let violationsCount = 0;

  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && /\.(tsx|jsx|ts|js)$/.test(entry.name)) {
        // Skip test files themselves
        if (fullPath.includes('test/')) continue;

        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          for (const pattern of disallowedPatterns) {
            if (pattern.test(line)) {
              // Ignore comments discussing the rule itself
              if (line.includes('01-PRODUCT-AND-UI.md') || line.includes('05-TESTING-AND-RELIABILITY.md')) {
                continue;
              }
              console.error(
                `❌ VIOLATION in ${fullPath}:${idx + 1}: Found forbidden pattern "${pattern}":\n   ${line.trim()}`
              );
              violationsCount++;
            }
          }
        });
      }
    }
  }

  for (const dir of scanDirs) {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      scanDirectory(fullDir);
    }
  }

  if (violationsCount > 0) {
    throw new Error(
      `UI COPY LINT FAILED: Found ${violationsCount} violation(s) claiming "live price" in UI code. Use "Current verified price" or "Last verified N min ago" per docs/01-PRODUCT-AND-UI.md §3.5.`
    );
  }

  console.log('✓ UI Copy Lint passed: Zero prohibited "live price" claims detected across all components and pages.');
}

if (process.argv[1]?.includes('lint-live-copy.test')) {
  testLintLiveCopy().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
