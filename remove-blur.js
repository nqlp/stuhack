(() => {
'use strict';
const attempted = new WeakMap();
StuHack.register(() => {
document.querySelectorAll('.page-content:not(.nofilter)').forEach(page => page.classList.add('nofilter'));
document.querySelectorAll('.blurred-container').forEach(container => {
const image = container.querySelector('img');
if (!image) return;
const source = image.currentSrc || image.src;
if (!source || attempted.get(image) === source) return;
const candidate = new URL(source, document.baseURI);
if (!candidate.pathname.includes('/blurred/')) return;
candidate.pathname = candidate.pathname.replace('/blurred/', '/');
attempted.set(image, source);
const probe = new Image();
probe.onload = () => {
if (!image.isConnected || (image.currentSrc || image.src) !== source) return;
image.removeAttribute('srcset');
image.src = candidate.href;
image.classList.add('bi', 'x0', 'y0', 'w1', 'h1');
container.classList.remove('blurred-container');
};
probe.onerror = () => console.info('[StuHack] An unblurred image is unavailable; keeping the original preview.');
probe.src = candidate.href;
});
});
})();