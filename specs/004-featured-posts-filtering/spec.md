# Feature Specification: Featured Posts Filtering

**Feature Branch**: `develop` (no feature branch)  
**Created**: November 21, 2025  
**Status**: Draft  
**Input**: User description: "We will remain on the develop branch, for this next feature we need to update the FeaturedPosts component to only show featured posts, currently I believe it shows the most recent posts. In order to determine if a post is featured we should check the frontmatter featured property. This will be a boolean of true when specified, most posts will not have this and would in that case be determined as false if it is not found in the frontmatter. We need to have 7 posts marked as featured, none of which can be family since we exclude them from the homepage, if any family posts are marked featured they should be ignored. If we have more than 7 posts marked as featured only the first 7 should be shown and the rest ignored. It would be nice if during the build or some other way it could alert me to the fact that I have more than 7 posts marked as featured, maybe a script could be run that would tell me this? Maybe I could do npm run list-featured and it would outline all of my posts with filename that are marked as featured, this script should also make it abundantly clear if I have any family posts marked as featured."

## Clarifications

### Session 2025-11-21

- Q: When no posts are marked as featured, should the featured section display empty, show a message, fall back to recent posts, or hide entirely? → A: Display empty featured section with a message like "No featured posts configured"
- Q: When multiple featured posts have the same publication date, what should be the secondary sort criteria? → A: Sort by slug alphabetically (ascending)
- Q: What output format should the audit script use (JSON, table, plain text, markdown)? → A: Table format (human-readable, aligned columns)

## User Scenarios & Testing

### User Story 1 - Display Curated Featured Posts (Priority: P1)

As a website owner, I want to manually curate which posts appear in the featured section by setting a frontmatter property, so that I can highlight my best content regardless of publication date.

**Why this priority**: This is the core functionality that shifts from automatic (recent posts) to manual curation, giving editorial control over the homepage's most prominent content section.

**Independent Test**: Can be fully tested by adding `featured: true` to exactly 7 non-family posts, verifying they appear in the FeaturedPosts component (5 in slider, 2 in highlighted), and confirming recent posts without the featured flag do not appear.

**Acceptance Scenarios**:

1. **Given** 7 posts have `featured: true` in their frontmatter and none are in the family category, **When** the homepage loads, **Then** exactly those 7 posts appear in the featured section (5 in slider, 2 in highlighted)
2. **Given** a post has `featured: true` but belongs to the family category, **When** the homepage loads, **Then** that post is excluded from the featured section
3. **Given** a post does not have the `featured` property in its frontmatter, **When** the homepage loads, **Then** that post is treated as non-featured and excluded from the featured section
4. **Given** a post has `featured: false` in its frontmatter, **When** the homepage loads, **Then** that post is excluded from the featured section

---

### User Story 2 - Handle Excess Featured Posts Gracefully (Priority: P2)

As a website owner, when I accidentally mark more than 7 posts as featured, the system should display only the first 7 based on publication date (most recent first), so that the homepage layout remains consistent.

**Why this priority**: This prevents layout issues and maintains consistent user experience, though it's a defensive scenario that should rarely occur.

**Independent Test**: Can be fully tested by marking 10 non-family posts with `featured: true`, verifying only the 7 most recent appear in the featured section, and confirming the other 3 are excluded.

**Acceptance Scenarios**:

1. **Given** 10 posts have `featured: true` and none are in the family category, **When** the homepage loads, **Then** only the 7 most recently published featured posts appear
2. **Given** 5 posts have `featured: true`, **When** the homepage loads, **Then** all 5 featured posts appear and the system does not fill the remaining 2 slots with non-featured posts

---

### User Story 3 - Audit Featured Posts via Script (Priority: P3)

As a website owner, I want to run a command that lists all posts marked as featured, so that I can audit my content and ensure I have exactly 7 featured posts and no family posts are accidentally marked.

**Why this priority**: This is a utility/quality-of-life feature that helps maintain content governance but isn't critical for the user-facing functionality.

**Independent Test**: Can be fully tested by running `npm run list-featured` and verifying it outputs all posts with `featured: true`, their filenames, categories, and clearly highlights any issues (more than 7 posts, family posts marked as featured).

**Acceptance Scenarios**:

1. **Given** I have posts marked as featured, **When** I run `npm run list-featured`, **Then** the script outputs a table format listing all featured posts with their filename, title, category, and publication date in aligned columns
2. **Given** I have more than 7 posts marked as featured, **When** I run `npm run list-featured`, **Then** the script displays a prominent warning that I have exceeded the limit
3. **Given** I have family posts marked as featured, **When** I run `npm run list-featured`, **Then** the script displays a prominent warning listing which family posts are marked as featured
4. **Given** I have exactly 7 non-family posts marked as featured, **When** I run `npm run list-featured`, **Then** the script displays a success message confirming the configuration is optimal

---

### Edge Cases

- What happens when fewer than 7 posts are marked as featured? (Display only the available featured posts, do not fill remaining slots with non-featured posts)
- What happens when no posts are marked as featured? (Display empty featured section with a message like "No featured posts configured" to prompt content curation)
- What happens when featured posts are deleted or unpublished? (The count decreases; the audit script helps identify this)
- What happens during build if family posts are marked as featured? (They are excluded from display but the build should succeed; the audit script warns about this)
- How are featured posts ordered when multiple have the same publication date? (Sort by slug alphabetically in ascending order as secondary sort)

## Requirements

### Functional Requirements

- **FR-001**: System MUST filter posts for the featured section based on the `featured: true` frontmatter property
- **FR-002**: System MUST exclude all posts in the "family" category from the featured section, even if they have `featured: true`
- **FR-003**: System MUST treat posts without the `featured` property as non-featured (equivalent to `featured: false`)
- **FR-004**: System MUST display exactly 7 featured posts when available: 5 in the slider, 2 in the highlighted section
- **FR-005**: System MUST limit featured posts to the first 7 when more than 7 are marked, ordered by publication date (most recent first), with slug alphabetically ascending as secondary sort
- **FR-006**: System MUST maintain series grouping logic for featured posts (if a post belongs to a series, display it as the series)
- **FR-007**: System MUST provide an npm script called `list-featured` that audits featured posts
- **FR-008**: The audit script MUST display all posts marked with `featured: true` including their filename, title, category, and publication date in a human-readable table format with aligned columns
- **FR-009**: The audit script MUST clearly warn when more than 7 posts are marked as featured
- **FR-010**: The audit script MUST clearly warn when any family posts are marked as featured
- **FR-011**: The audit script MUST display a success message when exactly 7 non-family posts are marked as featured
- **FR-012**: When no posts are marked as featured, the system MUST display an empty featured section with a message prompting content curation (e.g., "No featured posts configured")

### Key Entities

- **Post Frontmatter**: The YAML metadata at the top of each markdown post file containing properties like `title`, `category`, `publishedAt`, `featured`, etc.
- **Featured Post**: A post with `featured: true` in its frontmatter, not in the "family" category, used to populate the featured section on the homepage
- **Featured Section**: The prominent section at the top of the homepage consisting of a slider (5 posts) and highlighted posts (2 posts)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Homepage featured section displays only posts explicitly marked with `featured: true` (excluding family posts)
- **SC-002**: Content editors can curate the featured section by editing frontmatter without code changes
- **SC-003**: The `npm run list-featured` command executes in under 3 seconds and provides clear, actionable output
- **SC-004**: When more than 7 posts are featured, the system gracefully handles this by showing the 7 most recent without breaking the layout
- **SC-005**: Content editors can quickly verify their featured posts configuration is correct by running a single command

## Assumptions

- The existing GraphQL query in `index.tsx` can be extended to include the `featured` field from frontmatter
- The current sorting logic (by `publishedAt` descending) should be maintained for featured posts
- The series grouping logic (showing series as a single entity) applies to featured posts as well
- The build process should not fail if family posts are marked as featured; they should simply be excluded
- The audit script should be runnable at any time (not just during build) for content governance
- Featured posts should be statically determined at build time (not dynamic/client-side)

## Out of Scope

- Creating a visual UI for managing featured posts (this is done via markdown frontmatter editing)
- Implementing automatic featured post rotation or scheduling
- Adding analytics to track featured post performance
- Creating a preview mode to see featured post changes before deployment
- Implementing a maximum age for featured posts (they remain featured indefinitely until the frontmatter is changed)
- Dynamic reordering of featured posts without republishing the site

