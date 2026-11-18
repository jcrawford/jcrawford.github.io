import json
import os

files = ['ai_hits.json', 'llm_hits.json', 'softeng_hits.json', 'devtools_hits.json']
all_hits = []

for f in files:
    if os.path.exists(f):
        with open(f, 'r') as file:
            try:
                data = json.load(file)
                all_hits.extend(data.get('hits', []))
            except json.JSONDecodeError:
                pass

# Deduplicate by objectID
unique_hits = {hit['objectID']: hit for hit in all_hits}.values()

# Rank by points (engagement)
sorted_hits = sorted(unique_hits, key=lambda x: x.get('points', 0), reverse=True)

# Take top 10
top_10 = sorted_hits[:10]

for i, hit in enumerate(top_10, 1):
    title = hit.get('title', 'No Title')
    url = hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
    points = hit.get('points', 0)
    comments = hit.get('num_comments', 0)
    print(f"{i}|{title}|{url}|{points}|{comments}")
