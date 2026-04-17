# Popular articles

The sidebar's **Popular** widget is powered by a small JSON file at `static/data/popular-articles.json`.

## How it works

- A scheduled GitHub Action runs `npm run generate:popular` on `main` every 6 hours.
- The generator pulls the last 30 days of `screenPageViews` from the GA4 Data API.
- It also pulls Giscus discussion comment counts from the GitHub Discussions GraphQL API.
- Each article gets a score of `views + comments * 25`.
- `src/components/RecentArticles.tsx` fetches that JSON at runtime and orders the widget accordingly.
- If the JSON is missing or stale, the widget falls back to the most recent posts.

## Why this approach

- Keeps the site static and GitHub Pages friendly.
- Uses privacy-respecting analytics already present on the site, with IP anonymization and DNT respected.
- Avoids exposing API secrets to browsers.
- Lets comments influence ranking without depending on client-only Giscus internals.

## Required secrets

Add these repository secrets before enabling the workflow:

- `GA4_PROPERTY_ID`
- `GA4_SERVICE_ACCOUNT_EMAIL`
- `GA4_SERVICE_ACCOUNT_PRIVATE_KEY`
- `POPULAR_POSTS_GITHUB_TOKEN`

The GitHub token only needs read access to discussions for `jcrawford/jcrawford.github.io`.

## Local generation

Create a `.env` file from `.env.example`, then run:

```bash
npm run generate:popular
```

That rewrites `static/data/popular-articles.json`.
