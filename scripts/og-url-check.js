const WebSocket = require('ws');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map();
  ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, { resolve, reject }); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise((r) => ws.on('open', r));
  const check = async (url, label) => {
    await send('Page.navigate', { url });
    await sleep(9000);
    const r = await send('Runtime.evaluate', { expression: `(() => {
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const ogType = document.querySelector('meta[property="og:type"]');
      return JSON.stringify({ canonical: canonical ? canonical.href : null, ogUrl: ogUrl ? ogUrl.content : null, ogType: ogType ? ogType.content : null });
    })()`, returnByValue: true });
    console.log(label, r.result.value);
  };
  await check('http://localhost:8100/brewing/mead-numbers-replication-not-judgment/', 'BREWING_ARTICLE:');
  await check('http://localhost:8100/posts/disney-vacation-2026/', 'REGULAR_POST:');
  await check('http://localhost:8100/reviews/', 'SKIP_REVIEW_INDEX');
  ws.close(); process.exit(0);
})();
