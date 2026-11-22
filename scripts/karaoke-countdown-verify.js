/**
 * karaoke-countdown-verify.js — prove the interlude 3-2-1 countdown in the
 * karaoke theater:
 *
 *   usage: node scripts/karaoke-countdown-verify.js [track-page-url]
 *
 * 1. Opens the track page, clicks "Open karaoke view".
 * 2. Starts playback with a TRUSTED CDP click (synthesized .click() leaves
 *    audio blocked), then mutes the shared <audio>.
 * 3. For each probe point: seek, sample the countdown overlay + upcoming-line
 *    highlight, and recompute the expectation from the real audio time and
 *    the known dead-air gap data (parse of music-lyrics.json through lrc.ts
 *    hold-aware window math). Render must match the math.
 */
const http = require('http');
const WebSocket = require(require('path').join(process.cwd(), 'node_modules', 'ws'));

const PAGE = process.argv[2] || 'http://localhost:8100/music/the-man-i-m-trying-to-be/';

// Dead-air gaps (>=5s) per track, from parse of music-lyrics.json through
// lrc.ts hold-aware window math (scripts regen: node --experimental-strip-types).
const GAPS_BY_SLUG = {
  'the-man-i-m-trying-to-be': [
    { vocalEnd: 78.82, nextStart: 88.72 },
    { vocalEnd: 137.82, nextStart: 157.58 },
  ],
  'don-t-let-the-green-fool-you': [
    { vocalEnd: 16.76, nextStart: 31.46 },
    { vocalEnd: 191.12, nextStart: 203.72 },
  ],
  'she-s-my-wife': [], // no dead air >= 5s — countdown must never fire
};

const get = (path) =>
  new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: 9222, path }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targets = await get('/json/list');
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r) => ws.on('open', r));

  let id = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const mid = ++id;
      pending.set(mid, resolve);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: PAGE });
  await sleep(4500);

  // Open the theater via its explicit button (labelled by text, not aria-label)
  await evalJs(`(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Open karaoke view');
    if (!b) return 'NO-BUTTON';
    b.click();
    return 'clicked';
  })()`);
  await sleep(800);

  const open = await evalJs(`!!document.querySelector('.hm-theater')`);
  if (!open) {
    console.log('FAIL: theater overlay did not open');
    process.exit(1);
  }
  // TRUSTED click on the theater play button — a synthesized .click() does not
  // confer user activation, so media play() stays blocked.
  const rect = await evalJs(`(() => {
    const b = document.querySelector('.hm-theater-play');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!rect) {
    console.log('FAIL: no .hm-theater-play button');
    process.exit(1);
  }
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  }
  await sleep(900);
  const state = await evalJs(`(() => {
    const a = document.querySelector('audio');
    return a ? { playing: !a.paused, t: a.currentTime } : null;
  })()`);
  if (!state || !state.playing) {
    console.log('FAIL: trusted click did not start playback', JSON.stringify(state));
    process.exit(1);
  }
  // Mute now that playback is running (muting mid-play needs no activation).
  await evalJs(`document.querySelector('audio').muted = true; 'ok'`);
  console.log(`playback started (muted), t=${state.t.toFixed(2)}`);

  const seek = (t) => evalJs(`(async () => { document.querySelector('audio').currentTime = ${t}; return 'ok'; })()`);
  const sample = () =>
    evalJs(`(() => {
      const cd = document.querySelector('.hm-theater-interlude');
      const up = document.querySelector('.hm-theater-line.is-upcoming');
      const a = document.querySelector('audio');
      return {
        t: a ? a.currentTime : null,
        paused: a ? a.paused : null,
        counting: cd ? cd.classList.contains('is-counting') : null,
        countdown: cd ? (cd.querySelector('.hm-theater-count-num')?.textContent ?? null) : null,
        gap: cd ? (cd.querySelector('.hm-theater-interlude-title')?.textContent ?? null) : null,
        upcoming: up ? up.textContent.trim().slice(0, 60) : null,
        visible: cd ? (cd.offsetWidth > 0 && getComputedStyle(cd).background !== 'transparent') : null,
        card: (() => {
          const card = document.querySelector('.hm-theater-interlude-card');
          if (!card) return null;
          const cs = getComputedStyle(card);
          const num = card.querySelector('.hm-theater-count-num');
          const lyric = card.querySelector('.hm-theater-interlude-lyric');
          return {
            painted: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(cs.borderTopWidth) > 0,
            borderColor: cs.borderTopColor,
            digitInsideCard: num ? card.contains(num) : null,
            lyricInsideCard: lyric ? lyric.textContent.trim().slice(0, 40) : null,
            cardCount: document.querySelectorAll('.hm-theater-interlude-card').length,
          };
        })(),
      };
    })()`);

  // Expected phase from real time + gap math (mirrors component logic):
  // full gap -> centered "musical interlude" dim overlay; final 3s -> 3-2-1.
  const slugMatch = PAGE.match(/\/music\/([^/]+)\//);
  const slug = slugMatch ? decodeURIComponent(slugMatch[1]) : '';
  const GAPS = GAPS_BY_SLUG[slug] || [];
  const expectAt = (t) => {
    for (const g of GAPS) {
      if (t >= g.vocalEnd && t < g.nextStart) {
        if (t >= g.nextStart - 3) {
          return { countdown: String(Math.min(3, Math.max(1, Math.ceil(g.nextStart - t)))), gap: 'musical interlude', counting: true, nextLineAt: g.nextStart };
        }
        return { countdown: null, gap: 'musical interlude', counting: false, nextLineAt: g.nextStart };
      }
    }
    return { countdown: null, gap: null, counting: null, nextLineAt: null };
  };

  // Cases: generic from gap math + per-track negatives.
  const cases = [];
  for (const g of GAPS) {
    for (const tick of [1, 2, 3]) {
      cases.push({ seek: g.nextStart - tick - 0.4, why: `gap @${g.nextStart} — tick ${tick}` });
    }
    cases.push({ seek: g.vocalEnd + 1, why: `gap @${g.nextStart} — centered "musical interlude" in quiet stretch` });
    cases.push({ seek: g.nextStart - 3.5, why: `gap @${g.nextStart} — interlude just before 3-2-1 boundary` });
  }
  if (GAPS.length > 0) {
    cases.push({ seek: GAPS[0].vocalEnd - 12, why: 'outside any gap — no countdown' });
  } else {
    // She's My Wife has no qualifying gaps: prove silence across the song.
    cases.push(
      { seek: 95, why: 'mid-song span — no qualifying gap' },
      { seek: 250, why: 'late-song span — no qualifying gap' },
      { seek: 6, why: 'early span — no qualifying gap' }
    );
  }

  let pass = 0;
  let fail = 0;
  for (const c of cases) {
    await seek(c.seek);
    await sleep(1200); // real time advances; sample truth from audio.currentTime
    const s = await sample();
    if (s.paused) {
      fail += 1;
      console.log(`FAIL ${c.why} | audio PAUSED at t=${s.t}`);
      continue;
    }
    const exp = expectAt(s.t);
    const okNum = (s.countdown ?? null) === exp.countdown;
    const okGap = (s.gap ?? null) === exp.gap;
    const okCounting = exp.counting === null || s.counting === exp.counting;
    const ok = okNum && okGap && okCounting;
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${c.why} | seek ${c.seek} -> t=${s.t.toFixed(2)}` +
        ` | countdown=${s.countdown === null ? '—' : s.countdown}/${exp.countdown === null ? '—' : exp.countdown}` +
        ` gap=${s.gap === null ? '—' : s.gap}/${exp.gap === null ? '—' : exp.gap}` +
        ` dim=${s.counting === null ? '—' : s.counting ? 'light' : 'dark'}` +
        ` overlayVisible=${s.visible === null ? '—' : s.visible}` +
        ` card=${s.card ? `painted=${s.card.painted} title="${s.gap ?? ''}" digits=1of${s.card.cardCount} inside=${s.card.digitInsideCard} nextLyric="${s.card.lyricInsideCard ?? '—'}"` : '—'}` +
        ` | upcoming=${s.upcoming ? '"' + s.upcoming + '"' : '—'}${!ok && exp.nextLineAt ? ' (expected next line @ ' + exp.nextLineAt + ')' : ''}`
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
