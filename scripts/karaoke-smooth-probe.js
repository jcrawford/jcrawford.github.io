// Verify fill SMOOTHNESS while playing: sample the speaking word's clip
// progress ~10 times/sec for 3s. Deltas between consecutive samples should be
// small/non-zero (continuous fill), NOT 0-or-jump patterns like before.
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
  await send('Page.navigate', { url: 'http://localhost:8100/music/she-s-my-wife/' });
  await sleep(6000);
  await evalJs(
    "[...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play')).click()"
  );
  await sleep(700);
  await evalJs("document.querySelector('audio').currentTime = 16.35");
  await sleep(400);

  const samples = [];
  for (let k = 0; k < 26; k += 1) {
    const s = await evalJs(`(() => {
      const w = Array.from(document.querySelectorAll('.hm-lyric-line.is-current .hm-lyric-word'))
        .find(x => x.className.includes('is-speaking'));
      if (!w) return null;
      const f = w.querySelector('.hm-lyric-word-fill');
      if (!f) return null;
      const m = getComputedStyle(f).clipPath.match(/inset\\(0px? ([\\d.]+)%/);
      return m ? Math.round(100 - Number(m[1])) : null;
    })()`);
    samples.push(s);
    await sleep(90);
  }
  const spokenPct = samples.filter((s) => s !== null);
  console.log('fill samples over ~2.4s:', spokenPct.join('%, ') + '%');
  const deltas = spokenPct.slice(1).map((v, i) => v - spokenPct[i]).filter((d) => d > 0);
  console.log(
    'non-negative monotonic steps:',
    deltas.length,
    '| avg step per ~90ms:',
    (deltas.reduce((a, b) => a + b, 0) / (deltas.length || 1)).toFixed(2) + '%'
  );
  const flatStreak = (() => {
    let max = 0; let cur = 0;
    for (let i = 1; i < spokenPct.length; i += 1) {
      if (spokenPct[i] === spokenPct[i - 1]) { cur += 1; max = Math.max(max, cur); } else cur = 0;
    }
    return max;
  })();
  console.log('longest flat (frozen) streak:', flatStreak, 'samples (<=1 = smooth)');
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
