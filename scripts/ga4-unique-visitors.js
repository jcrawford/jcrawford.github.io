/**
 * Fetch unique visitors (activeUsers) from GA4 for the last 7 days
 * Run: node scripts/ga4-unique-visitors.js
 */

require('dotenv').config();
const https = require('https');
const { google } = require('googleapis');

const {
  GA4_PROPERTY_ID,
  GA4_SERVICE_ACCOUNT_EMAIL,
  GA4_SERVICE_ACCOUNT_PRIVATE_KEY,
} = process.env;

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GA4_SERVICE_ACCOUNT_EMAIL,
      private_key: GA4_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function runReport(accessToken, metrics) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: metrics.map(m => ({ name: m })),
      orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
      limit: 30,
    });

    const req = https.request({
      hostname: 'analyticsdata.googleapis.com',
      path: `/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Fetching GA4 data...');
  const accessToken = await getAccessToken();
  const result = await runReport(accessToken, ['activeUsers', 'screenPageViews']);

  console.log('\n' + '='.repeat(90));
  console.log('Last 7 Days: Unique Visitors (activeUsers) vs Page Views (screenPageViews)');
  console.log('='.repeat(90));
  console.log('Path'.padEnd(55), 'Unique'.padStart(8), 'Views'.padStart(8), 'Pages/Visit');
  console.log('-'.repeat(90));

  for (const row of result.rows || []) {
    const pagePath = row.dimensionValues?.[0]?.value || 'unknown';
    const uniqueUsers = parseInt(row.metricValues?.[0]?.value || '0', 10);
    const pageViews = parseInt(row.metricValues?.[1]?.value || '0', 10);
    const ratio = uniqueUsers > 0 ? (pageViews / uniqueUsers).toFixed(1) : '0';
    console.log(pagePath.padEnd(55), String(uniqueUsers).padStart(8), String(pageViews).padStart(8), ratio + 'x');
  }

  // Intro to Making Mead series summary
  console.log('\n' + '='.repeat(90));
  console.log('Intro to Making Mead Series Breakdown:');
  console.log('='.repeat(90));
  const introSeries = result.rows?.filter(r => r.dimensionValues?.[0]?.value?.includes('intro-to-making-mead')) || [];
  
  let totalUnique = 0;
  let totalViews = 0;
  
  for (const row of introSeries) {
    const pagePath = row.dimensionValues?.[0]?.value || 'unknown';
    const uniqueUsers = parseInt(row.metricValues?.[0]?.value || '0', 10);
    const pageViews = parseInt(row.metricValues?.[1]?.value || '0', 10);
    totalUnique += uniqueUsers;
    totalViews += pageViews;
    console.log(`${pagePath}: ${uniqueUsers} unique, ${pageViews} views`);
  }
  
  console.log(`\nSeries Total: ~${totalUnique} unique visitors, ${totalViews} page views`);
  console.log('\nNote: Unique visitors are counted per page path. A user visiting multiple');
  console.log('articles in the series is counted once per article path.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
