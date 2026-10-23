const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.join(__dirname, '..');
const scripts = ['runtime.js', 'remove-banner.js', 'remove-blur.js', 'doc-viewer.js'];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fixture(html = '') {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, { url: 'https://www.studocu.com/en-us/document/test/12345', runScripts: 'outside-only', virtualConsole: vc });
  for (const file of scripts) dom.window.eval(fs.readFileSync(path.join(root, file), 'utf8'));
  await delay(250);
  return { dom, window: dom.window, document: dom.window.document, errors };
}
test('missing viewer and toolbar do not throw', async () => {
  const f = await fixture('<h1>Home</h1>');
  assert.equal(f.errors.length, 0);
  assert.equal(f.document.querySelector('#stuhack-print-button'), null);
  f.window.close();
});
test('late viewer initializes and repeated mutations do not duplicate buttons', async () => {
  const f = await fixture();
  f.document.body.innerHTML = '<div id="page-container"><div class="page-content">First</div></div>';
  await delay(300);
  f.document.querySelector('.page-content').append(' update');
  await delay(300);
  assert.equal(f.document.querySelectorAll('#stuhack-print-button').length, 1);
  assert.equal(f.errors.length, 0);
  f.document.querySelector('#page-container').remove();
  await delay(300);
  assert.equal(f.document.querySelector('#stuhack-print-button'), null);
  f.window.close();
});
test('banner removal preserves sibling document content and whitespace', async () => {
  const f = await fixture('<div id="document-wrapper">\n<div>Keep me</div><div class="banner-wrapper">Banner</div><div id="page-container">\n<div class="page-content">Page</div>\n</div></div>');
  assert.match(f.document.body.textContent, /Keep me/);
  assert.equal(f.document.querySelectorAll('.page-content').length, 1);
  assert.equal(f.document.querySelector('.banner-wrapper'), null);
  f.window.close();
});
test('print preview ignores whitespace and tiny placeholders, keeps pages and title', async () => {
  const f = await fixture('<h1>Exam &amp; answers</h1><div id="page-container">\n<div style="height:1px;visibility:hidden"></div>\n<div class="pf"><div class="page-content"><div class="pc" style="display:none">Question one</div></div></div>\n<div class="pf"><div class="page-content">Question two</div></div></div>');
  const preview = new JSDOM('');
  f.window.open = () => ({document: preview.window.document, focus() {}, opener: f.window});
  const before = f.document.querySelector('#page-container').outerHTML;
  f.document.querySelector('#stuhack-print-button').click();
  assert.equal(preview.window.document.title, 'Exam & answers');
  assert.equal(preview.window.document.querySelectorAll('.stuhack-print-page').length, 2);
  assert.match(preview.window.document.body.textContent, /Question one/);
  assert.equal(preview.window.getComputedStyle(preview.window.document.querySelector('.pc')).display, 'block');
  assert.equal(f.document.querySelector('#page-container').outerHTML, before);
  assert.equal(f.errors.length, 0);
  preview.window.close(); f.window.close();
});
test('blocked popup produces an actionable message', async () => {
  const f = await fixture('<div id="page-container"><div class="page-content">Page</div></div>');
  let message;
  f.window.open = () => null;
  f.window.alert = value => { message = value; };
  f.document.querySelector('#stuhack-print-button').click();
  assert.match(message, /Allow pop-ups/);
  assert.equal(f.errors.length, 0);
  f.window.close();
});
test('failed unblurred image probe keeps the original image', async () => {
  const f = await fixture();
  let attempts = 0;
  f.window.Image = class { set src(value) { attempts++; this.onerror(); } };
  f.document.body.innerHTML = '<div class="blurred-container">\n<img src="https://example.test/blurred/page.png"></div>';
  await delay(400);
  assert.match(f.document.querySelector('img').src, /\/blurred\//);
  assert.ok(f.document.querySelector('.blurred-container'));
  assert.equal(attempts, 1);
  assert.equal(f.errors.length, 0);
  f.window.close();
});
test('successful probe updates only the intended image', async () => {
  const f = await fixture();
  f.window.Image = class { set src(value) { this.onload(); } };
  f.document.body.innerHTML = '<div class="blurred-container">\n<img src="https://example.test/blurred/page.png?x=1"></div>';
  await delay(400);
  assert.equal(f.document.querySelector('img').src, 'https://example.test/page.png?x=1');
  assert.equal(f.document.querySelector('.blurred-container'), null);
  f.window.close();
});
test('manifest lists existing assets and runtime loads first', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.content_scripts[0].js[0], 'runtime.js');
  for (const file of [...manifest.content_scripts[0].js, ...manifest.content_scripts[0].css, ...Object.values(manifest.icons)]) assert.ok(fs.existsSync(path.join(root, file)), file);
});


