const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined, headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<style>.pf {width:650px;height:840px;background:white} .pc {display:none} .page-content {filter:blur(5px)} body {background:#ccc}</style><h1>Print regression fixture</h1><div id="page-container">\n<div style="height:1px;visibility:hidden"></div>\n<div class="pf"><div class="page-content"><div class="pc" style="display:none"><h2>Question one</h2><p>This document page must be visible.</p></div></div></div>\n<div class="pf"><div class="page-content"><div class="pc"><h2>Question two</h2></div></div></div></div>');
    for (const file of ['runtime.js','remove-banner.js','remove-blur.js','doc-viewer.js']) await page.addScriptTag({path:path.join(__dirname,'..',file)});
    await page.addStyleTag({content: '#page-container .pc { font-family:monospace; font-size:19px; padding-left:37px; }'});
    await page.locator('#page-container').evaluate(el => { const missing = document.createElement('div'); missing.className = 'page-content'; el.append(missing); });
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#stuhack-print-button').click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(await popup.locator('.stuhack-print-page').count(),2);
    assert.match(await popup.locator('#stuhack-export-status').textContent(), /2.*3/);
    assert.equal(await popup.locator('.pc').first().evaluate(el => getComputedStyle(el).paddingLeft),'37px');
    assert.equal(await popup.locator('.pc').first().evaluate(el => getComputedStyle(el).fontSize),'19px');
    assert.equal(await popup.locator('h2').first().isVisible(),true);
    assert.equal(await popup.locator('h2').nth(1).isVisible(),true);
    assert.equal(await popup.locator('.page-content').first().evaluate(el => getComputedStyle(el).filter),'none');
    assert.equal(await page.locator('.pc').first().isVisible(),false);
    await popup.emulateMedia({media:'print'});
    assert.equal(await popup.locator('h2').first().isVisible(),true);
    await popup.screenshot({path:path.join(require('node:os').tmpdir(),'stuhack-print-preview-test.png'),fullPage:true});
    await popup.pdf({path:path.join(require('node:os').tmpdir(),'stuhack-print-preview-test.pdf'),preferCSSPageSize:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: Brave renders both previously hidden pages in the popup and print media; source DOM unchanged; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });

