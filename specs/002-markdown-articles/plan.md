# Implementation Plan: Convert Article Data from JSON to Markdown with Frontmatter

**Branch**: `002-markdown-articles` | **Date**: 2025-01-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-markdown-articles/spec.md`

## Summary

This feature converts all 20 existing JSON article files to Markdown files with YAML frontmatter, aligning the project with Gatsby best practices for content management. The migration includes updating Gatsby configuration to use `gatsby-transformer-remark`, refactoring all GraphQL queries from `allArticlesJson` to `allMarkdownRemark`, and validating 100% data preservation. The approach ensures zero downtime during migration by supporting both formats temporarily, followed by comprehensive validation before removing JSON files.

## Technical Context

**Language/Version**: TypeScript 5.3.3, React 18.3.0, Gatsby 5.13.0  
**Primary Dependencies**: `gatsby-transformer-remark` (for Markdown), `gray-matter` (for frontmatter parsing), `remark` and `remark-html` (for Markdown to HTML conversion), `dayjs` (for date handling - already installed)  
**Storage**: File system - Markdown files in `content/posts/` directory (Gatsby convention)  
**Testing**: Manual testing - verify all pages render correctly, no GraphQL errors, search functionality works  
**Target Platform**: Static site - built to HTML/CSS/JS, deployed to GitHub Pages  
**Project Type**: Web application (Gatsby static site generator)  
**Performance Goals**: Build time remains under 10 seconds, no regression in page load times  
**Constraints**: Zero data loss during migration, all URLs must remain unchanged (SEO preservation), backward compatibility during migration phase  
**Scale/Scope**: 20 articles, 5 categories, 1 author, ~30 total pages generated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ P1: TypeScript-First Development
**Status**: PASS - All migration scripts and updated components will use TypeScript

### ✅ P2: Strict Type Safety
**Status**: PASS - Will define proper TypeScript interfaces for MarkdownRemark query structure, no `any` types

### ✅ P3: Best Practices Compliance
**Status**: PASS - Using `gatsby-transformer-remark` is the official Gatsby best practice for Markdown content, aligns with Gatsby documentation

### ✅ P4: Latest Dependency Versions
**Status**: PASS - Will use latest stable versions of gatsby-transformer-remark and related plugins

### ✅ P5: Theme-Based Architecture
**Status**: PASS - Migration is content-only, UI components and theme remain unchanged

### ✅ P6: No Utility Libraries
**Status**: PASS - Will use native JavaScript methods for file operations and data transformation

### ✅ P7: Date Handling with dayjs
**Status**: PASS - Existing date utilities using dayjs remain unchanged

### ✅ P8: Native Fetch for HTTP Requests
**Status**: N/A - No HTTP requests involved in this migration

### ✅ P9: Static Site Generation
**Status**: PASS - Maintains static site generation, Markdown is processed at build time

### ✅ P10: No Unit Testing Required
**Status**: PASS - Will use manual testing to verify migration success

### ✅ P11: Minimal Code Comments
**Status**: PASS - Migration script will have minimal comments, no FR-XXX identifiers in code

**Overall Gate Status**: ✅ PASS - All applicable principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/002-markdown-articles/
├── plan.md              # This file
├── research.md          # Technical decisions and approach
├── data-model.md        # Markdown file structure and frontmatter schema
├── quickstart.md        # Guide for creating new Markdown articles
├── contracts/
│   └── markdown-schema.md   # Frontmatter field definitions
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
# Current structure (JSON-based)
src/
├── data/
│   ├── articles/           # 20 JSON files (to be migrated)
│   ├── categories.json     # Remains unchanged
│   └── authors.json        # Remains unchanged
├── components/
│   ├── ArticleCard.tsx     # Update for MarkdownRemark
│   ├── FeaturedSlider.tsx  # Update for MarkdownRemark
│   ├── Header.tsx          # No changes
│   ├── Footer.tsx          # No changes
│   └── ...
├── templates/
│   ├── article.tsx         # Update GraphQL query
│   ├── category.tsx        # Update GraphQL query
│   └── author.tsx          # Update GraphQL query
├── pages/
│   └── index.tsx           # Update GraphQL query
└── utils/
    ├── dateUtils.ts        # No changes
    └── searchIndex.ts      # Update to read from MarkdownRemark

# New structure (Markdown-based)
content/
└── posts/                  # NEW: 20 Markdown files
    ├── the-journey-not-the-arrival-matters.md
    ├── fashion-fades-only-style-remains.md
    └── ...

scripts/
└── migrate-to-markdown.ts  # NEW: Migration script

gatsby-config.ts            # UPDATE: Add gatsby-transformer-remark
gatsby-node.ts              # UPDATE: Query MarkdownRemark for page creation
```

**Structure Decision**: Adding a new `content/posts/` directory for Markdown articles following Gatsby conventions. Migration script will be temporary (in `scripts/`) and can be removed after successful migration. The `src/data/articles/` directory will be removed once validation is complete.

## Complexity Tracking

> No violations - this section is not needed.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **R1: Gatsby Markdown Transformer Configuration**
   - Question: What is the optimal configuration for gatsby-transformer-remark for a blog?
   - Required plugins: gatsby-transformer-remark, gatsby-remark-images (for image optimization in Markdown)
   - Configuration: Path mappings, excerpt generation, HTML parsing options

2. **R2: Frontmatter Schema Design**
   - Question: What is the standard YAML frontmatter structure for blog posts?
   - Fields: Map all JSON fields to frontmatter fields
   - Dates: ISO 8601 format for publishedAt/updatedAt
   - Arrays: YAML array syntax for tags

3. **R3: GraphQL Query Migration Pattern**
   - Question: How do MarkdownRemark queries differ from JSON transformer queries?
   - Node access: `allMarkdownRemark.nodes` vs `allArticlesJson.nodes`
   - Field access: `frontmatter.title` vs `title`
   - HTML content: `html` vs `content` field

4. **R4: Migration Script Approach**
   - Question: What's the safest way to migrate 20 files with validation?
   - Approach: TypeScript script that reads JSON, converts to Markdown with frontmatter, writes files
   - Validation: Generate checksums, compare field counts, dry-run mode

5. **R5: Backward Compatibility Strategy**
   - Question: How to support both formats during migration?
   - Approach: Keep both transformers active temporarily
   - Validation period: Build and test with Markdown before removing JSON
   - Rollback: Git branch allows easy revert if issues found

### Research Output → research.md

*To be generated in next step*

---

## Phase 1: Design Artifacts

### Phase 1.1: Data Model

**Output**: `data-model.md`

**Content**:
- Markdown file structure (frontmatter + content sections)
- YAML frontmatter schema with field types and validation rules
- Mapping from JSON fields to frontmatter fields
- Example Markdown file with complete frontmatter

### Phase 1.2: Contracts

**Output**: `contracts/markdown-schema.md`

**Content**:
- Frontmatter field definitions (name, type, required/optional, description)
- Content body format and conventions
- File naming convention (slug.md)
- Validation rules for each field

### Phase 1.3: Quick Start Guide

**Output**: `quickstart.md`

**Content**:
- How to create a new article in Markdown format
- Frontmatter template with all fields
- Image path conventions
- Local development workflow (gatsby develop)
- Validation checklist before committing

---

## Phase 2: Task Planning

*Phase 2 is handled by `/speckit.tasks` command - not generated by this plan*

**Inputs for task generation**:
- All Phase 0-1 artifacts above
- Constitution constraints
- Feature spec requirements and user stories

**Expected task categories**:
1. Setup tasks (install plugins, configure Gatsby)
2. Migration script development
3. File conversion and validation
4. GraphQL query updates across all templates/pages
5. TypeScript interface updates
6. Search index updates
7. Testing and validation
8. Cleanup (remove JSON files, remove temporary scripts)

---

## Dependencies

**External**:
- `gatsby-transformer-remark@^6.13.0` - Markdown transformer
- `gatsby-remark-images@^7.13.0` - Image optimization in Markdown (optional but recommended)

**Internal**:
- Existing Gatsby configuration and build pipeline
- Existing GraphQL schema and queries (will be modified)
- Existing TypeScript types (will be extended)

**Blockers**:
- None - all dependencies are well-established Gatsby plugins

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Migration script with dry-run mode, validation checksums, Git branch for rollback |
| GraphQL query errors | MEDIUM | Comprehensive TypeScript types, test all pages manually, keep JSON format temporarily |
| URL structure changes breaking SEO | HIGH | Maintain identical slug-based routing, validate all URLs before/after |
| Image paths breaking | MEDIUM | Test image loading on all pages, use relative paths in frontmatter |
| Build time regression | LOW | Benchmark build times before/after, optimize remark configuration if needed |

---

## Success Validation

Before removing JSON files, verify:

1. ✅ All 20 Markdown files created with complete frontmatter
2. ✅ `gatsby develop` runs without GraphQL errors
3. ✅ All 20 article pages render with identical content
4. ✅ Category pages show correct articles
5. ✅ Author page shows all articles
6. ✅ Homepage featured slider works
7. ✅ Search returns all articles
8. ✅ Build time is under 10 seconds
9. ✅ All image paths resolve correctly
10. ✅ No console errors or warnings

---

## Next Steps

1. Execute Phase 0: Generate `research.md` with technical decisions
2. Execute Phase 1: Generate data model, contracts, and quickstart guide
3. Run `/speckit.tasks` to generate detailed implementation tasks
4. Begin implementation following task sequence
