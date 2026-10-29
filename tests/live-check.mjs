// Loads the live playtest site, checks the title and that the hub opens with no errors.
import { chromium } from 'playwright-core';
const URL = process.env.URL || 'https://nhigh723.github.io/fizby-sports/'; const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL); await p.waitForTimeout(1500); await p.evaluate(() => window.__snap.go('hub')); await p.waitForTimeout(500); console.log('title:', await p.title(), 'screen:', await p.evaluate(() => window.__snap.screen), 'errors:', errs.length); await b.close();
