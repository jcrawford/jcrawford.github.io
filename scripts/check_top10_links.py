import json, urllib.request, urllib.error, time

d = json.load(open("top10_48h.json"))
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"}
for a in d["articles"]:
    for label, u in (("url", a["url"]), ("hn", a.get("hn_discussion"))):
        if not u:
            continue
        try:
            req = urllib.request.Request(u, headers=UA, method="GET")
            r = urllib.request.urlopen(req, timeout=25)
            print(f'{a["rank"]:>2} {label:3} {r.status} {len(r.read(2000)):>5}B {u}')
        except urllib.error.HTTPError as e:
            print(f'{a["rank"]:>2} {label:3} HTTP{e.code}      {u}')
        except Exception as e:
            print(f'{a["rank"]:>2} {label:3} ERR{type(e).__name__} {u}')
        time.sleep(0.4)
