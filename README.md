# StuHack — PDF export repair

A community fork of the discontinued [isanchop/stuhack](https://github.com/isanchop/stuhack) project. Version **0.5.9** fixes several PDF export and initialization issues in Chromium-based browsers.

## What changed

- Copies stylesheets marked `rel="preload stylesheet"`, which contain essential document fonts and layout rules.
- Preserves the `.p2hv` CSS context and pdf2htmlEX text transforms.
- Uses a print size matched to each document page to avoid extra blank pages.
- Adds a separate **Print loaded pages** button.
- Handles pages added after initial loading and checks for missing elements.
- Reports exported page counts, empty pages, and images that failed to load.
- Keeps the existing preview image when an alternative image cannot be loaded.

## Install in Brave or Chrome

1. Download this repository using **Code → Download ZIP**, then extract it.
2. Open `brave://extensions` or `chrome://extensions`.
3. Disable any older StuHack installation.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the folder containing `manifest.json`.
6. Reload the document tab.

You do not need to run `npm install` to use the extension. The npm dependencies are only for testing.

To update an existing installation, replace the files in its folder, click **Reload** on the extension card, and reload the document tab.

## Export a document

1. Slowly scroll to the last page to load the document content.
2. Click **Print loaded pages** in the bottom-right corner.
3. Check the page count and preview content. A complete count does not guarantee that every image or text layer is available.
4. Wait for images and fonts to finish loading.
5. Use **Ctrl+P → Save as PDF**. Disable headers and footers, and use the CSS page size when offered.

If the browser blocks the preview window, allow pop-ups for the site and try again.

## Validation and limitations

Version 0.5.9 was tested in Brave against a saved HTML copy of a **17-page document**. The exported PDF contained 17 pages, all visually reviewed. Automated regression tests cover delayed viewer loading, missing elements, hidden pages, whitespace nodes, blocked pop-ups, and image-loading failures.

This does not guarantee compatibility with every document or future website update. The extension exports pages present in the viewer; it cannot recover content the server does not provide. It currently depends on the `#page-container .page-content` structure.

Documents, browser captures, signed URLs, and session data used during debugging are not included in this repository. Published tests use synthetic examples only.

## Development and testing

Requires Node.js 24 or later.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

To test with an existing Chromium-based browser, set `BROWSER_EXECUTABLE` to its executable path. PowerShell example for Brave:

```powershell
$env:BROWSER_EXECUTABLE = 'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe'
npm run test:browser
```

The browser test writes its test captures to the system temporary directory. Tests do not download real documents.

## Report an issue

Include the extension version, browser, expected page count, and exported page count. If possible, attach a screenshot with personal information removed. Do not publish cookies, signed URLs, or saved HTML containing session information.

## Credits and license

Original project: [isanchop/stuhack](https://github.com/isanchop/stuhack). Repairs in this fork: [nqlp](https://github.com/nqlp).

The upstream repository has no explicit license file at the revision used (`f0622dc796ccfdc2e1435a3b111d57a8eb0faf70`). This fork does not add a license to the inherited code; publication does not grant new general reuse permissions.
