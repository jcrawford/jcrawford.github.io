---
description: "Task list for Featured Posts Filtering implementation"
---

# Tasks: Featured Posts Filtering

**Input**: Design documents from `/specs/004-featured-posts-filtering/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/frontmatter-schema.md

**Tests**: Included per user story - unit, integration, and script tests for comprehensive coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Gatsby web application with the following structure:
- Source: `src/` at repository root
- Tests: `tests/` at repository root  
- Scripts: `scripts/` at repository root
- Content: `content/posts/` for markdown files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal project setup - most infrastructure already exists

- [X] T001 Verify TypeScript configuration has `strict: true` enabled in tsconfig.json
- [X] T002 Verify Gatsby dependencies are up to date (gatsby@5.13, react@18.3)
- [X] T003 [P] Verify `gray-matter` is available (transitive dependency via gatsby-transformer-remark)

**Checkpoint**: ✅ Project environment validated

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and GraphQL schema that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Add `featured?: boolean` field to ArticleFrontmatter interface in src/pages/index.tsx (line ~10-25)
- [X] T005 [P] Update GraphQL query to include `featured` field in frontmatter selection in src/pages/index.tsx (line ~346-393)
- [X] T006 Run `gatsby clean` and `gatsby build` to verify GraphQL schema inference includes featured field

**Checkpoint**: ✅ Foundation ready - type safety and data access established

---

## Phase 3: User Story 1 - Display Curated Featured Posts (Priority: P1) 🎯 MVP

**Goal**: Replace automatic "7 most recent posts" with manual curation via `featured: true` frontmatter

**Independent Test**: Mark exactly 7 non-family posts with `featured: true`, build, verify they appear in featured section (5 slider + 2 highlighted), confirm non-featured posts don't appear

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T007 [P] [US1] Create unit test file tests/unit/featured-filtering.test.ts with test cases for filtering logic
- [X] T008 [P] [US1] Write test: filters posts where featured === true in tests/unit/featured-filtering.test.ts
- [X] T009 [P] [US1] Write test: excludes family category even if featured === true in tests/unit/featured-filtering.test.ts  
- [X] T010 [P] [US1] Write test: treats missing featured property as false in tests/unit/featured-filtering.test.ts
- [X] T011 [P] [US1] Write test: treats featured === false as non-featured in tests/unit/featured-filtering.test.ts
- [X] T012 [P] [US1] Create integration test file tests/integration/homepage-featured.test.ts for full page rendering
- [X] T013 [US1] Write integration test: homepage renders with 7 featured posts in tests/integration/homepage-featured.test.ts
- [X] T014 [US1] Run tests and verify they FAIL (no implementation yet)

### Implementation for User Story 1

- [X] T015 [US1] Locate existing filtering logic in src/pages/index.tsx (lines ~184-186 for family exclusion)
- [X] T016 [US1] Locate series grouping logic in src/pages/index.tsx (lines ~189-220) - PRESERVE this logic
- [X] T017 [US1] Locate where latestArticles is generated in src/pages/index.tsx (line ~251)
- [X] T018 [US1] Replace `allDisplayArticles.slice(0, 7)` with featured filtering logic in src/pages/index.tsx
- [X] T019 [US1] Implement featured posts filter: `articles.filter(a => a.frontmatter.featured === true && a.frontmatter.category !== 'family')` in src/pages/index.tsx
- [X] T020 [US1] Add sort logic: primary by publishedAt DESC, secondary by slug ASC in src/pages/index.tsx
- [X] T021 [US1] Add `.slice(0, 7)` to limit to first 7 posts in src/pages/index.tsx
- [X] T022 [US1] Ensure series grouping happens BEFORE featured filtering (preserve line ~189-220 logic) in src/pages/index.tsx
- [X] T023 [US1] Add JSDoc comment to filtering function documenting purpose and parameters in src/pages/index.tsx
- [X] T024 [US1] Run tests and verify T007-T013 now PASS
- [X] T025 [US1] Build site with `gatsby build` and verify no TypeScript errors
- [X] T026 [US1] Mark 7 test posts with `featured: true` in content/posts/ for manual testing
- [X] T027 [US1] Run `gatsby develop` and manually verify homepage shows 7 featured posts

**Checkpoint**: ✅ At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle Excess Featured Posts (Priority: P2)

**Goal**: Gracefully handle >7 featured posts by showing only 7 most recent (already implemented in US1 via slice)

**Independent Test**: Mark 10 non-family posts with `featured: true`, verify only 7 most recent appear

**Note**: This user story is largely covered by US1 implementation (.slice(0, 7) handles limiting). These tasks add explicit testing and edge case handling.

### Tests for User Story 2

- [X] T028 [P] [US2] Write test: when 10 posts featured, only 7 most recent appear in tests/unit/featured-filtering.test.ts
- [X] T029 [P] [US2] Write test: when 5 posts featured, all 5 appear (no filler) in tests/unit/featured-filtering.test.ts
- [X] T030 [P] [US2] Write test: when 0 posts featured, empty array returned in tests/unit/featured-filtering.test.ts
- [X] T031 [US2] Run tests and verify they FAIL (no empty state handling yet)

### Implementation for User Story 2

- [X] T032 [US2] Add empty state check: if featured posts array length === 0 in src/pages/index.tsx
- [X] T033 [US2] Create EmptyFeaturedState component in src/components/EmptyFeaturedState.tsx with message "No featured posts configured"
- [X] T034 [US2] Render EmptyFeaturedState component when no featured posts in src/pages/index.tsx
- [X] T035 [US2] Add CSS styling for empty state in src/styles/empty-featured.css (or appropriate stylesheet)
- [X] T036 [US2] Run tests T028-T030 and verify they now PASS
- [X] T037 [US2] Test with 10 featured posts: mark 10 posts, build, verify only 7 appear
- [X] T038 [US2] Test with 0 featured posts: unmark all, build, verify empty state message appears

**Checkpoint**: ✅ At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Audit Featured Posts Script (Priority: P3)

**Goal**: Provide `npm run list-featured` command to audit featured posts configuration

**Independent Test**: Run `npm run list-featured`, verify it lists all featured posts with warnings for >7 or family posts

### Tests for User Story 3

- [ ] T039 [P] [US3] Create test file tests/unit/audit-script.test.ts for script functionality
- [ ] T040 [P] [US3] Write test: script finds all posts with featured === true in tests/unit/audit-script.test.ts
- [ ] T041 [P] [US3] Write test: script warns when >7 posts featured in tests/unit/audit-script.test.ts
- [ ] T042 [P] [US3] Write test: script warns when family posts featured in tests/unit/audit-script.test.ts
- [ ] T043 [P] [US3] Write test: script shows success with exactly 7 non-family posts in tests/unit/audit-script.test.ts
- [ ] T044 [US3] Run tests and verify they FAIL (no script yet)

### Implementation for User Story 3

- [ ] T045 [US3] Create scripts/list-featured.js file with Node.js shebang
- [ ] T046 [US3] Implement getAllMarkdownFiles() function to recursively read content/posts/ directory in scripts/list-featured.js
- [ ] T047 [US3] Import gray-matter for frontmatter parsing in scripts/list-featured.js
- [ ] T048 [US3] Parse frontmatter from each markdown file in scripts/list-featured.js
- [ ] T049 [US3] Filter posts where featured === true in scripts/list-featured.js
- [ ] T050 [US3] Group featured posts by category to identify family posts in scripts/list-featured.js
- [ ] T051 [US3] Implement table formatting function using template literals (aligned columns) in scripts/list-featured.js
- [ ] T052 [US3] Format output: Filename | Title | Category | Published Date columns in scripts/list-featured.js
- [ ] T053 [US3] Add warning logic: if featured posts > 7, display warning with excess posts in scripts/list-featured.js
- [ ] T054 [US3] Add error logic: if family posts featured, display prominent warning in scripts/list-featured.js
- [ ] T055 [US3] Add success logic: if exactly 7 non-family posts, display success message in scripts/list-featured.js
- [ ] T056 [US3] Add JSDoc comments to all functions in scripts/list-featured.js
- [ ] T057 [US3] Add to package.json scripts: `"list-featured": "node scripts/list-featured.js"`
- [ ] T058 [US3] Run tests T039-T043 and verify they now PASS
- [ ] T059 [US3] Manual test: run `npm run list-featured` and verify table output is readable
- [ ] T060 [US3] Manual test: mark 10 posts, run script, verify warning about 3 excess posts
- [ ] T061 [US3] Manual test: mark family post, run script, verify family warning appears
- [ ] T062 [US3] Manual test: configure exactly 7 non-family posts, run script, verify success message

**Checkpoint**: ✅ All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T063 [P] Verify all TypeScript types are specific (no `any` type used) across modified files
- [X] T064 [P] Verify JSDoc comments on all exported functions in src/pages/index.tsx
- [X] T065 [P] Verify no specification markers (FR-XXX, SC-XXX) in code comments
- [X] T066 [P] Run `npm run type-check` and verify zero TypeScript errors
- [X] T067 [P] Run full test suite with `npm test` and verify all tests pass
- [X] T068 Update CHANGELOG.md with feature description (if project uses changelog)
- [X] T069 Update README.md to document `npm run list-featured` command
- [X] T070 Create content/posts/ selection: choose final 7 posts to feature
- [X] T071 Add `featured: true` to selected 7 posts frontmatter
- [X] T072 Run `npm run list-featured` to validate final configuration
- [X] T073 Run full build with `npm run build` and verify success
- [X] T074 Run `npm run serve` and manually test all acceptance scenarios from spec.md
- [X] T075 Verify Constitution compliance: dates use dayjs (if any date transformations added)
- [X] T076 Run quickstart.md validation checklist from specs/004-featured-posts-filtering/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (builds on filtering logic)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - INDEPENDENT of US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (extends the filtering implementation)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - INDEPENDENT of US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Type definitions before implementation
- Core logic before edge cases
- Unit tests before integration tests
- Implementation complete before moving to next story

### Parallel Opportunities

- **Phase 1** (T001-T003): All can run in parallel
- **Phase 2** (T004-T005): Can run in parallel
- **US1 Tests** (T007-T013): All tests can be written in parallel
- **US2 Tests** (T028-T030): All tests can be written in parallel
- **US3 Tests** (T039-T043): All tests can be written in parallel
- **Polish** (T063-T067): Many tasks can run in parallel
- **US3 can start immediately after Phase 2** (independent of US1/US2)

---

## Parallel Example: User Story 1

```bash
# Launch all test files for User Story 1 together:
Task: "Create unit test file tests/unit/featured-filtering.test.ts" (T007)
Task: "Create integration test file tests/integration/homepage-featured.test.ts" (T012)

# Write all test cases for User Story 1 in parallel:
Task: "Write test: filters posts where featured === true" (T008)
Task: "Write test: excludes family category" (T009)
Task: "Write test: treats missing featured property as false" (T010)
Task: "Write test: treats featured === false as non-featured" (T011)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (types + GraphQL) - CRITICAL
3. Complete Phase 3: User Story 1 (core filtering)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready (basic featured posts working)

**Time Estimate**: ~1.5-2 hours for MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~15 min)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (~1 hour)
3. Add User Story 2 → Test independently → Deploy/Demo (~30 min)
4. Add User Story 3 → Test independently → Deploy/Demo (~45 min)
5. Polish and finalize → Full feature complete (~30 min)

**Total Time Estimate**: ~3 hours (matches plan.md estimate of 2-2.5 hours implementation + testing)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~15 min)
2. Once Foundational is done:
   - Developer A: User Story 1 + 2 (dependent)
   - Developer B: User Story 3 (independent)
   - Can work in parallel after Phase 2
3. Merge and integrate when both complete
4. Team completes Polish together

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each logical task group
- Stop at any checkpoint to validate story independently
- US3 (audit script) is completely independent and can be built in parallel with US1/US2

## Task Summary

**Total Tasks**: 76

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (US1): 21 tasks (7 tests + 14 implementation)
- Phase 4 (US2): 11 tasks (4 tests + 7 implementation)
- Phase 5 (US3): 24 tasks (6 tests + 18 implementation)
- Phase 6 (Polish): 14 tasks

**By User Story**:
- User Story 1: 21 tasks
- User Story 2: 11 tasks
- User Story 3: 24 tasks
- Shared (Setup/Foundational/Polish): 20 tasks

**Parallel Opportunities**: 28 tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- US1: Mark 7 non-family posts with `featured: true`, verify they appear in featured section
- US2: Mark 10 non-family posts, verify only 7 most recent appear; mark 0 posts, verify empty state
- US3: Run `npm run list-featured`, verify table output and warnings/success messages

**Suggested MVP Scope**: Complete through Phase 3 (US1) for functional homepage with featured posts (~1.5-2 hours)

