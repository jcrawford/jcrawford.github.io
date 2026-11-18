#!/usr/bin/env python3
"""Fetch top link posts from selected subreddits in a rolling window via Arctic Shift."""
import json, time, urllib.request, urllib.error, argparse

SUBS = ['LocalLLaMA', 'MachineLearning', 'programming', 'softwareengineering',
        'ExperiencedDevs', 'webdev', 'devops', 'artificial']

def fetch(sub, cut, now, limit=100):
    url = ("https://arctic-shift.photon-reddit.com/api/posts/search"
           f"?subreddit={sub}&after={cut}&before={now}"
           "&sort=desc&sort_type=created_utc&limit=%d" % limit)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 research'})
            with urllib.request.urlopen(req, timeout=90) as r:
                d = json.loads(r.read().decode())
            if isinstance(d, dict) and d.get('data'):
                return d['data']
        except Exception as e:
            print("  [retry %s %s] %s" % (sub, attempt + 1, e))
        time.sleep(3 * (attempt + 1))
    return []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hours', type=int, default=48)
    ap.add_argument('--out', default='reddit_48h.json')
    ap.add_argument('--min-karma', type=int, default=25)
    ap.add_argument('--show', type=int, default=60)
    a = ap.parse_args()

    now = int(time.time())
    cut = now - a.hours * 3600
    posts, per = [], {}
    for sub in SUBS:
        data = fetch(sub, cut, now)
        link = 0
        for p in data:
            url = p.get('url') or ''
            if 'reddit.com' in url or 'redd.it' in url:
                continue
            link += 1
            posts.append({
                'subreddit': sub,
                'title': p.get('title'),
                'url': url,
                'source': (p.get('domain') or ''),
                'karma': p.get('score') or 0,
                'comments': p.get('num_comments') or 0,
                'created_utc': p.get('created_utc'),
                'permalink': 'https://www.reddit.com' + (p.get('permalink') or ''),
                'flair': p.get('link_flair_text'),
            })
        per[sub] = {'fetched': len(data), 'link_posts': link}
        print("  %-20s fetched=%3d link=%3d" % (sub, len(data), link))

    posts = [p for p in posts if p['karma'] >= a.min_karma]
    posts.sort(key=lambda x: -x['karma'])
    payload = {'scraped_at': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime(now)),
               'window_hours': a.hours, 'per_subreddit': per,
               'count': len(posts), 'posts': posts}
    with open(a.out, 'w') as f:
        json.dump(payload, f, indent=1)
    print("[ok] %d posts >=%d karma -> %s" % (len(posts), a.min_karma, a.out))
    for p in posts[:a.show]:
        print("%5d %5d | r/%-18s | %s | %s" % (p['karma'], p['comments'], p['subreddit'], p['title'], p['url'][:100]))

if __name__ == '__main__':
    main()
