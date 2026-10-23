(() => {
'use strict';
const tasks = new Set();
let pending = false;
const run = () => { pending = false; for (const task of tasks) { try { task(); } catch (e) { console.warn('[StuHack]', e); } } };
const schedule = () => { if (!pending) { pending = true; setTimeout(run, 100); } };
globalThis.StuHack = { register(task) { tasks.add(task); schedule(); } };
const start = () => {
new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['src','class','style','hidden']});
schedule();
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();