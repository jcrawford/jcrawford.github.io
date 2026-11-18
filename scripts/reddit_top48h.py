#!/usr/bin/env python3
"""Top upvoted *link* posts from tech subreddits, last 48h.

Source: Arctic Shift Reddit archive API (reddit.com JSON/RSS and all mirrors
are WAF-blocked from this host; redlib/pullpush are dead or rate-limited).
Arctic Shift returns full post objects incl. score, created_utc, domain.
"""
import json, time, subprocess, sys
from datetime import datetime, timezone
from urllib.parse import urlparse

SUBS = ["MachineLearning", "programming", "softwareengineering"]
WINDOW_H = 48
API = "https://arctic-shift.photon-reddit.com/api/posts/search"


def fetch(sub, after, before, limit=100, tries=3):
    url = (f"{API}?subreddit={sub}&after={after}&before={before}"
           f"&sort=desc&sort_type=created_utc&limit={limit}")
    for attempt in range(tries):
        r = subprocess.run(["curl", "-s", "-m", "60", url], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
        except Exception:
            d = {}
        if d.get("data") is not None:
            return d["data"]
        err = d.get("error") or r.stdout[:120]
        print(f"[warn] {sub} attempt {attempt+1}: {err}", file=sys.stderr)
        time.sleep(3 + attempt * 3)
    return []


def domain_of(item):
    d = (item.get("domain") or "").lower()
    if d.startswith("www."):
        d = d[4:]
    if d and d != "self":
        return d
    host = urlparse(item.get("url") or "").netloc.lower()
    return host[4:] if host.startswith("www.") else host


def main():
    now = int(time.time())
    cutoff = now - WINDOW_H * 3600
    all_rows, meta = [], {}

    for sub in SUBS:
        rows, cursor, pages = [], now, 0
        while pages < 12:
            batch = fetch(sub, cutoff, cursor)
            pages += 1
            if not batch:
                break
            rows += batch
            oldest = min(b["created_utc"] for b in batch)
            if oldest <= cutoff or len(batch) < 100 or oldest >= cursor:
                break
            cursor = oldest
            time.sleep(1.5)

        seen_ids, uniq = set(), []
        for r in rows:
            if r.get("id") in seen_ids:
                continue
            seen_ids.add(r.get("id"))
            uniq.append(r)

        links = []
        for r in uniq:
            if r.get("is_self"):
                continue
            if (r.get("created_utc") or 0) < cutoff:
                continue
            url = r.get("url_overridden_by_dest") or r.get("url") or ""
            if not url.startswith("http"):
                continue
            host = urlparse(url).netloc.lower()
            if "reddit.com" in host or "redd.it" in host:
                continue
            # exclude non-article media / social links (task asks for articles)
            NON_ARTICLE = ("i.redd.it", "v.redd.it", "preview.redd.it", "imgur.com",
                           "youtu.be", "youtube.com", "x.com", "twitter.com",
                           "instagram.com", "tiktok.com", "i.imgur.com")
            if any(host == d or host.endswith("." + d) for d in NON_ARTICLE):
                continue
            # keep 0/negative-karma rows: archive scores can lag for fresh posts.
            # Live scores are refreshed + filtered later.
            links.append({
                "subreddit": r.get("subreddit") or sub,
                "title": (r.get("title") or "").strip(),
                "url": url,
                "source": domain_of(r),
                "karma": int(r.get("score") or 0),
                "comments": int(r.get("num_comments") or 0),
                "ratio": r.get("upvote_ratio"),
                "created_utc": r.get("created_utc"),
                "created": datetime.fromtimestamp(r.get("created_utc") or 0, timezone.utc)
                           .strftime("%Y-%m-%d %H:%M UTC"),
                "age_hours": round((now - (r.get("created_utc") or now)) / 3600, 1),
                "flair": r.get("link_flair_text") or "",
                "permalink": "https://www.reddit.com" + (r.get("permalink") or ""),
            })

        meta[sub] = {"fetched": len(uniq), "link_posts_48h": len(links), "pages": pages}
        print(f"[info] r/{sub}: {len(uniq)} posts fetched -> {len(links)} link posts", file=sys.stderr)
        all_rows += links
        time.sleep(1.5)

    seen, out = set(), []
    for it in sorted(all_rows, key=lambda x: x["karma"], reverse=True):
        key = it["url"].split("?")[0].rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        out.append(it)

    payload = {
        "scraped_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "window_hours": WINDOW_H,
        "source": "arctic-shift.photon-reddit.com",
        "per_subreddit": meta,
        "count": len(out),
        "posts": out,
    }
    with open("reddit_48h_links.json", "w") as f:
        json.dump(payload, f, indent=2)

    print(f"[ok] {len(out)} unique link posts across {len(SUBS)} subs -> reddit_48h_links.json")
    for i, it in enumerate(out, 1):
        print(f"{i:2d}. [{it['karma']:>5}] r/{it['subreddit']:<17} {it['source'][:28]:<28} {it['title'][:75]}")


if __name__ == "__main__":
    main()
