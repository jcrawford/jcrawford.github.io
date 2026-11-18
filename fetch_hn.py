import requests
import json
from datetime import datetime, timedelta

def fetch_hn_hits(query):
    # Calculate timestamp for 48 hours ago
    forty_eight_hours_ago = int((datetime.now() - timedelta(hours=48)).timestamp())
    url = "https://hn.algolia.com/api/v1/search"
    params = {
        "query": query,
        "tags": "story",
        "numericFilters": f"created_at_i>{forty_eight_hours_ago}",
        "hitsPerPage": 50
    }
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json().get('hits', [])
        else:
            print(f"Error {response.status_code} for {query}")
            return []
    except Exception as e:
        print(f"Exception for {query}: {e}")
        return []

queries = ["AI", "LLM", "Machine Learning", "Software Engineering", "Developer Tools", "Rust", "TypeScript"]
all_hits = []

for q in queries:
    hits = fetch_hn_hits(q)
    all_hits.extend(hits)

# Deduplicate by objectID
unique_hits = {hit['objectID']: hit for hit in all_hits}.values()

# Rank by points (engagement)
sorted_hits = sorted(unique_hits, key=lambda x: x.get('points', 0), reverse=True)

# Take top 10
top_10 = sorted_hits[:10]

print(json.dumps(top_10, indent=2))
