# Research & Technical Decisions: Resume Page with LinkedIn Recommendations

**Feature**: Resume Page | **Branch**: `002-resume-page` | **Date**: 2025-11-17

## Overview

This document captures research findings and technical decisions for implementing the resume page feature with automated LinkedIn recommendations fetching. All technology choices have been evaluated against project constraints: 800-1000ms skill animations at 60fps, LinkedIn scraping with session cookies, full-text recommendation display in accessible slider, and multiple JSON file storage.

---

## Decision 1: Animation Implementation Strategy

### Question
Should we use CSS animations or JavaScript library for 800-1000ms skill bar animations?

### Decision
**Pure CSS transitions with custom Intersection Observer hook**

### Rationale

1. **Performance**: CSS transitions run on the GPU compositor thread, easily achieving 60fps without JavaScript overhead. Critical for meeting SC-002 (60fps on 3-year-old devices).

2. **Bundle Size**: Zero additional dependencies. CSS animations are built into browsers. JavaScript libraries like Framer Motion add 50-100KB to bundle.

3. **SSR Compatibility**: Gatsby performs static rendering. CSS animations work seamlessly, whereas JS animation libraries may require client-side hydration checks and can cause flicker.

4. **Precise Timing Control**: CSS `transition: width 900ms cubic-bezier(0.4, 0.0, 0.2, 1)` gives exact control over 800-1000ms duration. No library needed for simple width animation.

5. **prefers-reduced-motion Support**: CSS media query `@media (prefers-reduced-motion: reduce)` is native and reliable. Instantly disables animations for users with motion sensitivity.

6. **Simplicity**: Skill bars animate a single property (width) from 0% to target percentage. This doesn't justify a full animation library's API surface.

### Implementation Approach

```typescript
// Custom hook: useIntersectionObserver.ts
import { useEffect, useState, RefObject } from 'react';

export const useIntersectionObserver = (
  ref: RefObject<Element>,
  options: IntersectionObserverInit = { threshold: 0.3 }
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return; // SSR guard

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true); // Prevent re-animation per FR-013
      }
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options, hasAnimated]);

  return { isVisible, hasAnimated };
};

// CSS approach
.skill-bar {
  width: 0;
  transition: width 900ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.skill-bar.animate {
  width: var(--target-width);
}

@media (prefers-reduced-motion: reduce) {
  .skill-bar {
    transition: none !important;
    width: var(--target-width); /* Instant display */
  }
}
```

### Alternatives Considered

| Library | Bundle Size | Pros | Cons | Rejected Because |
|---------|------------|------|------|------------------|
| **Framer Motion** | ~50KB gzipped | Rich API, spring physics, declarative | Large bundle, overkill for width animation | Bundle size and complexity not justified |
| **React Spring** | ~30KB gzipped | Physics-based, performant | Still adds weight for single property animation | Bundle size not justified |
| **GSAP** | ~40KB gzipped | Very powerful, timeline control, ScrollTrigger | Not React-idiomatic, commercial licensing for some features | Licensing and integration overhead |
| **Anime.js** | ~17KB gzipped | Lightweight, good docs | Still larger than CSS, not necessary | CSS is simpler and faster |

### Browser Support

- CSS transitions: 98%+ browser support
- Intersection Observer: 96%+ support (polyfill available if needed: `intersection-observer` npm package ~2KB)

---

## Decision 2: LinkedIn Scraping Approach with Session Cookies

### Question
What's the best method to fetch LinkedIn recommendations using session cookie authentication?

### Decision
**Playwright (full browser automation)**

### Rationale

1. **Session Cookie Reliability**: LinkedIn's recommendations page requires JavaScript execution and has anti-bot measures. Playwright renders the page fully with a real browser, handling all JavaScript, lazy loading, and session authentication naturally.

2. **Complete Page Rendering**: LinkedIn loads recommendations dynamically. Playwright waits for network idle and can scroll to trigger lazy-loaded content, ensuring all recommendations are captured.

3. **Profile Photo Downloads**: Playwright can intercept image requests or directly download profile photos with proper authentication headers inherited from the session.

4. **Cookie Injection**: Playwright's `context.addCookies()` API makes it straightforward to inject session cookies from environment variables:
   ```typescript
   await context.addCookies([{
     name: 'li_at',
     value: process.env.LINKEDIN_SESSION_COOKIE!,
     domain: '.linkedin.com',
     path: '/',
     httpOnly: true,
     secure: true,
   }]);
   ```

5. **Resilience to Changes**: Full browser automation is more resilient to LinkedIn's HTML structure changes than static HTML parsing. Can use visual selectors and wait for elements.

6. **Build Time Acceptable**: Adds ~45-60 seconds to build time (browser startup + page load + scraping). Given builds aren't frequent and cache is indefinite, this is acceptable.

### Implementation Approach

```typescript
// src/utils/linkedin-scraper.ts
import { chromium } from 'playwright';

export interface LinkedInRecommendation {
  recommenderName: string;
  recommenderTitle: string;
  recommenderCompany: string;
  recommendationText: string;
  recommenderPhotoUrl: string;
  date: string;
}

export async function fetchLinkedInRecommendations(): Promise<LinkedInRecommendation[]> {
  const sessionCookie = process.env.LINKEDIN_SESSION_COOKIE;
  
  if (!sessionCookie) {
    throw new Error('LINKEDIN_SESSION_COOKIE environment variable not set');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Inject session cookie
  await context.addCookies([{
    name: 'li_at',
    value: sessionCookie,
    domain: '.linkedin.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  }]);

  const page = await context.newPage();
  
  try {
    await page.goto('https://www.linkedin.com/in/crawfordjoseph/details/recommendations/', {
      waitUntil: 'networkidle',
    });

    // Wait for recommendations section to load
    await page.waitForSelector('.pvs-list__item', { timeout: 10000 });

    // Extract recommendations (selectors will need adjustment based on actual HTML)
    const recommendations = await page.$$eval('.pvs-list__item', (elements) => {
      return elements.map(el => {
        const nameEl = el.querySelector('.profile-card__title');
        const titleEl = el.querySelector('.profile-card__subtitle');
        const textEl = el.querySelector('.recommendation-text');
        const photoEl = el.querySelector('img.profile-photo');
        
        return {
          recommenderName: nameEl?.textContent?.trim() || '',
          recommenderTitle: titleEl?.textContent?.trim() || '',
          recommenderCompany: '', // Extract from title if combined
          recommendationText: textEl?.textContent?.trim() || '',
          recommenderPhotoUrl: photoEl?.getAttribute('src') || '',
          date: '', // Extract if available
        };
      });
    });

    // Download profile photos
    for (const rec of recommendations) {
      if (rec.recommenderPhotoUrl) {
        // Download logic here
      }
    }

    return recommendations;
  } finally {
    await browser.close();
  }
}
```

### Alternatives Considered

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| **Cheerio** (static HTML) | Lightweight (~500KB), fast parsing | Can't execute JavaScript, may miss lazy-loaded content, session auth unreliable | LinkedIn requires JS execution for recommendations |
| **Puppeteer** | Similar to Playwright, well-established | Slightly larger bundle, less modern API | Playwright has better API and is actively developed |
| **jsdom** | Node.js DOM implementation | No actual browser, can't handle complex SPAs | LinkedIn is a complex SPA requiring real browser |
| **Manual API** (if exists) | Official, stable | LinkedIn API very restricted, may not include recommendations endpoint | API access difficult to obtain for personal use |

### Security Considerations

- **Cookie Storage**: Store `LINKEDIN_SESSION_COOKIE` in `.env` file (gitignored), use in CI/CD via encrypted secrets
- **Never Log Cookie**: Implement logging that never outputs cookie value
- **Cookie Renewal**: Document process for renewing cookie when it expires (typically months)
- **Audit Trail**: Log fetch attempts (success/failure) but not cookie value

### Build Integration

```typescript
// gatsby-node.ts
export const onPreBootstrap: GatsbyNode['onPreBootstrap'] = async ({ reporter }) => {
  reporter.info('Fetching LinkedIn recommendations...');
  
  try {
    const recommendations = await fetchLinkedInRecommendations();
    
    // Save to cache file
    await saveRecommendationsCache(recommendations);
    
    reporter.success(`Fetched ${recommendations.length} LinkedIn recommendations`);
  } catch (error) {
    reporter.warn(`LinkedIn fetch failed: ${error.message}. Using cached data.`);
    
    // Fallback to cache - build continues
    const cached = await loadCachedRecommendations();
    if (!cached) {
      reporter.warn('No cached recommendations available. Recommendations section will be hidden.');
    }
  }
};
```

---

## Decision 3: Carousel/Slider Library Selection

### Question
Which carousel library should be used for the recommendations slider?

### Decision
**Embla Carousel React**

### Rationale

1. **Accessibility Built-in**: Native ARIA support, keyboard navigation (arrow keys), focus management. Critical for SC-004 (Lighthouse accessibility 90+).

2. **Touch/Swipe Quality**: Excellent mobile touch handling with momentum scrolling, rubber-band effect, and smooth animations. Works perfectly on iOS and Android.

3. **Lightweight**: ~10KB gzipped for core + React bindings. Much lighter than Swiper (~30KB) or React Slick (~25KB + jQuery).

4. **Height Flexibility**: Doesn't force fixed height. Slider automatically adjusts to content height, perfect for full-text recommendations of varying lengths (per clarification: no truncation).

5. **Headless Architecture**: Framework-agnostic core with React bindings. Full control over HTML/CSS, easy to integrate with light/dark theme system.

6. **TypeScript Native**: Written in TypeScript with complete type definitions. No `@types/*` packages needed.

7. **SSR Compatible**: Works with Gatsby's static rendering without hydration issues. No client-only rendering needed.

8. **Active Maintenance**: Actively developed, good documentation, responsive maintainers.

### Implementation Approach

```typescript
import useEmblaCarousel from 'embla-carousel-react';

const ResumeRecommendations = ({ recommendations }: { recommendations: Recommendation[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
  });
  
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="recommendations-slider">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {recommendations.map((rec, index) => (
            <div className="embla__slide" key={index}>
              <RecommendationSlide recommendation={rec} />
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={scrollPrev} 
        aria-label="Previous recommendation"
        className="slider-button slider-button-prev"
      >
        ←
      </button>
      <button 
        onClick={scrollNext} 
        aria-label="Next recommendation"
        className="slider-button slider-button-next"
      >
        →
      </button>
    </div>
  );
};
```

### CSS for Variable Height

```css
.embla {
  overflow: hidden;
}

.embla__container {
  display: flex;
  /* No fixed height - allows natural height adjustment */
}

.embla__slide {
  flex: 0 0 100%; /* Full width per slide */
  min-width: 0;
  /* Height auto-adjusts to content */
}
```

### Alternatives Considered

| Library | Bundle Size | Pros | Cons | Rejected Because |
|---------|------------|------|------|------------------|
| **Swiper** | ~30KB gzipped | Feature-rich, popular, battle-tested | Heavy, lots of unused features, opinionated styling | 3x larger than needed, harder to theme |
| **React Slick** | ~25KB + jQuery | Mature, widely used | Requires jQuery (!), aging codebase, accessibility issues | jQuery dependency is bloat in 2025, poor A11y |
| **Keen Slider** | ~7KB gzipped | Very lightweight, performant | Less mature, smaller community, fewer examples | Embla has better docs and accessibility |
| **Custom Implementation** | 0KB | Full control, no dependencies | High development cost, need to handle touch, keyboard, ARIA, edge cases | Accessibility is hard to get right, not worth the effort |

### Dependencies to Add

```json
{
  "embla-carousel-react": "^8.0.0"
}
```

---

## Decision 4: Intersection Observer Implementation

### Question
Should we use native Intersection Observer API or a library wrapper?

### Decision
**Custom hook wrapping native Intersection Observer API**

### Rationale

1. **Browser Support**: 96% browser support globally. For the remaining 4%, we can add a lightweight polyfill (`intersection-observer` package, ~2KB) if needed.

2. **Simplicity**: The use case (trigger animation when section visible, only once) is straightforward. A 20-30 line custom hook is sufficient. No library abstraction needed.

3. **Zero Dependencies**: No additional packages for core functionality. Keeps bundle size minimal.

4. **SSR Safety**: Easy to guard with `typeof window !== 'undefined'` check for Gatsby's static rendering phase.

5. **Full Control**: Can customize threshold (how much of element must be visible), root margin (trigger offset), and one-time vs. continuous observation.

6. **Performance**: Native API is faster than any JavaScript wrapper. Direct browser implementation.

### Implementation

```typescript
// src/hooks/useIntersectionObserver.ts
import { useEffect, useState, RefObject } from 'react';

export const useIntersectionObserver = (
  ref: RefObject<Element>,
  options: IntersectionObserverInit = { 
    threshold: 0.3,      // 30% of element visible
    rootMargin: '0px'    // No offset
  }
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined' || !ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true); // One-time trigger (FR-013)
      }
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options, hasAnimated]);

  return { isVisible, hasAnimated };
};

// Usage in SkillBar component
const SkillBar = ({ name, proficiency }: { name: string; proficiency: number }) => {
  const skillBarRef = useRef<HTMLDivElement>(null);
  const { isVisible } = useIntersectionObserver(skillBarRef);

  return (
    <div className="skill-bar-container" ref={skillBarRef}>
      <div className="skill-bar-header">
        <span className="skill-name">{name}</span>
        <span className="skill-percentage">{proficiency}%</span>
      </div>
      <div className="skill-bar-track">
        <div 
          className={`skill-bar ${isVisible ? 'animate' : ''}`}
          style={{ '--target-width': `${proficiency}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
```

### Polyfill Strategy (if needed)

```typescript
// gatsby-browser.js
export const onClientEntry = () => {
  if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
    import('intersection-observer').then(() => {
      console.log('[Resume Page] IntersectionObserver polyfill loaded');
    });
  }
};
```

### Alternatives Considered

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| **react-intersection-observer** | Pre-built, tested, hooks API | 2KB dependency for 20 lines of code | Custom hook is simpler and sufficient |
| **react-cool-inview** | Popular, feature-rich | Adds abstraction we don't need | Overkill for one-time animation trigger |
| **Scroll event listener** | Works everywhere (100% support) | Performance issues (throttling needed), not modern best practice | Inferior performance vs Intersection Observer |

---

## Decision 5: Data Validation Strategy for Multiple JSON Files

### Question
How should we validate 5 separate JSON files at build time?

### Decision
**TypeScript interfaces + Zod schema validation in Gatsby node API**

### Rationale

1. **Type Safety**: TypeScript interfaces provide compile-time checking and IDE autocomplete during development.

2. **Runtime Validation**: Zod adds runtime validation at build time to catch data errors before deployment. Critical since data is in separate JSON files.

3. **Developer Experience**: Zod provides excellent error messages pointing to exact validation failures (e.g., "skills[2].proficiency must be between 0 and 100").

4. **Build-Time Errors**: Gatsby node API validates during build, preventing invalid data from ever reaching production.

5. **Documentation**: Zod schema serves as executable documentation of data requirements and constraints.

6. **No Runtime Cost**: Validation only runs at build time (not in browser bundle).

7. **Flexible**: Easy to add new validation rules (e.g., email format, URL validation, date ranges) as requirements evolve.

### Implementation Approach

**TypeScript Types**:
```typescript
// src/types/resume.ts
export interface Profile {
  name: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
  location: string;
  socialLinks: SocialLink[];
  bio: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Skill {
  name: string;
  proficiency: number; // 0-100
}

export interface Experience {
  company: string;
  title: string;
  startDate: string; // ISO 8601 or "YYYY-MM"
  endDate: string | 'Present';
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Recommendation {
  quote: string;
  name: string;
  title: string;
  company: string;
  photoPath?: string; // Optional per spec
}

export interface RecommendationsCache {
  fetchTimestamp: string; // ISO 8601
  sourceURL: string;
  recommendations: Recommendation[];
}
```

**Zod Schemas**:
```typescript
// src/utils/resume-schemas.ts
import { z } from 'zod';

export const SocialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url('Invalid URL'),
  icon: z.string().optional(),
});

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  photo: z.string().min(1, 'Photo path is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  location: z.string().min(1, 'Location is required'),
  socialLinks: z.array(SocialLinkSchema),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  proficiency: z.number()
    .min(0, 'Proficiency must be at least 0')
    .max(100, 'Proficiency must be at most 100'),
});

export const ExperienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Use YYYY-MM or YYYY-MM-DD format'),
  endDate: z.union([
    z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
    z.literal('Present')
  ]),
  description: z.string().min(1),
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
  endDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
});

export const RecommendationSchema = z.object({
  quote: z.string().min(10, 'Quote must be at least 10 characters'),
  name: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  photoPath: z.string().optional(),
});

export const RecommendationsCacheSchema = z.object({
  fetchTimestamp: z.string().datetime(),
  sourceURL: z.string().url(),
  recommendations: z.array(RecommendationSchema),
});

// Validation functions
export const validateProfile = (data: unknown) => ProfileSchema.parse(data);
export const validateSkills = (data: unknown) => z.array(SkillSchema).parse(data);
export const validateExperience = (data: unknown) => z.array(ExperienceSchema).parse(data);
export const validateEducation = (data: unknown) => z.array(EducationSchema).parse(data);
export const validateRecommendations = (data: unknown) => RecommendationsCacheSchema.parse(data);
```

**Build-Time Validation**:
```typescript
// gatsby-node.ts
import { GatsbyNode } from 'gatsby';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import {
  validateProfile,
  validateSkills,
  validateExperience,
  validateEducation,
  validateRecommendations,
} from './src/utils/resume-schemas';

export const onPreBootstrap: GatsbyNode['onPreBootstrap'] = async ({ reporter }) => {
  const dataDir = path.resolve(__dirname, 'src/data/resume');
  
  // Validate all resume JSON files
  try {
    // Profile
    const profileData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'profile.json'), 'utf-8')
    );
    validateProfile(profileData);
    
    // Skills
    const skillsData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'skills.json'), 'utf-8')
    );
    validateSkills(skillsData);
    
    // Experience
    const experienceData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'experience.json'), 'utf-8')
    );
    validateExperience(experienceData);
    
    // Education
    const educationData = JSON.parse(
      await fs.readFile(path.join(dataDir, 'education.json'), 'utf-8')
    );
    validateEducation(educationData);
    
    reporter.success('All resume data files validated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      reporter.panicOnBuild(
        'Resume data validation failed:\n' +
        error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
      );
    }
    throw error;
  }
  
  // Fetch LinkedIn recommendations (separate try/catch for resilience)
  try {
    const recommendations = await fetchLinkedInRecommendations();
    await saveRecommendationsCache(recommendations);
    reporter.success(`Fetched ${recommendations.length} LinkedIn recommendations`);
  } catch (error) {
    reporter.warn(`LinkedIn fetch failed: ${error.message}. Using cached data.`);
  }
};
```

### Alternatives Considered

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| **TypeScript only** | No dependencies, compile-time checks | No runtime validation, errors only when accessing data | Can't catch JSON file errors until runtime |
| **JSON Schema** | Standard format, tooling support | Verbose, needs separate validator library, less ergonomic | Zod is more ergonomic for TypeScript projects |
| **Joi** | Mature, feature-rich | Server-side focused, larger bundle if accidentally imported client-side | Zod is lighter and TS-first |
| **Manual validation** | Full control, no dependencies | Error-prone, verbose, poor error messages | Zod provides better DX |

### Dependencies to Add

```json
{
  "zod": "^3.22.0"
}
```

---

## Decision 6: Testing Framework Setup

### Question
How to configure Jest + React Testing Library for the first time in this project?

### Decision
**Jest + React Testing Library (standard Gatsby setup)**

### Rationale

1. **Industry Standard**: Jest is the de facto testing framework for React applications. React Testing Library (RTL) is recommended by the React team and Gatsby docs.

2. **Gatsby Official Support**: Gatsby officially supports and documents Jest configuration. Well-tested integration pattern available.

3. **React 18 Compatible**: Both Jest and RTL have full React 18 support, including concurrent features testing.

4. **TypeScript Support**: First-class TypeScript support via `ts-jest` or built-in Jest TS support (Jest 29+).

5. **Comprehensive**: Unit tests, integration tests, snapshot tests, code coverage - all in one framework.

6. **Developer Experience**: Excellent error messages, watch mode, parallel execution, mature ecosystem of plugins.

7. **Accessibility Testing**: RTL encourages testing from user perspective (finding elements by role, label, text), naturally promoting accessibility.

### Implementation Approach

**Install Dependencies**:
```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  ts-jest \
  @types/jest \
  identity-obj-proxy
```

**Jest Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{spec,test}.{ts,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: './tsconfig.json',
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  globals: {
    __PATH_PREFIX__: '', // Gatsby global
  },
};
```

**Test Setup** (`tests/setup.ts`):
```typescript
import '@testing-library/jest-dom';

// Mock Gatsby Link component
jest.mock('gatsby', () => ({
  ...jest.requireActual('gatsby'),
  Link: ({ to, ...props }: any) => <a href={to} {...props} />,
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
} as any;

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

**Example Test** (`tests/unit/components/resume/SkillBar.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import SkillBar from '@/components/resume/SkillBar';

describe('SkillBar', () => {
  it('renders skill name and percentage', () => {
    render(<SkillBar name="TypeScript" proficiency={85} />);
    
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('applies correct width style', () => {
    const { container } = render(<SkillBar name="React" proficiency={90} />);
    
    const skillBar = container.querySelector('.skill-bar');
    expect(skillBar).toHaveStyle({ '--target-width': '90%' });
  });

  it('animates when isVisible is true', () => {
    // Mock useIntersectionObserver to return isVisible=true
    jest.mock('@/hooks/useIntersectionObserver', () => ({
      useIntersectionObserver: () => ({ isVisible: true, hasAnimated: true }),
    }));

    const { container } = render(<SkillBar name="JavaScript" proficiency={95} />);
    
    const skillBar = container.querySelector('.skill-bar');
    expect(skillBar).toHaveClass('animate');
  });

  it('respects prefers-reduced-motion', () => {
    // Test with matchMedia mock for prefers-reduced-motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as any;

    const { container } = render(<SkillBar name="CSS" proficiency={80} />);
    
    // Check that animation class is not applied or CSS handles it
    // (actual implementation will vary)
  });
});
```

**Package.json Scripts**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Test Strategy

1. **Unit Tests**: Individual components in isolation
   - SkillBar (animation, proficiency display, motion preferences)
   - TimelineItem (date formatting, description display)
   - RecommendationSlide (full text display, photo display)

2. **Integration Tests**: Composed sections
   - ResumeSkills (multiple skill bars, intersection observer)
   - ResumeRecommendations (slider navigation, touch gestures)

3. **Page Tests**: Full resume page
   - All sections render with data
   - Empty sections hidden
   - Responsive behavior

4. **Accessibility Tests**: ARIA attributes, keyboard navigation
   - Slider keyboard controls work
   - All interactive elements accessible
   - Screen reader compatibility

### Alternatives Considered

| Framework | Pros | Cons | Rejected Because |
|-----------|------|------|------------------|
| **Vitest** | Faster than Jest, Vite-compatible, modern | Less mature, potential Gatsby compatibility issues | Gatsby ecosystem is Jest-centric |
| **Cypress** | E2E testing, visual testing, time-travel debugging | Heavy for unit tests, slower execution | Complement, not replacement for Jest |
| **Testing Library alone** | Minimal, focused on user behavior | Needs test runner (would still need Jest/Vitest) | Not standalone solution |

---

## Decision 7: Session Cookie Management

### Question
How should LinkedIn session cookies be securely stored and used in the build environment?

### Decision
**Environment Variables (.env file for local, CI/CD secrets for production)**

### Rationale

1. **Industry Standard**: Environment variables are the standard approach for secrets in build processes. Well-supported by Gatsby, Node.js, and all CI/CD platforms.

2. **Never Committed**: `.env` file is gitignored, so cookie value never enters version control. `.env.example` provides template without actual values.

3. **CI/CD Compatible**: All major platforms (GitHub Actions, GitLab CI, Vercel, Netlify) have encrypted secrets management for environment variables.

4. **Easy Access**: Node.js `process.env.VARIABLE_NAME` is simple and reliable. No additional libraries needed.

5. **Audit Trail**: CI/CD platforms log when secrets are added/updated (but not the values themselves). Good for security auditing.

6. **Developer Experience**: Simple to set up locally (copy `.env.example` to `.env`, fill in value). Clear documentation possible.

### Implementation Approach

**Local Development** (`.env`):
```bash
# .env (gitignored)
LINKEDIN_SESSION_COOKIE=AQEDASxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Template** (`.env.example`):
```bash
# .env.example (committed to repo)
# Copy this file to .env and fill in your LinkedIn session cookie

# LinkedIn session cookie for fetching recommendations
# To get this value:
# 1. Log in to LinkedIn in your browser
# 2. Open DevTools > Application > Cookies > linkedin.com
# 3. Find the 'li_at' cookie value
# 4. Copy the entire value here
LINKEDIN_SESSION_COOKIE=your_linkedin_session_cookie_here
```

**Gatsby Environment Variable Loading**:
```typescript
// gatsby-config.ts
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

// Environment variables are now available in process.env
```

**Usage in Scraper**:
```typescript
// src/utils/linkedin-scraper.ts
export async function fetchLinkedInRecommendations() {
  const sessionCookie = process.env.LINKEDIN_SESSION_COOKIE;
  
  if (!sessionCookie) {
    throw new Error(
      'LINKEDIN_SESSION_COOKIE environment variable is not set. ' +
      'See .env.example for instructions on obtaining this value.'
    );
  }

  // NEVER log the actual cookie value
  console.log('[LinkedIn Scraper] Using session cookie (length: ' + sessionCookie.length + ' chars)');
  
  // Use cookie...
}
```

**CI/CD Setup** (GitHub Actions example):
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build site
        env:
          LINKEDIN_SESSION_COOKIE: ${{ secrets.LINKEDIN_SESSION_COOKIE }}
        run: npm run build
      
      - name: Deploy
        run: npm run deploy
```

**Security Best Practices**:

1. **Never Log Cookie Value**:
   ```typescript
   // ❌ BAD
   console.log('Cookie:', process.env.LINKEDIN_SESSION_COOKIE);
   
   // ✅ GOOD
   console.log('Cookie length:', process.env.LINKEDIN_SESSION_COOKIE?.length || 0);
   ```

2. **Validate Cookie Format** (without logging value):
   ```typescript
   const cookie = process.env.LINKEDIN_SESSION_COOKIE;
   if (!cookie || cookie.length < 50 || !cookie.startsWith('AQEDA')) {
     throw new Error('LINKEDIN_SESSION_COOKIE appears invalid (wrong format)');
   }
   ```

3. **Clear Error Messages** (without exposing cookie):
   ```typescript
   try {
     await fetchLinkedInRecommendations();
   } catch (error) {
     if (error.message.includes('401') || error.message.includes('unauthorized')) {
       throw new Error(
         'LinkedIn session cookie is invalid or expired. Please update LINKEDIN_SESSION_COOKIE. ' +
         'See quickstart.md for renewal instructions.'
       );
     }
     throw error;
   }
   ```

4. **Cookie Renewal Documentation** (in `quickstart.md`):
   ```markdown
   ## Renewing LinkedIn Session Cookie

   LinkedIn session cookies typically expire after several months of inactivity.
   
   **Symptoms of expired cookie**:
   - Build logs show "LinkedIn fetch failed: 401 Unauthorized"
   - Recommendations section shows cached (old) data
   
   **To renew**:
   1. Open LinkedIn in an incognito/private browser window
   2. Log in with your account
   3. Open DevTools (F12) > Application tab > Cookies > linkedin.com
   4. Find the 'li_at' cookie
   5. Copy its entire value
   6. Update .env locally: `LINKEDIN_SESSION_COOKIE=<new-value>`
   7. Update CI/CD secrets (GitHub: Settings > Secrets and variables > Actions)
   8. Trigger a new build to verify

   **Security notes**:
   - Never commit the actual cookie to version control
   - Store securely as environment variable or secret
   - Rotate cookie if accidentally exposed
   ```

### Alternatives Considered

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| **Secrets Management Service** (Vault, AWS Secrets Manager) | Enterprise-grade, rotation support, audit logs | Complex setup, overkill for single secret, cost | Too complex for personal site |
| **Encrypted Config File** | Can be committed (encrypted) | Need encryption key (still need env var), complex workflow | Adds unnecessary layer |
| **Hard-coded** (DON'T DO THIS) | Simple | Insecure, cookie exposed in version control | Massive security risk |
| **Prompt for Input** | No storage needed | Can't run in CI/CD, poor DX | Doesn't work for automated builds |

---

## Summary of Key Decisions

| Decision Area | Choice | Primary Reason | Bundle Impact |
|---------------|--------|----------------|---------------|
| **Animations** | CSS transitions + Intersection Observer hook | 60fps performance, 0 dependencies, exact timing control | 0KB |
| **LinkedIn Scraping** | Playwright (full browser) | Session auth reliability, JavaScript execution, complete rendering | 0KB runtime (dev only) |
| **Carousel** | Embla Carousel React | Accessibility, 10KB size, height flexibility, touch quality | ~10KB gzipped |
| **Scroll Detection** | Custom Intersection Observer hook | Native API, 0 dependencies, SSR-safe, full control | 0KB |
| **Data Validation** | TypeScript + Zod | Type safety + runtime validation, great errors, build-time only | ~3KB dev only |
| **Testing** | Jest + React Testing Library | Industry standard, Gatsby support, comprehensive, good DX | 0KB (dev only) |
| **Session Cookies** | Environment variables | Standard practice, CI/CD compatible, secure, simple | 0KB |

## Dependencies to Add

**Production**:
```json
{
  "embla-carousel-react": "^8.0.0",
  "zod": "^3.22.0"
}
```

**Development**:
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
  "playwright": "^1.40.0",
  "cheerio": "^1.0.0-rc.12"
}
```

**Total Production Bundle Impact**: ~13KB gzipped (Embla + Zod runtime)  
**Build Time Impact**: +45-60 seconds (Playwright browser automation)

---

**Research Status**: ✅ Complete - All technical decisions resolved  
**Next Step**: Phase 1 - Create data-model.md and contracts/


