// verify-layout.js
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  
  // 1. Capture unhandled exceptions
  page.on('pageerror', (err) => consoleErrors.push(`Unhandled Exception: ${err.message}`));
  
  // 2. Capture console.error messages (including React Hydration issues)
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`Console Error: ${msg.text()}`);
    }
  });

  const targetUrl = process.env.TARGET_URL || 'http://localhost:3000';

  try {
    console.log(`[Playwright] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
   
    // Capture screenshot
    await page.screenshot({ path: 'clone_snapshot.png', fullPage: true });

    // 3. Process all errors BEFORE exiting
    if (consoleErrors.length > 0) {
      // Check for hydration errors specifically first
      const hydrationErrors = consoleErrors.filter(e => e.includes('Hydration') || e.includes('React error'));
      if (hydrationErrors.length > 0) {
        console.error(`[FAIL] React Hydration Mismatch detected:\n${hydrationErrors.join('\n')}`);
        process.exit(1);
      }
      
      console.error(`[FAIL] Runtime Exceptions / Errors detected:\n${consoleErrors.join('\n')}`);
      process.exit(1);
    }

    console.log("[PASS] Architecture rendered with zero exceptions.");
    process.exit(0);
  } catch (err) {
    console.error(`[FAIL] Playwright Navigation Error: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
