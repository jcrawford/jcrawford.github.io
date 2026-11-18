#!/usr/bin/env python3
"""Resolve exact URLs for chosen HN objectIDs and fetch readable text via r.jina.ai."""
import json, re, sys, urllib.request

IDS = sys.argv[1].split(",")
d = json.load(open("hn_48h_links.json"))
by_id = {s["id"]: s for s in d["stories"]}

WANT = [
    "50341174",  # placeholder, replaced below by lookup on title match
]


def get(url, timeout=45):
    req = urllib.request.Request(
        "https://r.jina.ai/" + url,
        headers={"User-Agent": "Mozilla/5.0 research-scout", "Accept": "text/plain"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


for sid in IDS:
    s = by_id.get(sid)
    if not s:
        print(f"=== {sid} NOT FOUND ===")
        continue
    print(f"\n===== {sid} | {s['upvotes']}pts {s['comments']}c | {s['title']}")
    print(f"URL: {s['url']}")
    try:
        txt = get(s["url"])
        txt = re.sub(r"\n{3,}", "\n\n", txt)
        print(txt[:1800].strip())
    except Exception as e:
        print(f"[fetch fail] {e}")
