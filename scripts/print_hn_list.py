#!/usr/bin/env python3
"""Print HN 48h stories sorted by points for manual editorial pass."""
import json, sys

path = sys.argv[1] if len(sys.argv) > 1 else "hn_48h_links.json"
d = json.load(open(path))
st = sorted(d["stories"], key=lambda x: -x["upvotes"])
print(d.get("generated_utc"), "total:", d.get("total_stories"))
for i, s in enumerate(st, 1):
    print(f"{i:3} {s['upvotes']:5} {s['comments']:4} | {s['source'][:26]:26} | {s['title'][:100]} | {s['url'][:90]}")
