// Verify the karaoke-video style fill on the real track: a word being sung
// fills left-to-right via background gradient; words before it stay lit;
// words after it stay dim. Probes land inside known word windows taken from
// the parsed LRC.
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
  await evalJs(
    "[...document.querySelectorAll('button')].find(b => b.className.includes('hm-music-single-play')).click()"
  );
  await sleep(800);

  // Probe A — line 0, "behind," (18.37 -> 19.30). Landing at 18.75 => ~41%.
  await evalJs("document.querySelector('audio').currentTime = 18.75");
  await sleep(900);
  const a = await evalJs(`(() => {
    const cur = document.querySelector('.hm-lyric-line.is-current');
    if (!cur) return 'NO CURRENT LINE';
    const words = Array.from(cur.querySelectorAll('.hm-lyric-word'));
    const speaking = words.findIndex(w => w.className.includes('is-speaking'));
    return JSON.stringify({
      line: cur.textContent.trim().slice(0, 40),
      sungCount: words.filter(w => w.className.includes('is-sung')).length,
      speakingIndex: speaking,
      speakingWord: speaking >= 0 ? words[speaking].textContent : null,
      fill: speaking >= 0 ? (words[speaking].style.backgroundSize || '') : null
    });
  })()`);
  const A = JSON.parse(a);
  console.log('A t=18.75:', A.line);
  console.log('   sung:', A.sungCount, '| speaking:', JSON.stringify(A.speakingWord), 'at', A.fill);

  // Probe B — deeper into the SAME word (19.0 => ~68%); fill must exceed A.
  await evalJs("document.querySelector('audio').currentTime = 19.00");
  await sleep(700);
  const b = await evalJs(
    "[...document.querySelectorAll('.hm-lyric-line.is-current .hm-lyric-word')].find(w => w.className.includes('is-speaking'))?.style.backgroundSize || 'none'"
  );
  console.log('B t=19.00 same word fill:', b, '— should exceed', A.fill);

  // Probe C — new line, first word "Just" (19.30 -> 19.70) at 19.5 = 50%.
  await evalJs("document.querySelector('audio').currentTime = 19.50");
  await sleep(700);
  const c = await evalJs(`(() => {
    const cur = document.querySelector('.hm-lyric-line.is-current');
    const words = Array.from(cur.querySelectorAll('.hm-lyric-word'));
    const speaking = words.findIndex(w => w.className.includes('is-speaking'));
    return JSON.stringify({ line: cur.textContent.trim().slice(0, 30), idx: speaking, fill: speaking >= 0 ? words[speaking].style.backgroundSize : null });
  })()`);
  console.log('C t=19.50 new line:', JSON.parse(c).line);
  console.log('   speaking word idx', JSON.parse(c).idx, 'fill', JSON.parse(c).fill);
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
