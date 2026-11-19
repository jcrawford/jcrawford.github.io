// Verify green fill color + tightened row spacing after CSS changes.
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
  await send('Page.navigate', { url: 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/' });
  await sleep(6000);
  const res1 = await evalJs(
    `(() => {
      const row = document.querySelector('.hm-lyric-line');
      const rs = getComputedStyle(row);
      return JSON.stringify({ rowPad: rs.padding, rowLH: rs.lineHeight, rowH: Math.round(row.getBoundingClientRect().height) });
    })()`
  );
  console.log('spacing:', res1);

  await evalJs(
    "[...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play')).click()"
  );
  await sleep(800);
  await evalJs("document.querySelector('audio').currentTime = 18.75");
  await sleep(900);
  const res2 = await evalJs(
    `(() => {
      const w = document.querySelector('.hm-lyric-line.is-current .hm-lyric-word.is-speaking .hm-lyric-word-fill');
      if (!w) return 'no fill found';
      const s = getComputedStyle(w);
      return JSON.stringify({ fillColor: s.color, shadow: s.textShadow.slice(0, 44) });
    })()`
  );
  console.log('fill:', res2);

  // Static song must inherit the same tightened rhythm.
  await send('Page.navigate', { url: 'http://localhost:8100/music/bitingchart9669-don-t-let-the-green-fool-you/' });
  await sleep(6000);
  const res3 = await evalJs(
    `(() => {
      const row = document.querySelector('.hm-lyric-line');
      if (!row) return 'no rows';
      const rs = getComputedStyle(row);
      return JSON.stringify({ rows: document.querySelectorAll('.hm-lyric-line').length, rowH: Math.round(row.getBoundingClientRect().height), rowPad: rs.padding });
    })()`
  );
  console.log('static song spacing:', res3);
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
