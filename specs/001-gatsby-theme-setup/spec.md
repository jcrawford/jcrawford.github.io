# Feature Specification: Gatsby Static Site with HybridMag WordPress Theme

**Feature Branch**: `001-gatsby-theme-setup`  
**Created**: November 5, 2025  
**Updated**: November 5, 2025  
**Status**: Draft  
**Input**: Convert the HybridMag WordPress theme from `design/` folder into a Gatsby-powered static site with full TypeScript support, maintaining all features including dark mode, sliders, and responsive design.

## Overview

Convert the HybridMag WordPress theme (a modern blog/magazine theme) into a fully functional Gatsby-powered static site. The theme features dark mode toggle, Swiper-based sliders, multiple layout options, slideout sidebars, and a customizable header system. All WordPress PHP templates and hooks must be converted to React/TypeScript components while preserving functionality and design.

## Clarifications

### Session 2025-11-05

- Q: GitHub Pages deployment path configuration? → A: Custom domain (no path prefix needed)
- Q: Package manager selection for dependency management? → A: Yarn Berry (v3+) with PnP and .yarn/
- Q: TypeScript configuration approach for Gatsby project? → A: Full TypeScript with strict mode enabled for all components and configuration
- Q: Image asset handling strategy? → A: Download and optimize all images locally using gatsby-plugin-image
- Q: JavaScript interactivity migration approach? → A: Convert all interactive features to React components with hooks and TypeScript
- Q: WordPress PHP template conversion strategy? → A: Convert all PHP templates to React/TypeScript components, WordPress hooks to React patterns
- Q: Swiper library integration? → A: Use Swiper React components for featured content sliders
- Q: Dark mode implementation? → A: Implement with React state and localStorage persistence matching WordPress theme
- Q: Content source and format for articles? → A: Markdown files in `content/` directory with YAML frontmatter (standard Gatsby blog pattern)
- Q: Search functionality implementation scope? → A: UI-only placeholder (search toggle/overlay present but non-functional for initial setup)
- Q: Featured slider content selection criteria? → A: Most recent articles (sorted by publish date, first N articles)
- Q: Widget areas content population approach? → A: Configuration file (e.g., `src/data/widgetConfig.ts` with widget type, props, and placement)
- Q: Markdown transformer plugin choice? → A: Both (gatsby-transformer-remark for simple posts, gatsby-plugin-mdx for advanced posts with embedded components)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Development Environment Setup (Priority: P1)

As a developer, I need to have a working Gatsby development environment where I can preview the site locally with the HybridMag theme fully integrated.

**Why this priority**: Without a working development environment, no other work can proceed. This is the foundation for all future feature development.

**Independent Test**: Can be fully tested by running the development server and verifying that the homepage displays correctly with all theme elements (header, navigation, featured slider, article grid, sidebar, footer) rendering properly.

**Acceptance Scenarios**:

1. **Given** a fresh project setup, **When** I start the development server, **Then** the site loads successfully on localhost
2. **Given** the development server is running, **When** I navigate to the homepage, **Then** I see the HybridMag layout with header, featured slider, article grid, and sidebar
3. **Given** the development server is running, **When** I make changes to content, **Then** the site hot-reloads and displays the changes automatically

---

### User Story 2 - WordPress to React Component Conversion (Priority: P1)

As a developer, I need all WordPress PHP templates converted to React/TypeScript components so that the Gatsby site maintains the same structure and functionality as the WordPress theme.

**Why this priority**: The component architecture is essential for building any pages. Without proper conversion, the theme's design and functionality cannot be replicated.

**Independent Test**: Can be fully tested by comparing the rendered Gatsby components against the WordPress theme output and verifying that all layouts, styles, and structures match.

**Acceptance Scenarios**:

1. **Given** the PHP header template, **When** converted to React, **Then** it supports both 'default' and 'large' layout options
2. **Given** WordPress action hooks, **When** converted to React, **Then** component composition provides equivalent flexibility
3. **Given** WordPress sidebar areas, **When** converted to React, **Then** widget areas render correctly with proper positioning

---

### User Story 3 - Interactive Features and Dark Mode (Priority: P1)

As a user, I need all interactive features (mobile menu, slideout sidebar, search toggle, dark mode) to work correctly so that the site provides the same user experience as the WordPress theme.

**Why this priority**: Interactive features define the user experience. Dark mode is a key differentiator of the HybridMag theme.

**Independent Test**: Can be fully tested by interacting with each feature and verifying behavior matches the WordPress theme functionality.

**Acceptance Scenarios**:

1. **Given** the dark mode toggle, **When** I click it, **Then** the theme switches to dark mode and saves preference to localStorage
2. **Given** the mobile menu, **When** I click the toggle, **Then** the sidebar slides out with overlay and proper focus management
3. **Given** the search toggle, **When** activated, **Then** the search overlay displays with input field focused (non-functional placeholder)
4. **Given** page reload, **When** dark mode was previously enabled, **Then** dark mode persists from localStorage

---

### User Story 4 - Featured Content Slider (Priority: P1)

As a site visitor, I need the featured content slider to display articles with smooth transitions so that I can browse highlighted content.

**Why this priority**: The featured slider is a prominent visual element and key feature of the HybridMag theme.

**Independent Test**: Can be fully tested by loading the homepage and verifying the Swiper slider displays, transitions, and responds correctly.

**Acceptance Scenarios**:

1. **Given** featured articles exist, **When** the homepage loads, **Then** the Swiper slider displays with proper styling
2. **Given** the slider is active, **When** I swipe or click navigation, **Then** slides transition smoothly
3. **Given** multiple slides, **When** the slider auto-plays, **Then** it cycles through slides at the configured interval
4. **Given** mobile device, **When** I swipe, **Then** the slider responds to touch gestures

---

### User Story 5 - Static Site Generation and Deployment (Priority: P1)

As a developer, I need to generate a production-ready static build of the site that can be deployed to GitHub Pages.

**Why this priority**: The ability to build and deploy the static site is essential for hosting on GitHub Pages.

**Independent Test**: Can be fully tested by running the production build command and verifying that all HTML, CSS, JavaScript, and asset files are generated correctly.

**Acceptance Scenarios**:

1. **Given** the project is configured, **When** I run the production build command, **Then** all pages are generated as static HTML files
2. **Given** a successful build, **When** I inspect the output directory, **Then** all assets (CSS, JavaScript, images, fonts) are properly bundled and optimized
3. **Given** a production build, **When** I serve the static files locally, **Then** the site loads and functions identically to the development version including dark mode persistence

---

### Edge Cases

- What happens when WordPress-specific functions (wp_head, body_class, etc.) need to be replicated in React?
- How does dark mode work when JavaScript is disabled?
- What happens if Swiper fails to load or initialize?
- How does the site handle missing widget content or empty sidebar areas?
- What happens when localStorage is unavailable (private browsing)?
- How does keyboard navigation work in mobile menu when sidebar is open?
- What happens if featured slider has only one slide?
- How does the site handle different header layout options across page types?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize a Gatsby project with TypeScript strict mode and all required dependencies (React, Gatsby plugins, Swiper, dayjs, gatsby-transformer-remark, gatsby-plugin-mdx)
- **FR-002**: System MUST integrate the HybridMag CSS from `design/css/hybridmag-style.css` and convert styles to Tailwind CSS utility classes preserving all CSS custom properties for theming
- **FR-003**: System MUST convert all HTML templates from `design/` folder (hybridmag.html, lifestyle.html, single post) to TypeScript React components
- **FR-004**: System MUST implement Figtree font family from local woff2 files in `design/fonts/`
- **FR-005**: System MUST convert the JavaScript functionality from `design/js/js-main.js` to React hooks and components
- **FR-006**: System MUST implement dark mode toggle that persists preference to localStorage
- **FR-007**: System MUST implement mobile menu with slideout sidebar, overlay, and keyboard navigation
- **FR-008**: System MUST implement slideout sidebar functionality matching WordPress theme
- **FR-009**: System MUST implement search toggle with focus management (UI-only, non-functional placeholder for initial setup)
- **FR-010**: System MUST integrate Swiper React for featured content slider with lazy loading, displaying most recent articles sorted by publish date
- **FR-011**: System MUST support both 'default' and 'large' header layout options
- **FR-012**: System MUST implement keyboard-accessible navigation with focus management
- **FR-013**: System MUST convert WordPress SVG icon system to React components
- **FR-014**: System MUST implement multiple sidebar positions (header-2, header-3, primary, mobile-sidebar, slideout-sidebar) populated from TypeScript configuration file
- **FR-015**: System MUST provide development server with hot-reloading
- **FR-016**: System MUST generate production build creating static HTML, CSS, and JavaScript files
- **FR-017**: System MUST preserve all responsive design breakpoints from original theme
- **FR-018**: System MUST configure Gatsby for custom domain deployment on GitHub Pages without path prefix
- **FR-019**: System MUST download and optimize all image assets locally using gatsby-plugin-image
- **FR-020**: System MUST implement WordPress action hook pattern using React component composition
- **FR-021**: System MUST support CTA button in header with configurable URL and target
- **FR-022**: System MUST implement social menu rendering in multiple locations (topbar, header, mobile sidebar)
- **FR-023**: System MUST generate valid, semantic HTML5 markup matching WordPress output
- **FR-024**: System MUST include all WordPress-equivalent metadata tags (viewport, charset, Open Graph, etc.)
- **FR-025**: System MUST source article content from Markdown (.md) or MDX (.mdx) files in `content/` directory with YAML frontmatter containing metadata (title, date, author, category, featuredImage, excerpt), supporting both simple Markdown posts and advanced posts with embedded React components

### Key Entities *(include if feature involves data)*

- **Site Configuration**: Global site settings including title, description, author, dark mode defaults, header layout options
- **Page**: Individual pages with layout, sidebar configuration, and metadata
- **Article**: Blog post content stored as Markdown (.md) or MDX (.mdx) file with YAML frontmatter (title, date, author, category, featuredImage, excerpt, tags) and body content (plain Markdown or Markdown with embedded React components)
- **Theme Assets**: Static files including CSS stylesheets, JavaScript files, Figtree font files, and images
- **Component**: React/TypeScript components replacing WordPress template parts
- **Navigation Structure**: Menu items, dropdowns, social links, and their positioning
- **Widget Area**: Sidebar regions (header-2, header-3, primary, mobile-sidebar, slideout-sidebar) configured in `src/data/widgetConfig.ts` with widget type, props, and position mapping
- **Featured Slider**: Swiper configuration and slide data, populated with most recent articles sorted by publish date (descending)
- **Dark Mode State**: User preference stored in localStorage and React state
- **Header Layout**: Configuration determining header structure ('default' | 'large')

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can start the development server and view the site in a browser within 30 seconds of running the start command (measured from `yarn develop` invocation to "You can now view..." console message, cold start)
- **SC-002**: Production build completes successfully without errors in under 2 minutes
- **SC-003**: Homepage displays with all HybridMag elements (header, featured slider, article grid, sidebar, footer) correctly rendered matching the WordPress theme design
- **SC-004**: Dark mode toggle switches theme colors instantly and persists preference across page reloads
- **SC-005**: All interactive features (mobile menu, slideout sidebar, search toggle, keyboard navigation) function identically to WordPress theme
- **SC-006**: Swiper slider displays featured content with smooth transitions and touch/swipe support
- **SC-007**: Site loads on all modern browsers (Chrome, Firefox, Safari, Edge) without console errors or rendering issues
- **SC-008**: Responsive design works correctly at all breakpoints matching WordPress theme responsive behavior
- **SC-009**: Generated static files can be served from any web server or CDN and function correctly
- **SC-010**: Page load performance meets acceptable standards (Lighthouse Performance score above 80; other categories: Accessibility >90, Best Practices >90, SEO >90)
- **SC-011**: All Figtree font weights load successfully from local woff2 files
- **SC-012**: Developer can make content changes and see results within 2 seconds via hot reload (measured from file save to browser visual update completion)
- **SC-013**: Dark mode preference persists even when localStorage is cleared and defaults are applied
- **SC-014**: Keyboard navigation works correctly in all menus including trapped focus in mobile sidebar
- **SC-015**: Featured slider degrades gracefully if only one slide is present (no navigation arrows, no auto-play)

### Assumptions

- The HybridMag WordPress theme in `inspiration/` is the authoritative source for design and functionality
- The site will use modern browser standards (ES6+) and does not need to support Internet Explorer
- Figtree font files from the theme will be used directly without CDN dependencies
- Swiper React library (swiper/react) will be used instead of vanilla Swiper
- Images from the theme will be downloaded and optimized locally using gatsby-plugin-image
- GitHub Pages deployment will use a custom domain with no path prefix required
- Article content will be authored in Markdown (.md) or MDX (.mdx) files with YAML frontmatter, stored in `content/` directory, transformed by both gatsby-transformer-remark (for .md files) and gatsby-plugin-mdx (for .mdx files with React components)
- The development machine has Node.js and Yarn Berry (v3+) installed
- Internet connection is available for downloading dependencies
- Dark mode will only support system-level prefers-color-scheme detection if localStorage is unavailable
- WordPress customizer options will be converted to configuration files or component props
- WordPress widgets will be converted to React components, with widget placement and configuration managed through TypeScript configuration file rather than runtime CMS
- PHP server-side logic (if any) will be converted to build-time data generation
- Focus is on homepage and core templates initially before expanding to archive/single post templates
- Search functionality will be UI-only placeholder in initial implementation, with functional search to be added in future iteration
