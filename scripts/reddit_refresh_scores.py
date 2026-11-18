#!/usr/bin/env python3
"""Refresh archive scores with live Reddit scores by visiting each permalink."""
import json, time
from playwright.sync_api import sync_playwright

UA = "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"
JS = """() => { const e = document.querySelector('shreddit-post');
  if (!e) return null;
  const t = e.getAttribute('post-title') || '';
  return {score: e.getAttribute('score'), title: t,
          removed: /removed|deleted/i.test(t),
          comments: e.getAttribute('comment-count')}; }"""

d = json.load(open("reddit_48h_links.json"))
posts = d["posts"]
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(user_agent=UA, viewport={"width": 1400, "height": 1000}).new_page()
    for i, it in enumerate(posts, 1):
        for attempt in range(2):
            try:
                pg.goto(it["permalink"], wait_until="domcontentloaded", timeout=45000)
                time.sleep(2.5)
                live = pg.evaluate(JS)
                if live and live.get("score"):
                    it["archive_karma"] = it["karma"]
                    it["karma"] = int(float(live["score"]))
                    it["removed"] = bool(live.get("removed"))
                    if live.get("comments"):
                        it["comments"] = int(float(live["comments"]))
                    print(f"[{i}/{len(posts)}] {it['archive_karma']:>4} -> {it['karma']:>4}"
                          f"{' REMOVED' if it['removed'] else ''}  {it['title'][:55]}")
                    break
            except Exception as e:
                if attempt:
                    print(f"[{i}] fail {it['title'][:40]}: {e}")
                time.sleep(2)
        time.sleep(0.8)
    b.close()

posts = [p for p in posts if not p.get("removed")]
posts.sort(key=lambda x: x["karma"], reverse=True)
d["posts"] = posts
d["count"] = len(posts)
d["scores_refreshed_live"] = True
json.dump(d, open("reddit_48h_links.json", "w"), indent=2)
print(f"\n[ok] {len(posts)} posts after removing deleted/removed")
