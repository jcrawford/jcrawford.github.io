# Quickstart Guide: SEO Sitemap Generation

**Feature**: 005-sitemap  
**Last Updated**: 2025-11-21

## Overview

This guide provides step-by-step instructions for setting up automated XML sitemap generation for the Gatsby blog using gatsby-plugin-sitemap.

**Time to Complete**: 15-20 minutes

**Prerequisites**:
- Node.js and npm installed
- Gatsby project running locally
- Access to gatsby-config.ts
- Basic familiarity with Gatsby configuration

## Installation

### Step 1: Install the Plugin

```bash
npm install gatsby-plugin-sitemap
```

**Expected Output**:
```
+ gatsby-plugin-sitemap@6.x.x
added 1 package
```

**Verify Installation**:
```bash
npm list gatsby-plugin-sitemap
```

### Step 2: Add Plugin to Gatsby Config

Open `gatsby-config.ts` and add the plugin to the plugins array:

```typescript
const config: GatsbyConfig = {
  siteMetadata: {
    siteUrl: 'https://jcrawford.github.io',  // Must be set for sitemap
    // ... other metadata
  },
  plugins: [
    // ... existing plugins
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        output: '/',
        excludes: [
          '/dev-404-page/',
          '/404/',
          '/404.html',
          '/offline-plugin-app-shell-fallback/',
        ],
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
              }
            }
            allMarkdownRemark(
              filter: { frontmatter: { draft: { ne: true } } }
            ) {
              nodes {
                frontmatter {
                  slug
                  publishedAt
                  updatedAt
                  category
                }
              }
            }
          }
        `,
        resolvePages: ({
          allSitePage: { nodes: allPages },
          allMarkdownRemark: { nodes: allPosts },
        }) => {
          const postMap = allPosts.reduce((acc, post) => {
            acc[`/${post.frontmatter.slug}/`] = post;
            return acc;
          }, {});

          return allPages.map(page => {
            return {
              ...page,
              ...postMap[page.path],
            };
          });
        },
        serialize: ({ path, frontmatter }) => {
          let priority = 0.5;
          let changefreq = 'monthly';

          // Homepage
          if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
          }
          // Blog posts
          else if (path.match(/^\/\d{4}\/\d{2}\//)) {
            priority = 0.8;
            changefreq = 'monthly';
          }
          // Category pages
          else if (path.startsWith('/category/')) {
            priority = 0.7;
            changefreq = 'weekly';
          }
          // Author pages
          else if (path.startsWith('/author/')) {
            priority = 0.6;
            changefreq = 'monthly';
          }
          // Tag pages
          else if (path.startsWith('/tag/')) {
            priority = 0.5;
            changefreq = 'weekly';
          }

          return {
            url: path,
            changefreq,
            priority,
            lastmod: frontmatter?.updatedAt || frontmatter?.publishedAt,
          };
        },
      },
    },
    // ... other plugins
  ],
};
```

**Important Configuration Notes**:
- `siteMetadata.siteUrl` MUST be set (required for absolute URLs)
- `excludes` array prevents dev/error pages from appearing in sitemap
- `query` fetches page paths and post metadata
- `resolvePages` joins page data with post metadata
- `serialize` determines priority/changefreq based on page type

## Verification

### Step 3: Build and Test Locally

```bash
# Clean previous builds
npm run clean

# Build the site
npm run build
```

**Expected Output**:
```
success Building production JavaScript and CSS bundles - 15.234s
success run queries - 2.456s - 150/150 queries
success Building static HTML for pages - 3.789s - 30/30 pages
info Done building in 21.479 sec
```

### Step 4: Verify Sitemap Exists

```bash
# Check sitemap was created
ls -lh public/sitemap.xml

# View sitemap content (formatted)
cat public/sitemap.xml | xmllint --format -
```

**Expected Output**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jcrawford.github.io/</loc>
    <lastmod>2025-11-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... more URLs -->
</urlset>
```

### Step 5: Test with Local Server

```bash
# Start production server
npm run serve

# In another terminal, test sitemap
curl http://localhost:9000/sitemap.xml
```

**What to Check**:
- [ ] Sitemap returns valid XML
- [ ] All expected pages are present
- [ ] URLs are absolute (include https://jcrawford.github.io)
- [ ] lastmod dates are in ISO 8601 format (YYYY-MM-DD)
- [ ] Priority values are between 0.0 and 1.0
- [ ] No draft posts appear in sitemap

### Step 6: Validate XML Structure

```bash
# Validate XML is well-formed
xmllint --noout public/sitemap.xml

# If valid, no output. If invalid, error message shown
```

**Common Issues**:
- **Error: "parser error"**: XML syntax error, check for unescaped characters
- **Empty sitemap**: siteUrl not set in gatsby-config.ts
- **Missing pages**: Check query filter (draft posts excluded?)

## Update robots.txt

### Step 7: Add Sitemap Reference

Edit `/static/robots.txt` (creates `/robots.txt` when deployed):

```text
User-agent: *
Allow: /

Sitemap: https://jcrawford.github.io/sitemap.xml
```

**Important**: Use absolute URL including protocol (https://)

**Verify robots.txt**:
```bash
cat static/robots.txt
```

## Deployment

### Step 8: Deploy to Production

```bash
# Commit changes
git add gatsby-config.ts static/robots.txt
git commit -m "Add sitemap generation (gatsby-plugin-sitemap)"

# Deploy (adjust based on your deployment method)
npm run deploy
```

**Post-Deployment Checklist**:
- [ ] Visit https://jcrawford.github.io/sitemap.xml
- [ ] Verify sitemap is accessible
- [ ] Check robots.txt: https://jcrawford.github.io/robots.txt
- [ ] Confirm sitemap reference in robots.txt

## Validation Tools

### Online Validators

**1. XML Sitemap Validator**:
- URL: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Enter: https://jcrawford.github.io/sitemap.xml
- Check results for errors

**2. Google Rich Results Test**:
- URL: https://search.google.com/test/rich-results
- Useful for checking URL accessibility

### CLI Validation

```bash
# Validate XML schema
xmllint --noout --schema sitemap.xsd public/sitemap.xml

# Check for broken links (requires linkchecker)
linkchecker public/sitemap.xml

# Count URLs in sitemap
grep -c '<url>' public/sitemap.xml
```

## Google Search Console Setup

### Step 9: Submit Sitemap to Google

**Prerequisites**: 
- Google Search Console account
- Site verified in Search Console

**Steps**:

1. **Go to Search Console**:
   - URL: https://search.google.com/search-console
   - Select property: https://jcrawford.github.io

2. **Navigate to Sitemaps**:
   - Click "Sitemaps" in left sidebar

3. **Submit Sitemap**:
   - Enter: `sitemap.xml`
   - Click "Submit"

4. **Monitor Status**:
   - Check "Discovered" count (how many URLs Google found)
   - Check "Indexed" count (how many URLs are in Google's index)
   - Review any errors or warnings

**Expected Timeline**:
- Submission: Immediate
- Discovery: Hours to 1-2 days
- Indexing: Days to weeks (varies by content quality)

### Step 10: Monitor Indexing

Check indexing status:
- Search Console > Coverage report
- Look for "Valid" pages (indexed successfully)
- Address any "Errors" or "Warnings"

**Common Issues**:
- **"Submitted URL not found (404)"**: URL in sitemap doesn't exist
- **"Submitted URL blocked by robots.txt"**: robots.txt disallows crawling
- **"Redirect"**: URL redirects, use final destination URL instead

## Ongoing Maintenance

### Automatic Updates

**Good News**: Sitemap automatically updates on every build!

- New posts? Rebuild site → sitemap updates
- Updated posts? Rebuild site → lastmod updates
- Deleted posts? Rebuild site → removed from sitemap

**No manual sitemap editing required**

### Monitoring Checklist

**Weekly**:
- [ ] Check Google Search Console for crawl errors
- [ ] Verify indexed pages count is reasonable

**After Publishing New Posts**:
- [ ] Rebuild and deploy site
- [ ] Verify new post appears in sitemap
- [ ] Check Search Console for indexing status

**Monthly**:
- [ ] Review sitemap coverage (are all important pages indexed?)
- [ ] Check for 404 errors in Search Console
- [ ] Verify sitemap file size remains reasonable

### Troubleshooting

**Problem**: New posts not appearing in sitemap

**Solutions**:
1. Check post frontmatter doesn't have `draft: true`
2. Verify build completed successfully
3. Clear Gatsby cache: `npm run clean`
4. Rebuild: `npm run build`

**Problem**: Wrong priority/changefreq values

**Solution**:
1. Check serialize function logic in gatsby-config.ts
2. Adjust conditions based on path patterns
3. Rebuild to regenerate sitemap

**Problem**: Sitemap file too large

**Solution** (if site exceeds 50MB or 50,000 URLs):
1. Enable sitemap splitting in plugin options
2. Plugin will create sitemap index automatically
3. robots.txt should reference sitemap-index.xml

## Ongoing Management

### Monthly Monitoring Checklist

Perform these checks monthly to ensure sitemap health:

1. **Google Search Console Review**
   - Log in to GSC: https://search.google.com/search-console
   - Navigate to Sitemaps section
   - Check for errors or warnings
   - Review coverage report for indexing issues

2. **Sitemap Size Monitoring**
   - Check file size: `ls -lh public/sitemap-*.xml`
   - Verify URL count: `grep -c '<url>' public/sitemap-0.xml`
   - Compare to limits (50 MB, 50,000 URLs)
   - Alert if approaching 90% of limits (45 MB, 45,000 URLs)

3. **Content Verification**
   - Spot-check recent posts appear in sitemap
   - Verify draft posts are excluded
   - Confirm family posts not in sitemap (if applicable)
   - Check priority/changefreq values are appropriate

4. **Performance Check**
   - Test load time: `curl -w "Time: %{time_total}s\n" -o /dev/null -s https://josephcrawford.com/sitemap-index.xml`
   - Should be < 1 second
   - If slow, investigate file size or server issues

### When to Act

**Immediate Action Required:**
- GSC shows sitemap errors
- Sitemap not accessible (404 error)
- robots.txt missing sitemap reference
- Recent posts (< 1 week) not appearing in sitemap

**Plan for Future:**
- URL count > 45,000 (monitor for auto-splitting)
- File size > 45 MB (monitor for auto-splitting)
- Build time increased significantly (investigate plugin performance)

### Maintenance Tasks

**After Publishing New Content:**
- No action needed - sitemap regenerates automatically on next build
- Deploy triggers rebuild: `npm run deploy`
- Verify new posts appear: check sitemap after deployment

**After Site Structure Changes:**
- Review serialize function logic in gatsby-config.ts
- Update priority/changefreq mappings if page types changed
- Test sitemap generation in development
- Deploy and verify in production

**After Plugin Updates:**
- Review gatsby-plugin-sitemap changelog
- Test sitemap generation after update
- Verify no breaking changes in output format
- Check GSC for any validation errors

### Emergency Recovery

If sitemap becomes corrupted or unavailable:

1. **Immediate Fix:**
   ```bash
   cd /path/to/site
   npm run clean          # Clear cache
   npm run build          # Regenerate sitemap
   npm run deploy         # Deploy fresh version
   ```

2. **Verify Recovery:**
   ```bash
   curl -I https://josephcrawford.com/sitemap-index.xml
   # Should return 200 OK
   
   xmllint --noout public/sitemap-index.xml
   # Should show no errors
   ```

3. **Notify Search Engines:**
   - Resubmit sitemap in Google Search Console
   - Use "Request Indexing" for critical pages
   - Monitor indexing status over next 48 hours

## Success Criteria

Your sitemap is successfully configured when:

✅ Sitemap accessible at https://josephcrawford.com/sitemap-index.xml  
✅ Valid XML passing xmllint validation  
✅ All public pages included (posts, categories, authors)  
✅ Draft posts excluded  
✅ URLs are absolute with https://  
✅ Priority values between 0.0 and 1.0  
✅ robots.txt references sitemap  
✅ Google Search Console shows no errors  
✅ Sitemap updates automatically on builds

## Quick Reference Commands

```bash
# Install plugin
npm install gatsby-plugin-sitemap

# Clean and build
npm run clean && npm run build

# Verify sitemap exists
ls public/sitemap.xml

# View formatted XML
cat public/sitemap.xml | xmllint --format - | head -n 50

# Validate XML
xmllint --noout public/sitemap.xml

# Test locally
npm run serve
curl http://localhost:9000/sitemap.xml

# Count URLs
grep -c '<url>' public/sitemap.xml

# Deploy
npm run deploy
```

## Additional Resources

- **Sitemaps.org Protocol**: https://www.sitemaps.org/protocol.html
- **Gatsby Plugin Docs**: https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/
- **Google Search Console**: https://search.google.com/search-console
- **XML Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html

## Next Steps

After sitemap is live:

1. Submit sitemap to other search engines:
   - Bing Webmaster Tools
   - Yandex Webmaster
   
2. Consider additional SEO improvements:
   - Add structured data (JSON-LD)
   - Optimize meta descriptions
   - Add Open Graph tags

3. Monitor performance:
   - Track organic search traffic in analytics
   - Monitor keyword rankings
   - Review click-through rates in Search Console

