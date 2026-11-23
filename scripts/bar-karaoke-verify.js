#!/usr/bin/env node
/**
 * Footer karaoke button probe. From a NON-music page:
 *  1. click a track in... no — cue via the /music/ index? Simplest: visit the
 *     track page, trust-click Play, navigate CLIENT-SIDE to /blog/ via the
 *     footer nav link, confirm the bar still shows the current song
 *  2. click the bar's Karaoke button → .hm-theater overlay open on /blog/
 *  3. body has hm-theater-open
 *  4. close → overlay gone, still on /blog/ (URL unchanged), page interactive
 *
 *  node scripts/bar-karaoke-verify.js
 */
const WebSocket = require('ws');
const PORT = process.env.CDP_PORT || 9222;
const BASE = process.argv[2] || 'http://localhost:8100';
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

  const evalJs = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result.value;
  };
  const trustedClick = async (selector) => {
    const box = await evalJs(`(() => {
      const b = document.querySelector(${JSON.stringify(selector)});
      if (!b) return null;
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
    })()`);
    if (!box) return false;
    const { x, y } = JSON.parse(box);
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
      await sleep(60);
    }
    return true;
  };

  // Step 1: song page, trusted Play click so audio actually starts.
  await send('Page.navigate', { url: `${BASE}/music/she-s-my-wife/` });
  await sleep(8000);
  await trustedClick('.hm-music-single-play');
  await sleep(2000);
  const playing = await evalJs(`!document.querySelector('audio').paused`);
  console.log('STEP1 playing on song page:', playing);

  // Step 2: client-side navigate away via a visible link (the headless
  // emulated-viewport hides top-nav entries behind a hamburger, so use the
  // first sized in-site link that is not the current music track).
  const navTarget = await evalJs(
    `(() => {
      const cands = Array.from(document.querySelectorAll('a')).filter((a) => {
        const href = a.getAttribute('href') || '';
        const r = a.getBoundingClientRect();
        return href.startsWith('/') && !href.startsWith('/music') && r.width > 10 && r.height > 5;
      });
      const target = cands[0];
      if (!target) return null;
      return target.getAttribute('href');
    })()`
  );
  console.log('STEP2 nav candidate:', navTarget);
  // A click on a real <a> href from CDP is trusted; Gatsby's Link intercepts
  // real clicks. Use the trusted mouse path on the element's coordinates via
  // the shared helper by temporarily naming the selector.
  const navOk = navTarget ? await trustedClick(`a[href="${navTarget}"]`) : false;
  console.log('STEP2 nav link found + clicked:', navOk);
  await sleep(4000);
  const afterNav = await evalJs(
    `JSON.stringify({ path: location.pathname, barTrack: (document.querySelector('.hm-music-bar-title') || {}).textContent || null, playing: document.querySelector('audio') ? !document.querySelector('audio').paused : null, barButtons: Array.from(document.querySelectorAll('.hm-music-bar-side button')).map(b => (b.textContent || '').trim()) })`
  );
  console.log('STEP2 state:', afterNav);

  // Step 3: open the theater from the footer bar.
  const karaokeClicked = await trustedClick('.hm-music-btn-karaoke');
  await sleep(1500);
  const theaterState = await evalJs(
    `JSON.stringify({ open: !!document.querySelector('.hm-theater'), bodyLocked: document.body.classList.contains('hm-theater-open'), path: location.pathname, title: (document.querySelector('.hm-theater-title') || {}).textContent || null })`
  );
  console.log('STEP3 theater:', theaterState, '| clicked:', karaokeClicked);

  // Step 4: close, expect same page, no navigation residue.
  await trustedClick('.hm-theater-close');
  await sleep(1500);
  const afterClose = await evalJs(
    `JSON.stringify({ theaterGone: !document.querySelector('.hm-theater'), bodyUnlocked: !document.body.classList.contains('hm-theater-open'), path: location.pathname, playing: document.querySelector('audio') ? !document.querySelector('audio').paused : null, barBack: !!document.querySelector('.hm-music-bar') })`
  );
  console.log('STEP4 after close:', afterClose);

  const s2 = JSON.parse(afterNav);
  const s3 = JSON.parse(theaterState);
  const s4 = JSON.parse(afterClose);
  const ok = null; // verdict assembled below
  const verdict =
    playing &&
    s2.barTrack &&
    s2.playing &&
    Array.isArray(s2.barButtons) &&
    s2.barButtons.some((t) => t.toLowerCase().includes('karaoke')) &&
    s3.open &&
    s3.bodyLocked &&
    !s3.path.includes('/music/') &&
    s3.title &&
    s4.theaterGone &&
    s4.bodyUnlocked &&
    s4.path === s2.path &&
    s4.barBack
      ? 'PASS — bar Karaoke opens overlay on a non-music page; close returns, no navigation'
      : 'FAIL — see steps above';
  console.log('VERDICT:', verdict);
  ws.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
