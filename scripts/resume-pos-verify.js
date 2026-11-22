/**
 * resume-pos-verify.js — prove pause/leave/return/resume keeps position.
 * 1. Open track page, trusted-click page Play, listen ~7s (>= one 5s save).
 * 2. Trusted-click Pause. Navigate away to /music/ and back to the track page
 *    (real page load, so the child cue() ordering runs like Joseph's flow).
 * 3. Trusted-click Play. currentTime must be near the saved position (> 4),
 *    NOT 0.
 */
const http = require('http');
const WebSocket = require(require('path').join(process.cwd(), 'node_modules', 'ws'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const get = (p) =>
    new Promise((res, rej) => {
      http.get({ host: '127.0.0.1', port: 9222, path: p }, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

  const targets = await get('/json/list');
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r) => ws.on('open', r));
  let id = 0;
  const pend = new Map();
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pend.has(m.id)) {
      pend.get(m.id)(m);
      pend.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const mid = ++id;
      pend.set(mid, res);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  const PAGE = 'http://localhost:8100/music/the-man-i-m-trying-to-be/';
  const clickPlayBtn = async () => {
    // Page play button toggles: isCurrent -> toggle(). Label flips with state.
    // Scroll it clear of the dock first (short headless viewports hide it under
    // the transport bar), then verify the click point really hits the button.
    await ev(`(() => {
      const b = [...document.querySelectorAll('button')].find(x => /^(▶ Play|❚❚ Pause)$/.test(x.textContent.trim()));
      if (b) b.scrollIntoView({ block: 'center' });
      return 'ok';
    })()`);
    await sleep(300);
    const pos = await ev(`(() => {
      const b = [...document.querySelectorAll('button')].find(x => /^(▶ Play|❚❚ Pause)$/.test(x.textContent.trim()));
      if (!b) return null;
      const r = b.getBoundingClientRect();
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      return {
        x: cx,
        y: cy,
        label: b.textContent.trim(),
        hit: top ? top.closest('button') === b : false,
      };
    })()`);
    if (!pos || !pos.hit) throw new Error(`page play button not clickable: ${JSON.stringify(pos)}`);
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    }
    return pos.label;
  };

  await send('Page.enable');
  // Fresh slate for the position keys
  await send('Page.navigate', { url: PAGE });
  await sleep(4500);
  await ev(`window.localStorage.removeItem('hm-music-pos'); 'cleared'`);

  const l1 = await clickPlayBtn();
  await sleep(7000); // crosses the 5 s persist threshold
  const midState = await ev(`({ t: document.querySelector('audio').currentTime.toFixed(2), paused: document.querySelector('audio').paused })`);
  const l2 = await clickPlayBtn(); // pause
  await sleep(600);
  const pausedState = await ev(`({ t: document.querySelector('audio').currentTime.toFixed(2), paused: document.querySelector('audio').paused })`);
  console.log(`play(${l1}) -> t=${midState.t}; pause(${l2}) -> t=${pausedState.t} paused=${pausedState.paused}`);

  // Leave the page and come back — full navigation both ways.
  await send('Page.navigate', { url: 'http://localhost:8100/music/' });
  await sleep(3500);
  await send('Page.navigate', { url: PAGE });
  await sleep(4500);

  await clickPlayBtn();
  await sleep(1200);
  const resumed = await ev(`({ t: document.querySelector('audio').currentTime.toFixed(2), paused: document.querySelector('audio').paused })`);
  const ok = !resumed.paused && Number(resumed.t) > 4;
  console.log(`${ok ? 'PASS' : 'FAIL'} resume t=${resumed.t} (expected > 4, stored pos ~${pausedState.t}) paused=${resumed.paused}`);
  process.exit(ok ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
