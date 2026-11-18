#!/usr/bin/env python3
"""Fetch Lobsters hottest stories and print score/title/url."""
import json, urllib.request

req = urllib.request.Request(
    "https://lobste.rs/hottest.json",
    headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) research-scout"},
)
with urllib.request.urlopen(req, timeout=45) as r:
    data = json.loads(r.read().decode())

for it in data:
    print(f"{it.get('score', 0):4} {it.get('comment_count', 0):4} {it.get('created_at','')[:10]} | {it['title'][:85]} | {it.get('url') or it.get('short_id_url')}")
