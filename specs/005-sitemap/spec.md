# Feature Specification: SEO Sitemap Generation

**Feature Branch**: `005-sitemap`  
**Created**: 2025-11-21  
**Status**: Draft  
**Input**: User description: "We will need to create a sitemap for search engines to be able to hit and index. We should use best practices when it comes to generating this sitemap. It should be generated every-time we build. There may be gatsbyjs plugins we can leverage so you should investigate that as well"

## Clarifications

### Session 2025-11-21

- Q: What priority value should blog posts receive in the sitemap (Assumptions stated 0.7, but best practices suggest 0.8 for primary content)? → A: Blog posts receive priority 0.8 (high value content)
- Q: What change frequency should blog posts have (Assumptions stated weekly, but typical blog posts rarely change weekly after publication)? → A: Blog posts have changefreq "monthly"
- Q: How should the robots.txt file be updated to reference the sitemap (FR-010 states SHOULD reference but doesn't specify approach)? → A: Manual update to /static/robots.txt file (standard Gatsby approach)

## User Scenarios & Testing

### User Story 1 - Search Engine Discovery (Priority: P1)

As a search engine crawler, I need to discover all pages on the blog so that I can index the entire site efficiently and users can find the content through search results.

**Why this priority**: This is the core purpose of a sitemap - enabling search engines to discover and index all content. Without this, pages may not appear in search results, defeating the primary purpose of the feature.

**Independent Test**: Can be fully tested by submitting the sitemap to Google Search Console and verifying that all expected URLs are present and accessible. Delivers immediate value by making the site discoverable to search engines.

**Acceptance Scenarios**:

1. **Given** the site has been built, **When** a search engine requests the sitemap at the standard location, **Then** it receives a valid XML sitemap with all public pages listed
2. **Given** new blog posts have been published, **When** the site is rebuilt, **Then** the sitemap automatically includes the new posts without manual intervention
3. **Given** the sitemap has been submitted to search engines, **When** crawlers access the sitemap, **Then** all listed URLs are accessible and return successful responses

---

### User Story 2 - Sitemap Accessibility (Priority: P1)

As a site owner, I need the sitemap to be accessible at standard locations so that search engines can automatically discover it and I can submit it to webmaster tools.

**Why this priority**: Search engines expect sitemaps at specific locations (typically /sitemap.xml). Following this convention ensures automatic discovery and compatibility with all major search engines.

**Independent Test**: Can be tested by navigating to /sitemap.xml in a browser and verifying the sitemap loads correctly. Can also be validated using sitemap validation tools.

**Acceptance Scenarios**:

1. **Given** the site is live, **When** a user navigates to /sitemap.xml, **Then** they see a properly formatted XML sitemap
2. **Given** the sitemap exists, **When** search engines read the robots.txt file, **Then** they can find a reference to the sitemap location
3. **Given** the sitemap is accessible, **When** validated with sitemap testing tools, **Then** it passes all XML schema validations

---

### User Story 3 - Content Metadata (Priority: P2)

As a search engine crawler, I need metadata about each page (last modified date, change frequency, priority) so that I can prioritize crawling and understand content freshness.

**Why this priority**: While the basic URL list is essential (P1), metadata helps search engines crawl more efficiently and understand content importance. This improves indexing quality but isn't required for basic functionality.

**Independent Test**: Can be tested by inspecting the sitemap XML and verifying that each URL entry contains appropriate metadata fields. Delivers value by helping search engines prioritize recent or important content.

**Acceptance Scenarios**:

1. **Given** a blog post has been updated, **When** the site is rebuilt, **Then** the sitemap reflects the updated lastmod timestamp for that post
2. **Given** different page types exist (blog posts, category pages, static pages), **When** the sitemap is generated, **Then** each page type has appropriate priority values reflecting its importance
3. **Given** the sitemap contains change frequency information, **When** search engines read it, **Then** they can optimize their crawl schedule based on expected update patterns

---

### User Story 4 - Large Site Scalability (Priority: P3)

As a site owner with many pages, I need the sitemap to handle large numbers of URLs efficiently so that it remains usable as the site grows.

**Why this priority**: For current site size (under 1000 pages), this isn't critical, but proper sitemap structure now prevents future issues if the site grows significantly.

**Independent Test**: Can be tested by verifying sitemap size remains under the 50MB/50,000 URL limits and loads quickly. Delivers value by ensuring long-term scalability.

**Acceptance Scenarios**:

1. **Given** the site has hundreds of pages, **When** the sitemap is generated, **Then** it remains under the 50MB and 50,000 URL limits specified by the sitemap protocol
2. **Given** the sitemap file size is reasonable, **When** search engines request it, **Then** it loads within acceptable timeframes
3. **Given** the site structure supports it, **When** the sitemap grows large, **Then** it can be split into multiple sitemap files with a sitemap index

---

### Edge Cases

- What happens when a page is deleted or unpublished? The sitemap should exclude it on the next build.
- How does the system handle pages with special characters or international URLs? URLs should be properly encoded according to XML standards.
- What happens if the build process fails? The existing sitemap should remain in place rather than being corrupted or deleted.
- How does the system handle dynamic query parameters or hash fragments? Only canonical URLs should be included, excluding temporary or duplicate content.
- What happens when the site has no published content? The sitemap should still be valid XML with an empty or minimal URL list.

**Testing Note**: These edge cases are handled automatically by the `gatsby-plugin-sitemap` implementation and are verified through the combination of (1) query filtering logic in T008, (2) URL encoding in T022-T026, and (3) manual validation in T012-T014. No additional explicit edge case testing tasks are required beyond the standard verification suite.

## Requirements

### Functional Requirements

- **FR-001**: System MUST generate a valid XML sitemap that conforms to the sitemaps.org protocol specification
- **FR-002**: System MUST automatically regenerate the sitemap during every site build process
- **FR-003**: Sitemap MUST include all public-facing pages (blog posts, category pages, author pages, static pages)
- **FR-004**: Sitemap MUST exclude pages marked as private, draft, or no-index from the sitemap
- **FR-005**: Each URL entry MUST include the page's canonical URL with proper encoding
- **FR-006**: Each URL entry SHOULD include lastmod timestamp reflecting the page's last modification date
- **FR-007**: Each URL entry SHOULD include a priority value (0.0-1.0) indicating relative importance within the site
- **FR-008**: Each URL entry SHOULD include a changefreq hint (daily, weekly, monthly, etc.) based on content type
- **FR-009**: Sitemap MUST be accessible at /sitemap.xml (standard location)
- **FR-010**: Sitemap location SHOULD be referenced in the robots.txt file (via manual update to /static/robots.txt)
- **FR-011**: Generated sitemap MUST remain under protocol limits (50MB file size, 50,000 URLs per sitemap file)
- **FR-012**: System MUST handle sitemap generation errors gracefully without breaking the build process

### Key Entities

- **Sitemap**: An XML document containing a list of all indexable pages, conforming to the sitemaps.org protocol. Includes URL, lastmod, changefreq, and priority for each entry.

- **URL Entry**: Represents a single page in the sitemap with properties:
  - Location (canonical URL)
  - Last modification timestamp
  - Change frequency hint
  - Priority value (relative to other pages on the site)

- **Content Pages**: All public-facing pages that should be indexed, including:
  - Blog post pages
  - Category/tag archive pages
  - Author profile pages
  - Static pages (about, contact, etc.)
  - Homepage

## Success Criteria

### Measurable Outcomes

- **SC-001**: Search engines can discover 100% of public pages by crawling the sitemap alone
- **SC-002**: Sitemap validation tools (Google Search Console, XML validators) report zero errors or warnings
- **SC-003**: Sitemap regenerates automatically within the standard build time without adding more than 5 seconds to the build process
- **SC-004**: Sitemap is accessible and loads in under 1 second for typical network conditions
- **SC-005**: Search engines successfully index at least 90% of submitted URLs within 30 days of sitemap submission *(Note: This is an aspirational metric that depends on external search engine behavior, content quality, crawl budgets, and other factors beyond the feature's direct control. The feature enables success by providing proper sitemap structure and metadata.)*
- **SC-006**: Sitemap accurately reflects content changes within 24 hours of publishing (after rebuild and deployment)

## Assumptions

- The site will primarily use Gatsby's plugin ecosystem rather than custom sitemap generation code
- Standard Gatsby plugin (gatsby-plugin-sitemap) follows best practices and meets requirements
- All pages use predictable URL patterns that can be automatically discovered during build
- The site will remain under 50,000 pages for the foreseeable future (single sitemap sufficient)
- Deployment process automatically rebuilds the site when content changes
- The site uses standard HTTP(S) URLs without complex authentication requirements
- Priority values will follow convention: homepage (1.0), blog posts (0.8), category pages (0.7), author pages (0.6), tag/static pages (0.5)
- Change frequency will be based on content type: blog posts (monthly), category pages (weekly), static pages (yearly)

## Dependencies

- Gatsby build system must complete successfully for sitemap to be generated
- Site deployment process must include the generated sitemap file
- Access to robots.txt file for adding sitemap reference
- Gatsby plugin ecosystem for sitemap generation functionality

## Out of Scope

- Image sitemaps (separate XML format for media files)
- Video sitemaps (separate XML format for video content)
- News sitemaps (Google News-specific sitemap format)
- Multi-language sitemaps (hreflang annotations)
- Sitemap index files (only needed if exceeding 50,000 URLs; note: gatsby-plugin-sitemap automatically handles splitting into index files if needed, but custom implementation of this splitting logic is out of scope)
- Real-time sitemap updates (sitemap updates only occur during builds)
- Sitemap submission automation (manual submission to webmaster tools)
- Sitemap analytics or monitoring dashboard
