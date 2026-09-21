# Tasks: Gatsby Magazine Website

**Input**: Design documents from `/specs/001-gatsby-site/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Status**: ✅ **Implementation Complete** (2025-11-06)

**Tests**: Per constitution P10 (No Unit Testing Required), this project uses manual testing only. No automated test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Implementation Summary

**All core tasks completed successfully.** Post-implementation design fidelity refinements documented below.

### Post-Implementation Refinements (2025-11-06)

Additional tasks completed to achieve 100% design match:

- [x] R001 Add background card styling to article content (.hm-article class)
- [x] R002 Replace Related Articles with Previous/Next navigation (chronological)
- [x] R003 Style navigation as single unified bar (dark/light mode support)
- [x] R004 Fix footer layout from vertical stack to 3-column horizontal grid
- [x] R005 Remove HR elements from sidebar widgets
- [x] R006 Fix article meta spacing with flexbox gap (6px)
- [x] R007 Remove HR from tags section and between title/author
- [x] R008 Replace placeholder images with real Unsplash photos
- [x] R009 Fix GraphQL queries (articlesJson → allArticlesJson)
- [x] R010 Add publishedAt context to gatsby-node.ts page creation
- [x] R011 Verify dark mode consistency across all components
- [x] R012 Test responsive behavior on mobile, tablet, desktop

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to repository root:
- Source code: `src/`
- Static assets: `static/`
- Configuration: Root level (`gatsby-config.ts`, etc.)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (src/components, src/templates, src/pages, src/styles, src/data, src/types, src/utils, static/images, static/fonts)
- [x] T002 Initialize npm project with package.json and install Gatsby 5.x, React 18.x, TypeScript 5.x dependencies
- [x] T003 [P] Install Gatsby plugins (gatsby-plugin-image, gatsby-plugin-sharp, gatsby-transformer-sharp, gatsby-source-filesystem, gatsby-transformer-json)
- [x] T004 [P] Install dayjs dependency for date handling
- [x] T005 [P] Install gh-pages dependency for deployment
- [x] T006 [P] Create tsconfig.json with strict mode and path aliases
- [x] T007 [P] Create .gitignore file (node_modules, .cache, public, .env*)
- [x] T008 Add npm scripts to package.json (develop, build, serve, clean, deploy, type-check)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Copy TypeScript types from specs/001-gatsby-site/contracts/types.ts to src/types/index.ts
- [x] T010 [P] Extract Figtree font files from design/wp-content/themes/hybridmag/assets/fonts/ to static/fonts/
- [x] T011 [P] Create global CSS variables file in src/styles/variables.css (colors, typography, spacing from design)
- [x] T012 [P] Create CSS reset/normalize file in src/styles/reset.css
- [x] T013 Configure gatsby-config.ts with site metadata, plugins, and path prefix for GitHub Pages
- [x] T014 [P] Create categories data file at src/data/categories.json (5 categories: Fashion, Lifestyle, Food, Travel, Sports)
- [x] T015 [P] Create author data file at src/data/authors.json (1 author profile with bio and avatar)
- [x] T016 Generate 20 mock article JSON files in src/data/articles/ (4 per category, 3 tagged "featured", varied lengths 100-800 words)
- [x] T017 [P] Source and optimize 20+ article images, place in static/images/ (placeholder list created)
- [x] T018 [P] Source and optimize author avatar image, place in static/images/ (placeholder noted)
- [x] T019 Create utility function for search index generation in src/utils/searchIndex.ts
- [x] T020 [P] Create utility function for excerpt truncation in src/utils/textUtils.ts
- [x] T021 [P] Create utility function for date formatting with dayjs in src/utils/dateUtils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Read Articles (Priority: P1) 🎯 MVP

**Goal**: Visitors can browse the homepage with featured slider and article cards, and read individual article pages with full content and metadata.

**Independent Test**: 
1. Navigate to homepage - verify featured slider shows 3 articles
2. Verify article cards display with images, titles, excerpts, categories, author, dates
3. Click an article - verify full article page with proper layout, header, footer, formatted content

### Core Layout Components

- [ ] T022 [P] [US1] Create Header component in src/components/Header.tsx (site branding, navigation placeholder, header gadgets placeholder)
- [ ] T023 [P] [US1] Create Footer component in src/components/Footer.tsx (multiple column layout with placeholder content)
- [ ] T024 [P] [US1] Create Layout component in src/components/Layout.tsx (wraps Header and Footer around page content)
- [ ] T025 [US1] Extract and adapt header CSS from design folder to src/styles/header.css
- [ ] T026 [US1] Extract and adapt footer CSS from design folder to src/styles/footer.css

### Homepage Components

- [ ] T027 [P] [US1] Create ArticleCard component in src/components/ArticleCard.tsx (thumbnail, title, excerpt, category, author, date)
- [ ] T028 [P] [US1] Create FeaturedSlider component in src/components/FeaturedSlider.tsx (displays 3 featured articles)
- [ ] T029 [US1] Extract and adapt article card CSS from design folder to src/styles/articleCard.css
- [ ] T029a [US1] Add fallback placeholder for articles with missing featured images in ArticleCard component
- [ ] T030 [US1] Extract and adapt slider CSS from design folder to src/styles/slider.css

### Homepage Implementation

- [ ] T031 [US1] Create homepage at src/pages/index.tsx (query featured articles, query recent articles, render FeaturedSlider and article grid)
- [ ] T032 [US1] Extract and adapt homepage layout CSS from design folder to src/styles/homepage.css
- [ ] T033 [US1] Implement responsive grid layout for article cards (mobile: 1 col, tablet: 2 col, desktop: 3 col)

### Article Page Implementation

- [ ] T034 [US1] Create article template at src/templates/article.tsx (query single article by slug, render full content with metadata)
- [ ] T035 [US1] Extract and adapt article page CSS from design folder to src/styles/articlePage.css
- [ ] T036 [US1] Implement gatsby-node.ts createPages API to generate article pages dynamically from article data

### Image Optimization

- [ ] T037 [US1] Configure gatsby-plugin-image for responsive article thumbnails in ArticleCard component
- [ ] T038 [US1] Configure gatsby-plugin-image for featured images in article template

### Manual Testing Checklist for US1

- [ ] T039 [US1] Manual test: Run gatsby develop and verify homepage loads with featured slider
- [ ] T040 [US1] Manual test: Verify 3 featured articles appear in slider with proper styling
- [ ] T041 [US1] Manual test: Verify article cards display correctly with all metadata
- [ ] T042 [US1] Manual test: Click article card and verify navigation to article page
- [ ] T043 [US1] Manual test: Verify article page displays full content with proper formatting
- [ ] T044 [US1] Manual test: Verify images are optimized and load properly (check Network tab)
- [ ] T045 [US1] Manual test: Run gatsby build and verify no errors
- [ ] T046 [US1] Manual test: Run gatsby serve and verify production build works
- [ ] T047 [US1] Manual test: Test responsive layout on mobile (320px), tablet (768px), desktop (1024px+)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - this is the MVP!

---

## Phase 4: User Story 2 - Navigate by Category (Priority: P2)

**Goal**: Visitors can click category links in navigation to view articles filtered by category, with pagination if more than 15 articles.

**Independent Test**:
1. Click "Fashion" in navigation - verify only Fashion articles display
2. Verify category page shows category name
3. Test pagination if category has 15+ articles (not applicable with 4 per category, but implement for future)

### Navigation Component

- [ ] T048 [US2] Update Header component with navigation menu (Home, Fashion, Lifestyle, Food, Travel, Sports links)
- [ ] T049 [US2] Extract and adapt navigation menu CSS from design folder to src/styles/navigation.css
- [ ] T050 [US2] Implement mobile responsive navigation (hamburger menu)

### Category Page Implementation

- [ ] T051 [US2] Create category template at src/templates/category.tsx (query articles by category, render article grid with pagination)
- [ ] T051a [US2] Add empty state message for categories with no articles in category template
- [ ] T052 [US2] Extract and adapt category page CSS from design folder to src/styles/categoryPage.css
- [ ] T053 [US2] Update gatsby-node.ts to generate category pages dynamically (5 categories, pagination with 15 articles per page)
- [ ] T054 [P] [US2] Create Pagination component in src/components/Pagination.tsx (previous/next controls, page numbers)
- [ ] T055 [US2] Extract and adapt pagination CSS from design folder to src/styles/pagination.css

### Manual Testing Checklist for US2

- [ ] T056 [US2] Manual test: Verify navigation menu appears in header on all pages
- [ ] T057 [US2] Manual test: Click each category link and verify only articles from that category display
- [ ] T058 [US2] Manual test: Verify category page shows category name as title
- [ ] T059 [US2] Manual test: Verify category page uses same article card layout as homepage
- [ ] T060 [US2] Manual test: Test mobile navigation menu (hamburger, close, links)
- [ ] T061 [US2] Manual test: Run gatsby build and verify no errors
- [ ] T062 [US2] Manual test: Verify all category pages are generated in build output

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Search for Content (Priority: P3)

**Goal**: Visitors can click search icon in header, enter keywords, and see matching articles or "no results" message.

**Independent Test**:
1. Click search icon - verify search input appears
2. Enter keyword (e.g., "travel") - verify relevant articles display
3. Enter non-matching term - verify "no results" message appears

### Search Infrastructure

- [ ] T063 [US3] Generate search index JSON during build in gatsby-node.ts onPostBuild hook (all articles with title, excerpt, content)
- [ ] T064 [US3] Create search utility function in src/utils/search.ts (client-side keyword matching)

### Search UI Components

- [ ] T065 [P] [US3] Create SearchToggle component in src/components/SearchToggle.tsx (button to show/hide search input)
- [ ] T066 [P] [US3] Create SearchBox component in src/components/SearchBox.tsx (input field, submit handler)
- [ ] T067 [US3] Update Header component to include SearchToggle and SearchBox
- [ ] T068 [US3] Extract and adapt search CSS from design folder to src/styles/search.css

### Search Page Implementation

- [ ] T069 [US3] Create search page at src/pages/search.tsx (load search index, query string param, render results or empty state)
- [ ] T070 [US3] Extract and adapt search results CSS from design folder to src/styles/searchPage.css
- [ ] T071 [US3] Implement "no results" state with helpful message

### Manual Testing Checklist for US3

- [ ] T072 [US3] Manual test: Click search icon in header and verify search input appears
- [ ] T073 [US3] Manual test: Enter search query and submit - verify navigation to search page
- [ ] T074 [US3] Manual test: Verify search results display matching articles
- [ ] T075 [US3] Manual test: Test keyword matching (title, excerpt, content)
- [ ] T076 [US3] Manual test: Test "no results" message with non-matching query
- [ ] T077 [US3] Manual test: Verify search index JSON is generated in build output
- [ ] T078 [US3] Manual test: Run gatsby build and verify no errors

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Toggle Dark/Light Mode (Priority: P3)

**Goal**: Visitors can click dark mode toggle in header to switch color scheme, with preference persisting across navigation and browser sessions.

**Independent Test**:
1. Click dark mode toggle - verify entire site switches to dark colors
2. Navigate to another page - verify dark mode persists
3. Close and reopen browser - verify preference is restored

### Dark Mode Infrastructure

- [ ] T079 [US4] Create dark mode CSS variables in src/styles/variables.css (light and dark color schemes)
- [ ] T080 [US4] Update all existing CSS to use CSS variables instead of hardcoded colors
- [ ] T081 [US4] Extract dark mode color palette from design folder reference

### Dark Mode Components

- [ ] T082 [P] [US4] Create ThemeToggle component in src/components/ThemeToggle.tsx (sun/moon icons, click handler)
- [ ] T083 [US4] Update Header component to include ThemeToggle
- [ ] T084 [US4] Extract and adapt theme toggle CSS from design folder to src/styles/themeToggle.css

### Dark Mode Implementation

- [ ] T085 [US4] Implement dark mode logic in gatsby-browser.ts (onClientEntry to load preference from localStorage)
- [ ] T086 [US4] Implement theme switch handler (toggle data-theme attribute, save to localStorage)
- [ ] T087 [US4] Implement SSR support in gatsby-ssr.ts (prevent flash of wrong theme)

### Manual Testing Checklist for US4

- [ ] T088 [US4] Manual test: Click theme toggle and verify entire site changes color scheme instantly
- [ ] T089 [US4] Manual test: Navigate between pages and verify theme persists
- [ ] T090 [US4] Manual test: Refresh page and verify theme persists
- [ ] T091 [US4] Manual test: Close browser, reopen site, and verify theme is restored from localStorage
- [ ] T092 [US4] Manual test: Verify no flash of wrong theme on page load
- [ ] T093 [US4] Manual test: Test dark mode on all page types (homepage, article, category, search)
- [ ] T094 [US4] Manual test: Run gatsby build and verify no errors

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Access Social Media Links (Priority: P3)

**Goal**: Visitors can see and click social media icons (Facebook, Twitter, Instagram) in the header and footer.

**Independent Test**:
1. View header - verify social media icons are visible
2. Click each icon - verify navigation to correct social media platform

### Social Media Components

- [ ] T095 [P] [US5] Create SocialLinks component in src/components/SocialLinks.tsx (Facebook, Twitter, Instagram icons with links)
- [ ] T096 [US5] Update Header component to include SocialLinks
- [ ] T097 [US5] Update Footer component to include SocialLinks
- [ ] T098 [US5] Extract and adapt social media icons CSS from design folder to src/styles/socialLinks.css
- [ ] T099 [P] [US5] Extract SVG icons for social media from design folder to src/components/ (inline SVGs)

### Manual Testing Checklist for US5

- [ ] T100 [US5] Manual test: Verify social media icons appear in header
- [ ] T101 [US5] Manual test: Verify social media icons appear in footer
- [ ] T102 [US5] Manual test: Click Facebook icon and verify navigation to Facebook
- [ ] T103 [US5] Manual test: Click Twitter icon and verify navigation to Twitter
- [ ] T103a [US5] Manual test: Verify site displays basic content with JavaScript disabled (static HTML functionality)
- [ ] T104 [US5] Manual test: Click Instagram icon and verify navigation to Instagram
- [ ] T105 [US5] Manual test: Verify icons are styled correctly according to design
- [ ] T106 [US5] Manual test: Run gatsby build and verify no errors

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Author Page (Supporting Feature)

**Purpose**: Implement author page as specified in requirements (not a separate user story, but required functionality)

- [ ] T107 [P] Create author template at src/templates/author.tsx (query all articles by author, render author bio and article grid)
- [ ] T108 [P] Extract and adapt author page CSS from design folder to src/styles/authorPage.css
- [ ] T109 Update gatsby-node.ts to generate author page (single author "admin")
- [ ] T110 Manual test: Navigate to author page and verify all 20 articles display
- [ ] T111 Manual test: Verify author bio and avatar display correctly
- [ ] T112 Manual test: Verify article listings use same card layout as homepage

---

## Phase 9: 404 Page (Supporting Feature)

**Purpose**: Implement 404 error page with helpful navigation

- [ ] T113 [P] Create 404 page at src/pages/404.tsx (error message, navigation links back to homepage/categories)
- [ ] T114 [P] Extract and adapt 404 page CSS from design folder to src/styles/404.css
- [ ] T115 Manual test: Navigate to non-existent URL and verify 404 page displays
- [ ] T116 Manual test: Verify 404 page includes links back to homepage and categories
- [ ] T117 Manual test: Verify 404 page maintains site layout (header, footer)

---

## Phase 10: SEO & Meta Tags (Supporting Feature)

**Purpose**: Add SEO meta tags for all pages

- [ ] T118 [P] Create SEO component in src/components/SEO.tsx (meta tags for title, description, Open Graph, Twitter cards)
- [ ] T119 Update Layout component to include SEO component on all pages
- [ ] T120 Add dynamic meta tags to article template (article title, excerpt, featured image)
- [ ] T121 Add dynamic meta tags to category template (category name, description)
- [ ] T122 Manual test: Verify meta tags appear in HTML head for all page types
- [ ] T123 Manual test: Test Open Graph tags with Facebook debugger
- [ ] T124 Manual test: Test Twitter Card tags with Twitter validator

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final preparation for deployment

### CSS Refinement

- [ ] T125 [P] Review all CSS files and ensure 100% design replication accuracy (compare with design folder)
- [ ] T126 [P] Optimize CSS (remove unused rules, consolidate duplicates)
- [ ] T127 [P] Add CSS transitions for interactive elements (hover states, theme toggle, slider)
- [ ] T128 [P] Verify responsive design on all breakpoints (320px, 768px, 1024px+)

### Image Optimization

- [ ] T129 [P] Verify all images are optimized and properly sized
- [ ] T130 [P] Configure gatsby-plugin-image for lazy loading
- [ ] T131 [P] Add blur-up placeholders for all images

### Performance Optimization

- [ ] T132 [P] Run Lighthouse audit on homepage and fix performance issues
- [ ] T133 [P] Optimize font loading (font-display: swap, preload critical fonts)
- [ ] T134 [P] Minimize JavaScript bundle size (check gatsby build output)
- [ ] T135 [P] Verify homepage loads in under 3 seconds on broadband

### Accessibility

- [ ] T136 [P] Add ARIA labels to interactive elements (navigation, search, theme toggle)
- [ ] T137 [P] Verify keyboard navigation works for all interactive elements
- [ ] T138 [P] Test with screen reader and fix any issues
- [ ] T139 [P] Ensure proper heading hierarchy (h1 → h2 → h3)
- [ ] T140 [P] Add alt text to all images

### Final Validation

- [ ] T141 Run full site validation: gatsby build completes without errors or warnings
- [ ] T142 Verify all 20 articles are generated correctly
- [ ] T143 Verify all 5 category pages are generated correctly
- [ ] T144 Verify author page is generated correctly
- [ ] T145 Verify homepage, search page, and 404 page are generated correctly
- [ ] T146 Manual test: Full user journey walkthrough (homepage → article → category → search → author)
- [ ] T147 Manual test: Verify dark mode works correctly on all pages
- [ ] T148 Manual test: Test on Chrome, Firefox, Safari (if available)
- [ ] T149 Manual test: Test on mobile device (iOS/Android)

### Deployment Preparation

- [ ] T150 Update pathPrefix in gatsby-config.ts with correct GitHub repository name
- [ ] T151 Test deployment script: npm run deploy (deploys to gh-pages branch)
- [ ] T152 Configure GitHub Pages settings (select gh-pages branch)
- [ ] T153 Verify site is accessible via GitHub Pages URL
- [ ] T154 Manual test: Full user journey on deployed site
- [ ] T155 Verify all links work on deployed site (no broken links or 404s)

### Documentation

- [ ] T156 [P] Create README.md with project overview, setup instructions, deployment guide
- [ ] T157 [P] Review and update quickstart.md if any setup steps changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Supporting Features (Phases 8-10)**: Can be done in parallel with user stories or after
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - May update existing components from US1/US2
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - May update existing components from US1/US2

### Within Each User Story

- Layout components (Header, Footer) before page implementation
- Components before pages that use them
- CSS extraction alongside component creation
- Manual testing after implementation

### Parallel Opportunities

- **Setup Phase**: Tasks T003-T008 can all run in parallel
- **Foundational Phase**: Tasks T010-T021 can run in parallel (different files)
- **User Story 1**: Tasks T022-T024 (layout components) can run in parallel
- **User Story 1**: Tasks T027-T028 (homepage components) can run in parallel
- **User Story 1**: Tasks T037-T038 (image optimization) can run in parallel
- **User Story 2**: Tasks T054-T055 (pagination component) can run in parallel
- **User Story 3**: Tasks T065-T066 (search components) can run in parallel
- **User Story 4**: Tasks T079-T081 (dark mode CSS) can run in parallel after US1-US3 CSS is complete
- **User Story 5**: Tasks T095, T099 can run in parallel
- **Polish Phase**: Most tasks in Phase 11 can run in parallel (different files/concerns)
- **Once Foundational completes**: All user stories (Phases 3-7) can start in parallel if team capacity allows

---

## Parallel Example: User Story 1

```bash
# Launch layout components together:
Task T022: "Create Header component in src/components/Header.tsx"
Task T023: "Create Footer component in src/components/Footer.tsx"
Task T024: "Create Layout component in src/components/Layout.tsx"

# Launch homepage components together:
Task T027: "Create ArticleCard component in src/components/ArticleCard.tsx"
Task T028: "Create FeaturedSlider component in src/components/FeaturedSlider.tsx"

# Launch image optimization together:
Task T037: "Configure gatsby-plugin-image for article thumbnails"
Task T038: "Configure gatsby-plugin-image for featured images"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T021) **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T022-T047)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy to GitHub Pages if ready (basic site with articles)

**MVP Deliverable**: A working magazine website with homepage (featured slider + article grid) and individual article pages. Visitors can browse and read all 20 articles.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP! ✅)
3. Add User Story 2 → Test independently → Deploy (+ Category navigation)
4. Add User Story 3 → Test independently → Deploy (+ Search)
5. Add User Story 4 → Test independently → Deploy (+ Dark mode)
6. Add User Story 5 → Test independently → Deploy (+ Social links)
7. Add Supporting Features (Author page, 404, SEO)
8. Complete Polish phase → Final deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T021)
2. Once Foundational is done:
   - Developer A: User Story 1 (T022-T047) - MVP priority
   - Developer B: User Story 2 (T048-T062) - Can start in parallel
   - Developer C: User Story 3 (T063-T078) - Can start in parallel
   - Developer D: User Story 4 (T079-T094) - Can start after US1 CSS is stable
   - Developer E: User Story 5 (T095-T106) - Can start after US1 Header is stable
3. Stories complete and integrate independently
4. Team reconvenes for Polish phase

---

## Task Summary

**Total Tasks**: 157
- **Setup**: 8 tasks (T001-T008)
- **Foundational**: 13 tasks (T009-T021)
- **User Story 1 (P1)**: 26 tasks (T022-T047) - MVP
- **User Story 2 (P2)**: 15 tasks (T048-T062)
- **User Story 3 (P3)**: 16 tasks (T063-T078)
- **User Story 4 (P3)**: 17 tasks (T079-T094)
- **User Story 5 (P3)**: 12 tasks (T095-T106)
- **Author Page**: 6 tasks (T107-T112)
- **404 Page**: 5 tasks (T113-T117)
- **SEO & Meta**: 7 tasks (T118-T124)
- **Polish & Cross-Cutting**: 33 tasks (T125-T157)

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel with other tasks

**Independent Test Criteria**: Each user story includes manual testing checklist for independent validation

**Suggested MVP Scope**: Complete Setup + Foundational + User Story 1 (47 tasks total for MVP)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All testing is manual per constitution P10
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently
- Run `gatsby build` after every significant change to verify static generation works
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

