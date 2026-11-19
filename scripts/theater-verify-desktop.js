// Desktop check: /music-2/ on a desktop viewport must show the normal page +
// "Open karaoke view" button; opening it shows the same theater centered.
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
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id;
      pending.set(i, resolve);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    return r.result.value;
  };
  await send('Page.enable');
  // Desktop viewport
  await send('Emulation.clearDeviceMetricsOverride');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });

  await send('Page.navigate', { url: 'http://localhost:8100/music-2/joseph-crawford-she-s-my-wife/' });
  await sleep(6500);
  const d = await evalJs(`JSON.stringify({
    desktopTheaterBtn: [...document.querySelectorAll('button')].some(b => b.textContent.includes('Open karaoke view')),
    vw: window.innerWidth
  })`);
  console.log('DESKTOP PAGE:', d);
  // Click it, verify theater opens even on desktop (manual test path)
  await evalJs("[...document.querySelectorAll('button')].find(b => b.textContent.includes('Open karaoke view')).click()");
  await sleep(900);
  const t = await evalJs(`JSON.stringify({
    overlay: !!document.querySelector('.hm-theater'),
    stageMax: Math.round(document.querySelector('.hm-theater-stage')?.getBoundingClientRect().width || 0),
    fontPx: (l => l ? Math.round(parseFloat(getComputedStyle(l).fontSize)) : null)(document.querySelector('.hm-theater-line'))
  })`);
  console.log('DESKTOP THEATER:', t);
  await evalJs("document.querySelector('.hm-theater-close').click()");
  await sleep(500);
  console.log('closed:', await evalJs("!document.querySelector('.hm-theater')"));
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
