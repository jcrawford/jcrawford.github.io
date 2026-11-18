#!/usr/bin/env python3
"""Fetch article text via r.jina.ai, strip nav noise, print a dense slice."""
import json, os, re, sys, urllib.request

os.makedirs("/tmp/art", exist_ok=True)
d = json.load(open("hn_48h_links.json"))
by_id = {s["id"]: s for s in d["stories"]}


def get(url, timeout=60):
    req = urllib.request.Request(
        "https://r.jina.ai/" + url,
        headers={"User-Agent": "Mozilla/5.0 research-scout", "Accept": "text/plain"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


for sid in sys.argv[1].split(","):
    s = by_id.get(sid)
    if not s:
        print(f"=== {sid} NOT FOUND")
        continue
    print(f"\n########## {sid} | {s['upvotes']}pts {s['comments']}c | {s['title']}")
    print(f"URL: {s['url']}")
    try:
        txt = get(s["url"])
    except Exception as e:
        print(f"[fetch fail] {e}")
        continue
    open(f"/tmp/art/{sid}.txt", "w").write(txt)
    lines = [l.strip() for l in txt.splitlines()]
    keep = []
    for l in lines:
        if len(l) < 45:
            continue
        if l.startswith(("![", "[![", "*   ", "-   ")):
            continue
        keep.append(l)
    # dedupe consecutive
    out, prev = [], None
    for l in keep:
        if l != prev:
            out.append(l)
        prev = l
    print("\n".join(out)[:3200])
