# Implementation Plan: Resume Page with LinkedIn Recommendations

**Branch**: `002-resume-page` | **Date**: 2025-11-17 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-resume-page/spec.md`

## Summary

Create a comprehensive resume page at `/resume` that displays professional profile, skills (with 800-1000ms animated progress bars at 0-100% scale), work experience, education, and LinkedIn recommendations (fetched automatically during builds via session cookies). Resume data is stored in multiple JSON files (`profile.json`, `skills.json`, `experience.json`, `education.json`) in `/src/data/resume/`, with recommendations cached in `recommendations.json`. The page integrates with existing Gatsby site theming, supports light/dark modes, meets accessibility targets (Lighthouse 90+), and includes a touch-enabled slider for browsing recommendations with full-text display (no truncation). Cache remains valid indefinitely for maximum build reliability.

## Technical Context

**Language/Version**: TypeScript 5.3.3 with React 18.3.0  
**Framework**: Gatsby 5.13.0 (Static Site Generator)  
**Primary Dependencies**: 
- gatsby-plugin-image (image optimization)
- gatsby-transformer-json (JSON data sourcing - already installed)
- gatsby-transformer-sharp (image processing)
- React 18 (UI components)
- **New**: Embla Carousel React (~10KB, for recommendations slider)
- **New**: Zod (~3KB, for data validation)
- **New**: Cheerio or Playwright (for LinkedIn HTML parsing)

**Storage**: Multiple JSON files in `/src/data/resume/` directory (profile, skills, experience, education, recommendations cache)  
**Testing**: Jest + React Testing Library (needs setup - not currently in package.json)  
**Target Platform**: Web (static site, responsive: 320px mobile to desktop 4K)  
**Project Type**: Single Gatsby web application (frontend only)  
**Performance Goals**: 
- Page load < 3 seconds on broadband
- 60fps skill bar animations (800-1000ms duration)
- Lighthouse accessibility score ≥ 90
- Skills display 0-100% proficiency scale

**Constraints**: 
- Skills animation: exactly 800-1000ms duration, triggered on scroll
- Must respect prefers-reduced-motion CSS media query
- Must support light/dark theme via existing CSS variables
- Recommendation text: no truncation, full display
- Cache: never expires (valid indefinitely)
- Session cookies: stored in environment variables, never logged

**Scale/Scope**: 
- Single resume page (~5 main sections)
- Single user data source
- Estimated: 10-20 skills, 5-10 positions, 3-5 education entries, 5-15 recommendations
- LinkedIn fetch adds ~30-60 seconds to build time (with session auth)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (No Active Constitution)

**Analysis**: The project does not have an established constitution file (template found at `.specify/memory/constitution.md` but not customized). No specific architectural principles, testing mandates, or complexity gates have been defined for this codebase.

**Observations**:
- No testing framework currently configured (Jest/RTL will be added)
- No existing test-driven development (TDD) requirements
- No defined component architecture patterns
- No explicit constraints on external integrations

**Action**: Proceeding with standard Gatsby/React best practices and the constraints defined in the feature specification. Future iterations should consider establishing project-specific principles around:
- Testing requirements and coverage thresholds
- Component architecture patterns (container/presentational)
- Data fetching and state management approaches
- Build-time vs. runtime data handling
- Security practices for credentials management

Since there's no active constitution to violate, this feature proceeds without gate constraints.

## Project Structure

### Documentation (this feature)

```text
specs/002-resume-page/
├── spec.md              # Feature specification (complete with 5 clarifications)
├── checklists/
│   └── requirements.md  # Spec quality checklist (validated)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── resume-data-schema.ts
│   ├── profile.schema.json
│   ├── skills.schema.json
│   ├── experience.schema.json
│   ├── education.schema.json
│   └── recommendations.schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT yet created)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Layout.tsx                    # [EXISTING] - Main layout wrapper
│   ├── Header.tsx                    # [EXISTING] - Site header
│   ├── Footer.tsx                    # [EXISTING] - Site footer
│   ├── OptimizedImage.tsx            # [EXISTING] - Image optimization wrapper
│   └── resume/                       # [NEW] - Resume-specific components
│       ├── ResumeProfile.tsx         # Profile section with photo, name, contact
│       ├── ResumeSkills.tsx          # Skills section with animated bars container
│       ├── SkillBar.tsx              # Individual animated skill bar (800-1000ms)
│       ├── ResumeExperience.tsx      # Work experience timeline
│       ├── ResumeEducation.tsx       # Education timeline
│       ├── ResumeRecommendations.tsx # LinkedIn recommendations slider wrapper
│       ├── RecommendationSlide.tsx   # Single recommendation display (full text)
│       └── TimelineItem.tsx          # Reusable timeline entry component
│
├── data/
│   └── resume/                       # [NEW] - Multiple JSON files
│       ├── profile.json              # Profile data
│       ├── skills.json               # Skills array with 0-100 percentages
│       ├── experience.json           # Work history array
│       ├── education.json            # Education array
│       └── recommendations.json      # [GENERATED] Cached LinkedIn data (never expires)
│
├── hooks/
│   ├── useDarkMode.ts                # [EXISTING] - Theme management
│   ├── useMediaQuery.ts              # [EXISTING] - Responsive breakpoints
│   ├── useIntersectionObserver.ts    # [NEW] - Scroll animation trigger (no re-trigger)
│   └── useEmblaCarousel.ts           # [NEW] - Re-export from embla-carousel-react
│
├── pages/
│   └── resume.tsx                    # [NEW] - Main resume page component
│
├── styles/
│   ├── variables.css                 # [EXISTING] - CSS variables (theme colors)
│   ├── global.css                    # [EXISTING] - Global styles
│   └── resume.css                    # [NEW] - Resume page styles (light/dark theme)
│
├── types/
│   ├── index.ts                      # [EXISTING] - Type definitions
│   └── resume.ts                     # [NEW] - Resume data types with Zod schemas
│
└── utils/
    ├── linkedin-scraper.ts           # [NEW] - LinkedIn fetch logic (session cookies)
    ├── resume-data-loader.ts         # [NEW] - Load and merge JSON files
    └── cache-manager.ts              # [NEW] - Manage recommendations cache

scripts/
└── fetch-linkedin-recommendations.ts # [NEW] - Build-time script to fetch LinkedIn data

tests/                                # [NEW DIRECTORY] - Test structure
├── setup.ts                          # Jest setup
├── unit/
│   └── components/
│       └── resume/
│           ├── SkillBar.test.tsx     # Test 800-1000ms animation
│           ├── ResumeProfile.test.tsx
│           ├── TimelineItem.test.tsx
│           └── RecommendationSlide.test.tsx
└── integration/
    └── resume-page.test.tsx          # Full page integration test

gatsby-node.ts                        # [MODIFY] - Add LinkedIn fetch in onPreBootstrap
gatsby-config.ts                      # [MODIFY] - Add /resume to navigation
package.json                          # [MODIFY] - Add dependencies and test scripts
jest.config.js                        # [NEW] - Jest configuration
tsconfig.json                         # [EXISTING] - Already configured
```

**Structure Decision**: This is an existing Gatsby web application, so we're using the single project structure (Option 1 adapted for Gatsby). Components are organized by feature under `src/components/resume/`, with data split into multiple JSON files per clarification. The LinkedIn scraper runs during Gatsby's build process via `gatsby-node.ts` hooks, fetching to `/src/data/resume/recommendations.json` which serves as both source data and cache. Test structure follows Jest + React Testing Library conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations detected. No active project constitution to assess against.

## Phase 0: Research & Decisions

**Output**: [research.md](./research.md) (to be generated)

### Research Tasks

1. **Animation Implementation Strategy**
   - Question: CSS animations vs. JavaScript library for 800-1000ms skill bars?
   - Requirements: 60fps, scroll-triggered, no re-animation, prefers-reduced-motion support
   - Options: Pure CSS transitions, Framer Motion, React Spring, GSAP
   - Decision criteria: Bundle size, SSR compatibility, performance, simplicity

2. **LinkedIn Scraping Approach with Session Cookies**
   - Question: Best method to fetch LinkedIn recommendations using session authentication?
   - Requirements: Session cookie auth, HTML parsing, profile photo download, build-time execution
   - Options: Cheerio (lightweight HTML parser), Playwright (full browser), Puppeteer, jsdom
   - Decision criteria: Reliability with session auth, image downloading capability, build time impact, maintenance burden

3. **Carousel/Slider Library Selection**
   - Question: Which carousel library for recommendations slider?
   - Requirements: Touch/swipe, accessibility (ARIA), keyboard nav, responsive height (no truncation), light/dark theme compatible
   - Options: Embla Carousel, Swiper, React Slick, Keen Slider, custom implementation
   - Decision criteria: Accessibility support, bundle size, mobile touch quality, height flexibility

4. **Intersection Observer Implementation**
   - Question: Native API or library wrapper for scroll-triggered animations?
   - Requirements: SSR-safe, one-time trigger (no re-animation), threshold customization
   - Options: Native Intersection Observer API, react-intersection-observer library, custom hook
   - Decision criteria: Browser support (polyfill if needed), SSR compatibility, bundle size

5. **Data Validation Strategy for Multiple JSON Files**
   - Question: How to validate 5 separate JSON files at build time?
   - Requirements: TypeScript types, runtime validation, clear error messages, validate all files before build
   - Options: TypeScript only, Zod schemas, JSON Schema, Joi, manual validation
   - Decision criteria: DX, error quality, build-time validation, maintenance overhead

6. **Testing Framework Setup**
   - Question: Configure Jest + RTL for first time in this project?
   - Requirements: Gatsby compatibility, React 18 support, TypeScript support, component + integration tests
   - Options: Jest + RTL (standard), Vitest (faster), Cypress Component Testing
   - Decision criteria: Gatsby ecosystem support, community adoption, setup complexity

7. **Session Cookie Management**
   - Question: How to securely store and use LinkedIn session cookies in build environment?
   - Requirements: Never logged, encrypted storage, CI/CD compatible, clear renewal docs
   - Options: Environment variables (dotenv), Secrets management service, encrypted config files
   - Decision criteria: Security, CI/CD ease, developer experience, audit trail

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete

### Outputs

1. **[data-model.md](./data-model.md)** - Resume data structures for all JSON files
   - **Profile** entity (`profile.json`): name, title, photo, email, phone, location, social links array, bio
   - **Skill** entity (`skills.json`): array of {name: string, proficiency: number (0-100)}
   - **Experience** entity (`experience.json`): array of {company, title, startDate, endDate, description}
   - **Education** entity (`education.json`): array of {institution, degree, startDate, endDate}
   - **LinkedInRecommendation** (raw from scraper): recommender data + text + photo URL
   - **Recommendation** entity (`recommendations.json`): {fetchTimestamp, sourceURL, recommendations: array of {quote, name, title, company, photoPath}}

2. **[contracts/](./contracts/)** - TypeScript interfaces and Zod schemas
   - `resume-data-schema.ts` - Master types + Zod validators
   - `profile.schema.json` - JSON Schema for profile.json validation
   - `skills.schema.json` - JSON Schema with 0-100 constraint
   - `experience.schema.json` - JSON Schema for experience.json
   - `education.schema.json` - JSON Schema for education.json
   - `recommendations.schema.json` - JSON Schema for recommendations cache

3. **[quickstart.md](./quickstart.md)** - Developer guide
   - How to update resume content (edit which JSON file)
   - How to test the page locally (`npm run develop`)
   - How to configure LinkedIn session cookies (environment variables)
   - How to manually refresh LinkedIn recommendations
   - How to add new sections or customize animations
   - Data format examples for each JSON file
   - Troubleshooting common issues (cache, authentication, animations)

## Phase 2: Task Decomposition

**Note**: This phase is executed by the `/speckit.tasks` command, not by `/speckit.plan`.

The tasks will be generated in a separate workflow and output to `tasks.md`.

## Implementation Sequence

### Milestone 1: Foundation & Data Setup (P1)
**Goal**: Establish data structure, page routing, and basic profile display

- [ ] Set up data directory structure `/src/data/resume/`
- [ ] Create TypeScript types and Zod schemas for all entities
- [ ] Create initial JSON files (profile, skills, experience, education with sample data)
- [ ] Create base resume page route at `/resume`
- [ ] Implement ResumeProfile component
- [ ] Style profile section for light/dark themes
- [ ] Test responsive profile layout (320px+)

**Deliverable**: `/resume` accessible with working profile section

### Milestone 2: Animated Skills Section (P1)
**Goal**: Implement scroll-triggered skill bars with 800-1000ms animation

- [ ] Create useIntersectionObserver custom hook
- [ ] Implement SkillBar component with CSS animation (800-1000ms)
- [ ] Implement ResumeSkills container component
- [ ] Add animation state management (no re-trigger)
- [ ] Implement prefers-reduced-motion support
- [ ] Style skill bars for light/dark themes
- [ ] Test animation performance (60fps target)

**Deliverable**: Skills bars animate smoothly on scroll, respect motion preferences

### Milestone 3: Timeline Sections (P2)
**Goal**: Display work experience and education in timeline format

- [ ] Create TimelineItem reusable component
- [ ] Implement ResumeExperience component
- [ ] Implement ResumeEducation component
- [ ] Style timelines for light/dark themes
- [ ] Ensure timeline responsive behavior (vertical on mobile)
- [ ] Test with sample data (multiple entries)

**Deliverable**: Experience and education visible in timeline format

### Milestone 4: LinkedIn Recommendations Integration (P1)
**Goal**: Fetch recommendations during build and display in slider

- [ ] Research and select LinkedIn scraping approach (Cheerio vs. Playwright)
- [ ] Implement linkedin-scraper.ts with session cookie auth
- [ ] Implement profile photo download and optimization
- [ ] Integrate scraper into gatsby-node.ts (onPreBootstrap hook)
- [ ] Implement recommendations cache management (indefinite validity)
- [ ] Add error handling and fallback to cache
- [ ] Implement secure session cookie storage (environment variables)
- [ ] Add build logging for fetch status

**Deliverable**: LinkedIn recommendations fetched and cached during builds

### Milestone 5: Recommendations Slider UI (P1)
**Goal**: Display recommendations in touch-enabled slider with full text

- [ ] Research and select carousel library (likely Embla Carousel)
- [ ] Implement RecommendationSlide component (full text, no truncation)
- [ ] Implement ResumeRecommendations slider wrapper
- [ ] Add slider controls (arrows, dots)
- [ ] Add touch/swipe gesture support
- [ ] Style recommendations for light/dark themes
- [ ] Test slider with varying text lengths (ensure height adjustment)
- [ ] Test keyboard navigation and accessibility

**Deliverable**: Recommendations browsable in accessible, touch-enabled slider

### Milestone 6: Testing Infrastructure (P3)
**Goal**: Set up testing framework and add core tests

- [ ] Install Jest + React Testing Library dependencies
- [ ] Create jest.config.js and tests/setup.ts
- [ ] Add test scripts to package.json
- [ ] Write unit tests for SkillBar (animation timing, motion preferences)
- [ ] Write unit tests for TimelineItem
- [ ] Write unit tests for RecommendationSlide (full text display)
- [ ] Write integration test for full resume page
- [ ] Document testing approach in quickstart.md

**Deliverable**: Testing framework configured with core component tests

### Milestone 7: Polish & Validation (P2)
**Goal**: Meet all success criteria and production requirements

- [ ] Run Lighthouse audit (target: 90+ accessibility, <3s load)
- [ ] Performance testing (animation frame rate, page load)
- [ ] Empty section handling (hide when no data)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Responsive testing (320px to 4K)
- [ ] Dark theme comprehensive validation
- [ ] LinkedIn fetch error scenario testing
- [ ] Session cookie expiration handling
- [ ] Documentation review and updates

**Deliverable**: Production-ready resume page meeting all success criteria

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LinkedIn ToS violation concerns | High | High | Review LinkedIn ToS before implementation, consider manual entry fallback, document legal implications |
| LinkedIn HTML structure changes | High | Medium | Implement robust CSS selectors, comprehensive error handling, maintain cache aggressively, monitor for failures |
| Session cookie authentication complexity | Medium | Medium | Use Playwright if Cheerio fails with session auth, document cookie renewal clearly, implement expiration alerts |
| Session cookies exposed in logs/artifacts | High | High | Never log cookie values, use encrypted env vars, audit build logs, implement secure handling guidelines |
| LinkedIn rate limiting during frequent builds | Medium | Low | Cache aggressively (indefinite validity), consider build frequency limits, implement retry with backoff |
| Animation performance on 3-year-old devices | Low | Medium | Use CSS transforms (GPU-accelerated), test on older devices, respect prefers-reduced-motion |
| No existing test framework increases setup effort | Medium | Low | Use standard Gatsby + Jest + RTL pattern (well-documented), allocate time for learning curve |
| Slider library bundle size impact | Low | Low | Chose Embla Carousel (~10KB), verify tree-shaking works, measure bundle impact |
| Multiple JSON files complicate data management | Low | Low | Good separation of concerns, easier to update individual sections, validate each independently |
| Full-text recommendation display breaks layout | Low | Medium | Test with real LinkedIn data (varying lengths), ensure slider height adjusts dynamically, CSS overflow handling |

## Success Metrics

**Performance**:
- ✅ Lighthouse performance score ≥ 90
- ✅ Page load < 3 seconds (standard broadband)
- ✅ Skill animations run at 60fps on 3-year-old devices
- ✅ Build time increase < 90 seconds with LinkedIn fetch

**Accessibility**:
- ✅ Lighthouse accessibility score ≥ 90
- ✅ Keyboard navigable (Tab, Arrow keys work in slider)
- ✅ Screen reader compatible (ARIA labels present)
- ✅ prefers-reduced-motion respected

**Functionality**:
- ✅ All sections display correctly with sample data
- ✅ Empty sections hidden gracefully
- ✅ LinkedIn recommendations sync on every build (when cookies valid)
- ✅ Cache fallback works 100% of time when fetch fails
- ✅ Skill bars animate exactly 800-1000ms duration
- ✅ Proficiency displayed as 0-100 percentages

**Visual Quality**:
- ✅ Responsive 320px to 4K (no horizontal scroll)
- ✅ Light/dark theme support (consistent with site)
- ✅ Timeline visually clear and professional
- ✅ Recommendation slider smooth on mobile (touch gestures)

**Code Quality**:
- ✅ TypeScript strict mode (no `any` types)
- ✅ No linter errors
- ✅ Unit tests for core components (SkillBar, TimelineItem, RecommendationSlide)
- ✅ Integration test for full page

**Security**:
- ✅ Session cookies never appear in logs or version control
- ✅ Environment variables used for sensitive data
- ✅ Build failure doesn't expose credentials

## Dependencies to Add

**Production Dependencies**:
```json
{
  "embla-carousel-react": "^8.0.0",
  "zod": "^3.22.0"
}
```

**Development Dependencies**:
```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/user-event": "^14.5.0",
  "jest-environment-jsdom": "^29.7.0",
  "ts-jest": "^29.1.0",
  "@types/jest": "^29.5.0",
  "identity-obj-proxy": "^3.0.0",
  "cheerio": "^1.0.0-rc.12",
  "playwright": "^1.40.0"
}
```

Note: Choose either Cheerio (lightweight, ~500KB) OR Playwright (full browser, ~150MB) based on research findings. Playwright more reliable with session auth but much larger.

**Total Bundle Impact**: ~13KB gzipped (Embla + Zod, production dependencies only)

## Configuration Files Needed

1. **jest.config.js** - Jest configuration for Gatsby
2. **tests/setup.ts** - Test environment setup (DOM matchers, etc.)
3. **.env.example** - Template for LinkedIn session cookies (never commit actual .env)
4. **gatsby-node.ts modifications** - Add LinkedIn fetch logic
5. **package.json updates** - Add test scripts and dependencies

## Next Steps

1. **Execute Phase 0**: Generate `research.md` with technology decisions
2. **Execute Phase 1**: Create `data-model.md`, `contracts/`, and `quickstart.md`
3. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh cursor-agent`
4. **Generate Tasks**: Run `/speckit.tasks` to decompose into actionable development tasks
5. **Begin Implementation**: Start with Milestone 1 (Foundation & Data Setup)

---

**Plan Status**: ✅ Complete - Ready for Phase 0 research  
**Next Command**: Continue with Phase 0 research generation (automatic)
