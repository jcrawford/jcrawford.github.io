// Diagnose flicker: run with CDP on 9222 (mobile emulated).
// Samples per frame: DOM mutations to lyric rows + style recalc churn.
// Reports which attributes change every frame (the flicker source).
const WebSocket = require('ws');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params }));
  });
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  const evalJs = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result.value;

  await send('Page.enable');
  await send('Log.enable');
  const logs = [];
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.method === 'Log.entryAdded' && m.params.entry.source === 'rendering') {
      logs.push(`[${m.params.entry.level}] ${m.params.entry.text.slice(0, 160)}`);
    }
    if (m.method === 'Log.entryAdded' && String(m.params.entry.text || '').match(/clip|paint|layer|layout/)) {
      logs.push(`[rndr] ${m.params.entry.text.slice(0, 160)}`);
    }
  });

  await send('Page.navigate', { url: 'http://localhost:8100/music-2/joseph-crawford-she-s-my-wife/' });
  await sleep(6000);
  // Play in theater
  await evalJs("[...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play')).click()");
  await sleep(1000);

  // Count style mutations over 3 seconds of playback
  await evalJs(`
    window.__mut = { count: 0, attrs: {}, sample: [] };
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        window.__mut.count++;
        const key = m.attributeName || m.type;
        window.__mut.attrs[key] = (window.__mut.attrs[key] || 0) + 1;
        if (window.__mut.sample.length < 8) window.__mut.sample.push(
          (m.target.className || m.target.tagName || '').toString().slice(0, 60) + ' @' + key
        );
      }
    });
    obs.observe(document.querySelector('.hm-theater-lyrics') || document.body, { attributes: true, childList: true, subtree: true, attributeOldValue: false });
  `);
  await sleep(3000);
  const mut = await evalJs('JSON.stringify(window.__mut)');
  const parsed = JSON.parse(mut);
  console.log('3s mutations:', parsed.count);
  console.log('by attribute:', JSON.stringify(parsed.attrs));
  parsed.sample.forEach(s => console.log('  e.g.', s));
  if (logs.length) { console.log('rendering warnings:'); logs.slice(0, 8).forEach(l => console.log(' ', l)); }
  else console.log('rendering warnings: none');
  ws.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
