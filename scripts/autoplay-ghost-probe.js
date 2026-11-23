#!/usr/bin/env node
/**
 * Autoplay-ghost probe: load a song page with ZERO interaction and watch the
 * audio element for 25s. Catches (a) duplicate <audio> elements, (b) any
 * JS-initiated play() with its call stack, (c) any browser-initiated 'play'
 * event, (d) paused/currentTime sampling.
 *
 *   node scripts/autoplay-ghost-probe.js http://localhost:8100/music/she-s-my-wife/
 */
const WebSocket = require('ws');

const URL_TO_CHECK = process.argv[2];
if (!URL_TO_CHECK) {
  console.error('usage: node scripts/autoplay-ghost-probe.js <url>');
  process.exit(2);
}
const PORT = process.env.CDP_PORT || 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target on port ' + PORT);

  const ws = new WebSocket(page.webSocketDebuggerUrl, {
    perMessageDeflate: false,
    maxPayload: 64 * 1024 * 1024,
  });
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
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result.value;
  };

  // Install watchers BEFORE anything else can fire: wrap play()/pause() with a
  // stack-capturing logger, and log every media event with element state.
  const install = await evalJs(`(() => {
    if (window.__hmAutoplayWatch) return 'already';
    window.__hmAutoplayWatch = true;
    window.__hmLog = [];
    const stamp = () => (performance.now() / 1000).toFixed(2);
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio, idx) => {
      audio.dataset.hmIdx = String(idx);
      const origPlay = audio.play.bind(audio);
      audio.play = function (...args) {
        window.__hmLog.push({ t: stamp(), kind: 'play() called', idx, stack: new Error().stack.split('\\n').slice(1, 5).join(' | ') });
        return origPlay(...args);
      };
      const origPause = audio.pause.bind(audio);
      audio.pause = function (...args) {
        window.__hmLog.push({ t: stamp(), kind: 'pause() called', idx });
        return origPause(...args);
      };
      for (const ev of ['play', 'playing', 'pause', 'ended', 'loadstart', 'emptied']) {
        audio.addEventListener(ev, () => {
          window.__hmLog.push({
            t: stamp(),
            kind: 'event:' + ev,
            idx,
            paused: audio.paused,
            time: Number(audio.currentTime.toFixed(2)),
            readyState: audio.readyState,
            visibility: document.visibilityState,
            hasFocus: document.hasFocus(),
          });
        });
      }
    });
    return 'audio elements: ' + audios.length;
  })()`);
  console.log('INSTALL:', install);

  const sample = async () =>
    JSON.parse(
      await evalJs(`JSON.stringify({
        count: document.querySelectorAll('audio').length,
        playing: Array.from(document.querySelectorAll('audio')).map(a => !a.paused),
        time: Array.from(document.querySelectorAll('audio')).map(a => Number(a.currentTime.toFixed(2))),
        src: Array.from(document.querySelectorAll('audio')).map(a => (a.getAttribute('src') || '').slice(0, 60)),
        barPlayLabel: (document.querySelector('.hm-music-btn-play') || {}).textContent || '(no bar)',
        pagePlayLabel: (document.querySelector('.hm-music-single-play') || {}).textContent || '(no page btn)',
      })`)
    );

  const samples = [];
  for (let i = 0; i < 5; i += 1) {
    samples.push(await sample());
    await sleep(5000);
  }
  samples.forEach((s, i) => console.log(`T${i * 5}s:`, JSON.stringify(s)));

  const log = await evalJs('JSON.stringify(window.__hmLog || [])');
  console.log('EVENT_LOG:', log);

  const verdict = samples.every((s) => s.playing.every((p) => p === false))
    ? 'NO AUTOPLAY — audio stayed paused the whole 25s'
    : 'AUTOPLAY REPRODUCED — see log above';
  console.log('VERDICT:', verdict);

  // Replay Joseph's report play a moment, pause, hide + show the tab, then
  // watch again. If anything self-starts after the visibility round-trip, the
  // log will show the stack of the play() call that did it.
  const replay = await evalJs(`(async () => {
    const audio = document.querySelector('audio');
    const stamp = () => (performance.now() / 1000).toFixed(2);
    const out = [];
    audio.play();
    await new Promise((r) => setTimeout(r, 2500));
    audio.pause();
    out.push({ t: stamp(), kind: 'pause after 2.5s sample play', paused: audio.paused });
    const before = Date.now();
    // Simulate app-switch: freeze the tab, then foreground it.
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 9000));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 9000));
    out.push({ t: stamp(), kind: 'after hide+show round trip', elapsed: Date.now() - before, paused: audio.paused });
    return out;
  })()`);
  console.log('REPLAY:', JSON.stringify(replay));

  await sleep(6000);
  const final = await sample();
  console.log('FINAL:', JSON.stringify(final));
  const postLog = await evalJs('JSON.stringify(window.__hmLog || [])');
  console.log('EVENT_LOG2:', postLog);

  // Ghost-resurrection replay: emulate the OS thawing suspended media while
  // the page is hidden (audio.play() fired from stale state), then foreground
  // the page. The provider's visibility guard must pause it before React
  // records an autoplay, and the final state must be paused with the ▶ label.
  const ghost = await evalJs(`(async () => {
    const audio = document.querySelector('audio');
    // simulate element running while tab hidden — no React play() involved
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    audio.play();
    await new Promise((r) => setTimeout(r, 1200));
    const hiddenState = { playingWhileHidden: !audio.paused };
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 800));
    return { ...hiddenState, playingAfterRestore: !audio.paused, barLabel: (document.querySelector('.hm-music-btn-play') || {}).textContent };
  })()`);
  console.log('GHOST_REPLAY:', JSON.stringify(ghost));
  const ghostLog = await evalJs('JSON.stringify((window.__hmLog || []).filter(e => e.t > 50))');
  console.log('GHOST_LOG:', ghostLog);
  console.log(
    'VERDICT3:',
    !ghost.playingAfterRestore && ghost.barLabel.includes('▶')
      ? 'GUARD WORKS — no sound after restore, button in sync (paused ' +
        (ghost.playingWhileHidden ? 'by the hidden-kill or guard' : 'immediately') + ')'
      : 'GUARD FAILED — see GHOST_REPLAY'
  );

  console.log(
    'VERDICT2:',
    final.playing.every((p) => p === false) ? 'NO AUTOPLAY after visibility round-trip' : 'AUTOPLAY REPRODUCED after round-trip'
  );

  ws.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
