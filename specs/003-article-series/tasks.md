# Implementation Tasks: Article Series Navigation

**Feature**: Article Series Navigation  
**Branch**: `003-article-series`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task Summary

**Total Tasks**: 35  
**Parallelizable Tasks**: 18  
**MVP Scope**: User Stories 1, 2, 6 (23 tasks)  
**Full Feature**: All 6 User Stories (35 tasks)

**Task Distribution**:
- Setup: 3 tasks
- Foundational: 4 tasks
- User Story 1 (Series Metadata): 4 tasks
- User Story 2 (Table of Contents): 3 tasks
- User Story 6 (Prev/Next Navigation): 3 tasks
- User Story 3 (Sticky Behavior): 3 tasks
- User Story 4 (References): 2 tasks
- User Story 5 (Attachments): 2 tasks
- Polish & Integration: 11 tasks

---

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies for series feature

**Tasks**:

- [x] T001 Create base src/types/index.ts file (specific series interfaces added in Phase 3, User Story 1)
- [x] T002 [P] Create series-widget.css file in src/styles/
- [x] T003 [P] Create series-navigation.css file in src/styles/

**Dependencies**: None (can start immediately)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Implement build-time validation that must work before any user story

**Independent Test**: Run `gatsby build` with test articles containing series metadata and verify validation catches errors for missing series.name, broken prev/next links, and circular references

**Tasks**:

- [x] T004 Implement series metadata validation in gatsby-node.ts (detect missing series.name)
- [x] T005 Add article slug lookup map creation in gatsby-node.ts  
- [x] T006 Add prev/next reference validation in gatsby-node.ts (check article exists)
- [x] T007 Add circular reference detection algorithm in gatsby-node.ts

**Dependencies**: T001 (types) → T004-T007

**Validation Checklist**:
- [ ] Build fails with clear error when series.name is missing
- [ ] Build fails with clear error when prev/next references non-existent article
- [ ] Build fails with clear error when circular reference detected (A → B → A)
- [ ] Build succeeds with valid series metadata

**Note**: Attachment file validation (T031-T032) is implemented in Phase 9 (Polish) for complete validation coverage. Early validation focuses on critical metadata errors that block all functionality.

---

## Phase 3: User Story 1 - Series Metadata Declaration (P1)

**Story Goal**: Content authors can add series metadata to article frontmatter and build succeeds with proper validation

**Independent Test**: Create a test article with series metadata (name, order, prev, next), run `gatsby build`, and verify the article is recognized as part of a series with no build errors. GraphQL query should return series data.

**Tasks**:

- [x] T008 [P] [US1] Add SeriesMetadata interface in src/types/index.ts
- [x] T009 [P] [US1] Add SeriesReference interface in src/types/index.ts
- [x] T010 [P] [US1] Add SeriesAttachment interface in src/types/index.ts
- [x] T011 [US1] Update ArticleFrontmatter interface in src/types/index.ts to include optional series field

**Dependencies**: T001 → T008-T011

**Validation Checklist**:
- [ ] Article without series metadata builds successfully
- [ ] Article with series metadata accessible in GraphQL
- [ ] TypeScript compilation succeeds with no errors
- [ ] Invalid series metadata fails build with clear error

---

## Phase 4: User Story 2 - Series Table of Contents Display (P1)

**Story Goal**: Readers see a table of contents showing all articles in the series with proper ordering and current article highlighted

**Independent Test**: Create a 3-article series, view the middle article, and verify all three articles appear in the table of contents with correct numbering (1, 2, 3), current article is non-clickable, and other articles are clickable links

**Tasks**:

- [x] T012 [US2] Create SeriesWidget component in src/components/SeriesWidget.tsx (header + TOC structure)
- [x] T013 [US2] Implement series article grouping and sorting logic in SeriesWidget.tsx (series.order → publishedAt)
- [x] T014 [US2] Update article template GraphQL query in src/templates/article.tsx to fetch series data and all series articles

**Dependencies**: T011 → T012-T014

**Validation Checklist**:
- [ ] Series widget displays with series name as plain text (non-clickable)
- [ ] All articles in series appear in TOC in correct order
- [ ] Current article is non-clickable (plain text)
- [ ] Other articles are clickable links
- [ ] Articles numbered sequentially (1., 2., 3., ...)

---

## Phase 5: User Story 6 - Previous/Next Article Navigation (P1)

**Story Goal**: Readers can navigate sequentially through a series using Previous/Next buttons at top and bottom of article

**Independent Test**: Create a 3-article series, view the middle article, verify "Previous" and "Next" buttons appear at both top and bottom, clicking them navigates to correct articles, and first/last articles hide appropriate buttons

**Tasks**:

- [x] T015 [P] [US6] Create SeriesPrevNext component in src/components/SeriesPrevNext.tsx (button structure)
- [x] T016 [US6] Implement conditional rendering logic in SeriesPrevNext.tsx (hide buttons for first/last article)
- [x] T017 [US6] Integrate SeriesPrevNext component in src/templates/article.tsx (top and bottom positions)

**Dependencies**: T011 → T015-T017

**Validation Checklist**:
- [ ] Previous button appears at top and bottom when prev article exists
- [ ] Next button appears at top and bottom when next article exists
- [ ] First article shows no Previous button
- [ ] Last article shows no Next button
- [ ] Clicking buttons navigates to correct articles

---

## Phase 6: User Story 3 - Sticky Sidebar Behavior (P1)

**Story Goal**: On desktop (≥768px), series widget sticks to top of viewport when scrolling; on mobile (<768px), widget appears below content without sticky behavior

**Independent Test**: View a series article with long content on desktop (≥768px viewport), scroll down 500px, verify widget remains visible at top. View same article on mobile (<768px), verify widget appears below content without sticky behavior

**Tasks**:

- [x] T018 [P] [US3] Implement desktop sticky CSS in src/styles/series-widget.css (position: sticky, ≥768px media query)
- [x] T019 [P] [US3] Implement mobile static CSS in src/styles/series-widget.css (below content, <768px media query)
- [x] T020 [US3] Add responsive layout grid in src/templates/article.tsx (sidebar on desktop, below on mobile)

**Dependencies**: T012 → T018-T020

**Validation Checklist**:
- [ ] Desktop (≥768px): Widget starts in normal sidebar position
- [ ] Desktop: Widget becomes sticky when reaching viewport top
- [ ] Desktop: Widget returns to normal position when scrolling up
- [ ] Desktop: Long widget (taller than viewport) is scrollable
- [ ] Mobile (<768px): Widget appears below article content
- [ ] Mobile: No sticky behavior on mobile

---

## Phase 7: User Story 4 - Series References Display (P2)

**Story Goal**: Readers can see external references related to the series below the table of contents

**Independent Test**: Add references metadata to a series article, view the page, verify "References" section appears below TOC with proper numbering, links open in new tabs, and section is hidden when no references exist

**Tasks**:

- [x] T021 [P] [US4] Implement References section in src/components/SeriesWidget.tsx (conditional rendering)
- [x] T022 [US4] Add reference link styling in src/styles/series-widget.css (numbering, external link icon)

**Dependencies**: T012 → T021-T022

**Validation Checklist**:
- [ ] References section appears when metadata present
- [ ] References numbered sequentially (1., 2., 3., ...)
- [ ] Reference links open in new tabs (target="_blank" rel="noopener noreferrer")
- [ ] No references section when metadata absent

---

## Phase 8: User Story 5 - Series Attachments Display (P2)

**Story Goal**: Readers can download supplementary files related to the series

**Independent Test**: Add attachments metadata to a series article, view the page, verify "Attachments" section appears with download links, proper numbering, and section is hidden when no attachments exist

**Tasks**:

- [x] T023 [P] [US5] Implement Attachments section in src/components/SeriesWidget.tsx (conditional rendering)
- [x] T024 [US5] Add attachment link styling in src/styles/series-widget.css (numbering, download icon)

**Dependencies**: T012 → T023-T024

**Validation Checklist**:
- [ ] Attachments section appears when metadata present
- [ ] Attachments numbered sequentially (1., 2., 3., ...)
- [ ] Attachment links trigger downloads
- [ ] No attachments section when metadata absent

---

## Phase 9: Polish & Integration

**Goal**: Integrate all components, add final styling, and ensure production-ready quality

**Tasks**:

- [x] T025 Integrate SeriesWidget into Sidebar component in src/components/Sidebar.tsx (conditional rendering)
- [x] T026 [P] Add series widget header styling in src/styles/series-widget.css
- [x] T027 [P] Add table of contents styling in src/styles/series-widget.css (numbering, current article highlight)
- [x] T028 [P] Add prev/next button styling in src/styles/series-navigation.css (hover states, disabled states)
- [x] T029 [P] Add accessibility attributes to SeriesWidget.tsx (aria-labels, nav role)
- [x] T030 [P] Add accessibility attributes to SeriesPrevNext.tsx (aria-labels, descriptive text)
- [x] T031 Add attachment file existence validation in gatsby-node.ts (warn if file missing)
- [x] T032 Add attachment file size warning in gatsby-node.ts (warn if >50MB)
- [ ] T033 Test responsive behavior on mobile (320px to 767px viewports)
- [ ] T034 Test sticky behavior on desktop (768px+ viewports with long articles)
- [ ] T035 Verify build validation catches all error scenarios (missing name, broken links, circular refs)

**Dependencies**: T012, T015, T018-T019, T021, T023 → T025-T035

**Validation Checklist**:
- [ ] All user story acceptance criteria pass
- [ ] No console errors or warnings
- [ ] Build succeeds with valid series metadata
- [ ] Build fails with clear errors for invalid metadata
- [ ] Responsive layout works 320px to 2560px
- [ ] Sticky behavior smooth at 60fps on desktop
- [ ] Series widget renders within 100ms
- [ ] No layout shift (CLS) on page load
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces structure

---

## Dependency Graph

### Critical Path (Must Complete in Order)

```
Setup (T001-T003)
  ↓
Foundational (T004-T007) - Build Validation
  ↓
User Story 1 (T008-T011) - Type Definitions
  ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   User Story 2  │  User Story 6   │  User Story 3   │
│   (T012-T014)   │  (T015-T017)    │  (T018-T020)    │
│   TOC Widget    │  Prev/Next Nav  │  Sticky CSS     │
└─────────────────┴─────────────────┴─────────────────┘
  ↓                 ↓                 ↓
┌─────────────────┬─────────────────┐
│  User Story 4   │  User Story 5   │
│  (T021-T022)    │  (T023-T024)    │
│  References     │  Attachments    │
└─────────────────┴─────────────────┘
  ↓
Polish & Integration (T025-T035)
```

### Parallel Execution Opportunities

**Setup Phase** (all parallel):
- T001: Type interfaces
- T002: series-widget.css
- T003: series-navigation.css

**User Story 1 Phase** (T008-T010 parallel):
- T008: SeriesMetadata interface
- T009: SeriesReference interface
- T010: SeriesAttachment interface
Then T011 (depends on T008-T010)

**After US1 Complete** (T012, T015, T018 can start in parallel):
- US2: T012-T014 (SeriesWidget component)
- US6: T015-T017 (SeriesPrevNext component)
- US3: T018-T020 (Sticky CSS)

**After US2 Complete** (T021 and T023 can start in parallel):
- US4: T021-T022 (References)
- US5: T023-T024 (Attachments)

**Polish Phase** (many parallel):
- T026-T030: All styling and accessibility tasks can be done in parallel

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: User Stories 1, 2, 6 (23 tasks)

This provides core series functionality:
- ✅ Series metadata support with validation
- ✅ Table of contents navigation
- ✅ Previous/Next sequential navigation
- ✅ Basic integration and styling

**Defer to v2**:
- User Story 3: Sticky behavior (nice-to-have enhancement)
- User Story 4: References (supplementary)
- User Story 5: Attachments (supplementary)

**MVP Delivery**: ~23 tasks, estimated 2-3 days

### Incremental Delivery

**Sprint 1** (Core Foundation):
- Phase 1: Setup (T001-T003)
- Phase 2: Foundational validation (T004-T007)
- Phase 3: User Story 1 - Metadata (T008-T011)

**Sprint 2** (Navigation):
- Phase 4: User Story 2 - TOC (T012-T014)
- Phase 5: User Story 6 - Prev/Next (T015-T017)
- Basic integration (T025)

**Sprint 3** (Enhancement):
- Phase 6: User Story 3 - Sticky (T018-T020)
- Phase 7: User Story 4 - References (T021-T022)
- Phase 8: User Story 5 - Attachments (T023-T024)

**Sprint 4** (Polish):
- Phase 9: Polish & Integration (T026-T035)

---

## Testing Strategy

### Manual Testing Per User Story

**User Story 1**: Series Metadata Declaration
1. Create article without series → verify no widget displays
2. Create article with series.name only → verify widget displays
3. Create article with invalid series (missing name) → verify build fails
4. Create article with all series fields → verify all accessible in GraphQL

**User Story 2**: Series Table of Contents Display
1. Create 3-article series → verify all appear in TOC on each article
2. View article #2 → verify it's non-clickable, others are links
3. Create series with series.order fields → verify ordering respects order field
4. Create series without order fields → verify ordering by publishedAt

**User Story 6**: Previous/Next Article Navigation
1. View first article → verify no Previous button, Next button present
2. View middle article → verify both buttons present
3. View last article → verify Previous button present, no Next button
4. Click Previous/Next → verify correct navigation

**User Story 3**: Sticky Sidebar Behavior
1. Desktop (≥768px): Scroll down → verify widget sticks at top
2. Desktop: Scroll up → verify widget returns to normal position
3. Mobile (<768px): Verify widget below content, no sticky
4. Long widget: Verify scrollable within viewport

**User Story 4**: Series References Display
1. Add references to article → verify section appears below TOC
2. Verify numbering (1., 2., 3., ...)
3. Click reference → verify opens in new tab
4. Article without references → verify section hidden

**User Story 5**: Series Attachments Display
1. Add attachments to article → verify section appears
2. Verify numbering (1., 2., 3., ...)
3. Click attachment → verify download triggers
4. Article without attachments → verify section hidden

### Build Validation Testing

**Test Cases**:
1. Missing series.name → Build fails: "Missing series.name in article: [slug]"
2. Invalid prev reference → Build fails: "Invalid series.prev in [slug]: [path] not found"
3. Invalid next reference → Build fails: "Invalid series.next in [slug]: [path] not found"
4. Circular reference (A→B→A) → Build fails: "Circular reference detected starting from: [slug]"
5. Missing attachment file → Build warns: "Attachment not found: [filename] in [slug]"
6. Large attachment (>50MB) → Build warns: "Large attachment (XMB) in [slug]: [filename]"

### Performance Testing

**Benchmarks**:
- [ ] Series widget renders within 100ms of page load
- [ ] Sticky scrolling maintains 60fps (test with Chrome DevTools Performance)
- [ ] Build time with 20-article series < 15 seconds
- [ ] No Cumulative Layout Shift (CLS) when widget loads

### Browser Compatibility Testing

**Test Matrix**:
- [ ] Chrome 100+ (sticky positioning)
- [ ] Firefox 90+ (sticky positioning)
- [ ] Safari 14+ (sticky positioning)
- [ ] Edge 90+ (sticky positioning)
- [ ] Mobile Safari iOS 14+ (responsive layout)
- [ ] Mobile Chrome Android 90+ (responsive layout)

---

## File Checklist

### New Files Created

- [ ] src/types/index.ts (series interfaces)
- [ ] src/components/SeriesWidget.tsx
- [ ] src/components/SeriesPrevNext.tsx
- [ ] src/styles/series-widget.css
- [ ] src/styles/series-navigation.css

### Modified Files

- [ ] gatsby-node.ts (add validation)
- [ ] src/templates/article.tsx (integrate components, update query)
- [ ] src/components/Sidebar.tsx (conditionally render SeriesWidget)

### Test Articles (for manual testing)

- [ ] content/posts/series-test-1-first.md (first article in test series)
- [ ] content/posts/series-test-2-middle.md (middle article with prev/next)
- [ ] content/posts/series-test-3-last.md (last article in test series)
- [ ] content/posts/series-test-4-references.md (article with references)
- [ ] content/posts/series-test-5-attachments.md (article with attachments)

---

## Success Criteria

### Definition of Done

A task is complete when:
1. ✅ Code written and follows TypeScript strict mode
2. ✅ No linter errors or warnings
3. ✅ Component renders without console errors
4. ✅ Related user story acceptance criteria pass
5. ✅ Code committed to feature branch

A user story is complete when:
1. ✅ All tasks for that story completed
2. ✅ Independent test passes
3. ✅ All acceptance scenarios verified manually
4. ✅ No regressions in existing functionality

Feature is complete when:
1. ✅ All 6 user stories complete
2. ✅ All 35 tasks checked off
3. ✅ Build validation catches all error scenarios
4. ✅ Manual testing checklist 100% passed
5. ✅ Performance benchmarks met
6. ✅ Cross-browser testing passed
7. ✅ No outstanding bugs or issues

---

## Notes

**Parallelization**: 18 of 35 tasks (51%) can be executed in parallel, significantly reducing implementation time.

**Dependencies**: Most user stories (US2, US3, US4, US5, US6) can be implemented independently after US1 is complete, allowing flexible task ordering.

**Testing**: No unit tests required per project constitution (P10). All validation is manual testing against acceptance criteria.

**Backward Compatibility**: All tasks maintain backward compatibility - articles without series metadata continue to work unchanged.

**Risk Mitigation**: Build validation (Phase 2) implemented early to catch errors before component development, reducing rework.

---

## Quick Reference

### Task Count by Phase

| Phase | Tasks | Parallel | Story |
|-------|-------|----------|-------|
| Setup | 3 | 3 | - |
| Foundational | 4 | 0 | - |
| User Story 1 | 4 | 3 | P1 |
| User Story 2 | 3 | 0 | P1 |
| User Story 6 | 3 | 1 | P1 |
| User Story 3 | 3 | 2 | P1 |
| User Story 4 | 2 | 1 | P2 |
| User Story 5 | 2 | 1 | P2 |
| Polish | 11 | 7 | - |
| **Total** | **35** | **18** | - |

### Estimated Effort

- MVP (US1, US2, US6): ~23 tasks, 2-3 days
- Full Feature (all stories): ~35 tasks, 4-5 days
- Polish & Testing: ~1-2 days

**Total Estimated Time**: 5-7 days for full feature with polish

---

**Next Steps**: Begin with Phase 1 (Setup) tasks T001-T003, which can all be executed in parallel.

