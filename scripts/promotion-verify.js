// Verify promotion: /music/<slug> now hosts the karaoke view; /music-2/ removed.
const WebSocket = require('ws');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
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

  // Desktop viewport
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/' });
  await sleep(5000);
  const desktop = await evalJs(`(() => {
    const btns = [...document.querySelectorAll('button')].map(b => b.textContent.trim());
    const beta = document.querySelector('.hm-music-beta-tag');
    const openBtn = btns.find(t => t === 'Open karaoke view');
    if (!openBtn) return { btn: false };
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Open karaoke view').click();
    return new Promise(res => setTimeout(() => {
      const overlay = document.querySelector('.hm-theater');
      const lines = document.querySelectorAll('.hm-theater-line').length;
      const bodyLock = document.body.classList.contains('hm-theater-open');
      const controls = !!document.querySelector('.hm-theater-controls, .hm-theater [class*="controls"]');
      const closeBtn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '✕');
      if (closeBtn) closeBtn.click();
      setTimeout(() => res({
        btn: true,
        overlay: !!overlay,
        lines,
        bodyLock,
        controls,
        closed: !document.querySelector('.hm-theater'),
        bodyUnlocked: !document.body.classList.contains('hm-theater-open'),
        betaTagGone: !beta,
      }), 400);
    }, 900));
  })()`);

  // Mobile viewport
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send(' Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.navigate', { url: 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/' });
  await sleep(5000);
  const mobile = await evalJs(`(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Open karaoke view');
    return { openBtn: !!btn, betaTag: !!document.querySelector('.hm-music-beta-tag') };
  })()`);

  console.log('DESKTOP /music/:', JSON.stringify(desktop));
  console.log('MOBILE /music/:', JSON.stringify(mobile));
  ws.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
