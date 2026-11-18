#!/usr/bin/env python3
"""Fetch 48h link posts from selected subreddits via Arctic Shift, print them."""
import json, sys, time, urllib.parse, urllib.request

SUBS = sys.argv[1].split(",") if len(sys.argv) > 1 else ["LocalLLaMA", "MachineLearning", "programming", "softwareengineering", "ExperiencedDevs", "webdev", "devops"]
WINDOW = 48 * 3600
now = int(time.time())
cut = now - WINDOW

out = {}
for sub in SUBS:
    q = urllib.parse.urlencode({
        "subreddit": sub,
        "after": cut,
        "before": now,
        "sort": "desc",
        "sort_type": "created_utc",
        "limit": 100,
    })
    url = f"https://arctic-shift.photon-reddit.com/api/posts/search?{q}"
    data = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "research-scout/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                j = json.loads(r.read().decode())
            if isinstance(j, dict) and isinstance(j.get("data"), list) and j["data"]:
                data = j["data"]
                break
        except Exception as e:
            print(f"[warn] {sub} attempt {attempt+1}: {e}", file=sys.stderr)
        time.sleep(3)
    posts = []
    for p in data or []:
        u = p.get("url") or ""
        if "reddit.com" in u or "redd.it" in u:
            continue
        posts.append({
            "subreddit": sub,
            "title": p.get("title", ""),
            "url": u,
            "karma": p.get("score", 0),
            "comments": p.get("num_comments", 0),
            "permalink": "https://www.reddit.com" + (p.get("permalink") or ""),
            "created_utc": p.get("created_utc"),
        })
    out[sub] = posts
    print(f"[ok] r/{sub}: {len(posts)} link posts in 48h", file=sys.stderr)

json.dump({"cutoff": cut, "now": now, "subs": out}, open("reddit_48h_multisub.json", "w"), indent=2)

allp = [p for v in out.values() for p in v]
allp.sort(key=lambda x: -x["karma"])
for p in allp[:60]:
    print(f"{p['karma']:5} {p['comments']:4} r/{p['subreddit'][:18]:18} | {p['title'][:80]} | {p['url'][:75]}")
