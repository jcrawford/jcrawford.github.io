# Implementation Tasks: Resume Page with LinkedIn Recommendations

**Feature**: Resume Page | **Branch**: `002-resume-page` | **Generated**: 2025-11-17

## Overview

This document provides a complete, dependency-ordered task breakdown for implementing the resume page feature. Tasks are organized by user story to enable independent implementation and testing. Each phase represents a deliverable increment that can be tested in isolation.

**Total Estimated Tasks**: 78  
**P1 Tasks**: 41 (Profile, Skills, Recommendations Display)  
**P2 Tasks**: 20 (Work Experience, Education)  
**P3 Tasks**: 12 (LinkedIn Auto-Fetch)  
**Infrastructure**: 5 (Setup, Polish)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Recommended first delivery**: User Story 1 (Profile) only
- Provides immediate value: visitors can see identity and contact info
- Requires minimal dependencies (no animations, no LinkedIn fetch)
- Can be deployed and tested independently
- ~8 tasks, approximately 2-4 hours of work

### Incremental Delivery Phases
1. **Phase 1**: Profile only (MVP)
2. **Phase 2**: Profile + Skills animation
3. **Phase 3**: Profile + Skills + Static recommendations (manual data)
4. **Phase 4**: Full feature including LinkedIn auto-fetch
5. **Phase 5**: Work Experience + Education (optional enhancements)

### Parallel Execution Opportunities
- Profile, Skills, Experience, and Education components can be built in parallel after foundational setup
- Data JSON files can be created in parallel
- Tests can be written in parallel with implementation (if TDD)
- LinkedIn scraper can be developed independently of UI components

---

## Dependencies & Execution Order

### Story Completion Order

```text
Setup → Foundational → [US1, US2, US6] → US3 → [US4, US5] → Polish
        (blocking)      (parallel)       (needs US6) (parallel)
```

**Dependency Rationale**:
- **US1 (Profile)**: No dependencies, can start immediately after foundational
- **US2 (Skills)**: No dependencies, can start immediately after foundational
- **US6 (LinkedIn Fetch)**: No dependencies, provides data for US3
- **US3 (Recommendations)**: Depends on US6 completing (needs data source)
- **US4 (Experience)**: No dependencies, can start anytime after foundational
- **US5 (Education)**: No dependencies, can start anytime after foundational

### Critical Path
**Setup → Foundational → US6 (LinkedIn Fetch) → US3 (Recommendations Display) → Polish**

All other stories (US1, US2, US4, US5) can proceed in parallel off the critical path.

---

## Phase 1: Setup & Project Initialization

**Goal**: Establish development infrastructure and dependencies

**Duration**: ~1-2 hours

### Tasks

- [x] T001 Create feature branch `002-resume-page` from main
- [x] T002 Install production dependencies: `embla-carousel-react@^8.0.0` and `zod@^3.22.0` via npm
- [x] T003 Install development dependencies: `playwright@^1.40.0`, `cheerio@^1.0.0-rc.12`, `jest@^29.7.0`, `@testing-library/react@^14.1.0`, `@testing-library/jest-dom@^6.1.0`, `@testing-library/user-event@^14.5.0`, `jest-environment-jsdom@^29.7.0`, `ts-jest@^29.1.0`, `@types/jest@^29.5.0`, `identity-obj-proxy@^3.0.0`
- [x] T004 Create `/src/data/resume/` directory for JSON data files
- [x] T005 Create `/src/components/resume/` directory for resume-specific components
- [x] T006 Create `/src/hooks/` directory if it doesn't exist
- [x] T007 Create `/src/utils/` directory if it doesn't exist
- [x] T008 Create `/tests/unit/components/resume/` directory structure
- [x] T009 Create `/tests/integration/` directory
- [ ] T010 Create `.env.example` file with `LINKEDIN_SESSION_COOKIE=your_cookie_here` template and instructions ⚠️ **BLOCKED**: Cursor globalIgnore blocks .env* files - user must create manually

**Deliverable**: Project structure ready for development

---

## Phase 2: Foundational Infrastructure (Blocking)

**Goal**: Implement shared infrastructure required by all user stories

**Duration**: ~2-3 hours

**CRITICAL**: Must complete before starting any user story implementation

### Tasks

- [x] T011 Create TypeScript interfaces in `/src/types/resume.ts` for Profile, Skill, Experience, Education, Recommendation, RecommendationsCache
- [x] T012 Create Zod validation schemas in `/src/utils/resume-schemas.ts` for all resume entities
- [x] T013 Create `/src/utils/resume-data-loader.ts` to load and validate JSON files from `/src/data/resume/`
- [x] T014 Create `/src/pages/resume.tsx` as the main page component with route `/resume`
- [x] T015 Add `/resume` navigation link to `gatsby-config.ts` navigation array (optional: add to header menu)
- [x] T016 Create `/src/styles/resume.css` with base styles and CSS custom properties for theming
- [ ] T017 Import resume.css in `/src/components/Layout.tsx` ⚠️ **NEEDS MANUAL FIX**: Add `import '../styles/resume.css';` after line 12
- [x] T018 Create Jest configuration file `jest.config.js` with Gatsby-compatible settings
- [x] T019 Create test setup file `/tests/setup.ts` with @testing-library/jest-dom imports and Gatsby mocks
- [x] T020 Add test scripts to `package.json`: `test`, `test:watch`, `test:coverage`

**Deliverable**: Empty `/resume` page renders with site layout, ready for sections

**Independent Test**: Navigate to `/resume` and verify page loads with header/footer

---

## Phase 3: User Story 1 - Professional Profile (P1)

**Goal**: Display professional profile with photo, name, title, contact info, and social links

**Duration**: ~2-3 hours

**Priority**: P1 (Critical - Foundation of resume page)

**Independent Test**: Navigate to `/resume` and verify profile section displays name, title, photo, email, phone, location, social links, and bio. Test on mobile (320px) and desktop. Test in light and dark themes.

### Data Tasks

- [ ] T021 [P] [US1] Create `/src/data/resume/profile.json` with sample data: name, title, photo path, email, phone, location, socialLinks array, bio
- [ ] T022 [P] [US1] Add profile photo asset to `/static/images/resume/profile.jpg` (or appropriate path)

### Component Tasks

- [ ] T023 [US1] Create `/src/components/resume/ResumeProfile.tsx` component
- [ ] T024 [US1] Implement profile photo display using OptimizedImage component (if available) or standard img tag
- [ ] T025 [US1] Implement name and title display with proper heading hierarchy (h1 for name)
- [ ] T026 [US1] Implement contact information display (email with mailto:, phone with tel:, location)
- [ ] T027 [US1] Implement social links array rendering with target="_blank" and rel="noopener noreferrer"
- [ ] T028 [US1] Implement bio/introduction paragraph display
- [ ] T029 [US1] Add ResumeProfile component to `/src/pages/resume.tsx` with data loaded from profile.json

### Styling Tasks

- [ ] T030 [P] [US1] Add profile section styles to `/src/styles/resume.css` for light theme
- [ ] T031 [P] [US1] Add profile section dark theme styles using existing CSS custom properties
- [ ] T032 [P] [US1] Add profile section responsive styles for mobile (320px+), tablet, and desktop breakpoints
- [ ] T033 [US1] Test profile layout on mobile (320px width) and verify no horizontal scroll

### Validation Tasks

- [ ] T034 [US1] Add profile.json validation to gatsby-node.ts onPreBootstrap hook using ProfileSchema
- [ ] T035 [US1] Test validation by intentionally breaking profile.json and verifying build fails with clear error

**Deliverable**: Complete, styled profile section visible on `/resume` page

---

## Phase 4: User Story 2 - Skills with Animation (P1)

**Goal**: Display skills with animated progress bars triggered on scroll

**Duration**: ~4-5 hours

**Priority**: P1 (Critical - Core resume content with engaging UX)

**Independent Test**: Navigate to `/resume`, scroll to skills section, and verify bars animate from 0 to target percentage over 800-1000ms. Verify animation doesn't replay when scrolling away and back. Test with prefers-reduced-motion enabled (animation should be instant). Verify smooth 60fps animation on 3-year-old device.

### Data Tasks

- [ ] T036 [P] [US2] Create `/src/data/resume/skills.json` with array of sample skills: [{name: "TypeScript", proficiency: 85}, {name: "React", proficiency: 90}, ...] (at least 8-10 skills with varying proficiency 0-100)

### Hook Implementation

- [ ] T037 [US2] Create `/src/hooks/useIntersectionObserver.ts` custom hook with SSR guard
- [ ] T038 [US2] Implement intersection observer logic with 30% threshold and one-time trigger (hasAnimated state)
- [ ] T039 [US2] Return { isVisible, hasAnimated } from hook

### Component Tasks

- [ ] T040 [US2] Create `/src/components/resume/SkillBar.tsx` component for individual skill
- [ ] T041 [US2] Implement skill name and percentage display
- [ ] T042 [US2] Implement skill bar track (background) and fill (animated) elements
- [ ] T043 [US2] Integrate useIntersectionObserver hook to trigger animation
- [ ] T044 [US2] Add conditional 'animate' class when isVisible=true
- [ ] T045 [US2] Use CSS custom property `--target-width` to set bar width dynamically
- [ ] T046 [US2] Create `/src/components/resume/ResumeSkills.tsx` container component
- [ ] T047 [US2] Map through skills array and render SkillBar for each skill
- [ ] T048 [US2] Add ResumeSkills component to `/src/pages/resume.tsx` with data loaded from skills.json

### Animation Styling

- [ ] T049 [US2] Add skill bar base styles to `/src/styles/resume.css` with initial width: 0
- [ ] T050 [US2] Add CSS transition: `width 900ms cubic-bezier(0.4, 0.0, 0.2, 1)` to `.skill-bar`
- [ ] T051 [US2] Add `.skill-bar.animate` class that sets `width: var(--target-width)`
- [ ] T052 [US2] Add `@media (prefers-reduced-motion: reduce)` styles to disable transition and set width instantly
- [ ] T053 [P] [US2] Add dark theme styles for skill bars
- [ ] T054 [P] [US2] Add responsive styles for skill bars (mobile, tablet, desktop)

### Performance & Accessibility

- [ ] T055 [US2] Test animation performance with Chrome DevTools Performance panel (verify 60fps)
- [ ] T056 [US2] Test prefers-reduced-motion by enabling it in OS settings and verifying instant display
- [ ] T057 [US2] Test one-time animation trigger by scrolling past section and back

### Validation Tasks

- [ ] T058 [US2] Add skills.json validation to gatsby-node.ts using SkillsSchema (array, proficiency 0-100)
- [ ] T059 [US2] Test validation by setting proficiency to 150 and verifying build fails

**Deliverable**: Animated skills section that performs smoothly and respects accessibility preferences

---

## Phase 5: User Story 6 - LinkedIn Integration (P3, but needed for US3)

**Goal**: Automatically fetch LinkedIn recommendations during build

**Duration**: ~6-8 hours

**Priority**: P3 (Lower priority as feature, but blocks US3 implementation)

**Note**: This phase is implemented before US3 because US3 depends on having recommendation data available.

**Independent Test**: Add a test recommendation on LinkedIn, set LINKEDIN_SESSION_COOKIE environment variable, trigger build, and verify new recommendation appears in recommendations.json cache file. Remove recommendation on LinkedIn, rebuild, and verify it's removed from cache. Test build with invalid cookie and verify it falls back to existing cache without failing.

### LinkedIn Scraper Implementation

- [ ] T060 [P] [US6] Create `/src/utils/linkedin-scraper.ts` with fetchLinkedInRecommendations function
- [ ] T061 [US6] Implement Playwright browser launch with headless mode
- [ ] T062 [US6] Implement session cookie injection from process.env.LINKEDIN_SESSION_COOKIE
- [ ] T063 [US6] Navigate to https://www.linkedin.com/in/crawfordjoseph/details/recommendations/?detailScreenTabIndex=0
- [ ] T064 [US6] Wait for recommendations section to load using waitForSelector
- [ ] T065 [US6] Extract recommendation data: name, title, company, text, photo URL using page.$$eval
- [ ] T066 [US6] Download recommender profile photos to `/static/images/resume/recommendations/` directory
- [ ] T067 [US6] Transform photo URLs to local paths in recommendation data
- [ ] T068 [US6] Return array of LinkedInRecommendation objects
- [ ] T069 [US6] Add error handling for network failures, timeouts, invalid selectors
- [ ] T070 [US6] Add logging that never exposes cookie value (log cookie length only)

### Cache Management

- [ ] T071 [P] [US6] Create `/src/utils/cache-manager.ts` with saveRecommendationsCache function
- [ ] T072 [US6] Implement saveRecommendationsCache to write to `/src/data/resume/recommendations.json` with format: {fetchTimestamp, sourceURL, recommendations: [...]}
- [ ] T073 [US6] Implement loadCachedRecommendations function to read from recommendations.json
- [ ] T074 [US6] Add validation using RecommendationsCacheSchema when loading cache

### Build Integration

- [ ] T075 [US6] Modify `gatsby-node.ts` to add onPreBootstrap hook
- [ ] T076 [US6] In onPreBootstrap, check for LINKEDIN_SESSION_COOKIE environment variable
- [ ] T077 [US6] Call fetchLinkedInRecommendations() with try/catch
- [ ] T078 [US6] On success: save to cache using saveRecommendationsCache, log success with count
- [ ] T079 [US6] On failure: log warning, attempt to load cached data, continue build without failing
- [ ] T080 [US6] If no cache exists and fetch fails: log warning that recommendations will be hidden
- [ ] T081 [US6] Test build without LINKEDIN_SESSION_COOKIE set and verify clear error message
- [ ] T082 [US6] Test build with invalid cookie and verify fallback to cache
- [ ] T083 [US6] Test build with valid cookie and verify recommendations.json is updated

### Security & Documentation

- [ ] T084 [P] [US6] Add cookie renewal instructions to quickstart.md (how to get li_at cookie from DevTools)
- [ ] T085 [P] [US6] Document how to set LINKEDIN_SESSION_COOKIE in CI/CD (GitHub Actions secrets)
- [ ] T086 [US6] Audit all logging to ensure cookie value is never logged
- [ ] T087 [US6] Add .env to .gitignore if not already present

**Deliverable**: LinkedIn recommendations automatically fetched during builds and cached in recommendations.json

---

## Phase 6: User Story 3 - Recommendations Slider (P1)

**Goal**: Display LinkedIn recommendations in navigable slider with full text

**Duration**: ~4-5 hours

**Priority**: P1 (Critical - Social proof and credibility)

**Dependencies**: Requires Phase 5 (US6) to be complete for data source

**Independent Test**: Navigate to `/resume`, scroll to recommendations section, and verify recommendations display with name, title, company, photo, and full quote text. Test slider navigation with arrows and touch swipe. Verify slider height adjusts to accommodate long text. Test with 1 recommendation (no slider), 2 recommendations, and 10+ recommendations.

### Data Setup

- [ ] T088 [US3] Create sample `/src/data/resume/recommendations.json` manually for development (will be replaced by US6 fetch)
- [ ] T089 [US3] Include at least 3 sample recommendations with varying text lengths (50 chars, 300 chars, 800 chars)

### Component Implementation

- [ ] T090 [US3] Create `/src/components/resume/RecommendationSlide.tsx` for single recommendation display
- [ ] T091 [US3] Implement recommender photo display with fallback for missing photos
- [ ] T092 [US3] Implement recommender name, title, and company display
- [ ] T093 [US3] Implement recommendation quote/text display (full text, no truncation)
- [ ] T094 [US3] Create `/src/components/resume/ResumeRecommendations.tsx` slider container
- [ ] T095 [US3] Integrate Embla Carousel: import useEmblaCarousel from 'embla-carousel-react'
- [ ] T096 [US3] Set up Embla with options: { loop: false, align: 'start' }
- [ ] T097 [US3] Implement emblaRef and apply to carousel container div
- [ ] T098 [US3] Map recommendations array to RecommendationSlide components inside embla__container
- [ ] T099 [US3] Implement previous button with onClick handler: emblaApi?.scrollPrev()
- [ ] T100 [US3] Implement next button with onClick handler: emblaApi?.scrollNext()
- [ ] T101 [US3] Add aria-label attributes to navigation buttons for accessibility
- [ ] T102 [US3] Add ResumeRecommendations component to `/src/pages/resume.tsx` with data from recommendations.json

### Styling

- [ ] T103 [US3] Add Embla base styles to `/src/styles/resume.css`: .embla, .embla__container, .embla__slide
- [ ] T104 [US3] Set .embla to overflow: hidden
- [ ] T105 [US3] Set .embla__container to display: flex (no fixed height)
- [ ] T106 [US3] Set .embla__slide to flex: 0 0 100%, min-width: 0 (full width per slide, auto height)
- [ ] T107 [P] [US3] Style RecommendationSlide card layout for light theme
- [ ] T108 [P] [US3] Style slider navigation buttons (arrows) with hover states
- [ ] T109 [P] [US3] Add dark theme styles for recommendation cards and buttons
- [ ] T110 [P] [US3] Add responsive styles for mobile touch targets (larger buttons on mobile)

### Accessibility & Interaction

- [ ] T111 [US3] Test keyboard navigation: Tab to buttons, Enter/Space to navigate, Arrow keys within slider
- [ ] T112 [US3] Test touch swipe gestures on mobile device or Chrome DevTools mobile emulation
- [ ] T113 [US3] Test with screen reader (VoiceOver on Mac or NVDA on Windows) and verify ARIA labels are announced
- [ ] T114 [US3] Verify slider height adjusts dynamically to longest recommendation text
- [ ] T115 [US3] Test with single recommendation and verify slider controls are hidden or disabled appropriately

### Empty State Handling

- [ ] T116 [US3] Implement conditional rendering: hide recommendations section if recommendations array is empty
- [ ] T117 [US3] Test with empty recommendations.json and verify section is hidden

**Deliverable**: Fully functional, accessible recommendations slider displaying full-text testimonials with photos

---

## Phase 7: User Story 4 - Work Experience (P2)

**Goal**: Display work experience in chronological timeline

**Duration**: ~3-4 hours

**Priority**: P2 (Important but not critical)

**Independent Test**: Navigate to `/resume`, scroll to work experience section, and verify positions are listed in reverse chronological order with company, title, dates, and description. Verify timeline visual is clear. Test responsive layout on mobile (vertical timeline).

### Data Tasks

- [ ] T118 [P] [US4] Create `/src/data/resume/experience.json` with array of work experiences: [{company, title, startDate: "YYYY-MM", endDate: "YYYY-MM" | "Present", description}, ...] (at least 3-5 positions)

### Component Tasks

- [ ] T119 [US4] Create `/src/components/resume/TimelineItem.tsx` reusable component for timeline entries
- [ ] T120 [US4] Implement date range display with formatting (e.g., "Jan 2020 - Present" from "2020-01" to "Present")
- [ ] T121 [US4] Implement title display (company or position title)
- [ ] T122 [US4] Implement subtitle display (position title or company, depending on layout choice)
- [ ] T123 [US4] Implement description/body text display
- [ ] T124 [US4] Create `/src/components/resume/ResumeExperience.tsx` container component
- [ ] T125 [US4] Sort experience array by startDate descending (most recent first)
- [ ] T126 [US4] Map experience array to TimelineItem components
- [ ] T127 [US4] Add ResumeExperience component to `/src/pages/resume.tsx` with data from experience.json

### Styling Tasks

- [ ] T128 [US4] Add timeline base styles to `/src/styles/resume.css` with visual connector line
- [ ] T129 [P] [US4] Add timeline item styles with date, title, and description layout
- [ ] T130 [P] [US4] Add timeline dark theme styles
- [ ] T131 [US4] Add timeline responsive styles: horizontal/stepped on desktop, vertical on mobile
- [ ] T132 [US4] Test timeline visual clarity with multiple entries (ensure dates and positions are easy to follow)

### Validation Tasks

- [ ] T133 [US4] Add experience.json validation to gatsby-node.ts using ExperienceSchema
- [ ] T134 [US4] Test date format validation by using invalid date format and verifying build fails

### Empty State Handling

- [ ] T135 [US4] Implement conditional rendering: hide work experience section if experience array is empty
- [ ] T136 [US4] Test with empty experience.json and verify section is hidden

**Deliverable**: Clear, chronological work experience timeline integrated into resume page

---

## Phase 8: User Story 5 - Education (P2)

**Goal**: Display educational qualifications in chronological order

**Duration**: ~2-3 hours

**Priority**: P2 (Standard resume component)

**Independent Test**: Navigate to `/resume`, scroll to education section, and verify degrees/certificates are listed in reverse chronological order with institution, degree name, and dates. Verify visual styling matches work experience timeline.

### Data Tasks

- [ ] T137 [P] [US5] Create `/src/data/resume/education.json` with array of education entries: [{institution, degree, startDate: "YYYY-MM", endDate: "YYYY-MM"}, ...] (at least 2-3 entries)

### Component Tasks

- [ ] T138 [US5] Create `/src/components/resume/ResumeEducation.tsx` container component
- [ ] T139 [US5] Sort education array by startDate descending (most recent first)
- [ ] T140 [US5] Reuse TimelineItem component for each education entry
- [ ] T141 [US5] Map education array to TimelineItem components with appropriate props
- [ ] T142 [US5] Add ResumeEducation component to `/src/pages/resume.tsx` with data from education.json

### Styling Tasks

- [ ] T143 [P] [US5] Ensure education timeline styles match work experience timeline visually
- [ ] T144 [P] [US5] Add any education-specific style adjustments if needed (e.g., degree icon vs. company icon)
- [ ] T145 [US5] Test visual consistency between work experience and education sections

### Validation Tasks

- [ ] T146 [US5] Add education.json validation to gatsby-node.ts using EducationSchema
- [ ] T147 [US5] Test validation with invalid date format

### Empty State Handling

- [ ] T148 [US5] Implement conditional rendering: hide education section if education array is empty
- [ ] T149 [US5] Test with empty education.json and verify section is hidden

**Deliverable**: Education section with chronological timeline matching site design system

---

## Phase 9: Testing, Polish & Integration

**Goal**: Ensure production-ready quality, accessibility, and performance

**Duration**: ~4-6 hours

**Priority**: Critical before launch

### Integration Testing

- [ ] T150 Load full resume page with all sections populated and verify complete layout
- [ ] T151 Test `/resume` route navigation from site header/menu
- [ ] T152 Verify all sections render in correct order: Profile → Skills → Recommendations → Experience → Education
- [ ] T153 Test page with all sections having data
- [ ] T154 Test page with some sections empty (verify they're hidden per FR-033)
- [ ] T155 Test page with only profile data (all other sections empty)

### Responsive & Cross-Browser Testing

- [ ] T156 Test on mobile 320px width (smallest supported size) and verify no horizontal scroll
- [ ] T157 Test on mobile 375px (iPhone standard) and verify layout quality
- [ ] T158 Test on tablet 768px and verify responsive breakpoints work
- [ ] T159 Test on desktop 1920px and verify content is well-proportioned
- [ ] T160 Test on Chrome (latest)
- [ ] T161 Test on Firefox (latest)
- [ ] T162 Test on Safari (latest, macOS and iOS)
- [ ] T163 Test on Edge (latest)

### Theme & Accessibility Testing

- [ ] T164 Test light theme: verify all resume sections use correct colors and backgrounds
- [ ] T165 Test dark theme: verify all resume sections adapt correctly
- [ ] T166 Test theme switching (light to dark and back) while viewing resume page
- [ ] T167 Run Lighthouse accessibility audit and verify score ≥ 90
- [ ] T168 Fix any accessibility issues identified by Lighthouse
- [ ] T169 Test keyboard navigation through entire page (Tab order, Enter/Space activation)
- [ ] T170 Test with screen reader (VoiceOver/NVDA) and verify all content is accessible
- [ ] T171 Verify all images have appropriate alt text
- [ ] T172 Verify heading hierarchy is correct (h1 for name, h2 for sections, h3 for subsections)

### Performance Testing

- [ ] T173 Run Lighthouse performance audit and verify score ≥ 90
- [ ] T174 Measure page load time on simulated 3G connection (target: <3 seconds per SC-002)
- [ ] T175 Test skill bar animation performance with Chrome DevTools Performance panel (verify 60fps)
- [ ] T176 Verify bundle size impact: check that embla-carousel-react and zod total ~13KB gzipped
- [ ] T177 Test with throttled CPU (4x slowdown in DevTools) and verify animations remain smooth

### Build & Deployment Testing

- [ ] T178 Test build without LINKEDIN_SESSION_COOKIE and verify clear error message (not build failure)
- [ ] T179 Test build with invalid LINKEDIN_SESSION_COOKIE and verify fallback to cache
- [ ] T180 Test build with valid LINKEDIN_SESSION_COOKIE and verify recommendations.json is updated
- [ ] T181 Verify no sensitive data (cookies, API keys) appears in build output or logs
- [ ] T182 Perform full production build with `npm run build` and verify no errors
- [ ] T183 Test production build locally with `gatsby serve` and verify all functionality works

### Documentation

- [ ] T184 Create `/specs/002-resume-page/quickstart.md` with developer onboarding guide
- [ ] T185 Document how to update resume content (which JSON files to edit)
- [ ] T186 Document how to obtain and set LINKEDIN_SESSION_COOKIE
- [ ] T187 Document how to manually refresh recommendations
- [ ] T188 Document testing procedures for each section
- [ ] T189 Document troubleshooting common issues (expired cookies, animation not working, etc.)

### Final Validation

- [ ] T190 Verify all success criteria from spec.md are met (SC-001 through SC-012)
- [ ] T191 Verify all functional requirements from spec.md are met (FR-001 through FR-035)
- [ ] T192 Review all edge cases from spec.md and verify they're handled appropriately
- [ ] T193 Perform final code review: check for TypeScript errors, linter warnings, console.logs
- [ ] T194 Update main branch via pull request with comprehensive description and screenshots

**Deliverable**: Production-ready resume page meeting all specifications and quality standards

---

## Task Summary

### By Phase
- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (US1 - Profile)**: 15 tasks
- **Phase 4 (US2 - Skills)**: 24 tasks
- **Phase 5 (US6 - LinkedIn)**: 28 tasks
- **Phase 6 (US3 - Recommendations)**: 30 tasks
- **Phase 7 (US4 - Experience)**: 19 tasks
- **Phase 8 (US5 - Education)**: 13 tasks
- **Phase 9 (Polish)**: 45 tasks

**Total**: 194 tasks

### By Priority
- **P1 (Critical)**: 109 tasks (Profile, Skills, Recommendations)
- **P2 (Important)**: 32 tasks (Work Experience, Education)
- **P3 (Enhancement)**: 28 tasks (LinkedIn Auto-Fetch)
- **Infrastructure**: 25 tasks (Setup, Foundational, Polish)

### Parallel Execution Examples

**After Foundational Phase Completes, can run in parallel**:
```
Thread 1: T021-T035 (US1 Profile)
Thread 2: T036-T059 (US2 Skills)
Thread 3: T060-T087 (US6 LinkedIn)
Thread 4: T118-T136 (US4 Experience)
Thread 5: T137-T149 (US5 Education)
```

**US3 (Recommendations) must wait for US6 to complete** (needs data source)

**Within a single user story, parallelizable tasks marked with [P]**:
- Data file creation can happen while building components
- Styling tasks can happen in parallel if in different files or sections
- Test writing can happen in parallel with implementation

### Independent Test Criteria

**US1 (Profile)**: ✅ Navigate to `/resume`, verify profile displays name, title, photo, contact, social links. Test responsive. Test themes.

**US2 (Skills)**: ✅ Scroll to skills, verify bars animate 800-1000ms from 0 to target. Verify no re-animation. Test prefers-reduced-motion. Verify 60fps.

**US3 (Recommendations)**: ✅ View recommendations slider, verify full text display, navigation works, touch swipes work, photos display. Test with varying text lengths.

**US4 (Experience)**: ✅ View work experience timeline, verify reverse chronological order, all fields display, responsive layout works.

**US5 (Education)**: ✅ View education timeline, verify reverse chronological order, consistent styling with experience.

**US6 (LinkedIn)**: ✅ Modify LinkedIn recommendations, trigger build with valid cookie, verify changes reflected in recommendations.json. Test with invalid cookie (fallback).

---

## Format Validation

✅ **All tasks follow required checklist format**:
- Checkbox: `- [ ]` prefix
- Task ID: Sequential T001-T194
- [P] marker: Present on parallelizable tasks only
- [Story] label: Present on user story phase tasks (US1-US6)
- Description: Clear action with file path where applicable
- Setup/Foundational/Polish tasks: No story label (correct)

✅ **All tasks are actionable**: Each task specifies what to do and where (file path)

✅ **Dependencies are clear**: Critical path and parallel opportunities documented

✅ **Independent test criteria**: Each user story has clear, specific test criteria

---

## Next Steps

1. **Review this task breakdown** with stakeholders/team
2. **Select MVP scope** (recommend: US1 Profile only for first iteration)
3. **Begin implementation** starting with Phase 1 (Setup)
4. **Track progress** by checking off tasks as completed
5. **Test each phase independently** before moving to next
6. **Deploy incrementally** after each user story completes

**Estimated Total Time**: 30-40 hours for full implementation (all user stories)  
**Estimated MVP Time**: 4-6 hours (US1 Profile only)

---

**Document Status**: ✅ Complete and ready for execution  
**Last Updated**: 2025-11-17  
**Next Review**: After Phase 2 completion (foundational infrastructure ready)

