#!/usr/bin/env node
/** Reusable mobile layout audit: pass a URL, get overflow/element-visibility verdict.
 *  node scripts/post-mobile-check.js <url> [extraSelector1 extraSelector2 ...]
 *  Exit 0 = pass, 1 = fail (overflow or selector off-screen). */
const WebSocket = require('ws');
const PORT = Number(process.env.CDP_PORT || 9222);
const url = process.argv[2];
const selectors = process.argv.slice(3);
if (!url) {
  console.error('usage: node scripts/post-mobile-check.js <url> [selectors...]');
  process.exit(2);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await new Promise((r) => ws.on('open', r));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url });
  await sleep(9000);
  const selJson = JSON.stringify(selectors);
  const expr = `(async () => {
    const selectors = ${selJson};
    const doc = document.documentElement;
    const out = { horizontalOverflow: doc.scrollWidth > doc.clientWidth + 2, clientW: doc.clientWidth, els: [] };
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (!el) { out.els.push({ s, found: false }); continue; }
      const r = el.getBoundingClientRect();
      out.els.push({ s, found: true, w: Math.round(r.width), inView: r.left >= -2 && r.right <= doc.clientWidth + 2 });
    }
    return JSON.stringify(out);
  })()`;
  const raw = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  const res = JSON.parse(raw.result.value);
  const missing = res.els.filter((e) => !e.found);
  const offscreen = res.els.filter((e) => e.found && !e.inView);
  const fail = res.horizontalOverflow || missing.length > 0 || offscreen.length > 0;
  console.log(JSON.stringify(res, null, 1));
  console.log(fail ? 'VERDICT: FAIL' : 'VERDICT: PASS — no horizontal overflow, all elements in view at 390px');
  await send('Emulation.clearDeviceMetricsOverride');
  ws.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
