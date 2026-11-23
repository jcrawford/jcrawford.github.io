#!/usr/bin/env node
/** Count + source layout-shift events (visual flicker) during page load.
 *  node scripts/layout-shift-probe.js <url> */
const WebSocket = require('ws');
const URL_TO_CHECK = process.argv[2];
if (!URL_TO_CHECK) {
  console.error('usage: node scripts/layout-shift-probe.js <url>');
  process.exit(2);
}
const PORT = process.env.CDP_PORT || 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 64 * 1024 * 1024 });
  let id = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });
  await send('Page.enable');
  await send('Runtime.enable');

  // Install the observer BEFORE navigation so first paint shifts are captured.
  await send('Page.navigate', { url: 'about:blank' });
  await sleep(800);
  await send('Page.navigate', { url: URL_TO_CHECK });
  // wait for load, then ask for the buffered shift entries
  await sleep(9000);

  const res = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const shifts = await new Promise((resolve) => {
        const entries = [];
        if (!PerformanceObserver) { resolve(entries); return; }
        try {
          const obs = new PerformanceObserver((list) => entries.push(...list.getEntries()));
          obs.observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => { obs.disconnect(); resolve(entries); }, 500);
        } catch (e) { resolve(entries); }
      });
      const summary = shifts
        .filter(s => s.value > 0.01)
        .map(s => ({
          v: Number(s.value.toFixed(4)),
          t: Math.round(s.startTime),
          sources: (s.sources || []).map(src => ({
            node: src.node ? (src.node.nodeName + (src.node.className && typeof src.node.className === 'string' ? '.' + src.node.className.split(' ')[0] : '') + (src.node.id ? '#' + src.node.id : '')) : '?',
            rect: src.node ? ((r => [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)])(src.node.getBoundingClientRect())) : null,
            prev: src.previousRect ? [src.previousRect.x, src.previousRect.y, src.previousRect.width, src.previousRect.height] : null,
          })).slice(0, 4),
        }));
      return JSON.stringify({ count: summary.length, total: Number(shifts.reduce((a, s) => a + s.value, 0).toFixed(3)), summary }, null, 1);
    })()`,
  });
  console.log(res.result.value);
  ws.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
