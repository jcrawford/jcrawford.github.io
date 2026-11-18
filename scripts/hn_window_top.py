#!/usr/bin/env python3
"""Fetch HN stories above a points floor in a rolling window (Algolia, server-side filtered)."""
import json, time, urllib.request, argparse, os

def get(url, timeout=60):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hours', type=int, default=48)
    ap.add_argument('--min-points', type=int, default=30)
    ap.add_argument('--out', default='hn_48h_raw.json')
    ap.add_argument('--show', type=int, default=80)
    a = ap.parse_args()

    now = int(time.time())
    cut = now - a.hours * 3600
    url = ("https://hn.algolia.com/api/v1/search?tags=story"
           f"&numericFilters=created_at_i%3E{cut},points%3E{a.min_points}"
           "&hitsPerPage=500")
    d = get(url)
    hits = d.get('hits', [])
    out = []
    for h in hits:
        out.append({
            'id': str(h['objectID']),
            'title': h.get('title'),
            'url': h.get('url') or "https://news.ycombinator.com/item?id=%s" % h['objectID'],
            'points': h.get('points') or 0,
            'comments': h.get('num_comments') or 0,
            'created': h.get('created_at'),
            'hn_discussion': "https://news.ycombinator.com/item?id=%s" % h['objectID'],
        })
    out.sort(key=lambda x: (-x['points'], -x['comments']))
    payload = {
        'generated_utc': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime(now)),
        'window_hours': a.hours,
        'min_points': a.min_points,
        'nb_hits': d.get('nbHits'),
        'count': len(out),
        'stories': out,
    }
    with open(a.out, 'w') as f:
        json.dump(payload, f, indent=1)
    print("[ok] %s stories >=%s pts (nbHits=%s) -> %s" % (len(out), a.min_points, d.get('nbHits'), a.out))
    for s in out[:a.show]:
        print("%5d %5d | %s | %s" % (s['points'], s['comments'], s['title'], s['url'][:110]))

if __name__ == '__main__':
    main()
