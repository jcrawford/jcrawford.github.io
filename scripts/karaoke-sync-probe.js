// Measure the actual fill-vs-audio sync in the live DOM:
// find the speaking word, read its clip progress, and compare against the
// progress expected from audio.currentTime at the SAME instant.
// |delta| should be < ~10%.
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

  // Take over the clock: pause audio, set an exact time, sample fill, repeat.
  await evalJs(
    "[...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play')).click()"
  );
  await sleep(600);
  await evalJs("document.querySelector('audio').pause()");
  await sleep(200);

  const sample = `(() => {
    const w = Array.from(document.querySelectorAll('.hm-lyric-line.is-current .hm-lyric-word'))
      .find(x => x.className.includes('is-speaking'));
    if (!w || !w.querySelector('.hm-lyric-word-fill')) return 'no speaking word with fill';
    const right = getComputedStyle(w.querySelector('.hm-lyric-word-fill')).clipPath;
    const m = right.match(/inset\\(0px? ([\\d.]+)% 0px? 0px?\\)/);
    return JSON.stringify({
      word: w.textContent,
      audioNow: document.querySelector('audio').currentTime,
      fillRightInsetPct: m ? Number(m[1]) : null
    });
  })()`;

  for (const t of [17.0, 17.2, 17.45, 18.0, 18.6]) {
    await evalJs(`document.querySelector('audio').currentTime = ${t}`);
    await sleep(500);
    const s = JSON.parse(await evalJs(sample));
    if (s && s.fillRightInsetPct != null) {
      const spoken = 100 - s.fillRightInsetPct;
      console.log(
        `t=${t.toFixed(2)} word=${JSON.stringify(s.word)} clipSpoken=${spoken.toFixed(1)}% audioNow=${s.audioNow.toFixed(2)}`
      );
    } else {
      console.log(`t=${t.toFixed(2)} ->`, s);
    }
  }
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
