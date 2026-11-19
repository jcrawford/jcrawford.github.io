// Verify the karaoke theater end-to-end on a MOBILE viewport:
// 1) /music-2/<slug> page loads with KARAOKE BETA tag
// 2) tapping Play opens the theater overlay (black stage, big lyrics)
// 3) word fill paints with green color inside the theater
// 4) close (✕) unwraps back to the page; body class removed
// 5) player bar/support bar suppressed while open
const WebSocket = require('ws');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PORT = process.env.CDP_PORT || 9222;

(async () => {
  // Fresh mobile-emulating tab
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
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
  // Emulate a phone (iPhone-ish metrics + coarse pointer + touch)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' });

  await send('Page.navigate', { url: 'http://localhost:8100/music-2/joseph-crawford-she-s-my-wife/' });
  await sleep(6500);

  const pageState = await evalJs(`JSON.stringify({
    betaTag: !!document.querySelector('.hm-music-beta-tag'),
    playBtn: !!document.querySelector('.hm-music-single-play'),
    desktopTheaterBtn: [...document.querySelectorAll('button')].some(b => b.textContent.includes('Open karaoke view')),
    vw: window.innerWidth
  })`);
  console.log('PAGE:', pageState);

  // Tap Play (mobile => should open theater)
  await evalJs(
    "[...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play')).click()"
  );
  await sleep(1200);

  const theaterState = await evalJs(`JSON.stringify({
    overlay: !!document.querySelector('.hm-theater'),
    bodyLocked: document.body.className.includes('hm-theater-open'),
    barHidden: getComputedStyle(document.querySelector('.hm-music-bar') || document.body).display === 'none',
    lines: document.querySelectorAll('.hm-theater-line').length,
    currentLine: document.querySelector('.hm-theater-line.is-current')?.textContent.trim().slice(0, 34) || null,
    fontPx: (() => { const l = document.querySelector('.hm-theater-line'); return l ? Math.round(parseFloat(getComputedStyle(l).fontSize)) : null; })(),
    overlayHeightPx: (() => { const t = document.querySelector('.hm-theater'); return t ? Math.round(t.getBoundingClientRect().height) : null; })(),
    controls: !!document.querySelector('.hm-theater-controls'),
    closeBtn: !!document.querySelector('.hm-theater-close')
  })`);
  console.log('THEATER:', theaterState);

  // Word fill inside theater: pause + seek mid-word, sample clip + color
  await evalJs("document.querySelector('audio').pause()");
  await evalJs("document.querySelector('audio').currentTime = 18.75");
  await sleep(1000);
  const fillState = await evalJs(`(() => {
    const w = document.querySelector('.hm-theater-line.is-current .hm-theater-word-fill');
    if (!w) return JSON.stringify({ fill: false, line: document.querySelector('.hm-theater-line.is-current')?.textContent.trim().slice(0, 30) });
    const s = getComputedStyle(w);
    return JSON.stringify({ fill: true, color: s.color, clip: w.style.clipPath });
  })()`);
  console.log('FILL:', fillState);

  // Close the theater
  await evalJs("document.querySelector('.hm-theater-close').click()");
  await sleep(700);
  const afterClose = await evalJs(`JSON.stringify({
    overlayGone: !document.querySelector('.hm-theater'),
    bodyUnlocked: !document.body.className.includes('hm-theater-open'),
    stillCurrent: document.querySelector('.hm-music-bar')?.className.includes('is-active') || false,
    audioPlaying: (() => { const a = document.querySelector('audio'); return a ? !a.paused : false; })()
  })`);
  console.log('AFTER CLOSE:', afterClose);
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
