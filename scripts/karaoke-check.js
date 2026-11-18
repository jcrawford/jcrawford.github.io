// CDP harness: loads a song page, clicks Play with a trusted mouse event to
// unlock audio, then samples which lyric line is highlighted as time advances.
const WebSocket = require('ws');

const URL_TO_CHECK = process.argv[2] || 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/';
const PORT = process.env.CDP_PORT || 9222;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  let page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');

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

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: URL_TO_CHECK });
  await sleep(7000);

  const evalJs = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result.value;
  };

  const lineCount = await evalJs("document.querySelectorAll('.hm-lyric-line').length");
  console.log('LYRIC_LINES:', lineCount);

  // Real (trusted) mouse click on the Play button — grants user activation.
  const box = await evalJs(`(() => {
    const b = document.querySelector('.hm-music-single-play');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
  })()`);
  if (!box) throw new Error('play button not found');
  const { x, y } = JSON.parse(box);

  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', {
      type, x, y, button: 'left', clickCount: 1,
    });
    await sleep(60);
  }

  const sample = async () => {
    const raw = await evalJs(`JSON.stringify({
      playing: !document.querySelector('audio') ? null : !document.querySelector('audio').paused,
      t: document.querySelector('audio') ? Number(document.querySelector('audio').currentTime.toFixed(2)) : null,
      current: (document.querySelector('.hm-lyric-line.is-current') || {}).textContent || null,
      past: document.querySelectorAll('.hm-lyric-line.is-past').length
    })`);
    return JSON.parse(raw);
  };

  const samples = [];
  for (let i = 0; i < 7; i += 1) {
    samples.push(await sample());
    await sleep(1600);
  }

  samples.forEach((s, i) => console.log(`T${i}:`, JSON.stringify(s)));

  const actives = new Set(samples.map((s) => s.current).filter(Boolean));
  console.log('DISTINCT_ACTIVE_LINES:', actives.size);
  console.log('MOVED:', actives.size > 1 ? 'YES' : 'NO');

  // Pause via the same button, confirm playback stops.
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(60);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await sleep(900);
  console.log('AFTER_PAUSE_CLICK:', JSON.stringify(await sample()));

  ws.close();
})().catch((error) => {
  console.error('FAIL:', error.message);
  process.exit(1);
});
