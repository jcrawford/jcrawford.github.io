// Esc-close verification: open theater with button, send Escape keydown, check overlay gone.
const WebSocket = require('ws');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch('http://127.0.0.1:9225/json/list')).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params }));
  });
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  const evalJs = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result.value;

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:8100/music/joseph-crawford-she-s-my-wife/' });
  await sleep(6000);

  // Open theater
  await evalJs("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Open karaoke view').click()");
  await sleep(1000);
  console.log('opened:', await evalJs("!!document.querySelector('.hm-theater')"));

  // Send Escape via CDP Input.dispatchKeyEvent (real key event, not synthetic)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await sleep(600);

  console.log('after Esc:', await evalJs(`JSON.stringify({
    overlayGone: !document.querySelector('.hm-theater'),
    bodyUnlocked: !document.body.classList.contains('hm-theater-open')
  })`));

  // Reopen and close with ✕ to confirm both paths still work
  await evalJs("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Open karaoke view').click()");
  await sleep(800);
  const reopened = await evalJs("!!document.querySelector('.hm-theater')");
  await evalJs("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === '✕').click()");
  await sleep(500);
  console.log('reopened:', reopened, 'closedAgain:', await evalJs("!document.querySelector('.hm-theater')"));

  ws.close();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
