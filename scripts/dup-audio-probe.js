// Playback overlap probe: play a track on the song page, then watch every
// live <audio> element + Media Session for 14s and report double-play signs.
const WebSocket = require('ws');
const PORT = 9222;
const PAGE = process.argv[2] || 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/';
const WATCH_SECONDS = Number(process.argv[3] || 14);

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
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
  const send = (m, p = {}) => new Promise((res, rej) => {
    const msgId = ++id;
    pending.set(msgId, { resolve: res, reject: rej });
    ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
  });
  await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });
  await send('Runtime.enable');

  const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

  await send('Page.enable');
  await send('Page.navigate', { url: PAGE });
  await new Promise((r) => setTimeout(r, 5000));

  // Click Play via the real button (user-gesture path).
  await evalJs(`(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /Play/.test(b.textContent) && b.className.includes('hm-music-single-play'));
    if (!btn) throw new Error('no play button');
    btn.click();
    return 'clicked';
  })()`);

  // Instrument: log every play/pause/ended on every audio element present now or later.
  await evalJs(`(() => {
    window.__dupLog = [];
    const hook = (a, tag) => {
      const rec = (ev) => window.__dupLog.push({ t: ev.currentTarget.currentTime.toFixed(2), ev: ev.type, tag, src: (a.currentSrc||'').slice(-24) });
      ['play','playing','pause','ended','emptied'].forEach(type => a.addEventListener(type, rec));
    };
    document.querySelectorAll('audio').forEach((a, i) => hook(a, 'pre' + i));
    const mo = new MutationObserver((muts) => {
      document.querySelectorAll('audio').forEach((a) => {
        if (!a.dataset.dupHooked) { a.dataset.dupHooked = '1'; hook(a, 'new'); }
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('audio').forEach((a) => { a.dataset.dupHooked = '1'; });
    return document.querySelectorAll('audio').length;
  })()`);

  const samples = [];
  for (let s = 0; s < WATCH_SECONDS; s += 2) {
    await new Promise((r) => setTimeout(r, 2000));
    samples.push(await evalJs(`JSON.stringify({
      n: document.querySelectorAll('audio').length,
      states: [...document.querySelectorAll('audio')].map(a => ({
        paused: a.paused, t: a.currentTime.toFixed(2), net: a.networkState, ready: a.readyState,
        src: (a.currentSrc || a.src || '').slice(-28)
      })),
      sessPlays: (window.__mediaSessionPlays || 0)
    })`));
  }

  console.log('AUDIO ELEMENTS + STATES OVER TIME:');
  samples.forEach((s, i) => console.log(`  t+${(i + 1) * 2}s ${s}`));
  const log = await evalJs('JSON.stringify(window.__dupLog || [])');
  console.log('EVENT LOG:', log);

  ws.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
