#!/usr/bin/env python3
"""Scrape Hacker News for the top AI/ML, SWE and DevTools stories from the past 48h.

Source: HN Algolia API (no auth, no scraping of the HTML front page).
Pulls every story with points > MIN_POINTS created in the last 48 hours,
keyword-tags it, and writes:
  - hn_48h_links.json    all stories, sorted by points
  - hn_48h_curated.json  editorial picks grouped by category

Usage: python3 scripts/hn_top48h.py [--min-points 30]
"""
import argparse
import json
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

import urllib.request

API = "https://hn.algolia.com/api/v1/search"
MIN_POINTS = 30

AI = ["ai ", " ai", "llm", "gpt", "openai", "anthropic", "claude", "gemini", "machine learning",
      "neural", "model", "transformer", "diffusion", "agent", "llama", "mistral", "deepseek",
      "inference", "embedding", "rag", "copilot", "cursor", "vibe", "chatgpt", "prompt",
      "dataset", "benchmark", "hugging", "pytorch", "tensorflow", "fine-tun", "quantiz",
      "mcp", "chatbot", "generative", "nvidia", "gpu", "asr", "world model"]
SWE = ["rust", "python", "javascript", "typescript", "compiler", "kernel", "linux", "database",
       "postgres", "sqlite", "git", "refactor", "codebase", "software engineering", "debugging",
       "programming", "developer", "framework", "testing", "wasm", "webassembly", "concurrency",
       "distributed", "architecture", "kubernetes", "docker", "sql", "static analysis",
       "language server", "lsp", "memory safety", "garbage collector", "regex", "unicode",
       "profiling", "monorepo", "build system", "cve", "javascript engine"]
DEV = ["devtool", "dev tool", "cli", "editor", "ide", "vim", "neovim", "emacs", "vs code",
       "vscode", "terminal", "shell", "tmux", "debugger", "linter", "formatter",
       "package manager", "npm", "bun", "deno", "ci/cd", "github actions", "self-hosted",
       "open source", "toolchain", "gdb", "playwright", "devtools", "code review",
       "zero heap", "os for", "text editor", "extension"]


def domain(u: str) -> str:
    if not u:
        return "news.ycombinator.com"
    h = urlparse(u).netloc.lower()
    return h[4:] if h.startswith("www.") else h


def fetch(cutoff: int, min_points: int) -> list:
    q = (f"{API}?tags=story"
         f"&numericFilters=created_at_i>{cutoff},points>{min_points}"
         f"&hitsPerPage=300")
    req = urllib.request.Request(q, headers={"User-Agent": "hn-top48h/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)["hits"]


def tags(title: str, text: str) -> list:
    blob = f"{title} {text or ''}".lower()
    out = []
    if any(k in blob for k in AI):
        out.append("AI/ML")
    if any(k in blob for k in SWE):
        out.append("SWE")
    if any(k in blob for k in DEV):
        out.append("DevTools")
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-points", type=int, default=MIN_POINTS)
    args = ap.parse_args()

    cutoff = int(time.time()) - 48 * 3600
    hits = fetch(cutoff, args.min_points)

    rows = []
    for h in hits:
        url = h.get("url") or f"https://news.ycombinator.com/item?id={h['objectID']}"
        rows.append({
            "id": h["objectID"],
            "title": (h.get("title") or "").strip(),
            "url": url,
            "source": domain(h.get("url")),
            "upvotes": h.get("points") or 0,
            "comments": h.get("num_comments") or 0,
            "posted_utc": h.get("created_at"),
            "hn_discussion": f"https://news.ycombinator.com/item?id={h['objectID']}",
            "tags": tags(h.get("title") or "", h.get("story_text")),
        })
    rows.sort(key=lambda r: -r["upvotes"])

    meta = {
        "generated_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "window_hours": 48,
        "cutoff_epoch": cutoff,
        "min_points": args.min_points,
        "total_stories": len(rows),
    }
    json.dump({**meta, "stories": rows}, open("hn_48h_links.json", "w"), indent=2, ensure_ascii=False)

    # editorial picks (by HN objectID) -- filtered to genuinely technical stories
    picks = {
        "AI/ML": ["50289418", "50276792", "50284255", "50302334", "50290177", "50288019",
                  "50296486", "50301983", "50275626", "50295450", "50273731", "50290912",
                  "50275128", "50292727", "50297697", "50294486", "50286738", "50273753"],
        "SWE": ["50282454", "50282838", "50282544", "50295821", "50289162", "50278678",
                "50299182", "50282865", "50279722", "50287647", "50274300", "50299004"],
        "DevTools": ["50298436", "50287599", "50298964", "50294506", "50289590", "50278645",
                     "50295868", "50300618", "50300683", "50293115"],
    }
    by_id = {r["id"]: r for r in rows}
    curated = {}
    for cat, ids in picks.items():
        items = [by_id[i] for i in ids if i in by_id]
        items.sort(key=lambda r: -r["upvotes"])
        curated[cat] = items
    json.dump({**meta, "categories": curated}, open("hn_48h_curated.json", "w"),
              indent=2, ensure_ascii=False)

    print(f"[ok] {len(rows)} stories >={args.min_points} pts in 48h -> hn_48h_links.json")
    for cat, items in curated.items():
        print(f"\n{cat} ({len(items)}):")
        for i, it in enumerate(items, 1):
            print(f"{i:2d}. [{it['upvotes']:>5}] {it['source']:<26} {it['title'][:78]}")


if __name__ == "__main__":
    main()
