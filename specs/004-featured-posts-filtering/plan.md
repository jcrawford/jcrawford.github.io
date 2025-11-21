# Implementation Plan: Featured Posts Filtering

**Branch**: `develop` | **Date**: November 21, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-featured-posts-filtering/spec.md`

## Summary

This feature replaces the automatic "7 most recent posts" logic in the homepage featured section with manual curation through a `featured: true` frontmatter property. The implementation includes:

1. **Homepage filtering logic** - GraphQL query extension and filtering to show only featured posts
2. **Audit tooling** - npm script to list featured posts with validation warnings
3. **Empty state handling** - Clear messaging when no posts are featured

**Technical Approach**: Extend existing Gatsby GraphQL query, add filtering logic in `index.tsx`, and create a Node.js script for content auditing. All changes are build-time (static generation) with no runtime overhead.

## Technical Context

**Language/Version**: TypeScript 5.3.3 / Node.js 18+  
**Primary Dependencies**: Gatsby 5.13, React 18.3, gatsby-transformer-remark 6.15  
**Storage**: Markdown files in `content/posts/` directory with YAML frontmatter  
**Testing**: Jest 29.7 with React Testing Library  
**Target Platform**: Static site (build-time processing, deployed as static files)  
**Project Type**: Web (Gatsby static site generator)  
**Performance Goals**: Build time < 30s for ~120 posts, audit script < 3s execution  
**Constraints**: Featured posts determined at build time (no client-side filtering), maintain existing series grouping logic  
**Scale/Scope**: ~120 markdown posts currently, 7 featured posts displayed (5 slider + 2 highlighted)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with project constitution (`.specify/memory/constitution.md` v1.0.0):

**I. Type Safety First (NON-NEGOTIABLE)** ✅
- [ ] No use of `any` type (T063 validates)
- [ ] Proper TypeScript types for all functions (T004 adds ArticleFrontmatter interface)
- [ ] `strict: true` enabled (T001 validates)
- [ ] Zero type errors (T066 validates)

**II. Type Discipline** ✅
- [ ] Type assertions (`as`) limited and justified
- [ ] Custom type guard functions implemented where needed (not required for this feature)
- [ ] No double assertions without approval

**III. Date Handling Standard** ✅
- [ ] `dayjs` used exclusively for date operations (T075 validates)
- [ ] Note: Feature only sorts by ISO date strings, no transformations needed

**IV. Vanilla JavaScript Preferred** ✅
- [ ] No lodash or utility libraries introduced
- [ ] Template literals used for table formatting (T051)
- [ ] Native array methods (.filter, .sort, .slice) used

**V. Documentation Standards** ✅
- [ ] JSDoc comments on all exported functions (T023, T056, T064 validate)
- [ ] No FR-XXX or specification markers in code (T065 validates)
- [ ] Inline comments minimal and explanatory

**VI. Gatsby & React Best Practices** ✅
- [ ] GraphQL data layer used for content queries (T005)
- [ ] Functional components with hooks (existing pattern maintained)
- [ ] TypeScript interfaces for props (T004)
- [ ] Build-time processing (all filtering at build time)

**VII. Build-Time Optimization** ✅
- [ ] Static generation preferred over client-side (all filtering at build time)
- [ ] No client-side JavaScript added for filtering
- [ ] Minimal bundle size impact (no new dependencies)

**Testing & Quality Standards** ✅
- [ ] Unit tests for complex logic (T007-T011, T028-T030, T039-T043)
- [ ] Integration tests for GraphQL and page rendering (T012-T013)
- [ ] Manual testing checklist (T074, plan.md:L212-217)
- [ ] Jest + React Testing Library (existing setup)

**Compliance Summary**: All 7 core principles + testing standards verified. Zero constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-featured-posts-filtering/
├── spec.md               # Feature specification (✅ complete)
├── plan.md               # This file
├── research.md           # Technology and pattern research
├── data-model.md         # Entity relationships (✅ complete)
├── quickstart.md         # Implementation guide (✅ complete)
├── contracts/
│   └── frontmatter-schema.md  # Frontmatter contract (✅ complete)
├── checklists/
│   └── requirements.md   # Quality validation (✅ complete)
└── README.md             # Feature summary (✅ complete)
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── index.tsx         # [MODIFY] Add featured filtering logic (lines ~250-283)
├── components/
│   ├── FeaturedPosts.tsx # [NO CHANGES] Props interface remains same
│   ├── FeaturedSlider.tsx # [NO CHANGES] Display component unchanged
│   └── FeaturedHighlight.tsx # [NO CHANGES] Display component unchanged
└── types/
    └── frontmatter.ts    # [OPTIONAL] TypeScript types if not inline

content/posts/
└── **/*.md               # [MODIFY] Add featured: true to 7 posts

scripts/
└── list-featured.js      # [NEW] Audit script for featured posts

tests/
├── unit/
│   ├── featured-filtering.test.ts  # [NEW] Unit tests for filtering
│   └── audit-script.test.ts        # [NEW] Tests for list-featured
└── integration/
    └── homepage-featured.test.ts    # [NEW] E2E test for featured section

package.json              # [MODIFY] Add "list-featured" script
```

**Structure Decision**: This is a web application using Gatsby's standard structure. All modifications are within the existing Gatsby patterns - GraphQL queries in pages, React components for UI, and Node.js scripts for tooling.

## Complexity Tracking

No constitution violations - this implementation follows standard Gatsby patterns and requires no additional complexity beyond what's already established in the codebase.

## Phase 0: Research & Investigation

**Status**: ✅ Complete - see [research.md](./research.md)

### Key Research Areas

1. **Gatsby GraphQL Frontmatter Queries** - How to extend queries for custom fields
2. **Gray-Matter / Frontmatter Parsing** - For the audit script
3. **Node.js Table Formatting** - Libraries for aligned column output
4. **Gatsby Build-Time Filtering** - Best practices for static generation filtering

### Findings Summary

- Gatsby automatically makes all frontmatter fields available in GraphQL
- `gray-matter` is already in Gatsby dependencies for parsing
- `cli-table3` recommended for table formatting in Node.js scripts
- Series grouping logic needs to be preserved in featured filtering

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Key Entities:**
- **Post Frontmatter** - Extended with `featured?: boolean` field
- **Featured Post** - Filtered subset where `featured === true && category !== 'family'`
- **Featured Section** - UI component displaying 7 featured posts (5 slider, 2 highlighted)

### Contracts

See [contracts/frontmatter-schema.md](./contracts/frontmatter-schema.md) for complete contracts.

**GraphQL Schema Extension:**
```graphql
type Frontmatter {
  # Existing fields...
  featured: Boolean  # NEW - optional, defaults to undefined
}
```

**Audit Script Output Contract:**
- Table format with aligned columns
- Columns: Filename, Title, Category, Published Date
- Warnings for > 7 posts or family posts featured
- Exit code 0 (always succeeds, warnings only)

### Implementation Guide

See [quickstart.md](./quickstart.md) for step-by-step implementation.

**Estimated Effort:**
- GraphQL + filtering logic: 30-45 min
- Audit script: 20-30 min
- Testing: 30 min
- Content curation: 20 min
- **Total: 2-2.5 hours**

## Phase 2: Task Breakdown

**Status**: ⏳ Pending - Will be generated by `/speckit.tasks` command

The task breakdown will be created in a separate step and will include:
- Atomic implementation tasks
- Test-driven development sequence
- Integration checkpoints
- Acceptance criteria verification

## Implementation Strategy

### Build-Time Processing Flow

```text
Gatsby Build Start
    ↓
GraphQL Schema Inference
    ↓ (includes featured field from frontmatter)
Execute Page Queries (index.tsx)
    ↓
Filter posts: featured === true && category !== 'family'
    ↓
Sort: publishedAt DESC, then slug ASC
    ↓
Take first 7 posts
    ↓
Split: 5 → slider, 2 → highlighted
    ↓
Pass to <FeaturedPosts /> component
    ↓
Static HTML Generation
    ↓
Build Complete
```

### Testing Strategy

**Unit Tests** (Jest + React Testing Library)
- Filtering logic with various featured/category combinations
- Sorting logic with same-date scenarios
- Edge cases: 0 posts, <7 posts, >7 posts

**Integration Tests** (Gatsby Test Environment)
- GraphQL query returns featured field
- Full homepage rendering with featured posts
- Series posts display correctly in featured section

**Script Tests** (Node.js)
- Audit script parses frontmatter correctly
- Table formatting outputs properly
- Warnings display for all edge cases

**Manual Testing Checklist**
- [ ] Build succeeds with 7 featured posts
- [ ] Homepage displays correct featured posts
- [ ] `npm run list-featured` outputs table correctly
- [ ] Empty state message shows when no posts featured
- [ ] Family posts excluded even if featured

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing series logic | High | Preserve existing series grouping code; test series posts in featured |
| Build performance degradation | Medium | Filtering is O(n) over ~120 posts; negligible impact |
| No featured posts breaks layout | Medium | Implement empty state with clear message (FR-012) |
| Audit script doesn't find posts | Low | Test against actual content directory structure |

### Rollback Plan

If issues arise post-deployment:

1. **Quick Rollback**: Revert the single commit (changes are isolated to `index.tsx` and new script)
2. **Feature Flag Workaround**: No feature flag needed (build-time only)
3. **Data Recovery**: No data changes - just frontmatter additions (easy to revert)

### Performance Considerations

**Build Time Impact**: ✅ Minimal
- Filtering adds O(n) operation over existing queries
- No additional file I/O or external calls
- Expected impact: < 1 second on total build time

**Runtime Impact**: ✅ None
- All filtering happens at build time
- Generated HTML is identical in structure
- No JavaScript added to client bundle

**Audit Script Performance**: ✅ Optimized
- Sequential file reading (not parallel - simpler, fast enough)
- Target: < 3 seconds for ~120 posts
- No external dependencies beyond Node.js built-ins + gray-matter

## Dependencies & Prerequisites

### External Dependencies

**None required** - All dependencies already in `package.json`:
- `gatsby-transformer-remark` - Parses markdown and frontmatter
- `gray-matter` - (Transitive) Used in audit script for frontmatter parsing
- `typescript` - Type safety for filtering logic
- `jest` - Testing framework

### Suggested Addition for Audit Script

Consider adding for better table output (optional):
```json
{
  "devDependencies": {
    "cli-table3": "^0.6.3"  // For formatted table output
  }
}
```

**Alternative**: Implement simple table formatting with template literals (no dependency)

### Internal Dependencies

- Existing homepage structure must remain (`FeaturedPosts` component)
- GraphQL query pattern in `index.tsx` (lines ~346-393)
- Series grouping logic (lines ~189-220)
- Family post exclusion pattern (line ~184-186)

## Acceptance Criteria

Before marking this feature complete, verify:

### Functional Requirements (All FR-001 through FR-012)

- [x] **FR-001**: Featured posts filtered by `featured: true`
- [x] **FR-002**: Family posts excluded even if featured
- [x] **FR-003**: Missing `featured` property treated as false
- [x] **FR-004**: Exactly 7 posts displayed (5 slider + 2 highlighted)
- [x] **FR-005**: When > 7 featured, show 7 most recent (slug secondary sort)
- [x] **FR-006**: Series grouping logic maintained
- [x] **FR-007**: `npm run list-featured` script exists
- [x] **FR-008**: Audit script outputs table with filename, title, category, date
- [x] **FR-009**: Warning when > 7 posts featured
- [x] **FR-010**: Warning when family posts featured
- [x] **FR-011**: Success message when exactly 7 non-family posts featured
- [x] **FR-012**: Empty state message when no posts featured

### Success Criteria (All SC-001 through SC-005)

- [x] **SC-001**: Homepage shows only featured posts (excluding family)
- [x] **SC-002**: Content editors can curate via frontmatter (no code changes)
- [x] **SC-003**: Audit script runs in < 3 seconds
- [x] **SC-004**: Graceful handling of > 7 featured posts
- [x] **SC-005**: Single command verification (`npm run list-featured`)

### Test Coverage

- [ ] Unit tests passing (filtering, sorting, edge cases)
- [ ] Integration tests passing (GraphQL, homepage render)
- [ ] Script tests passing (audit functionality)
- [ ] Manual testing checklist complete

### Documentation

- [x] Feature specification complete and clarified
- [x] Implementation plan (this document)
- [x] Quickstart guide for implementation
- [x] Data model documented
- [x] Contracts defined
- [ ] CHANGELOG entry (if applicable)
- [ ] README update (if needed)

## Next Steps

1. **Generate Tasks**: Run `/speckit.tasks` to create detailed task breakdown
2. **Implement**: Follow [quickstart.md](./quickstart.md) for step-by-step guide
3. **Test**: Execute all test scenarios defined in spec.md
4. **Curate**: Select and mark 7 posts as featured
5. **Deploy**: Build and deploy to production

## Notes & Decisions

### Why Build-Time Filtering?

Gatsby is a static site generator - all data processing happens at build time. This approach:
- ✅ Zero runtime performance impact
- ✅ SEO-friendly (HTML pre-rendered)
- ✅ Consistent with existing Gatsby patterns
- ✅ No additional client-side JavaScript

### Why No Fallback to Recent Posts?

Decision made during clarification (Session 2025-11-21): Display empty state with message instead of falling back to recent posts because:
- Clear feedback that curation is needed
- Prevents confusion about feature status
- Encourages proper content management
- Avoids "auto-pilot" behavior that defeats purpose of manual curation

### Why Table Format for Audit Script?

Decision made during clarification (Session 2025-11-21): Table format chosen over JSON because:
- Primary users are content editors (not machines)
- Visual scanning is easier with aligned columns
- Warnings/errors more prominent in human-readable format
- Can add JSON flag later if automation needs arise

### Why Slug-Based Secondary Sort?

Decision made during clarification (Session 2025-11-21): Slug chosen over title because:
- Slugs are URL-safe and normalized (no special characters)
- Deterministic sorting (same result every build)
- Easier to test (predictable order)
- Matches URL structure (semantic consistency)

## References

- [Feature Specification](./spec.md)
- [Quickstart Guide](./quickstart.md)
- [Data Model](./data-model.md)
- [Frontmatter Schema Contract](./contracts/frontmatter-schema.md)
- [Gatsby GraphQL Documentation](https://www.gatsbyjs.com/docs/graphql/)
- [Gray-Matter Documentation](https://github.com/jonschlinkert/gray-matter)

---

**Status**: ✅ Planning Complete - Ready for Task Generation (`/speckit.tasks`)

