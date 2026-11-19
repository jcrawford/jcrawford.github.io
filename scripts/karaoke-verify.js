// Verifies word-level karaoke sync on the real track: jumps the playhead to
// timestamps taken from the word-timing export and inspects which words are
// marked sung.
const WebSocket = require('ws');

const URL_TO_CHECK = process.argv[2] || 'http://localhost:8100/music/she-s-my-wife/';
const PORT = process.env.CDP_PORT || 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// [playhead, expected first sung word of the active line]
const PROBES = [
  [17.0, 'Packed'],
  [24.5, 'Headed'],
  [45.6, 'I'],
  [74.5, 'WIFE,'],
  [107.1, 'WIFE,'],
  [212.5, 'WIFE,'],
  [287.7, 'forever.'],
];

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
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

  console.log('LINES:', await evalJs("document.querySelectorAll('.hm-lyric-line').length"));
  console.log('WORDS:', await evalJs("document.querySelectorAll('.hm-lyric-word').length"));

  const box = JSON.parse(
    await evalJs(`(() => {
      const b = document.querySelector('.hm-music-single-play');
      const r = b.getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
    })()`)
  );
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 });
    await sleep(70);
  }

  for (const [time, expected] of PROBES) {
    await evalJs(`(() => { const a = document.querySelector('audio'); a.currentTime = ${time}; return 1; })()`);
    await sleep(600);
    const state = JSON.parse(
      await evalJs(`JSON.stringify({
        t: Number(document.querySelector('audio').currentTime.toFixed(2)),
        playing: !document.querySelector('audio').paused,
        current: (document.querySelector('.hm-lyric-line.is-current') || {}).textContent || null,
        sungCount: document.querySelectorAll('.hm-lyric-line.is-current .hm-lyric-word.is-sung').length,
        sungWords: Array.from(document.querySelectorAll('.hm-lyric-line.is-current .hm-lyric-word.is-sung')).map(n => n.textContent)
      })`)
    );
    const ok = state.current && state.current.includes(expected);
    console.log(
      `${ok ? 'OK ' : 'BAD'} t=${state.t} playing=${state.playing} sung=${state.sungCount} first="${(state.sungWords[0] || '')}" line="${(state.current || '').slice(0, 46)}"`
    );
  }

  ws.close();
})().catch((error) => {
  console.error('FAIL:', error.message);
  process.exit(1);
});
