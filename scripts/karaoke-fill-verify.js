// Verify the clip-path karaoke fill after the "word vanishes" fix:
// - base word dims to its normal state (opacity stays 1, never black/transparent)
// - lit overlay child exists, is white, and its clip inset shrinks over time
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

  const probe = `(() => {
    const w = [...document.querySelectorAll('.hm-lyric-line.is-current .hm-lyric-word')]
      .find(x => x.className.includes('is-speaking'));
    if (!w) return JSON.stringify({ none: true, line: document.querySelector('.hm-lyric-line.is-current')?.textContent.trim().slice(0,30) });
    const fill = w.querySelector('.hm-lyric-word-fill');
    const baseStyle = getComputedStyle(w);
    return JSON.stringify({
      word: w.textContent.slice(0, -fill?.textContent.length || 0) === w.textContent ? w.textContent : w.textContent,
      baseColor: baseStyle.color,
      baseOpacity: baseStyle.opacity,
      fillPresent: !!fill,
      fillColor: fill ? getComputedStyle(fill).color : null,
      clip: fill ? (fill.style.clipPath || getComputedStyle(fill).clipPath) : null
    });
  })()`;

  // t=18.75 -> "behind," (18.37-19.30): base dim, white fill clipped at ~41%.
  await evalJs("document.querySelector('audio').currentTime = 18.75");
  await sleep(900);
  const a = JSON.parse(await evalJs(probe));
  console.log('t=18.75:');
  console.log('  base color:', a.baseColor, '| opacity:', a.baseOpacity, '(must NOT be transparent/black)');
  console.log('  fill overlay:', a.fillPresent, '| fill color:', a.fillColor, '| clip:', a.clip);

  await evalJs("document.querySelector('audio').currentTime = 19.05");
  await sleep(800);
  const b = JSON.parse(await evalJs(probe));
  console.log('t=19.05 (deeper into same word):');
  console.log('  clip:', b.clip, '— right inset must be SMALLER than 59%');

  await evalJs("document.querySelector('audio').currentTime = 19.6");
  await sleep(800);
  const c = JSON.parse(await evalJs(probe));
  console.log('t=19.6 next word "Just" 19.3-19.7 (~75%):', c.fillPresent ? c.clip : c.none ? 'none? ' + c.line : c.clip);
  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
