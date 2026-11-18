#!/usr/bin/env python3
"""Fetch arbitrary URLs via r.jina.ai and print a dense text slice."""
import re, sys, urllib.request


def get(url, timeout=60):
    req = urllib.request.Request(
        "https://r.jina.ai/" + url,
        headers={"User-Agent": "Mozilla/5.0 research-scout", "Accept": "text/plain"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


for url in sys.argv[1:]:
    print(f"\n########## {url}")
    try:
        txt = get(url)
    except Exception as e:
        print(f"[fetch fail] {e}")
        continue
    lines = [l.strip() for l in txt.splitlines() if len(l.strip()) >= 45]
    out, prev = [], None
    for l in lines:
        if l.startswith(("![", "[![", "*   ", "-   ")):
            continue
        if l != prev:
            out.append(l)
        prev = l
    print("\n".join(out)[:2200])
