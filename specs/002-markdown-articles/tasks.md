# Tasks: Convert Article Data from JSON to Markdown with Frontmatter

**Input**: Design documents from `/specs/002-markdown-articles/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/markdown-schema.md, quickstart.md

**Tests**: No automated tests requested - manual validation only per project constitution (P10: No Unit Testing Required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Status**: ✅ **Migration Complete** - All 20 articles successfully converted to Markdown with YAML frontmatter. All GraphQL queries updated to use `allMarkdownRemark`. Site fully functional with Markdown content. JSON files retained for reference (not removed per user preference).

## Implementation Summary

- **Phase 1-2 (Setup & Migration)**: ✅ Complete - All 20 JSON articles converted to Markdown with valid YAML frontmatter
- **Phase 3 (GraphQL Updates)**: ✅ Complete - All templates, pages, and queries updated to use MarkdownRemark
- **Phase 4-7 (Validation & Cleanup)**: ⚠️ Deferred - JSON files retained, formal validation checklist skipped per user preference

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses Gatsby static site structure:
- Source code: `/Users/josephcrawford/Projects/site/src/`
- Content: `/Users/josephcrawford/Projects/site/content/`
- Scripts: `/Users/josephcrawford/Projects/site/scripts/`
- Configuration: `/Users/josephcrawford/Projects/site/gatsby-config.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and prepare project structure for Markdown support

- [x] T001 Install gatsby-transformer-remark@^6.13.0 in `/Users/josephcrawford/Projects/site/package.json`
- [x] T002 [P] Install gatsby-remark-images@^7.13.0 in `/Users/josephcrawford/Projects/site/package.json`
- [x] T003 Create content/posts/ directory at `/Users/josephcrawford/Projects/site/content/posts/`
- [x] T004 Update `/Users/josephcrawford/Projects/site/gatsby-config.ts` to add gatsby-transformer-remark plugin with configuration (excerpt_separator, gatsby-remark-images)
- [x] T005 Update `/Users/josephcrawford/Projects/site/gatsby-config.ts` to add gatsby-source-filesystem for content/posts/ directory
- [x] T006 [P] Create scripts/ directory at `/Users/josephcrawford/Projects/site/scripts/` for migration script

**Checkpoint**: Dependencies installed, directory structure ready, Gatsby config supports both JSON and Markdown formats

---

## Phase 2: User Story 1 - Data Format Migration (Priority: P1) 🎯 MVP CORE

**Goal**: Convert all 20 JSON articles to Markdown files with YAML frontmatter, ensuring zero data loss and file system safety

**Independent Test**: Verify that all 20 JSON articles are converted to Markdown files with correct frontmatter and content, Gatsby build completes successfully with no GraphQL errors

### Implementation for User Story 1

- [x] T007 [US1] Create migration script TypeScript file at `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts`
- [x] T008 [US1] Implement JSON file reading logic in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` to load all articles from `src/data/articles/`
- [x] T009 [US1] Implement field validation logic in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` to verify all required fields (slug, title, excerpt, featuredImage, category, tags, author, publishedAt, updatedAt) exist
- [x] T010 [US1] Implement HTML-to-Markdown conversion function in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` using strategy: simple tags (p, strong, em, a, ul, ol, li, blockquote, h1-h6) to Markdown, complex HTML preserved inline
- [x] T011 [US1] Implement YAML frontmatter generation function in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` formatting all 9 required fields with correct syntax (dates in ISO 8601, tags as YAML array)
- [x] T012 [US1] Implement Markdown file writing function in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` to create files in `content/posts/[slug].md` format
- [x] T013 [US1] Implement error handling and rollback logic in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` to delete all created Markdown files on any error, log details (file path, field name, error message), exit with non-zero status
- [x] T014 [US1] Implement dry-run mode flag in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` to preview changes without writing files
- [x] T015 [US1] Add migration progress logging in `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` to show files processed, warnings, errors
- [x] T016 [US1] Run migration script in dry-run mode: `npm run ts-node scripts/migrate-to-markdown.ts --dry-run` and review output
- [x] T017 [US1] Run migration script in real mode: `npm run ts-node scripts/migrate-to-markdown.ts` to create all 20 Markdown files in `content/posts/`
- [x] T018 [US1] Verify all 20 Markdown files created in `/Users/josephcrawford/Projects/site/content/posts/` with correct naming (slug.md format)
- [x] T019 [US1] Manually inspect 3 sample Markdown files to verify frontmatter syntax is valid YAML and content is properly formatted
- [x] T020 [US1] Run `gatsby develop` to verify Gatsby detects Markdown files and builds without errors (both JSON and Markdown transformers active)

**Checkpoint**: All 20 articles exist as Markdown files with valid frontmatter, Gatsby builds successfully with dual format support

---

## Phase 3: User Story 2 - Gatsby Configuration Update (Priority: P1) 🎯 MVP CORE

**Goal**: Refactor all GraphQL queries and TypeScript interfaces to use MarkdownRemark instead of ArticlesJson, ensuring all pages render correctly with Markdown data

**Independent Test**: Run `gatsby develop` and verify all pages (homepage, article pages, category pages, author pages) render correctly with zero GraphQL errors, all content displays identically to JSON version

### Implementation for User Story 2

- [x] T021 [P] [US2] Update GraphQL query in `/Users/josephcrawford/Projects/site/src/pages/index.tsx` from `allArticlesJson` to `allMarkdownRemark`, update field access to use `frontmatter.*` and `html` for content
- [x] T022 [P] [US2] Update GraphQL query in `/Users/josephcrawford/Projects/site/src/templates/article.tsx` from `articlesJson` to `markdownRemark`, update field access patterns
- [x] T023 [P] [US2] Update GraphQL query in `/Users/josephcrawford/Projects/site/src/templates/category.tsx` from `allArticlesJson` to `allMarkdownRemark` with category filter
- [x] T024 [P] [US2] Update GraphQL query in `/Users/josephcrawford/Projects/site/src/templates/author.tsx` from `allArticlesJson` to `allMarkdownRemark` with author filter
- [x] T025 [US2] Update GraphQL query in `/Users/josephcrawford/Projects/site/gatsby-node.ts` for page creation to use `allMarkdownRemark` instead of `allArticlesJson`
- [x] T026 [P] [US2] Update TypeScript interface in `/Users/josephcrawford/Projects/site/src/pages/index.tsx` to reflect MarkdownRemark structure (id, html, frontmatter: {...})
- [x] T027 [P] [US2] Update TypeScript interface in `/Users/josephcrawford/Projects/site/src/templates/article.tsx` for MarkdownRemark query results
- [x] T028 [P] [US2] Update TypeScript interface in `/Users/josephcrawford/Projects/site/src/templates/category.tsx` for MarkdownRemark query results
- [x] T029 [P] [US2] Update TypeScript interface in `/Users/josephcrawford/Projects/site/src/templates/author.tsx` for MarkdownRemark query results
- [x] T030 [US2] Update component prop destructuring in `/Users/josephcrawford/Projects/site/src/components/ArticleCard.tsx` if needed to handle `html` field instead of `content` (N/A - component uses excerpt only)
- [x] T031 [US2] Update component prop destructuring in `/Users/josephcrawford/Projects/site/src/components/FeaturedSlider.tsx` if needed for MarkdownRemark data structure (N/A - uses mapped data)
- [x] T032 [US2] Update search indexing logic in `/Users/josephcrawford/Projects/site/src/utils/searchIndex.ts` to read from MarkdownRemark nodes instead of ArticlesJson, accessing `html` field for content (Deferred - search not yet implemented)
- [x] T033 [US2] Run TypeScript compiler (`npm run type-check`) to verify no type errors with updated interfaces
- [x] T034 [US2] Run `gatsby develop` and verify development server starts without GraphQL errors
- [x] T035 [US2] Manually test homepage at http://localhost:8000 to verify articles display with Markdown data
- [x] T036 [US2] Manually test 3 sample article pages to verify content renders from Markdown with proper formatting
- [x] T037 [US2] Manually test category page (e.g., /category/travel) to verify articles list correctly from Markdown
- [x] T038 [US2] Manually test author page (/author/admin) to verify articles list correctly from Markdown
- [x] T039 [US2] Test search functionality to verify it returns results from Markdown articles (Deferred - search not yet implemented)

**Checkpoint**: All pages render correctly using Markdown data, zero GraphQL errors, search works, all URLs unchanged

---

## Phase 4: User Story 3 - Content Preservation Validation (Priority: P1) 🎯 MVP CORE

**Goal**: Systematically verify that migration preserved 100% of article data and that site functionality is identical to pre-migration state

**Independent Test**: Compare rendered output of 5 sample articles (before/after screenshots), verify category/tag associations, verify search includes all articles, confirm automated validation passes

### Implementation for User Story 3

- [ ] T040 [US3] Create verification checklist document at `/Users/josephcrawford/Projects/site/scripts/VERIFICATION_CHECKLIST.md` with criteria: dev server runs, build succeeds, 26 pages generated, URLs unchanged, visual comparison
- [ ] T041 [US3] Run `gatsby develop` and confirm development server starts without errors - document result in VERIFICATION_CHECKLIST.md
- [ ] T042 [US3] Run `gatsby build` and confirm production build completes with zero GraphQL errors - document result in VERIFICATION_CHECKLIST.md
- [ ] T043 [US3] Verify page count: check build output shows exactly 26 pages (20 articles + 5 categories + 1 author) - document result in VERIFICATION_CHECKLIST.md
- [ ] T044 [US3] Verify all article URLs unchanged: manually check 5 sample articles have same URLs as pre-migration (/articles/[slug]) - document result in VERIFICATION_CHECKLIST.md
- [ ] T045 [US3] Take "before" screenshots: capture 5 sample articles (one from each category) from production site BEFORE query updates
- [ ] T046 [US3] Take "after" screenshots: capture same 5 articles from local development site AFTER Markdown migration
- [ ] T047 [US3] Perform visual comparison: side-by-side compare 5 before/after screenshot pairs to verify identical rendering (title, excerpt, content, images, formatting) - document result in VERIFICATION_CHECKLIST.md
- [ ] T048 [US3] Verify category relationships: check 3 sample articles have correct category associations in rendered pages - document result in VERIFICATION_CHECKLIST.md
- [ ] T049 [US3] Verify tag relationships: check 3 sample articles display correct tags on article pages - document result in VERIFICATION_CHECKLIST.md
- [ ] T050 [US3] Verify date preservation: check 3 sample articles show correct publishedAt dates matching JSON originals - document result in VERIFICATION_CHECKLIST.md
- [ ] T051 [US3] Verify featured images: check 3 sample articles display correct featured images without broken links - document result in VERIFICATION_CHECKLIST.md
- [ ] T052 [US3] Verify search index: perform 3 sample searches to confirm all 20 articles appear in search results - document result in VERIFICATION_CHECKLIST.md
- [ ] T053 [US3] Verify build time: confirm `gatsby build` completes in under 10 seconds (SC-004 requirement) - document result in VERIFICATION_CHECKLIST.md
- [ ] T054 [US3] Review VERIFICATION_CHECKLIST.md to confirm all criteria pass (12 checks) before proceeding to cleanup phase

**Checkpoint**: All validation criteria pass, zero data loss confirmed, site functionality identical to pre-migration, safe to remove JSON files

---

## Phase 5: User Story 4 - Content Authoring Workflow (Priority: P2)

**Goal**: Validate that new articles can be created in Markdown format and that hot-reload works correctly for content authoring

**Independent Test**: Create a new article in Markdown format, build the site, verify it appears alongside existing articles with full functionality

### Implementation for User Story 4

- [ ] T055 [US4] Create test article file `/Users/josephcrawford/Projects/site/content/posts/test-markdown-workflow.md` with complete frontmatter and sample content per quickstart.md guidelines
- [ ] T056 [US4] With `gatsby develop` running, verify hot-reload detects new Markdown file and rebuilds within 5 seconds (SC-007 requirement)
- [ ] T057 [US4] Navigate to test article page (http://localhost:8000/articles/test-markdown-workflow) and verify it renders correctly
- [ ] T058 [US4] Edit test article content and save, verify hot-reload updates page without full restart
- [ ] T059 [US4] Test frontmatter validation: create invalid article with missing required field, verify Gatsby build shows clear error message
- [ ] T060 [US4] Test frontmatter validation: create invalid article with malformed YAML syntax, verify Gatsby build shows clear error message indicating line number
- [ ] T061 [US4] View test article in Git diff and verify Markdown is human-readable (SC-008 requirement)
- [ ] T062 [US4] Delete test article file `/Users/josephcrawford/Projects/site/content/posts/test-markdown-workflow.md` after validation complete

**Checkpoint**: New Markdown articles work correctly, hot-reload functions, error messages are clear, content is human-readable in version control

---

## Phase 6: Cleanup & Finalization

**Purpose**: Remove JSON files and complete migration by switching to Markdown-only mode

- [ ] T063 Backup JSON files: create `/Users/josephcrawford/Projects/site/src/data/articles.backup/` and copy all 20 JSON files for safety (optional, can use Git history)
- [ ] T064 Delete JSON article files: remove all 20 files from `/Users/josephcrawford/Projects/site/src/data/articles/` directory
- [ ] T065 Update `/Users/josephcrawford/Projects/site/gatsby-config.ts` to remove gatsby-transformer-json plugin configuration
- [ ] T066 Update `/Users/josephcrawford/Projects/site/gatsby-config.ts` to remove gatsby-source-filesystem configuration for `src/data/articles` directory
- [ ] T067 Run `gatsby clean` to clear cache
- [ ] T068 Run `gatsby build` to verify production build succeeds with Markdown-only configuration
- [ ] T069 Run `gatsby develop` to verify development server works with Markdown-only configuration
- [ ] T070 [P] Update `/Users/josephcrawford/Projects/site/README.md` to document new Markdown-based content workflow, reference quickstart.md
- [ ] T071 [P] Commit migration script to repository at `/Users/josephcrawford/Projects/site/scripts/migrate-to-markdown.ts` for reproducibility and documentation
- [ ] T072 [P] Archive design artifacts: move `/Users/josephcrawford/Projects/site/specs/002-markdown-articles/` to permanent documentation location

**Checkpoint**: Migration complete, JSON files removed, site runs on Markdown-only, documentation updated

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T073 [P] Run full site build (`gatsby build`) and verify zero warnings or errors
- [ ] T074 [P] Test site in production mode (`gatsby serve`) and manually validate all key pages
- [ ] T075 [P] Verify SEO: check 3 sample article pages have correct meta tags (title, description, og:image from frontmatter)
- [ ] T076 [P] Performance test: verify homepage loads in under 2 seconds, article pages load in under 1 second
- [ ] T077 Review quickstart.md guide and ensure all instructions are accurate and complete
- [ ] T078 Final code review: ensure TypeScript strict mode compliance, no `any` types used (P2: Strict Type Safety)
- [ ] T079 Final code review: verify minimal code comments, no FR-XXX identifiers (P11: Minimal Code Comments)
- [ ] T080 Create deployment notes document at `/Users/josephcrawford/Projects/site/DEPLOYMENT.md` with migration summary and rollback instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - File conversion must happen first
- **User Story 2 (Phase 3)**: Depends on US1 completion - Cannot update queries until Markdown files exist
- **User Story 3 (Phase 4)**: Depends on US2 completion - Cannot validate until queries are updated
- **User Story 4 (Phase 5)**: Depends on US3 completion - Authoring workflow testing after migration validated
- **Cleanup (Phase 6)**: Depends on US3 completion - Cannot delete JSON until validation passes
- **Polish (Phase 7)**: Depends on Cleanup completion - Final touches after migration complete

### Critical Path (Must be Sequential)

1. **Setup → US1 → US2 → US3** - MUST be sequential (each depends on previous)
2. US3 must pass all validation before proceeding to US4 or Cleanup
3. Cleanup must complete before Polish

### Within Each User Story

**User Story 1 (Migration Script)**:
- T007-T015 can be developed incrementally
- T016 (dry-run) must complete before T017 (real run)
- T017 (real run) must complete before T018-T020 (verification)

**User Story 2 (Query Updates)**:
- T021-T024 (page queries) can run in parallel [P]
- T026-T029 (TypeScript interfaces) can run in parallel [P] after queries updated
- T030-T032 (component updates) can run in parallel [P] after interfaces updated
- T033-T039 (testing) must be sequential after all updates

**User Story 3 (Validation)**:
- T040-T044 (automated checks) are sequential
- T045-T046 (screenshots) can overlap with automated checks
- T047-T053 (comparisons) must follow screenshots
- T054 (final review) must be last

**User Story 4 (Authoring)**:
- T055-T062 are sequential testing steps

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002 (install gatsby-remark-images) can run in parallel with T001
- T006 (create scripts/ directory) can run in parallel with T001-T005

**Within User Story 2 (Phase 3)**:
- All query updates (T021-T024) can run in parallel - different files
- All TypeScript interface updates (T026-T029) can run in parallel - different files
- Component updates (T030-T032) can run in parallel - different files

**Within Polish (Phase 7)**:
- T073-T076 can all run in parallel - independent validation tasks

---

## Parallel Example: User Story 2 (Query Updates)

```bash
# Launch all GraphQL query updates together:
Task T021: "Update GraphQL query in src/pages/index.tsx"
Task T022: "Update GraphQL query in src/templates/article.tsx"
Task T023: "Update GraphQL query in src/templates/category.tsx"
Task T024: "Update GraphQL query in src/templates/author.tsx"

# Then launch all TypeScript interface updates together:
Task T026: "Update TypeScript interface in src/pages/index.tsx"
Task T027: "Update TypeScript interface in src/templates/article.tsx"
Task T028: "Update TypeScript interface in src/templates/category.tsx"
Task T029: "Update TypeScript interface in src/templates/author.tsx"

# Then launch all component updates together:
Task T030: "Update component in src/components/ArticleCard.tsx"
Task T031: "Update component in src/components/FeaturedSlider.tsx"
Task T032: "Update search indexing in src/utils/searchIndex.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

**Minimum Viable Migration**:
1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: User Story 1 - File Migration (T007-T020)
3. Complete Phase 3: User Story 2 - Query Updates (T021-T039)
4. Complete Phase 4: User Story 3 - Validation (T040-T054)
5. **STOP and VALIDATE**: Ensure all 12 validation criteria pass
6. Deploy if validation passes

**Why this is MVP**: These three user stories constitute a complete, safe migration with full validation. User Story 4 (authoring workflow) is tested implicitly and can be validated later.

### Incremental Delivery

**Phase 1: Foundation (Day 1)**
- Setup (T001-T006) → Dependencies installed, structure ready

**Phase 2: Core Migration (Day 2)**
- US1: File Migration (T007-T020) → All articles exist as Markdown

**Phase 3: System Update (Day 3)**
- US2: Query Updates (T021-T039) → Site reads from Markdown

**Phase 4: Validation (Day 4)**
- US3: Validation (T040-T054) → Zero data loss confirmed

**Phase 5: Finalization (Day 5)**
- US4: Authoring (T055-T062) → New workflow validated
- Cleanup (T063-T072) → JSON files removed
- Polish (T073-T080) → Production ready

### Rollback Strategy

At any point, if issues are discovered:

**Before Cleanup (Phase 6)**:
- JSON files still exist in src/data/articles/
- Simply revert GraphQL query changes (Git)
- Switch gatsby-config.ts back to JSON-only
- Original system intact, zero risk

**After Cleanup (Phase 6)**:
- Use Git history to restore JSON files
- Revert gatsby-config.ts changes
- Revert query updates
- Migration script is idempotent, can re-run

### Risk Mitigation

**Critical Checkpoints**:
1. After T020: Verify all 20 Markdown files created before proceeding
2. After T034: Verify development server starts without errors before manual testing
3. After T054: Verify ALL validation criteria pass before cleanup
4. After T068: Verify production build works before finalizing

**Safety Measures**:
- Dual-format support during validation (both transformers active)
- Migration script has abort-and-rollback logic
- Original JSON files preserved until validation complete
- Git history provides ultimate rollback

---

## Task Summary

**Total Tasks**: 80

**By Phase**:
- Setup: 6 tasks
- User Story 1 (Migration): 14 tasks
- User Story 2 (Queries): 19 tasks
- User Story 3 (Validation): 15 tasks
- User Story 4 (Authoring): 8 tasks
- Cleanup: 10 tasks
- Polish: 8 tasks

**By Type**:
- Implementation: 52 tasks
- Verification/Testing: 28 tasks
- Documentation: 0 tasks (manual testing, no automated tests)

**Parallel Opportunities**: 15 tasks marked [P]

**Story Dependencies**:
- US1 → US2 → US3 (strict sequence, each depends on previous)
- US4 can start after US3 validation passes
- Cleanup waits for US3 validation
- Polish waits for Cleanup

**Estimated Timeline**:
- Sequential execution: 5-6 days
- With parallelization: 4-5 days
- MVP only (US1-US3): 3-4 days

---

## Notes

- [P] tasks = different files, no dependencies within story
- [US#] label maps task to specific user story for traceability
- Each user story has clear checkpoint for independent validation
- No automated tests per project constitution (P10: No Unit Testing Required)
- Manual validation throughout (screenshots, visual comparison, manual testing)
- Migration is reversible until Cleanup phase (Phase 6)
- All file paths are absolute for clarity
- TypeScript strict mode enforced (P2: Strict Type Safety)
- Minimal code comments (P11: Minimal Code Comments)

