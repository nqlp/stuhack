(() => {
  'use strict';
  const getPages = () => [...new Set(Array.from(document.querySelectorAll('#page-container .page-content')).map(content => content.closest('.pf') || content))];
  const hasContent = page => Boolean(page.textContent.trim() || page.querySelector('img[src], canvas, svg, [style*="background-image"]'));

  // Freeze screen styles before moving nodes out of the website's selector context.
  function copyPage(source, output) {
    const clone = source.cloneNode(true);
    const nativePdfLayout = Boolean(source.querySelector('.pc .t'));
    const originals = [source, ...source.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    for (let i = 0; i < originals.length; i++) {
      const original = originals[i];
      const copy = copies[i];
      const computed = getComputedStyle(original);
      if (!nativePdfLayout) for (const property of computed) copy.style.setProperty(property, computed.getPropertyValue(property), 'important');
      copy.style.setProperty('animation', 'none', 'important');
      copy.style.setProperty('transition', 'none', 'important');
      for (const attribute of Array.from(copy.attributes)) {
        if (attribute.name.startsWith('on')) copy.removeAttribute(attribute.name);
      }
      if (original instanceof HTMLImageElement) {
        copy.src = original.currentSrc || original.src;
        copy.removeAttribute('srcset');
        copy.loading = 'eager';
      }
      if (original instanceof HTMLCanvasElement) {
        try {
          const image = output.createElement('img');
          image.src = original.toDataURL();
          image.style.cssText = copy.style.cssText;
          copy.replaceWith(image);
        } catch { throw new Error('Un canevas ne peut pas être copié. Export interrompu pour éviter une page vide.'); }
      }
    }
    clone.querySelectorAll('script, iframe, .banner-wrapper').forEach(node => node.remove());
    for (const content of [clone, ...clone.querySelectorAll('.page-content, .pc')]) {
      content.hidden = false;
      content.style.setProperty('display', 'block', 'important');
      content.style.setProperty('visibility', 'visible', 'important');
      content.style.setProperty('content-visibility', 'visible', 'important');
      content.style.setProperty('filter', 'none', 'important');
    }
    // Detach the page from viewport positioning while retaining its internal layout.
    for (const [key, value] of Object.entries({position:'relative', top:'auto', left:'auto', right:'auto', bottom:'auto', margin:'0', transform:'none', filter:'none'})) clone.style.setProperty(key, value, 'important');
    return clone;
  }

  function downloadDoc() {
    const candidates = getPages();
    const pages = candidates.filter(hasContent);
    if (!pages.length) { alert('Aucune page chargée. Faites défiler le document, puis réessayez.'); return; }
    const preview = window.open('', '_blank');
    if (!preview) { alert('Allow pop-ups for this site to open the print preview.'); return; }
    const output = preview.document;
    output.head.replaceChildren();
    output.body.replaceChildren();
    output.body.classList.add('p2hv');
    output.title = document.querySelector('h1')?.textContent?.trim() || 'Document';
    const base = output.createElement('base');
    base.href = document.baseURI;
    output.head.append(base);
    // Retain font-face declarations; computed inline styles preserve layout selectors.
    document.querySelectorAll('link[rel~="stylesheet"], style:not(.darkreader)').forEach(style => output.head.append(style.cloneNode(true)));
    const css = output.createElement('style');
    css.textContent = `html, body { margin:0 !important; padding:0 !important; height:auto !important; overflow:visible !important; background:white !important; }
      .stuhack-sheet { margin:16px auto; overflow:hidden; background:white; box-sizing:content-box; }
      #stuhack-export-status { display:block; padding:16px; background:#fff4cc; color:#222; font:16px/1.5 system-ui; }
      @media print { #stuhack-export-status { display:none !important; } .stuhack-sheet { margin:0; break-after:page; break-inside:avoid; } .stuhack-sheet:last-child { break-after:auto; } }`;
    output.head.append(css);
    const status = output.createElement('div');
    status.id = 'stuhack-export-status';
    const empty = candidates.length - pages.length;
    status.textContent = `${pages.length} pages avec contenu sur ${candidates.length} détectées. ${empty ? empty + ' pages vides exclues : retournez au document et faites-le défiler pour les charger. ' : ''}Vérifiez ce nombre avec le total annoncé par le document. Chargement des images et polices…`;
    output.body.append(status);
    try {
      pages.forEach((page, index) => {
        const clone = copyPage(page, output);
        clone.classList.add('stuhack-print-page');
        const computed = getComputedStyle(page);
        const width = parseFloat(computed.width) || page.offsetWidth || page.getBoundingClientRect().width || 794;
        const height = Math.max(parseFloat(computed.height) || 0, page.scrollHeight, page.offsetHeight) || 1123;
        const sheet = output.createElement('section');
        sheet.className = 'stuhack-sheet';
        sheet.style.width = width + 'px';
        sheet.style.height = height + 'px';
        sheet.style.page = 'stuhack' + index;
        clone.style.setProperty('width', width + 'px', 'important');
        clone.style.setProperty('height', height + 'px', 'important');
        css.textContent += `\n@page stuhack${index} { size:${width}px ${height}px; margin:0; }`;
        sheet.append(clone);
        output.body.append(sheet);
      });
      const images = Array.from(output.images);
      Promise.allSettled([output.fonts?.ready, ...images.map(image => image.decode())]).then(() => {
        const failed = images.filter(image => !image.naturalWidth).length;
        status.textContent = `${pages.length}/${candidates.length} pages détectées exportées. ${empty ? empty + ' pages vides exclues. ' : ''}${failed ? failed + ' images non chargées. ' : ''}Vérifiez le total et le contenu, puis Ctrl+P → Enregistrer au format PDF. Désactivez les en-têtes et pieds de page; utilisez le format de page CSS si proposé.`;
      });
    } catch (error) { status.textContent = 'Export incomplet : ' + error.message; }
    preview.opener = null;
    preview.focus();
  }
  StuHack.register(() => {
    let button = document.getElementById('stuhack-print-button');
    if (!getPages().length) { button?.remove(); return; }
    if (!button) {
      button = document.createElement('button');
      button.id = 'stuhack-print-button';
      button.type = 'button';
      button.textContent = 'Print loaded pages';
      button.title = 'Faites défiler toutes les pages avant de préparer le PDF.';
      button.addEventListener('click', downloadDoc);
      document.body.append(button);
    }
  });
})();
