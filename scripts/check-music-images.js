// Loads a URL in headless Chrome and reports whether every <img> actually decoded.
const WebSocket = require('ws');
const PORT = process.env.CDP_PORT || 9222;
const URLS = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');

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
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const failures = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.method === 'Network.loadingFailed') failures.push(msg.params);
  });

  for (const url of URLS) {
    await send('Page.navigate', { url });
    await sleep(6000);
    const res = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify(Array.from(document.images).filter(i => /music/.test(i.currentSrc || i.src)).map(i => ({
        cls: i.className,
        src: (i.currentSrc || i.src).replace(location.origin, ''),
        complete: i.complete,
        w: i.naturalWidth,
        h: i.naturalHeight
      })))`,
    });
    const imgs = JSON.parse(res.result.value);
    console.log(`\n== ${url}`);
    imgs.forEach((i) =>
      console.log(`  ${i.w > 0 ? 'LOADED ' : i.complete ? 'BROKEN ' : 'PENDING'} ${i.w}x${i.h}  ${i.cls || '(no class)'}  ${i.src}`)
    );
    if (imgs.length === 0) console.log('  (no music images on page)');
  }

  console.log('\nNETWORK FAILURES:', failures.length);
  failures.slice(0, 5).forEach((f) => console.log('  ', f.errorText, f.type));

  ws.close();
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
