# Feature Specification: Resume Page with LinkedIn Recommendations

**Feature Branch**: `002-resume-page`  
**Created**: November 17, 2025  
**Status**: Draft  
**Input**: User description: "A Resume page found at /resume that we will need to create using the files under resume/index.html as inspiration. We should not copy this 100% as it should fit into this site. It should not have a portfolio section but should have a skills section, work experience, references, education. The elements should load the skills bars using an animation. The recommendations section should pull the recommendations from https://www.linkedin.com/in/crawfordjoseph/details/recommendations/?detailScreenTabIndex=0 This should pull the recommendations and icons of the person making the recommendation with every build. The recommendations should be in a slider that the user can navigate and will be placed on the resume page."

## Clarifications

### Session 2025-11-17

- Q: Skills animation duration - how long should the progress bar animation take? → A: 800-1000ms (moderate, smooth animation)
- Q: Resume data storage format - single JSON file, multiple files, Markdown, or TypeScript? → A: Multiple JSON files split by section (skills.json, experience.json, etc.)
- Q: Skills proficiency scale - percentage, 1-5, 1-10, or qualitative labels? → A: 0-100 percentage (e.g., "JavaScript: 85%")
- Q: Recommendation text length handling - show full text, truncate with expansion, hard limit, or modal? → A: Show full text always (no truncation)
- Q: Recommendation cache duration - never expires, 30 days, 7 days, or no tracking? → A: Cache never expires (valid indefinitely until successful fetch)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Professional Profile and Contact Information (Priority: P1)

As a visitor, I want to see the professional's profile information and contact details so that I can learn about them and decide whether to reach out.

**Why this priority**: This is the foundation of any resume page - providing basic identity and contact information. Without this, the page serves no purpose.

**Independent Test**: Can be fully tested by navigating to `/resume` and verifying that profile photo, name, title, and contact information are displayed correctly. Delivers immediate value by allowing visitors to identify and contact the professional.

**Acceptance Scenarios**:

1. **Given** I navigate to `/resume`, **When** the page loads, **Then** I see a profile photo, name, professional title, and a brief introduction
2. **Given** I am viewing the profile section, **When** I look for contact information, **Then** I see email address, phone number, and location displayed clearly
3. **Given** I am viewing the profile section, **When** social media links are present, **Then** I can click them to visit the professional's social profiles in new tabs
4. **Given** I am viewing the profile on mobile, **When** the page loads, **Then** the profile section adapts responsively to fit my screen

---

### User Story 2 - Review Professional Skills with Animation (Priority: P1)

As a visitor, I want to see the professional's skills with animated visual indicators of proficiency so that I can quickly assess their capabilities in an engaging way.

**Why this priority**: Skills are a critical component of any resume. The animated presentation makes the information more engaging and helps visitors immediately understand the professional's technical capabilities.

**Independent Test**: Can be fully tested by scrolling to the skills section and verifying that skills are displayed with animated progress bars. Delivers value by providing a clear, engaging visual representation of competencies.

**Acceptance Scenarios**:

1. **Given** I scroll to the skills section, **When** the section comes into view, **Then** I see skill bars that animate smoothly from empty to their target proficiency levels over approximately 1 second
2. **Given** I am viewing the skills section, **When** the animation completes (800-1000ms), **Then** each skill displays a percentage value (0-100%)
3. **Given** I have already viewed the skills section, **When** I scroll away and back, **Then** the animation does not replay (prevents distraction)
4. **Given** I am viewing on a slower device, **When** the skills section loads, **Then** the animation performs smoothly without lag or jank

---

### User Story 3 - Browse LinkedIn Recommendations in Slider (Priority: P1)

As a visitor, I want to browse through LinkedIn recommendations with profile photos in a slider so that I can read authentic testimonials with visual attribution.

**Why this priority**: Recommendations from LinkedIn provide third-party validation and credibility. The slider format allows multiple testimonials without overwhelming the page, and profile photos add authenticity.

**Independent Test**: Can be fully tested by navigating to the recommendations section and verifying that LinkedIn recommendations are displayed with profile photos in a navigable slider. Delivers immediate value by showcasing social proof.

**Acceptance Scenarios**:

1. **Given** I navigate to the recommendations section, **When** I view it, **Then** I see recommendations from LinkedIn with the recommender's name, title, company, and profile photo
2. **Given** I am viewing the recommendations slider, **When** multiple recommendations are present, **Then** I can navigate between them using slider controls (arrows or swipe gestures)
3. **Given** I am viewing on mobile, **When** I interact with the slider, **Then** I can swipe left/right to navigate between recommendations
4. **Given** a recommender's profile photo is available, **When** their recommendation is displayed, **Then** I see their photo alongside their testimonial
5. **Given** a recommendation contains long text (>500 characters), **When** I view it in the slider, **Then** the full text is displayed without truncation and the slider height adjusts to accommodate it
6. **Given** the site is built, **When** the build process completes, **Then** the recommendations reflect the current state of the LinkedIn profile (newly added or removed recommendations are synchronized)

---

### User Story 4 - Explore Work Experience History (Priority: P2)

As a visitor, I want to see the professional's work experience presented chronologically so that I can understand their career progression and relevant roles.

**Why this priority**: Work experience demonstrates practical application of skills and career growth. Essential for evaluating fit for opportunities, but secondary to the profile, skills, and social proof.

**Independent Test**: Can be fully tested by navigating to the work experience section and verifying that positions are listed with company names, dates, titles, and descriptions.

**Acceptance Scenarios**:

1. **Given** I navigate to the work experience section, **When** I view the timeline, **Then** I see positions listed in reverse chronological order (most recent first)
2. **Given** I am viewing a work experience entry, **When** I read the details, **Then** I see the date range, company name, job title, and description of responsibilities
3. **Given** I am viewing the work experience section, **When** I look at the layout, **Then** the timeline is visually clear with dates and positions easy to follow
4. **Given** I am viewing on mobile, **When** the work experience section loads, **Then** the timeline adapts to a vertical layout that is easy to read

---

### User Story 5 - Review Educational Background (Priority: P2)

As a visitor, I want to see the professional's educational qualifications so that I can verify their academic credentials.

**Why this priority**: Education is a standard component of resumes and often a requirement for many positions. However, it's secondary to skills, experience, and recommendations for experienced professionals.

**Independent Test**: Can be fully tested by scrolling to the education section and verifying that degrees, institutions, and dates are displayed correctly.

**Acceptance Scenarios**:

1. **Given** I navigate to the education section, **When** I view the timeline, **Then** I see educational achievements listed in reverse chronological order
2. **Given** I am viewing an education entry, **When** I read the details, **Then** I see the date range, degree or certificate name, and institution name
3. **Given** I am viewing the education section, **When** I compare it to work experience, **Then** the visual styling is consistent with the work experience timeline

---

### User Story 6 - Automatic Recommendation Updates (Priority: P3)

As a site owner, I want recommendations to be automatically fetched from LinkedIn during each build so that the resume page stays current without manual updates.

**Why this priority**: Automation reduces maintenance burden and ensures the page is always up-to-date. However, the page can function with static data if automation fails, making this lower priority than displaying the content itself.

**Independent Test**: Can be fully tested by adding/removing a recommendation on LinkedIn, triggering a site build, and verifying the changes appear on the resume page.

**Acceptance Scenarios**:

1. **Given** the site build process runs, **When** recommendations are fetched from LinkedIn, **Then** any new recommendations appear on the resume page
2. **Given** a recommendation is removed on LinkedIn, **When** the next build runs, **Then** the removed recommendation no longer appears on the resume page
3. **Given** LinkedIn fetch fails during build, **When** the build completes, **Then** the page displays the last successfully fetched recommendations (cached data)
4. **Given** a recommender updates their profile photo on LinkedIn, **When** the next build runs, **Then** the updated photo appears on the resume page

---

### Edge Cases

- What happens when there are no skills to display (empty data)?
- What happens when LinkedIn is unreachable during the build process?
- How does the system handle LinkedIn rate limiting or anti-scraping measures?
- What happens when a recommender has no profile photo available?
- Long recommendation texts (>500 characters) are displayed in full without truncation, slider adjusts height accordingly
- What happens when work experience or education dates overlap or have gaps?
- How does the page render on very small mobile devices (e.g., 320px width)?
- What happens when the skills animation is viewed by users with motion sensitivity (prefers-reduced-motion)?
- How does the slider behave when there's only one recommendation?
- What happens if the LinkedIn URL structure changes or becomes private?

## Requirements *(mandatory)*

### Functional Requirements

**Resume Page Core:**
- **FR-001**: The page MUST be accessible via the `/resume` route
- **FR-002**: The page MUST integrate with the existing Gatsby site layout (header, footer, navigation)
- **FR-003**: The page MUST display a profile section containing a photo, name, professional title, and brief introduction
- **FR-004**: The page MUST display contact information including email, phone, and location
- **FR-005**: The page MUST display social media links (when provided) that open in new tabs
- **FR-006**: The page MUST NOT include a portfolio section
- **FR-007**: The page MUST support both light and dark theme modes consistent with the existing site
- **FR-008**: The page MUST be responsive and adapt to mobile, tablet, and desktop screen sizes (minimum 320px width)

**Skills Section:**
- **FR-009**: The page MUST display a skills section with multiple skills, each showing a proficiency percentage (0-100)
- **FR-010**: Skills MUST be displayed as visual bars or indicators that animate over 800-1000ms when the section comes into viewport
- **FR-011**: Skill animations MUST be smooth and performant (target: 60fps on modern devices)
- **FR-012**: Skill animations MUST respect user's motion preferences (no animations if prefers-reduced-motion is enabled)
- **FR-013**: Skills that have been animated MUST NOT re-animate when scrolled back into view

**Work Experience:**
- **FR-014**: The page MUST display a work experience section with positions listed in reverse chronological order
- **FR-015**: Each work experience entry MUST display date range, company name, job title, and description

**Education:**
- **FR-016**: The page MUST display an education section with qualifications listed in reverse chronological order
- **FR-017**: Each education entry MUST display date range, degree/certificate name, and institution name

**LinkedIn Recommendations:**
- **FR-018**: The page MUST display recommendations fetched from https://www.linkedin.com/in/crawfordjoseph/details/recommendations/ (Received tab)
- **FR-019**: Recommendations MUST be fetched automatically during every Gatsby build process
- **FR-020**: Each recommendation MUST include the recommender's name, title, company, recommendation text, and profile photo
- **FR-021**: Recommendations MUST be displayed in a slider/carousel that users can navigate
- **FR-022**: The slider MUST support navigation via controls (arrows, dots, or similar indicators)
- **FR-023**: The slider MUST support touch/swipe gestures on mobile devices
- **FR-024**: Recommendation text MUST be displayed in full without truncation, regardless of length
- **FR-025**: Recommender profile photos MUST be downloaded and optimized during the build process
- **FR-026**: The system MUST cache successfully fetched recommendations as fallback data in `/src/data/resume/recommendations.json`
- **FR-027**: If LinkedIn fetch fails, the system MUST use cached recommendations from the previous successful fetch (cache remains valid indefinitely)
- **FR-028**: If no cached data exists and fetch fails, the recommendations section MUST be hidden
- **FR-029**: The system MUST log fetch status (success/failure) for debugging purposes
- **FR-030**: Build process MUST NOT fail if LinkedIn recommendations fetch fails
- **FR-031**: The system MUST use LinkedIn session cookies from secure storage (environment variables) to authenticate requests
- **FR-032**: If authentication fails (invalid or expired session), the system MUST log the error and fall back to cached data

**General Requirements:**
- **FR-033**: Empty sections (skills, experience, education, recommendations with no data) MUST be hidden entirely
- **FR-034**: The page MUST achieve a Lighthouse accessibility score of 90 or higher
- **FR-035**: The page MUST load in under 3 seconds on a standard broadband connection

### Key Entities

- **Profile**: Represents the professional's identity and contact information (name, title, photo, email, phone, location, social links, bio)
- **Skill**: Represents a technical or professional skill (skill name, proficiency as 0-100 percentage value)
- **WorkExperience**: Represents a position held (company name, job title, start date, end date, description)
- **Education**: Represents an educational achievement (institution name, degree/certificate, start date, end date)
- **LinkedInRecommendation**: Raw recommendation data from LinkedIn (recommender name, title, company, text, date, profile photo URL, relationship)
- **Recommendation**: Transformed recommendation for display (quote, name, title, company, photo path)
- **RecommendationCache**: Cached recommendations with metadata stored in `/src/data/resume/recommendations.json` (fetch timestamp, recommendations array, source URL, cache remains valid indefinitely)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can view all core resume information (profile, skills, experience, education, recommendations) on a single page without navigation
- **SC-002**: Skill bars animate smoothly at 60fps or better on devices released in the last 3 years
- **SC-003**: The page loads completely in under 3 seconds on a standard broadband connection (10 Mbps+)
- **SC-004**: The page achieves a Lighthouse accessibility score of 90 or higher
- **SC-005**: The page is fully readable and functional on devices as small as 320px wide
- **SC-006**: Users with motion sensitivity (prefers-reduced-motion enabled) experience no animated content
- **SC-007**: LinkedIn recommendations are synchronized automatically with every build (100% automation)
- **SC-008**: The slider allows users to browse through all recommendations in under 30 seconds
- **SC-009**: Build completes successfully even when LinkedIn fetch fails (100% build reliability)
- **SC-010**: Recommender profile photos load and display for at least 95% of recommendations

## Assumptions

- The LinkedIn profile URL (https://www.linkedin.com/in/crawfordjoseph/details/recommendations/) remains stable
- LinkedIn recommendations require authentication via session cookies to access during builds
- Valid LinkedIn session cookies can be securely stored in the build environment (environment variables or secure configuration)
- The Gatsby build environment has network access to reach LinkedIn
- Cached recommendation data remains valid indefinitely until replaced by a successful fetch (no expiration or freshness requirements)
- The number of LinkedIn recommendations will remain under 50 (reasonable upper bound for performance)
- Recommender profile photos on LinkedIn are publicly accessible once recommendations are viewable
- The resume data will be stored in multiple JSON files split by section (`/src/data/resume/profile.json`, `/src/data/resume/skills.json`, `/src/data/resume/experience.json`, `/src/data/resume/education.json`)
- The site already has a theming system in place (light/dark mode) that the resume page will integrate with
- The existing site uses React components, so the resume page can be built with React components
- Social media icons are available from the existing site's icon library or can be added
- Profile photos and other images will be provided as image files or URLs
- Skills proficiency percentages (0-100) are subjective assessments provided by the professional
- The page will use the existing site's typography, color scheme, and spacing system
- The inspiration file at `resume/index.html` provides UI/UX patterns but not exact code to copy

## Dependencies

- Existing Gatsby site layout components (Layout, Header, Footer)
- Existing site theming system (light/dark mode CSS variables)
- Existing site navigation configuration
- Gatsby build process and Node.js APIs (for LinkedIn fetch integration)
- gatsby-transformer-json (for reading resume JSON files)
- HTTP client for fetching LinkedIn data during build
- HTML parsing capability for extracting recommendations from LinkedIn pages
- Authentication mechanism for LinkedIn access via session cookies (maintained logged-in session)
- Image optimization pipeline for profile photos (gatsby-plugin-image or similar)
- File system access for caching recommendations
- Slider/carousel component library or implementation
- Intersection Observer API or equivalent for scroll-triggered animations
- Animation capabilities (CSS animations or animation library)
- Inspiration file at `resume/index.html` (for UI/UX reference)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| LinkedIn Terms of Service may prohibit automated scraping | High | Review LinkedIn ToS, consider official API if available, or implement manual fallback |
| LinkedIn HTML structure changes break recommendation fetching | High | Implement robust error handling, maintain cached data, log parsing failures for quick fixes |
| LinkedIn rate limiting or anti-bot measures block fetches | Medium | Implement retry logic with exponential backoff, cache aggressively, consider fetch frequency limits |
| Session cookies expire requiring manual renewal | Medium | Document cookie renewal process, implement clear error messages, consider automated monitoring |
| Session cookies exposed in build logs or artifacts | High | Store cookies in encrypted environment variables, never log cookie values, implement secure handling |
| Large profile photos slow page load times | Medium | Optimize images during build (WebP, responsive sizes), implement lazy loading, set size limits |
| Slider library adds significant bundle size | Low | Evaluate lightweight options, consider custom implementation if needed, ensure tree-shaking |
| Animation performance on older devices | Low | Use CSS animations (GPU-accelerated), respect prefers-reduced-motion, test on 3-year-old devices |

## Notes

**LinkedIn Fetch Approach**: The automatic fetching of LinkedIn recommendations uses session cookie authentication. LinkedIn session cookies will be securely stored in the build environment (as encrypted environment variables) and used to fetch recommendations during each build.

**Implementation considerations**:
- **Session Management**: Session cookies must be periodically renewed (LinkedIn sessions typically expire after weeks/months of inactivity)
- **Security**: Cookie values must never appear in build logs, version control, or public artifacts
- **Error Handling**: Clear error messages when cookies expire, with documentation for renewal process
- **Fallback**: Cached recommendations ensure the page remains functional even when fetches fail
- **CI/CD Integration**: Build pipelines must have access to secure environment variables containing session cookies

The specification includes robust fallback mechanisms (caching, graceful degradation) to ensure the feature remains valuable even if authentication occasionally fails or cookies expire.

**Portfolio Section Exclusion**: The user explicitly requested no portfolio section, which is noted in FR-006. This distinguishes the resume page from a full personal website and keeps the focus on professional credentials and recommendations.
