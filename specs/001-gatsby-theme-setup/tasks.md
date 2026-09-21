# Implementation Tasks: Gatsby with HybridMag WordPress Theme

**Feature**: 001-gatsby-theme-setup  
**Branch**: `001-gatsby-theme-setup`  
**Generated**: November 5, 2025

## Overview

This document provides the complete task breakdown for converting the HybridMag WordPress theme into a Gatsby-powered static site. Tasks are organized by user story to enable independent implementation and testing. Each task includes specific file paths and can be executed in the order presented or parallelized where marked with [P].

**Total Tasks**: 213 (updated for Tailwind CSS integration)  
**Parallelizable Tasks**: 95  
**User Stories**: 5 (all P1 priority)

**Note**: Task numbers T035+ need renumbering after Tailwind CSS additions (T001-T034 complete)

## Phase 1: Setup & Initialization (T001-T020)

**Goal**: Initialize Gatsby project with Tailwind CSS and all required dependencies

### Tasks

- [ ] T001 Initialize Gatsby project with TypeScript in /Users/josephcrawford/Projects/site
- [ ] T002 Configure Yarn Berry v4.x with PnP mode (create .yarnrc.yml)
- [ ] T003 Create tsconfig.json with strict mode enabled
- [ ] T004 Create package.json with initial dependencies list
- [ ] T005 Install core dependencies (gatsby, react, react-dom, typescript)
- [ ] T006 [P] Install Gatsby plugins (gatsby-plugin-image, gatsby-plugin-sharp, gatsby-transformer-sharp, gatsby-source-filesystem)
- [ ] T007 [P] Install content transformation plugins (gatsby-transformer-remark, gatsby-plugin-mdx, @mdx-js/react)
- [ ] T008 [P] Install Tailwind CSS and dependencies (tailwindcss@^3.4.0, postcss, autoprefixer)
- [ ] T009 [P] Install Tailwind plugins (@tailwindcss/typography, @tailwindcss/forms)
- [ ] T010 [P] Install Swiper library (swiper@^11.0.0)
- [ ] T011 [P] Install dayjs (dayjs@^1.11.0)
- [ ] T012 [P] Install additional Gatsby plugins (gatsby-plugin-manifest, gatsby-plugin-sitemap)
- [ ] T013 [P] Install TypeScript type definitions (@types/react, @types/react-dom, @types/node)
- [ ] T014 Create tailwind.config.ts with HybridMag design tokens (colors, typography, spacing)
- [ ] T015 Create postcss.config.js for Tailwind processing
- [ ] T016 Configure VS Code SDKs for Yarn Berry PnP (.yarn/sdks)
- [ ] T017 Create gatsby-config.ts with plugin configuration
- [ ] T018 Create gatsby-node.ts with webpack configuration
- [ ] T019 Create gatsby-browser.tsx with browser APIs
- [ ] T020 Create .gitignore with Gatsby and Yarn Berry entries

**Completion Criteria**: `yarn develop` command exists and attempts to start (may fail due to missing content)

---

## Phase 2: Foundational Structure (T021-T034)

**Goal**: Setup project structure, extract HybridMag design tokens, configure Tailwind

### Tasks

- [ ] T021 Create project directory structure (src/components/, src/pages/, src/templates/, src/styles/, src/data/, src/types/, src/hooks/, src/utils/, static/fonts/, static/images/, content/posts/)
- [ ] T022 [P] Copy inspiration/assets/fonts/figtree/ to static/fonts/figtree/
- [ ] T023 Extract color system from inspiration/style.css and add to tailwind.config.ts colors
- [ ] T024 Extract typography system from inspiration/style.css and add to tailwind.config.ts fontSize/lineHeight/fontFamily
- [ ] T025 Extract spacing system from inspiration/style.css and add to tailwind.config.ts spacing
- [ ] T026 Create src/styles/global.css with Tailwind directives (@tailwind base/components/utilities) and Figtree @font-face
- [ ] T027 Update gatsby-browser.tsx to import src/styles/global.css
- [ ] T028 [P] Create src/types/index.ts with base TypeScript interfaces (Article, Author, Category, Image, NavigationItem, SocialLinks, SiteConfig, BreakingNewsItem, WidgetConfig)
- [ ] T029 [P] Create src/data/siteConfig.ts with site configuration matching WordPress theme_mod values
- [ ] T030 [P] Create src/data/navigation.ts with menu structures (primary, secondary, social)
- [ ] T031 [P] Create src/data/widgetConfig.ts with widget area configurations
- [ ] T032 [P] Create src/utils/icons.tsx with SVG icon definitions from WordPress theme
- [ ] T033 [P] Create src/utils/formatters.ts with date and string formatting utilities
- [ ] T034 Create static/images/default.jpg placeholder image

**Completion Criteria**: Project structure matches plan.md, Tailwind configured with HybridMag tokens, base files created

---

## Phase 3: User Story 1 - Development Environment Setup (T031-T055)

**Goal**: Working Gatsby development environment with HybridMag theme integrated

**User Story**: As a developer, I need to have a working Gatsby development environment where I can preview the site locally with the HybridMag theme fully integrated.

**Independent Test**: Dev server starts successfully and displays homepage with theme styling

### Tasks

#### 3.1 Layout Components

- [ ] T031 [P] [US1] Create src/components/layout/Layout.tsx wrapper component
- [ ] T032 [P] [US1] Create src/components/layout/Header.tsx (basic structure, no navigation yet)
- [ ] T033 [P] [US1] Create src/components/layout/Footer.tsx (basic structure)
- [ ] T034 [US1] Integrate Header and Footer into Layout component

#### 3.2 Base Homepage

- [ ] T035 [US1] Create src/pages/index.tsx with basic homepage structure
- [ ] T036 [US1] Create src/pages/404.tsx for not found page
- [ ] T037 [US1] Add Layout wrapper to index.tsx

#### 3.3 SEO Component

- [ ] T038 [P] [US1] Create src/components/seo/SEO.tsx with meta tags (viewport, charset, Open Graph)
- [ ] T039 [US1] Add SEO component to Layout.tsx head section

#### 3.4 Content Setup

- [ ] T040 [US1] Create content/posts/ directory structure
- [ ] T041 [P] [US1] Create sample Markdown post content/posts/2024-01-15-first-post.md with frontmatter
- [ ] T042 [P] [US1] Create sample MDX post content/posts/2024-01-20-second-post.mdx with frontmatter
- [ ] T043 [US1] Configure gatsby-source-filesystem for content/ directory in gatsby-config.ts
- [ ] T044 [US1] Configure gatsby-transformer-remark in gatsby-config.ts
- [ ] T045 [US1] Configure gatsby-plugin-mdx in gatsby-config.ts

#### 3.5 GraphQL Queries

- [ ] T046 [US1] Create GraphQL query in gatsby-node.ts to source all Markdown/MDX posts
- [ ] T047 [US1] Implement createPages API in gatsby-node.ts to generate blog post pages

#### 3.6 Development Testing

- [ ] T048 [US1] Start development server with `yarn develop`
- [ ] T049 [US1] Verify localhost:8000 loads without errors
- [ ] T050 [US1] Verify Figtree fonts load correctly
- [ ] T051 [US1] Verify HybridMag CSS applies to page
- [ ] T052 [US1] Test hot reload by modifying index.tsx
- [ ] T053 [US1] Verify hot reload completes within 2 seconds
- [ ] T054 [US1] Check browser console for errors (should be none)
- [ ] T055 [US1] Verify dev server startup time under 30 seconds

**US1 Completion Criteria**: 
- ✅ Dev server starts in <30s
- ✅ Homepage displays with HybridMag styling
- ✅ Hot reload works in <2s
- ✅ No console errors
- ✅ Figtree fonts render correctly

---

## Phase 4: User Story 2 - WordPress to React Component Conversion (T056-T095)

**Goal**: All WordPress PHP templates converted to TypeScript React components

**User Story**: As a developer, I need all WordPress PHP templates converted to React/TypeScript components so that the Gatsby site maintains the same structure and functionality as the WordPress theme.

**Independent Test**: Header, Footer, and Navigation components render correctly matching WordPress theme output

### Tasks

#### 4.1 Header Component (Default Layout)

- [ ] T056 [US2] Update src/components/layout/Header.tsx with full header structure from header.php
- [ ] T057 [US2] Add site branding section (logo, title, tagline) to Header component
- [ ] T058 [US2] Add headerLayout prop ('default' | 'large') to Header component
- [ ] T059 [US2] Implement default header layout structure
- [ ] T060 [US2] Add header gadgets section for default layout
- [ ] T061 [US2] Add header sidebar area for default layout

#### 4.2 Header Component (Large Layout)

- [ ] T062 [P] [US2] Implement large header layout structure in Header component
- [ ] T063 [P] [US2] Add header inner left container for large layout
- [ ] T064 [P] [US2] Add header inner right container for large layout
- [ ] T065 [US2] Add conditional rendering based on headerLayout prop

#### 4.3 Navigation Components

- [ ] T066 [P] [US2] Create src/components/navigation/PrimaryNav.tsx for desktop navigation
- [ ] T067 [P] [US2] Create src/components/navigation/SecondaryNav.tsx for top bar navigation
- [ ] T068 [P] [US2] Create src/components/navigation/SocialNav.tsx for social links
- [ ] T069 [P] [US2] Create src/components/navigation/MobileNav.tsx for mobile menu
- [ ] T070 [US2] Implement dropdown menu support in PrimaryNav component
- [ ] T071 [US2] Implement nested dropdown support in PrimaryNav component
- [ ] T072 [US2] Add navigation data from src/data/navigation.ts to components

#### 4.4 Footer Component

- [ ] T073 [US2] Update src/components/layout/Footer.tsx with full footer structure from footer.php
- [ ] T074 [US2] Add footer widget areas (4 columns) to Footer component
- [ ] T075 [US2] Add footer bottom section with copyright and legal links
- [ ] T076 [US2] Integrate social navigation into footer
- [ ] T077 [US2] Add newsletter signup form to footer

#### 4.5 Widget Components

- [ ] T078 [P] [US2] Create src/components/widgets/SidebarPosts.tsx for popular/recent posts widget
- [ ] T079 [P] [US2] Create src/components/widgets/Categories.tsx for category list widget
- [ ] T080 [P] [US2] Create src/components/widgets/Newsletter.tsx for newsletter signup widget
- [ ] T081 [US2] Create src/components/common/WidgetArea.tsx container component
- [ ] T082 [US2] Implement widget rendering from widgetConfig.ts

#### 4.6 Common Components

- [ ] T083 [P] [US2] Create src/components/common/Button.tsx for CTA buttons
- [ ] T084 [P] [US2] Create src/components/common/Icon.tsx wrapper for SVG icons
- [ ] T085 [P] [US2] Create src/components/common/ArticleCard.tsx for blog post cards

#### 4.7 Component Integration & Testing

- [ ] T086 [US2] Integrate all navigation components into Header
- [ ] T087 [US2] Integrate widget areas into Layout sidebar positions
- [ ] T088 [US2] Update index.tsx to use ArticleCard components
- [ ] T089 [US2] Test default header layout renders correctly
- [ ] T090 [US2] Test large header layout renders correctly
- [ ] T091 [US2] Test footer renders with all sections
- [ ] T092 [US2] Test dropdown menus display correctly
- [ ] T093 [US2] Test widget areas render in correct positions
- [ ] T094 [US2] Verify component composition matches WordPress hook pattern
- [ ] T095 [US2] Compare rendered output to WordPress theme screenshots

**US2 Completion Criteria**:
- ✅ Header supports both default and large layouts
- ✅ Footer displays with all widget areas
- ✅ Navigation menus render with dropdowns
- ✅ Widget areas positioned correctly
- ✅ Component composition provides WordPress hook flexibility

---

## Phase 5: User Story 3 - Interactive Features and Dark Mode (T096-T125)

**Goal**: All interactive features functional with proper state management

**User Story**: As a user, I need all interactive features (mobile menu, slideout sidebar, search toggle, dark mode) to work correctly so that the site provides the same user experience as the WordPress theme.

**Independent Test**: All interactive features work correctly and dark mode persists across page reloads

### Tasks

#### 5.1 Custom Hooks

- [ ] T096 [P] [US3] Create src/hooks/useDarkMode.ts hook for dark mode state management
- [ ] T097 [P] [US3] Create src/hooks/useLocalStorage.ts hook for localStorage abstraction
- [ ] T098 [P] [US3] Create src/hooks/useKeyboardNav.ts hook for keyboard navigation
- [ ] T099 [P] [US3] Create src/hooks/useMediaQuery.ts hook for responsive breakpoints

#### 5.2 Dark Mode Implementation

- [ ] T100 [US3] Implement useDarkMode hook with localStorage persistence ('hybridmagDarkMode' key)
- [ ] T101 [US3] Add dark mode CSS variables to src/styles/hybridmag.css (.hm-dark selector)
- [ ] T102 [US3] Create src/components/interactive/DarkModeToggle.tsx component
- [ ] T103 [US3] Implement toggle functionality with 'hm-dark' class on <html> element
- [ ] T104 [US3] Add prefers-color-scheme fallback detection
- [ ] T105 [US3] Integrate DarkModeToggle into Header component
- [ ] T106 [US3] Add DarkModeToggle to mobile sidebar

#### 5.3 Mobile Menu

- [ ] T107 [US3] Create src/components/interactive/MobileMenuToggle.tsx button component
- [ ] T108 [US3] Update MobileNav component with slideout functionality
- [ ] T109 [US3] Implement overlay mask creation/removal
- [ ] T110 [US3] Add 'mobile-menu-opened' class toggle on body element
- [ ] T111 [US3] Implement focus trapping within mobile sidebar
- [ ] T112 [US3] Add Escape key handler to close mobile menu
- [ ] T113 [US3] Add click-outside handler to close mobile menu
- [ ] T114 [US3] Integrate MobileMenuToggle into Header component

#### 5.4 Slideout Sidebar

- [ ] T115 [P] [US3] Create src/components/interactive/SlideoutSidebar.tsx component
- [ ] T116 [US3] Implement slideout sidebar toggle functionality
- [ ] T117 [US3] Add 'slideout-opened' class toggle on body element
- [ ] T118 [US3] Implement overlay mask for slideout sidebar
- [ ] T119 [US3] Add focus management for slideout sidebar
- [ ] T120 [US3] Integrate SlideoutSidebar into Layout component

#### 5.5 Search Overlay

- [ ] T121 [P] [US3] Create src/components/interactive/SearchToggle.tsx component
- [ ] T122 [US3] Implement search overlay toggle functionality (UI-only placeholder)
- [ ] T123 [US3] Add search input focus management
- [ ] T124 [US3] Add Escape key handler to close search overlay
- [ ] T125 [US3] Integrate SearchToggle into Header component

**US3 Completion Criteria**:
- ✅ Dark mode toggles and persists to localStorage
- ✅ Mobile menu slides out with overlay
- ✅ Slideout sidebar functions correctly
- ✅ Search overlay displays (UI-only)
- ✅ Focus management works in all overlays
- ✅ Keyboard navigation (Tab, Escape) functional
- ✅ Dark mode persists across page reloads

---

## Phase 6: User Story 4 - Featured Content Slider (T126-T145)

**Goal**: Swiper slider displaying featured articles with smooth transitions

**User Story**: As a site visitor, I need the featured content slider to display articles with smooth transitions so that I can browse highlighted content.

**Independent Test**: Swiper slider displays on homepage with most recent articles and supports touch/swipe gestures

### Tasks

#### 6.1 Swiper Configuration

- [ ] T126 [US4] Import Swiper React components and CSS in src/styles/global.css
- [ ] T127 [US4] Configure Swiper modules (Navigation, Pagination, Autoplay, Lazy) in gatsby-config.ts

#### 6.2 Featured Slider Component

- [ ] T128 [US4] Create src/components/featured/FeaturedSlider.tsx component
- [ ] T129 [US4] Integrate Swiper and SwiperSlide React components
- [ ] T130 [US4] Add Navigation module to FeaturedSlider
- [ ] T131 [US4] Add Pagination module to FeaturedSlider
- [ ] T132 [US4] Add Autoplay module with configurable delay
- [ ] T133 [US4] Add Lazy loading module for images
- [ ] T134 [US4] Configure touch/swipe gestures
- [ ] T135 [US4] Add HybridMag styling to Swiper slides

#### 6.3 Featured Content Query

- [ ] T136 [US4] Create GraphQL query in index.tsx for most recent articles (sorted by date descending)
- [ ] T137 [US4] Limit query to first 5 articles for slider
- [ ] T138 [US4] Pass article data to FeaturedSlider component

#### 6.4 Additional Featured Components

- [ ] T139 [P] [US4] Create src/components/featured/FeaturedSmall.tsx for small featured posts
- [ ] T140 [P] [US4] Create src/components/featured/FeaturedTabs.tsx for tabbed featured content
- [ ] T141 [US4] Integrate FeaturedSlider into index.tsx hero section
- [ ] T142 [US4] Add FeaturedSmall components to homepage sidebar

#### 6.5 Slider Testing

- [ ] T143 [US4] Test slider displays with proper styling
- [ ] T144 [US4] Test slider navigation (prev/next buttons) functionality
- [ ] T145 [US4] Test slider autoplay functionality
- [ ] T146 [US4] Test touch/swipe gestures on mobile viewport
- [ ] T147 [US4] Test lazy loading of images
- [ ] T148 [US4] Verify slider gracefully handles single slide (no navigation, no autoplay)

**US4 Completion Criteria**:
- ✅ Swiper slider displays on homepage
- ✅ Most recent articles populate slider
- ✅ Navigation arrows functional
- ✅ Autoplay cycles slides
- ✅ Touch/swipe gestures work
- ✅ Images lazy load
- ✅ Styling matches HybridMag theme

---

## Phase 7: User Story 5 - Static Site Generation and Deployment (T149-T165)

**Goal**: Production-ready static build deployable to GitHub Pages

**User Story**: As a developer, I need to generate a production-ready static build of the site that can be deployed to GitHub Pages.

**Independent Test**: Production build completes successfully and site functions identically to development version

### Tasks

#### 7.1 Blog Post Template

- [ ] T149 [US5] Create src/templates/blog-post.tsx template for single post pages
- [ ] T150 [US5] Add GraphQL query for post data (content, frontmatter, metadata)
- [ ] T151 [US5] Render Markdown content with gatsby-transformer-remark
- [ ] T152 [US5] Render MDX content with gatsby-plugin-mdx
- [ ] T153 [US5] Add article header with title, date, author, category
- [ ] T154 [US5] Add featured image with gatsby-plugin-image
- [ ] T155 [US5] Add article body with proper typography
- [ ] T156 [US5] Add related articles section

#### 7.2 Production Build Configuration

- [ ] T157 [US5] Update gatsby-config.ts with production siteUrl
- [ ] T158 [US5] Configure gatsby-plugin-manifest with site icons
- [ ] T159 [US5] Configure gatsby-plugin-sitemap for SEO
- [ ] T160 [US5] Verify pathPrefix is NOT set (custom domain deployment)
- [ ] T161 [US5] Create static/CNAME file with custom domain
- [ ] T162 [US5] Create static/.nojekyll file to disable Jekyll processing

#### 7.3 Build & Test

- [ ] T163 [US5] Run production build with `yarn build`
- [ ] T164 [US5] Verify build completes in under 2 minutes
- [ ] T165 [US5] Verify public/ directory contains all static files (HTML, CSS, JS, images, fonts)
- [ ] T166 [US5] Serve production build locally with `yarn serve`
- [ ] T167 [US5] Test site on localhost:9000
- [ ] T168 [US5] Verify dark mode persistence works in production build
- [ ] T169 [US5] Verify all interactive features work in production
- [ ] T170 [US5] Verify Swiper slider works in production
- [ ] T171 [US5] Check browser console for errors (production build)

**US5 Completion Criteria**:
- ✅ Production build completes in <2min
- ✅ All static files generated in public/
- ✅ Site functions identically to dev version
- ✅ Dark mode persists in production
- ✅ All interactive features work
- ✅ No console errors

---

## Phase 8: Polish & Cross-Cutting Concerns (T172-T185)

**Goal**: Production-ready site meeting all quality standards

### Tasks

#### 8.1 Responsive Testing

- [ ] T172 [P] Test site at 320px mobile breakpoint
- [ ] T173 [P] Test site at 768px tablet breakpoint
- [ ] T174 [P] Test site at 1024px desktop breakpoint
- [ ] T175 [P] Test site at 1200px+ large desktop breakpoint
- [ ] T176 Verify mobile menu works at mobile breakpoints
- [ ] T177 Verify navigation dropdowns work at desktop breakpoints
- [ ] T178 Verify responsive images load correct sizes

#### 8.2 Browser Compatibility

- [ ] T179 [P] Test site in Chrome (latest)
- [ ] T180 [P] Test site in Firefox (latest)
- [ ] T181 [P] Test site in Safari (latest)
- [ ] T182 [P] Test site in Edge (latest)
- [ ] T183 Verify consistent rendering across all browsers
- [ ] T184 Check for browser-specific console errors

#### 8.3 Performance Audits

- [ ] T185 [P] Run Lighthouse Performance audit (target >80)
- [ ] T186 [P] Run Lighthouse Accessibility audit (target >90)
- [ ] T187 [P] Run Lighthouse Best Practices audit (target >90)
- [ ] T188 [P] Run Lighthouse SEO audit (target >90)
- [ ] T189 Review and address any Lighthouse recommendations
- [ ] T190 Verify Core Web Vitals meet targets

#### 8.4 Accessibility Testing

- [ ] T191 Test keyboard navigation (Tab key through all interactive elements)
- [ ] T192 Test Escape key functionality (close overlays)
- [ ] T193 Verify focus indicators visible on all interactive elements
- [ ] T194 Test screen reader compatibility (VoiceOver on macOS)
- [ ] T195 Verify all images have alt text
- [ ] T196 Verify proper heading hierarchy (h1, h2, h3)
- [ ] T197 Verify ARIA attributes correct on all interactive components
- [ ] T198 Test focus trapping in mobile menu and slideout sidebar

#### 8.5 Final Polish

- [ ] T199 [P] Review all component comments for constitution compliance (no FR-XXX, minimal comments)
- [ ] T200 [P] Verify all TypeScript strict mode errors resolved
- [ ] T201 [P] Run type check with `yarn type-check`
- [ ] T202 Create README.md with project setup instructions
- [ ] T203 Create DEPLOYMENT.md with GitHub Pages deployment steps
- [ ] T204 Verify all constitution principles met (P1-P11 checklist)
- [ ] T205 Final review of spec.md success criteria (SC-001 through SC-015)

**Phase 8 Completion Criteria**:
- ✅ Responsive at all breakpoints
- ✅ Compatible with all modern browsers
- ✅ Lighthouse scores meet targets
- ✅ Keyboard navigation fully functional
- ✅ Screen reader accessible
- ✅ All constitution principles satisfied
- ✅ All spec success criteria met

---

## Task Dependencies & Execution Strategy

### Critical Path (Must Complete Sequentially)

1. **Phase 1: Setup** (T001-T016) → Blocks all other work
2. **Phase 2: Foundational** (T017-T030) → Blocks all user stories
3. **User Stories** (Can be executed in parallel after Phase 2 completes):
   - **US1**: Development Environment (T031-T055) - Foundation for all other stories
   - **US2**: Component Conversion (T056-T095) - Depends on US1
   - **US3**: Interactive Features (T096-T125) - Depends on US2 (needs Header/Layout)
   - **US4**: Featured Slider (T126-T148) - Depends on US1 (needs content), can parallel US2/US3
   - **US5**: Production Build (T149-T171) - Depends on US1-US4 completion
4. **Phase 8: Polish** (T172-T205) → Depends on all user stories

### Recommended Execution Order

**Week 1**: Phase 1 + Phase 2 (T001-T030)  
**Week 2**: US1 complete (T031-T055)  
**Week 3**: US2 complete (T056-T095)  
**Week 4**: US3 + US4 in parallel (T096-T148)  
**Week 5**: US5 complete (T149-T171)  
**Week 6**: Phase 8 Polish (T172-T205)

### Parallel Execution Opportunities

Within each phase, tasks marked [P] can be executed in parallel:

**Phase 1 Setup**: T006-T011 (install dependencies) can run simultaneously  
**Phase 2 Foundational**: T019-T029 (create files) can run simultaneously  
**US1**: T031-T033 (layout components), T041-T042 (content), T038 (SEO) can parallel  
**US2**: T066-T069 (navigation), T078-T080 (widgets), T083-T085 (common) can parallel  
**US3**: T096-T099 (hooks), T115 (slideout), T121 (search) can parallel  
**US4**: T139-T140 (featured components) can parallel  
**Phase 8**: T172-T175 (responsive), T179-T182 (browsers), T185-T188 (Lighthouse) can parallel

### MVP Scope (Minimal Viable Product)

For fastest time-to-value, implement in this order:

1. **MVP 1**: US1 only (T001-T055) - Working dev environment with basic homepage
2. **MVP 2**: Add US2 (T056-T095) - Full component structure
3. **MVP 3**: Add US5 (T149-T171) - Deployable static site
4. **Full Product**: Add US3, US4, Phase 8 - Complete feature set

### Independent Testing Per User Story

Each user story includes independent test criteria:

- **US1**: Dev server runs, hot reload works, theme styling applies
- **US2**: All components render, layouts match WordPress theme
- **US3**: Interactive features functional, dark mode persists
- **US4**: Slider displays with articles, gestures work
- **US5**: Production build succeeds, site works when served statically

---

## Summary

**Total Tasks**: 213 (updated for Tailwind CSS)  
**Parallelizable Tasks**: 95 (45% of total)  
**Estimated Timeline**: 6-8 weeks for full implementation  
**MVP Timeline**: 2-3 weeks for core functionality (US1, US2, US5)

### Task Breakdown by Phase

- Phase 1 Setup: 20 tasks (includes Tailwind CSS installation)
- Phase 2 Foundational: 14 tasks (includes Tailwind config extraction)
- US1 Development Environment: 25 tasks
- US2 Component Conversion: 40 tasks (using Tailwind utilities)
- US3 Interactive Features: 30 tasks (Tailwind dark mode)
- US4 Featured Slider: 23 tasks
- US5 Production Build: 23 tasks
- Phase 8 Polish: 34 tasks

### Tailwind CSS Integration

Phase 1 and Phase 2 now include:
- Tailwind CSS 3.4+ installation (T008-T009)
- tailwind.config.ts creation (T014)
- PostCSS configuration (T015)
- Design token extraction from HybridMag (T023-T025)
- Tailwind directives in global.css (T026)

All component tasks use Tailwind utility classes instead of custom CSS files.

### Next Steps

1. Begin with Phase 1 (T001-T020) to initialize project with Tailwind
2. Complete Phase 2 (T017-T030) to setup structure
3. Start US1 (T031-T055) to get dev environment running
4. Continue with remaining user stories in order
5. Finish with Phase 8 polish and testing

All tasks are ready for execution. Each task has specific file paths and clear completion criteria.
