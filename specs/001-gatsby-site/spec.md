# Feature Specification: Gatsby Magazine Website with GitHub Pages Deployment

**Feature Branch**: `001-gatsby-site`  
**Created**: November 5, 2025  
**Last Updated**: November 6, 2025  
**Status**: Implemented  
**Input**: User description: "We are going to build a gatsby site which will be deployed to github pages. Gatsby is a static site generator. We will need to use the design found in the design/ folder for this site. We should generate mock data for articles so that we have fake content to work with. We need to match the design in the design folder 100%. You should research how Gatsby works and follow all best practices when it comes to Gatsby. After every change you should verify that the site builds without issues."

## Clarifications

### Session 2025-11-05

- Q: How should the 18+ articles be distributed across the 5 categories (Fashion, Lifestyle, Food, Travel, Sports)? → A: Exactly equal distribution (4 articles per category, total 20 articles)
- Q: How many articles should display per page before pagination is needed? → A: 15 articles per page
- Q: How many articles should appear in the featured article slider on the homepage? → A: 3 featured slides
- Q: How long should the mock article content be? → A: Varied lengths (mix of short, medium, long)
- Q: How many different authors should be created for the mock data? → A: 1 author

### Session 2025-11-06 - Post-Implementation Refinements

Design fidelity improvements identified and implemented:
- Article pages should have background card/box around content (matches design)
- Related articles section replaced with Previous/Next article navigation (chronological by date)
- Navigation links styled as single dark bar with left/right positioning
- Footer columns should display horizontally (3-column grid) not stacked vertically
- Sidebar should not have HR elements between widgets
- Article meta spacing fixed with proper gaps between "by", author name, date, and comment count
- Tags section should have space (no HR) between tags and previous/next navigation
- All styling verified against design folder for 100% match

### Session 2025-01-10 - Featured Section Layout Fixes

Homepage featured section refined for precise design match:
- Fixed article duplication: Slider now uses first 3 featured articles, highlighted posts use articles 4-5
- Fixed height alignment: Highlighted posts now match 500px slider height using flexbox (flex: 1)
- Fixed spacing: Reduced gap between highlighted posts from 10px to 2px for tight alignment
- Fixed spacing: Reduced gap between slider and highlighted posts from 10px to 5px
- Added 5 articles with "featured" tag to populate slider and highlighted posts
- Added missing `.hmhp-content` CSS for proper overlay positioning
- Fixed `.hmhp-thumb` and `.hmhp-inner` to use height: 100% on desktop instead of padding-top hack
- Custom 404 page implemented with search box, recent articles, and centered layout

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Read Articles (Priority: P1)

Visitors can browse a magazine-style website with articles organized by categories and view individual article pages with full content.

**Why this priority**: Core functionality that delivers the primary value - allowing users to discover and read content. Without this, the site has no purpose.

**Independent Test**: Can be fully tested by navigating to the homepage, viewing the article listings, clicking through to an individual article, and verifying the article content displays correctly with proper formatting, images, and metadata.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the homepage, **When** they view the page, **Then** they see a featured article slider, multiple content sections with article cards displaying titles, images, excerpts, categories, and metadata (author, date)
2. **Given** a visitor clicks on an article title or image, **When** the article page loads, **Then** they see the full article with featured image, title, author information, publication date, category tags, and formatted body content
3. **Given** a visitor is viewing an article, **When** they look at the page layout, **Then** they see a consistent header with site branding and navigation, the article content in the main area, and a footer

---

### User Story 2 - Navigate by Category (Priority: P2)

Visitors can filter and browse articles by specific categories (Fashion, Lifestyle, Food, Travel, Sports) to find content relevant to their interests.

**Why this priority**: Enables content discovery and improves user experience by allowing focused browsing. Essential for a multi-category magazine site but depends on having articles available (P1).

**Independent Test**: Can be fully tested by clicking on a category link in the navigation menu, verifying the category page displays only articles from that category, and confirming the page shows the category name and maintains consistent design.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they click on a category link (Fashion, Lifestyle, Food, Travel, or Sports) in the main navigation, **Then** they are taken to a category page showing only articles from that category
2. **Given** a visitor is on a category page, **When** they view the content, **Then** they see a page title indicating the current category and article listings formatted consistently with the homepage
3. **Given** a category has more than 15 articles, **When** the visitor scrolls to the bottom of the page, **Then** they see pagination controls to navigate to additional pages

---

### User Story 3 - Search for Content (Priority: P3)

Visitors can use a search function to find specific articles by keywords.

**Why this priority**: Enhances user experience for returning visitors or those seeking specific topics, but the site is functional without it through browsing and category navigation.

**Independent Test**: Can be fully tested by clicking the search icon in the header, entering search terms, submitting the search, and verifying relevant results are displayed or an appropriate message appears when no results match.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they click the search icon in the header, **Then** a search input field appears
2. **Given** a visitor has entered search terms, **When** they submit the search, **Then** they are taken to a search results page showing articles matching their query
3. **Given** a search query returns no results, **When** the results page loads, **Then** the visitor sees a message indicating no articles were found

---

### User Story 4 - Toggle Dark/Light Mode (Priority: P3)

Visitors can switch between light and dark color schemes for comfortable reading in different lighting conditions.

**Why this priority**: Nice-to-have feature that improves accessibility and user comfort but doesn't impact core functionality. Can be added independently after basic site is functional.

**Independent Test**: Can be fully tested by clicking the light/dark mode toggle button in the header and verifying that the site's color scheme changes appropriately, with the preference persisting across page navigation.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing the site in light mode, **When** they click the dark mode toggle button, **Then** the entire site switches to a dark color scheme
2. **Given** a visitor has selected a color mode preference, **When** they navigate to other pages, **Then** their color mode preference is maintained
3. **Given** a visitor returns to the site after closing their browser, **When** the site loads, **Then** their previously selected color mode preference is restored

---

### User Story 5 - Access Social Media Links (Priority: P3)

Visitors can follow the site's social media presence through links in the header and footer.

**Why this priority**: Supports brand engagement and community building but doesn't affect the core content consumption experience.

**Independent Test**: Can be fully tested by clicking on social media icons in the header and verifying they link to the appropriate social media platforms.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing any page, **When** they look at the header, **Then** they see social media icons (Facebook, Twitter, Instagram)
2. **Given** a visitor clicks on a social media icon, **When** the link is followed, **Then** they are taken to the corresponding social media platform

---

### Edge Cases

- What happens when a visitor accesses a non-existent page URL? (Site should display a 404 page with helpful navigation)
- How does the site handle articles with very long titles or no featured images? (Layout should gracefully degrade with appropriate fallbacks)
- What happens when JavaScript is disabled in the visitor's browser? (Site should still display content with basic functionality, though interactive features like dark mode toggle may not work)
- How does the site perform on slow network connections? (Images should be optimized and lazy-loaded; critical content should load first)
- What happens when a category has no articles? (Category page should display a message indicating no articles are available)
- How are very long article excerpts handled in card layouts? (Excerpts should be truncated with ellipsis at 200 characters maximum to maintain consistent card heights)
- What happens on very small mobile screens (< 320px width)? (Layout should remain functional with appropriate responsive breakpoints)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Site MUST generate static HTML pages from mock article data using Gatsby
- **FR-002**: Site MUST exactly replicate the design found in the design/ folder, including layout, typography, spacing, colors, and component styling
- **FR-003**: Site MUST include a homepage with a featured article slider component displaying 3 featured articles
- **FR-004**: Site MUST display article listings with thumbnail images, titles, excerpts, category labels, author names, and publication dates
- **FR-005**: Site MUST generate individual article pages with full content, featured images, and article metadata
- **FR-006**: Site MUST include category pages for Fashion, Lifestyle, Food, Travel, and Sports categories
- **FR-007**: Site MUST include an author page showing all articles by the site author
- **FR-008**: Site MUST include pagination for article listings with 15 articles displayed per page
- **FR-009**: Site MUST include a responsive navigation menu with links to Home and all category pages
- **FR-010**: Site MUST include a header with site branding, main navigation, social media links, search toggle, and light/dark mode toggle
- **FR-011**: Site MUST include a footer with multiple column layout (3 columns per design reference) containing: site navigation links, category links, and copyright/social media information (extract specific content from design/index.html footer structure)
- **FR-012**: Site MUST support responsive design with appropriate layouts for mobile, tablet, and desktop screen sizes
- **FR-013**: Site MUST use the Figtree font family as specified in the design
- **FR-014**: Site MUST implement a light/dark color mode toggle with client-side JavaScript
- **FR-015**: Site MUST include search functionality for finding articles by keywords
- **FR-016**: Site MUST generate mock data including 1 author profile and 20 articles with titles, body content with varied lengths (short: 100-200 words, medium: 300-500 words, long: 500-800 words), featured images, dates, categories, and tags (with 3 articles tagged as "featured" for the homepage slider)
- **FR-017**: Site MUST optimize images for web delivery with responsive image sizes
- **FR-018**: Site MUST be deployable to GitHub Pages as a static site
- **FR-019**: Site MUST build without errors when running the Gatsby build command
- **FR-020**: Site MUST include appropriate meta tags for SEO in the HTML head

### Key Entities

- **Article**: Represents a blog post/article with properties including title, slug, excerpt, body content, featured image, author reference, publication date, category reference, and tags
- **Category**: Represents a content category (Fashion, Lifestyle, Food, Travel, Sports) with properties including name, slug, and description
- **Author**: Represents a content author with properties including name, slug, bio, and avatar image
- **Tag**: Represents a content tag/keyword with properties including name and slug
- **Page**: Represents static pages like 404 error page with title and content
- **Site Metadata**: Represents global site settings including site title, description, social media links, and navigation menu items

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Site successfully builds with Gatsby build command without errors or warnings
- **SC-002**: Visual comparison of generated site matches the reference design in the design/ folder with the following accuracy requirements: typography (font family, sizes, weights match exactly), colors (exact hex values from design), spacing (within ±5px of design), layout structure (identical component arrangement and grid)
- **SC-003**: All pages (homepage, category pages, article pages, author page) render correctly on mobile (320px-767px), tablet (768px-1023px), and desktop (1024px+) screen sizes
- **SC-004**: Site loads homepage in under 3 seconds on a 25Mbps broadband connection (simulated with Chrome DevTools Network throttling: "Fast 3G" or faster)
- **SC-005**: Site successfully deploys to GitHub Pages and is accessible via the GitHub Pages URL
- **SC-006**: All navigation links and internal links function correctly without 404 errors
- **SC-007**: Mock data includes exactly 20 complete articles with equal distribution (4 articles per category: Fashion, Lifestyle, Food, Travel, Sports)
- **SC-008**: Image assets are optimized and appropriately sized for responsive delivery
- **SC-009**: Dark mode toggle successfully switches color scheme across all pages
- **SC-010**: Search functionality returns relevant results for keyword queries
- **SC-011**: Site maintains consistent header, navigation, and footer across all page types
- **SC-012**: Article pages display formatted content including paragraphs, headings, images, and lists correctly
