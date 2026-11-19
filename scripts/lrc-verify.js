// Verify plain-LRC (line-level) lyrics render and highlight on the song page.
const WebSocket = require('ws');
const PORT = 9222;
const URL_TO_CHECK = process.argv[2] || 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
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
  const send = (m, p = {}) => new Promise((res, rej) => {
    const msgId = ++id;
    pending.set(msgId, { resolve: res, reject: rej });
    ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
  });
  await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });

  const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

  await send('Page.enable');
  await send('Page.navigate', { url: URL_TO_CHECK });
  await sleep(6000);

  console.log('LINES:', await evalJs("document.querySelectorAll('.hm-lyric-line').length"));
  console.log('WORDS:', await evalJs("document.querySelectorAll('.hm-lyric-word').length"));

  // Start playback, then jump to ~17s where line 1 should be active.
  await evalJs(`(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play'));
    btn.click();
    return 'play';
  })()`);
  await sleep(1200);
  await evalJs(`(() => {
    const a = document.querySelector('audio'); a.currentTime = 17.0; return a.currentTime;
  })()`);
  await sleep(1500);
  const probe1 = await evalJs(`(() => {
    const cur = document.querySelector('.hm-lyric-line.is-current');
    return cur ? cur.textContent.trim().slice(0, 50) : '(none)';
  })()`);
  console.log('t≈17s current line:', JSON.stringify(probe1));

  // Jump to a chorus line (~75s).
  await evalJs("document.querySelector('audio').currentTime = 75.2");
  await sleep(1200);
  const probe2 = await evalJs(`(() => {
    const cur = document.querySelector('.hm-lyric-line.is-current');
    return cur ? cur.textContent.trim().slice(0, 50) : '(none)';
  })()`);
  console.log('t≈75s current line:', JSON.stringify(probe2));

  const sungWords = await evalJs("document.querySelectorAll('.hm-lyric-word.is-sung').length");
  console.log('sung words (expects 0 for pure LRC):', sungWords);

  ws.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
