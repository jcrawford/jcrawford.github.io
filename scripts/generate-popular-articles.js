#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const SITE_URL = 'https://josephcrawford.com';
const OUTPUT_PATH = path.resolve(__dirname, '../static/data/popular-articles.json');
const DAYS_TO_TRACK = 30;
const COMMENT_WEIGHT = 25;

const {
  GA4_PROPERTY_ID,
  GA4_SERVICE_ACCOUNT_EMAIL,
  GA4_SERVICE_ACCOUNT_PRIVATE_KEY,
  GITHUB_TOKEN,
  POPULAR_POSTS_REPO = 'jcrawford/jcrawford.github.io',
} = process.env;

function requestJson(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method, headers }, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Request failed (${response.statusCode}): ${data}`));
          return;
        }

        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (error) {
          reject(new Error(`Invalid JSON response from ${url}: ${error.message}`));
        }
      });
    });

    request.on('error', reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken() {
  if (!GA4_PROPERTY_ID || !GA4_SERVICE_ACCOUNT_EMAIL || !GA4_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64Url(JSON.stringify({
    iss: GA4_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claimSet}`);
  signer.end();

  const privateKey = GA4_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  const signature = signer.sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const assertion = `${header}.${claimSet}.${signature}`;
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }).toString();

  const tokenResponse = await requestJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  return tokenResponse.access_token;
}

async function fetchGa4Views() {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken || !GA4_PROPERTY_ID) {
    return new Map();
  }

  const response = await requestJson(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${DAYS_TO_TRACK}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'BEGINS_WITH',
            value: '/',
          },
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 100,
    }),
  });

  const viewsByPath = new Map();
  for (const row of response.rows || []) {
    const rawPath = row.dimensionValues?.[0]?.value;
    const rawViews = row.metricValues?.[0]?.value;
    const pagePath = normalizePath(rawPath);
    const views = Number.parseInt(rawViews || '0', 10);

    if (pagePath) {
      viewsByPath.set(pagePath, views);
    }
  }

  return viewsByPath;
}

async function fetchDiscussionCommentCounts() {
  if (!GITHUB_TOKEN) {
    return new Map();
  }

  const [owner, name] = POPULAR_POSTS_REPO.split('/');
  const query = `query PopularDiscussions($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          title
          comments {
            totalCount
          }
        }
      }
    }
  }`;

  const response = await requestJson('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'popular-articles-generator',
    },
    body: JSON.stringify({ query, variables: { owner, name } }),
  });

  if (response.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${response.errors.map((error) => error.message).join('; ')}`);
  }

  const commentsByPath = new Map();
  for (const discussion of response.data?.repository?.discussions?.nodes || []) {
    const discussionPath = normalizeDiscussionTitle(discussion.title);
    if (!discussionPath) continue;
    commentsByPath.set(discussionPath, discussion.comments?.totalCount || 0);
  }

  return commentsByPath;
}

function normalizeDiscussionTitle(title) {
  if (!title) return null;
  const cleaned = title.startsWith('/') ? title : `/${title}`;
  return normalizePath(cleaned);
}

function normalizePath(input) {
  if (!input) return null;

  try {
    const url = input.startsWith('http://') || input.startsWith('https://')
      ? new URL(input)
      : new URL(input, SITE_URL);
    let pathname = url.pathname;

    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return pathname || '/';
  } catch {
    return null;
  }
}

async function main() {
  const [viewsByPath, commentsByPath] = await Promise.all([
    fetchGa4Views(),
    fetchDiscussionCommentCounts(),
  ]);

  const uniquePaths = new Set([
    ...viewsByPath.keys(),
    ...commentsByPath.keys(),
  ]);

  const popularArticles = Array.from(uniquePaths)
    .filter((pathName) => pathName.startsWith('/posts/') || pathName.startsWith('/series/') || pathName.startsWith('/reviews/'))
    .map((pathName) => {
      const views = viewsByPath.get(pathName) || 0;
      const comments = commentsByPath.get(pathName) || 0;
      const score = views + comments * COMMENT_WEIGHT;
      return {
        path: pathName,
        views,
        comments,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || b.views - a.views || b.comments - a.comments)
    .slice(0, 25);

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    windowDays: DAYS_TO_TRACK,
    entries: popularArticles.map((article) => ({
      id: article.path,
      views: article.views,
      comments: article.comments,
      score: article.score,
    })),
  }, null, 2) + '\n');

  console.log(`Wrote ${popularArticles.length} popular articles to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
