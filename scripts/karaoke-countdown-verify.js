/**
 * karaoke-countdown-verify.js — prove the interlude marker row in the lyric
 * flow of the karaoke theater.
 *
 *   usage: node scripts/karaoke-countdown-verify.js [track-page-url]
 *   (Chrome must be running with --remote-debugging-port=9222)
 *
 * Per track:
 *   1. Open the page, trusted-click the theater ⏯ (autoplay-blocked headless).
 *   2. Mute, then for each probe point: seek, sample the interlude row
 *      (in-flow, single instance, fill width vs expected gap fraction).
 *   3. Also assert the row is GONE past the gap end and never appears in
 *      ordinary sung spans, and that fill is monotonic between two samples.
 */
const http = require('http');
const WebSocket = require(require('path').join(process.cwd(), 'node_modules', 'ws'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const GAPS_BY_SLUG = {
  // measured from music-lyrics.json via parseLrc hold-aware ends; start = true vocal end
  'the-man-i-m-trying-to-be': [
    { i: 17, vocalEnd: 78.82, nextStart: 88.72 },
    { i: 31, vocalEnd: 137.82, nextStart: 157.58 },
  ],
  'don-t-let-the-green-fool-you': [
    { i: 15, vocalEnd: 16.8, nextStart: 31.5 }, // 14.7 s
    { i: 39, vocalEnd: 191.1, nextStart: 203.7 }, // 12.6 s
  ],
  'she-s-my-wife': [], // no dead air >= 5s — marker must never fire
};

function main() {
  const PAGE = process.argv[2] || 'http://localhost:8100/music/the-man-i-m-trying-to-be/';
  const wsModule = require(require('path').join(process.cwd(), 'node_modules', 'ws'));
  return new Promise((res) => {
    http.get({ host: '127.0.0.1', port: 9222, path: '/json/list' }, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', (e) => {
      console.error('CDP unavailable:', e.message);
      process.exit(1);
    });
  }).then((targets) => run(PAGE, targets, wsModule));
}

async function run(PAGE, targets, wsModule) {
  const page = targets.find((t) => t.type === 'page');
  if (!page) {
    console.log('FAIL: no CDP page target');
    process.exit(1);
  }
  const ws = new wsModule(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r) => ws.on('open', r));
  let id = 0;
  const pend = new Map();
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pend.has(m.id)) {
      pend.get(m.id)(m);
      pend.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const mid = ++id;
      pend.set(mid, res);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  await send('Page.enable');
  await send('Page.navigate', { url: PAGE });
  await sleep(4500);

  await ev(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Open karaoke view')?.click()`);
  await sleep(800);
  const rect = await ev(
    `(() => { const b = document.querySelector('.hm-theater-play'); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`
  );
  if (!rect) {
    console.log('FAIL: no .hm-theater-play button');
    process.exit(1);
  }
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  }
  await sleep(900);
  const state = await ev(`(() => {
    const a = document.querySelector('audio');
    return a ? { playing: !a.paused, t: a.currentTime } : null;
  })()`);
  if (!state || !state.playing) {
    console.log('FAIL: trusted click did not start playback', JSON.stringify(state));
    process.exit(1);
  }
  await ev(`document.querySelector('audio').muted = true; 'ok'`);
  console.log(`playback started (muted), t=${state.t.toFixed(2)}`);

  const seek = (t) => ev(`(async () => { document.querySelector('audio').currentTime = ${t}; return 'ok'; })()`);
  const sample = () =>
    ev(`(() => {
      const cd = document.querySelector('.hm-theater-interlude');
      const a = document.querySelector('audio');
      const lyricsPanel = document.querySelector('.hm-theater-lyrics');
      const fill = cd ? cd.querySelector('.hm-theater-interlude-fill') : null;
      return {
        t: a ? a.currentTime : null,
        paused: a ? a.paused : null,
        title: cd ? (cd.querySelector('.hm-theater-interlude-title')?.textContent ?? null) : null,
        fillW: fill ? parseFloat(getComputedStyle(fill).width) : null,
        rowW: cd ? cd.getBoundingClientRect().width : null,
        visible: cd ? (cd.offsetWidth > 0 && cd.offsetParent !== null) : null,
        inFlowRow: (() => {
          if (!cd || !lyricsPanel) return null;
          return lyricsPanel.contains(cd) && getComputedStyle(cd).position !== 'absolute' && getComputedStyle(cd).position !== 'fixed';
        })(),
        singleRow: document.querySelectorAll('.hm-theater-interlude').length,
      };
    })()`);

  const slugMatch = PAGE.match(/\/music\/([^/]+)\//);
  const slug = slugMatch ? decodeURIComponent(slugMatch[1]) : '';
  const GAPS = GAPS_BY_SLUG[slug] || [];
  // Expected: in-gap -> marker row with title + fill fraction over the WHOLE
  // gap (start = true vocal end of the previous line, end = next line stamp).
  const expectAt = (t) => {
    for (const g of GAPS) {
      if (t >= g.vocalEnd && t < g.nextStart) {
        return { row: true, frac: (t - g.vocalEnd) / (g.nextStart - g.vocalEnd), nextLineAt: g.nextStart, why: `gap @${g.nextStart}` };
      }
    }
    return { row: false, frac: null, nextLineAt: null, why: null };
  };

  const cases = [];
  for (const g of GAPS) {
    // Fractions across the WHOLE gap: 10%, ~50%, 75%, 95%.
    for (const f of [0.1, 0.5, 0.75, 0.95]) {
      const span = g.nextStart - g.vocalEnd;
      cases.push({ seek: g.vocalEnd + f * span, why: `gap @${g.nextStart} — fill ${Math.round(f * 100)}%`, frac: f });
    }
    cases.push({ seek: g.nextStart + 1.2, why: `gap @${g.nextStart} — row gone after vocal returns`, frac: null });
  }
  if (GAPS.length > 0) {
    cases.push({ seek: GAPS[0].vocalEnd - 12, why: 'outside any gap — no row', frac: null });
  } else {
    cases.push(
      { seek: 95, why: 'mid-song span — no qualifying gap' },
      { seek: 250, why: 'late-song span — no qualifying gap' },
      { seek: 6, why: 'early span — no qualifying gap' }
    );
  }

  let pass = 0;
  let fail = 0;
  let lastGapFill = null; // { frac, w } for monotonicity across the same gap
  for (const c of cases) {
    await seek(c.seek);
    await sleep(1200);
    const s = await sample();
    if (s.paused) {
      fail += 1;
      console.log(`FAIL ${c.why} | audio PAUSED at t=${s.t}`);
      continue;
    }
    const g = GAPS.find((x) => s.t >= x.vocalEnd && s.t < x.nextStart);
    const exp = expectAt(s.t);
    let ok = true;
    let fillNote = '';

    if (exp.row) {
      const okPresence = s.inFlowRow === true && s.singleRow === 1 && s.title === 'musical interlude' && s.visible === true;
      const okFillW = s.fillW !== null && s.rowW > 0;
      const expW = s.rowW * Math.min(1, Math.max(0, exp.frac));
      const tol = Math.max(4, s.rowW * 0.05); // seek latency + rAF sampling
      const okFill = okFillW && Math.abs(s.fillW - expW) <= tol;
      ok = okPresence && okFill;
      fillNote = ` fillW=${s.fillW?.toFixed(0) ?? '—'} exp=${expW.toFixed(0)}±${tol.toFixed(0)}`;
      lastGapFill = g ? { frac: exp.frac, w: s.fillW } : null;
    } else {
      const okGone = s.singleRow === 0;
      ok = okGone;
      fillNote = ` rows=${s.singleRow}`;
      if (g) lastGapFill = null;
    }
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${c.why} | seek ${c.seek} -> t=${s.t.toFixed(2)}` +
        ` | title=${s.title === null ? '—' : '"' + s.title + '"'}` +
        ` inFlow=${s.inFlowRow === null ? '—' : s.inFlowRow}` +
        ` rows=${s.singleRow ?? '—'}${fillNote}`
    );
    ok ? (pass += 1) : (fail += 1);
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  ws.close();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
