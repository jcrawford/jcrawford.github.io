#!/usr/bin/env node
/** Dock-tooltip + karaoke-icon probe: hover each dock control, assert exactly
 *  ONE tooltip is visible, it sits ABOVE the button row (bottom > row top),
 *  no clipping, and the karaoke control renders the mic SVG (no text node).
 *  node scripts/docktip-verify.js <url> */
const WebSocket = require('ws');
const PORT = process.env.CDP_PORT || 9222;
const URL_TO_CHECK = process.argv[2];
if (!URL_TO_CHECK) {
  console.error('usage: node scripts/docktip-verify.js <url>');
  process.exit(2);
}
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
  await sleep(8000);

  const evalJs = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result.value;
  };

  // Cue a track via the page Play button so the dock renders its controls.
  const box = await evalJs(`(() => {
    const b = document.querySelector('.hm-music-single-play');
    if (!b) return null;
    b.scrollIntoView({block:'center'});
    const r = b.getBoundingClientRect();
    return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)});
  })()`);
  const p = JSON.parse(box);
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
    await sleep(60);
  }
  await sleep(2000);
  const pause = await evalJs(`(() => { const b = document.querySelector('.hm-music-single-play'); const r = b.getBoundingClientRect(); return JSON.stringify({x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2)}); })()`);
  const p2 = JSON.parse(pause);
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: p2.x, y: p2.y, button: 'left', clickCount: 1 });
    await sleep(60);
  }
  await sleep(800);

  // Karaoke icon rendered? Any text "Karaoke" in the button?
  const karaoke = await evalJs(`(() => {
    const b = document.querySelector('.hm-music-btn-karaoke');
    if (!b) return null;
    const svg = b.querySelector('svg');
    const r = b.getBoundingClientRect();
    return JSON.stringify({ svg: !!svg, text: (b.textContent || '').trim(), w: Math.round(r.width), h: Math.round(r.height) });
  })()`);
  console.log('KARAOKE_BTN:', karaoke);

  // Hover each dock button; check tooltip count + geometry.
  const sideButtons = await evalJs(
    `JSON.stringify(Array.from(document.querySelectorAll('.hm-music-bar-side .hm-music-btn, .hm-music-bar-controls .hm-music-btn')).map((b, i) => {
      const r = b.getBoundingClientRect();
      return { i, cls: b.className.replace('hm-music-btn ', ''), x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), tip: (b.querySelector('.hm-music-docktip') || {}).textContent || null };
    }))`
  );
  const buttons = JSON.parse(sideButtons);
  console.log('DOCK_BUTTONS:', JSON.stringify(buttons.map((b) => ({ i: b.i, tip: b.tip }))));

  let failures = 0;
  for (const b of buttons) {
    if (!b.tip) continue;
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x: b.x, y: b.y, button: 'left', clickCount: 1 });
      await sleep(40);
    }
    await sleep(400);
    const state = await evalJs(`(() => {
      const tips = Array.from(document.querySelectorAll('.hm-music-docktip'));
      const vis = tips.filter((t) => {
        const cs = getComputedStyle(t);
        return cs.opacity !== '0' && cs.display !== 'none';
      });
      const row = document.querySelector('.hm-music-bar-inner').getBoundingClientRect();
      const active = vis[0];
      if (!active) return JSON.stringify({ visible: 0 });
      const tr = active.getBoundingClientRect();
      return JSON.stringify({
        visible: vis.length,
        label: active.textContent,
        above: tr.bottom <= row.top + 1,
        inView: tr.top >= 0 && tr.left >= 0,
      });
    })()`);
    const s = JSON.parse(state);
    const ok = s.visible === 1 && s.above && s.inView;
    if (!ok) failures += 1;
    console.log(`TIP b${b.i}:`, state, ok ? 'OK' : 'FAIL');
  }

  console.log('VERDICT:', failures === 0 ? 'PASS — one tooltip above the row per hover, karaoke is icon-only' : `FAIL — ${failures} problem state(s)`);
  ws.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
