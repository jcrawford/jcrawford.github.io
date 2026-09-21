# Research: SEO Sitemap Generation

**Date**: 2025-11-21  
**Feature**: 005-sitemap  
**Phase**: 0 - Research & Discovery

## Overview

This document consolidates research findings for implementing automated XML sitemap generation for the Gatsby blog. The research focuses on the gatsby-plugin-sitemap plugin, sitemaps.org protocol specifications, and best practices for SEO optimization.

## 1. Plugin Evaluation: gatsby-plugin-sitemap

### Decision: Use gatsby-plugin-sitemap

**Selected**: gatsby-plugin-sitemap (official Gatsby plugin)

**Version Compatibility**:
- Plugin version: 6.x (latest for Gatsby 5.x)
- Compatible with: Gatsby 5.0.0+
- TypeScript support: Yes (includes type definitions)

**Key Features**:
- Automatic sitemap generation from Gatsby's GraphQL data layer
- Support for all sitemap protocol fields (loc, lastmod, priority, changefreq)
- Custom query support for filtering pages
- Multiple sitemap support (sitemap index for large sites)
- Automatic URL resolution and encoding
- Configurable page exclusion patterns
- Integration with gatsby-config.ts

**Installation**:
```bash
npm install gatsby-plugin-sitemap
```

**Rationale**:
- **Official Plugin**: Maintained by Gatsby team, follows framework best practices
- **Zero Custom Code**: Declarative configuration, no custom sitemap logic needed
- **Type Safe**: Includes TypeScript definitions for configuration options
- **Battle-Tested**: Used by thousands of Gatsby sites, well-documented
- **Active Maintenance**: Regular updates, compatible with latest Gatsby versions

### Alternatives Considered

**Option A: Custom Sitemap Generation**
- **Pros**: Full control over output format
- **Cons**: Requires custom Gatsby API implementation, maintenance burden, reinventing wheel
- **Rejected**: Unnecessary complexity, plugin handles all requirements

**Option B: gatsby-plugin-advanced-sitemap**
- **Pros**: Additional features for multi-language sites, custom serializers
- **Cons**: More complex configuration, overkill for simple blog
- **Rejected**: Standard plugin sufficient for requirements, simpler maintenance

## 2. Sitemaps.org Protocol Specifications

### Protocol Requirements (Version 0.9)

**XML Structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2025-11-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Field Specifications**:

1. **`<loc>` (required)**:
   - Full absolute URL including protocol (https://)
   - Must be properly URL-encoded
   - Maximum length: 2,048 characters
   - Must be on same host or verified subdomain

2. **`<lastmod>` (optional, recommended)**:
   - ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDThh:mm:ss+00:00
   - Represents last modification date of page
   - Used by search engines to optimize crawl schedule

3. **`<changefreq>` (optional)**:
   - Valid values: always, hourly, daily, weekly, monthly, yearly, never
   - Hint to search engines, not a directive
   - Should reflect actual update frequency

4. **`<priority>` (optional)**:
   - Range: 0.0 to 1.0
   - Relative priority within site (not across different sites)
   - Default: 0.5
   - Used to prioritize crawling of site's own pages

**Protocol Limits**:
- Maximum file size: 50MB (uncompressed)
- Maximum URLs per sitemap: 50,000
- If exceeded: Use sitemap index file to split into multiple sitemaps

**Encoding Requirements**:
- UTF-8 character encoding
- Special characters must be entity-escaped: &amp; &apos; &quot; &gt; &lt;
- URLs must be percent-encoded for special characters

### Sitemap Index (For Large Sites)

Format when multiple sitemaps needed:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2025-11-21</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2025-11-21</lastmod>
  </sitemap>
</sitemapindex>
```

## 3. Best Practices for Blog Sitemaps

### Priority Values (Recommended Mappings)

Based on content type importance and crawl priority:

| Page Type | Priority | Rationale |
|-----------|----------|-----------|
| Homepage | 1.0 | Entry point, highest importance |
| Blog Posts (Recent) | 0.8 | Primary content, high value |
| Blog Posts (Older) | 0.6 | Still valuable, lower discovery priority |
| Category Pages | 0.7 | Navigation hubs, help organize content |
| Tag Pages | 0.5 | Secondary navigation |
| Author Pages | 0.6 | Profile pages, moderate importance |
| Static Pages (About, Contact) | 0.5 | Informational, less frequently updated |
| Archive Pages | 0.4 | Historical content, lower priority |

**Note**: Priority is relative within the site. All pages should be crawlable regardless of priority.

### Change Frequency Guidelines

Based on typical update patterns:

| Page Type | Change Frequency | Rationale |
|-----------|------------------|-----------|
| Homepage | daily | New posts appear here frequently |
| Recent Blog Posts | monthly | May receive updates/corrections |
| Older Blog Posts | yearly | Rarely updated after publication |
| Category Pages | weekly | New posts added to categories |
| Tag Pages | weekly | New posts added to tags |
| Author Pages | monthly | New posts added, profile updates |
| Static Pages | yearly | Infrequently updated content |

**Important**: changefreq is a hint, not a command. Search engines may ignore it if they observe different actual update patterns.

### Last Modified Date Strategy

**For Blog Posts**:
- Use `updatedAt` field if available (represents actual content changes)
- Fall back to `publishedAt` if updatedAt is not set
- Ensure dates are in ISO 8601 format

**For Category/Tag/Author Pages**:
- Use the most recent post's publishedAt date in that category/tag/author
- This indicates when new content was added to the page

**For Static Pages**:
- Use file modification time from git if available
- Or use a fixed date representing last content update

### Exclusion Patterns

Pages that SHOULD NOT be in sitemap:

1. **Draft/Unpublished Posts**: `frontmatter.draft === true`
2. **Private/NoIndex Pages**: `frontmatter.noindex === true`
3. **Pagination URLs**: `/page/2/`, `/page/3/` (use canonical on page 1 instead)
4. **Search Results**: `/search?q=...` (dynamic query parameters)
5. **404/Error Pages**: Not intended for indexing
6. **Development/Test Pages**: Any non-production content

**Note**: For this blog, we exclude pages with `category: "family"` from homepage but include them in sitemap as they are public content.

## 4. robots.txt Integration

### Standard Sitemap Reference

**Location**: `/static/robots.txt` (deployed to `/robots.txt`)

**Format**:
```text
User-agent: *
Allow: /

Sitemap: https://jcrawford.github.io/sitemap.xml
```

**Best Practices**:
- Include full absolute URL (https://domain.com/sitemap.xml)
- Can reference multiple sitemaps if using sitemap index
- Place at end of robots.txt file
- No trailing whitespace
- Must be accessible to all user-agents

**Verification**:
- Test with: curl https://jcrawford.github.io/robots.txt
- Validate sitemap URL is accessible

## 5. Gatsby Plugin Configuration

### Basic Configuration

**File**: `gatsby-config.ts`

**Minimal Setup**:
```typescript
{
  resolve: 'gatsby-plugin-sitemap',
  options: {
    output: '/',
    // Sitemap will be generated at /sitemap.xml
  }
}
```

### Advanced Configuration (Recommended)

```typescript
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
      // Map posts to pages with metadata
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

      return {
        url: path,
        changefreq,
        priority,
        lastmod: frontmatter?.updatedAt || frontmatter?.publishedAt,
      };
    },
  }
}
```

### Configuration Options Explained

**`output`**: Directory where sitemap is generated (relative to public/)
- Default: '/' (generates /public/sitemap.xml)
- For multiple sitemaps: use sitemap index

**`excludes`**: Array of path patterns to exclude
- Supports glob patterns: '/admin/**', '/**/draft-*'
- Applies before serialize function
- Useful for development pages, error pages

**`query`**: Custom GraphQL query
- Fetch page metadata needed for serialization
- Can filter at query level (e.g., filter out drafts)
- Access to full Gatsby data layer

**`resolvePages`**: Transform query results into page objects
- Maps metadata to pages
- Useful for joining data from multiple sources

**`serialize`**: Transform each page into sitemap entry
- Returns object with url, lastmod, priority, changefreq
- Implements custom priority/changefreq logic
- Applies conditional formatting

## 6. Validation Tools & Process

### Online Validators

1. **Google Search Console Sitemap Tester**
   - URL: https://search.google.com/search-console
   - Features: Sitemap submission, indexing status, error reporting
   - Best for: Production validation, ongoing monitoring

2. **XML Sitemap Validator**
   - URL: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Features: Protocol compliance, broken link detection
   - Best for: Pre-deployment validation

3. **Sitemap Validator (W3C)**
   - Features: XML schema validation
   - Best for: Technical validation

### CLI Validation Tools

**xmllint** (included with most Unix systems):
```bash
xmllint --noout --schema sitemap.xsd public/sitemap.xml
```

**curl + validation**:
```bash
curl -s http://localhost:8000/sitemap.xml | xmllint --format -
```

### Validation Checklist

- [ ] Sitemap is valid XML (well-formed)
- [ ] Sitemap follows sitemaps.org schema
- [ ] All URLs are absolute (include https://)
- [ ] All URLs are accessible (return 200 OK)
- [ ] lastmod dates are in ISO 8601 format
- [ ] priority values are between 0.0 and 1.0
- [ ] changefreq values are valid enum members
- [ ] File size < 50MB (uncompressed)
- [ ] URL count < 50,000 per sitemap
- [ ] No duplicate URLs
- [ ] URLs match canonical URLs (no redirects)

### Google Search Console Submission

**Steps**:
1. Add and verify site property in Google Search Console
2. Navigate to Sitemaps section in left sidebar
3. Enter sitemap URL: https://jcrawford.github.io/sitemap.xml
4. Click "Submit"
5. Monitor for crawl errors and indexing status

**Timeline**:
- Submission: Immediate
- Initial crawl: Hours to days
- Full indexing: Days to weeks
- Re-crawl frequency: Based on changefreq hints and site behavior

## 7. Integration Patterns

### Build-Time Generation

**Gatsby Build Lifecycle**:
```text
1. Source data (GraphQL queries)
2. Create pages (Gatsby Node APIs)
3. Build pages (React → HTML)
4. Generate sitemap (gatsby-plugin-sitemap)
   └─ Runs in onPostBuild hook
   └─ Queries all pages from Gatsby's internal data
   └─ Generates sitemap.xml in public/
5. Output public/ directory for deployment
```

**Key Points**:
- Sitemap generation is automatic, no manual trigger needed
- Generated sitemap is static file (no server-side processing)
- Sitemap reflects state of site at build time
- Changes require rebuild to update sitemap

### GraphQL Data Access

The plugin accesses Gatsby's internal `allSitePage` node:

```graphql
{
  allSitePage {
    nodes {
      path          # URL path of page
      pageContext   # Custom data passed during page creation
    }
  }
}
```

**Important**: `allSitePage` includes ALL pages created by Gatsby, including:
- Pages from `src/pages/`
- Pages created via `createPage` API
- Template-generated pages (blog posts, categories, authors)

This ensures comprehensive coverage without manual page registration.

### Custom Filtering Logic

**Approach 1: Query-Level Filtering** (Recommended)
```typescript
query: `
  {
    allMarkdownRemark(
      filter: {
        frontmatter: {
          draft: { ne: true }
          noindex: { ne: true }
        }
      }
    ) { ... }
  }
`
```

**Approach 2: Serialize-Level Filtering**
```typescript
serialize: (page) => {
  if (page.frontmatter?.draft || page.frontmatter?.noindex) {
    return null; // Exclude from sitemap
  }
  return { url: page.path, /* ... */ };
}
```

**Best Practice**: Use query-level filtering when possible (more efficient), use serialize-level for complex logic.

## 8. Performance Considerations

### Build Time Impact

**Expected Impact**: < 5 seconds additional build time

**Factors Affecting Performance**:
- Number of pages: Current ~30 pages = minimal impact
- GraphQL query complexity: Standard queries = minimal overhead
- File I/O: Single XML file write = negligible
- Large sites (>10,000 pages): May add 10-30 seconds

**Optimization Strategies**:
- Use efficient GraphQL queries (avoid unnecessary fields)
- Filter at query level instead of in serialize function
- Consider sitemap splitting only if build time becomes problematic

### Runtime Performance

**Sitemap File Size**:
- Current site: ~30 pages × ~200 bytes/entry = ~6 KB
- Expected growth (500 posts): ~500 pages × ~200 bytes = ~100 KB
- Well under 50MB limit, single sitemap sufficient

**Delivery Performance**:
- Static file (no server-side processing)
- Cacheable (rarely changes)
- Gzipped by default on GitHub Pages
- Load time: < 100ms for typical sitemap sizes

## 9. Testing Strategy

### Development Testing

**Local Validation**:
```bash
# Build site
npm run build

# Verify sitemap exists
ls public/sitemap.xml

# View sitemap content
cat public/sitemap.xml | xmllint --format -

# Check sitemap is valid XML
xmllint --noout public/sitemap.xml

# Test with local server
npm run serve
curl http://localhost:9000/sitemap.xml
```

**Automated Checks** (Can be added to CI):
```bash
# Check sitemap exists
test -f public/sitemap.xml || exit 1

# Validate XML
xmllint --noout public/sitemap.xml || exit 1

# Check minimum URLs present
grep -c '<url>' public/sitemap.xml
```

### Production Testing

**Post-Deployment Checklist**:
- [ ] Sitemap accessible at https://jcrawford.github.io/sitemap.xml
- [ ] Sitemap passes online validators
- [ ] robots.txt references sitemap correctly
- [ ] Sample URLs from sitemap are accessible
- [ ] Google Search Console reports no errors
- [ ] Sitemap updated after new posts published

## 10. Decisions Summary

### Key Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Plugin** | gatsby-plugin-sitemap | Official plugin, zero custom code, type-safe |
| **Priority Strategy** | Content-type based (homepage=1.0, posts=0.8, etc.) | Reflects actual importance hierarchy |
| **Changefreq Strategy** | Based on typical update frequency | Realistic hints for search engines |
| **Lastmod Strategy** | Use updatedAt || publishedAt from frontmatter | Accurate content freshness |
| **Exclusions** | Dev pages, 404s, drafts | Standard exclusion patterns |
| **Family Posts** | Include in sitemap | Public content, just hidden from homepage |
| **Sitemap Splitting** | Not needed initially | Site size well under limits |
| **Validation** | Manual + Google Search Console | Appropriate for blog scale |

### Configuration Approach

**Decision**: Use advanced configuration with custom serialize function

**Why**:
- Allows fine-grained control over priority/changefreq per page type
- Enables conditional metadata based on page characteristics
- Provides access to frontmatter data for accurate lastmod
- Still declarative, no complex custom code
- Easy to understand and maintain

### Alternative Rejected: Minimal Configuration

**Why not**:
- Default priority (0.5) for all pages doesn't reflect importance hierarchy
- No changefreq hints means less efficient crawling
- No lastmod means search engines can't optimize for freshness
- Missing these optimizations degrades SEO value

## 11. Open Questions & Assumptions

### Assumptions

1. **Site URL**: Assuming production URL is https://jcrawford.github.io
2. **Build Frequency**: Assuming builds occur on every content change (via CI/CD)
3. **URL Structure**: Assuming current URL patterns remain stable
4. **Frontmatter Fields**: Assuming all posts have publishedAt field
5. **Site Size**: Assuming site remains under 10,000 pages for foreseeable future

### Open Questions (Resolved)

**Q: Should family posts be included in sitemap?**
A: Yes. They are public content, just excluded from homepage featured section. Search engines should index them.

**Q: What priority for static pages?**
A: 0.5 (medium priority). They are important for site completeness but not primary content.

**Q: How to handle posts without updatedAt?**
A: Fall back to publishedAt. Most posts won't have explicit updatedAt field.

## Next Steps

1. ✅ Research complete - all technical questions resolved
2. ⏳ Phase 1: Generate data-model.md with sitemap structure
3. ⏳ Phase 1: Create contracts/sitemap-schema.xml for validation
4. ⏳ Phase 1: Write quickstart.md with setup instructions
5. ⏳ Update agent context with new configuration patterns
6. ⏳ Phase 2: Generate tasks.md with implementation checklist

