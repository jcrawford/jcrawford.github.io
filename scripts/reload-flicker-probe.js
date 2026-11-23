#!/usr/bin/env node
/** Reload flicker probe: load, settle, RELOAD same tab, capture layout shifts.
 *  Mirrors Joseph's report action: hit reload while the page is open.
 *  node scripts/reload-flicker-probe.js <url> */
const WebSocket = require('ws');
const URL_TO_CHECK = process.argv[2];
if (!URL_TO_CHECK) {
  console.error('usage: node scripts/reload-flicker-probe.js <url>');
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
  await send('Page.navigate', { url: URL_TO_CHECK });
  await sleep(9000); // settle fully — this is the "page is open" state

  const collect = `(async () => {
    const shifts = await new Promise((resolve) => {
      const entries = [];
      try {
        const obs = new PerformanceObserver((list) => entries.push(...list.getEntries()));
        obs.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => { obs.disconnect(); resolve(entries); }, 600);
      } catch (e) { resolve(entries); }
    });
    const summary = shifts
      .filter(s => s.value > 0.01)
      .map(s => ({
        v: Number(s.value.toFixed(4)),
        t: Math.round(s.startTime),
        src: (s.sources || []).map(s2 => s2.node ? (s2.node.nodeName + (typeof s2.node.className === 'string' && s2.node.className ? '.' + s2.node.className.split(' ')[0] : '')) : '?').slice(0, 3),
      }));
    return JSON.stringify({ count: summary.length, total: Number(shifts.reduce((a, s) => a + s.value, 0).toFixed(3)), summary });
  })()`;

  const evalRes = async () => {
    const res = await send('Runtime.evaluate', { expression: collect, returnByValue: true, awaitPromise: true });
    return res.result.value;
  };

  // 1) capture shifts from the initial load (buffered window)
  console.log('INITIAL LOAD :', await evalRes());

  // 2) RELOAD the same tab — Gatsby dev client re-runs; capture fresh shifts
  await send('Page.reload', { ignoreCache: true });
  await sleep(9000);
  console.log('RELOAD       :', await evalRes());

  // second reload to check consistency
  await send('Page.reload', { ignoreCache: true });
  await sleep(9000);
  console.log('RELOAD 2     :', await evalRes());

  ws.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
