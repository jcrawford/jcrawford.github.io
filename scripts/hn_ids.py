#!/usr/bin/env python3
"""Print id | points | title | url for HN 48h stories."""
import json

d = json.load(open("hn_48h_links.json"))
st = sorted(d["stories"], key=lambda x: -x["upvotes"])
for s in st:
    print(f"{s['id']}\t{s['upvotes']}\t{s['comments']}\t{s['title']}\t{s['url']}")
