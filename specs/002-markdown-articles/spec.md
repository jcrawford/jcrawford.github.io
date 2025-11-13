# Feature Specification: Convert Article Data from JSON to Markdown with Frontmatter

**Feature Branch**: `002-markdown-articles`  
**Created**: 2025-01-07  
**Last Updated**: 2025-01-10  
**Status**: Implemented  
**Input**: User description: "convert article data from json to markdown with frontmatter"

## Implementation Summary

Successfully migrated all 20 JSON articles to Markdown with YAML frontmatter. All Gatsby templates, queries, and components updated to use `allMarkdownRemark` and `markdownRemark` instead of JSON sources. Site functionality fully preserved with zero data loss.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Data Format Migration (Priority: P1)

As a developer, I need to convert all existing JSON article files to Markdown files with YAML frontmatter so that the site follows Gatsby best practices and enables better content authoring workflows.

**Why this priority**: This is the core migration task that enables all other benefits of Markdown-based content, including better version control, easier content editing, and alignment with Gatsby ecosystem best practices.

**Independent Test**: Can be fully tested by verifying that all 20 existing JSON articles are converted to Markdown files with correct frontmatter and content, and that the Gatsby build completes successfully with no data loss.

**Acceptance Scenarios**:

1. **Given** 20 existing JSON article files in `src/data/articles/`, **When** the conversion is complete, **Then** 20 corresponding Markdown files exist with identical data
2. **Given** a JSON article with all fields (title, excerpt, content, featuredImage, category, tags, author, publishedAt, updatedAt), **When** converted to Markdown, **Then** metadata is in YAML frontmatter and content is in Markdown body
3. **Given** converted Markdown articles, **When** Gatsby build runs, **Then** all 20 article pages are generated successfully
4. **Given** converted Markdown articles, **When** viewing article pages, **Then** all content displays identically to the JSON version

---

### User Story 2 - Gatsby Configuration Update (Priority: P1)

As a developer, I need the Gatsby configuration and queries updated to source data from Markdown files instead of JSON so that the site continues to function after the data format migration.

**Why this priority**: Without this update, the site will break after removing JSON files. This must be completed as part of the P1 migration to maintain site functionality.

**Independent Test**: Can be fully tested by running `gatsby develop` and verifying that GraphQL queries return article data from Markdown files, and that all pages (homepage, article pages, category pages, author pages) render correctly.

**Acceptance Scenarios**:

1. **Given** Markdown article files, **When** Gatsby build runs, **Then** GraphQL schema includes `allMarkdownRemark` nodes with all required fields
2. **Given** updated GraphQL queries in templates, **When** querying article data, **Then** all frontmatter fields (title, excerpt, featuredImage, category, tags, author, dates) are accessible
3. **Given** Markdown content body, **When** querying article data, **Then** HTML content is generated from Markdown
4. **Given** all templates and components updated, **When** site is built, **Then** zero GraphQL errors occur

---

### User Story 3 - Content Preservation Validation (Priority: P1)

As a site owner, I need to verify that all article content, metadata, and relationships are preserved exactly during the migration so that no information is lost.

**Why this priority**: Data loss during migration is unacceptable. This validation ensures the migration is safe and complete before removing old JSON files.

**Independent Test**: Can be fully tested by comparing rendered output of 5 sample articles (before/after screenshots), verifying category/tag associations, and checking that search index includes all articles.

**Acceptance Scenarios**:

1. **Given** an original JSON article, **When** compared with its Markdown equivalent, **Then** all fields match exactly (title, excerpt, content, metadata)
2. **Given** category/tag relationships in JSON, **When** migrated to Markdown, **Then** all category and tag associations are preserved
3. **Given** article dates in JSON, **When** migrated to Markdown, **Then** publishedAt and updatedAt dates are identical
4. **Given** featured image paths in JSON, **When** migrated to Markdown, **Then** image paths work and images display correctly
5. **Given** completed migration, **When** running verification checklist, **Then** all automated checks pass (dev server runs, build succeeds with zero GraphQL errors, 26 pages generated, URLs unchanged) AND manual visual comparison of 5 sample articles shows identical rendering

---

### User Story 4 - Content Authoring Workflow (Priority: P2)

As a content author, I want to create and edit articles in Markdown format so that I can use familiar text editing tools and see human-readable content in version control.

**Why this priority**: While important for future content management, this doesn't affect existing content and can be tested after migration is complete.

**Independent Test**: Can be fully tested by creating a new article in Markdown format, building the site, and verifying it appears alongside existing articles with full functionality.

**Acceptance Scenarios**:

1. **Given** a new Markdown article file with frontmatter, **When** added to the content directory, **Then** Gatsby automatically detects and builds the article page
2. **Given** a Markdown article being edited, **When** saved, **Then** hot-reload updates the page in development mode
3. **Given** content in Markdown format, **When** viewed in a text editor or Git diff, **Then** changes are human-readable
4. **Given** article frontmatter, **When** validating format, **Then** clear error messages indicate any missing or invalid fields

---

## Clarifications

### Session 2025-01-07

- Q: How should the migration script handle HTML content in existing JSON articles? → A: Convert simple HTML tags to Markdown, keep complex HTML inline (Markdown supports HTML)
- Q: If the migration script encounters an error during conversion, what should happen? → A: Abort entire migration, rollback any created files, log error details
- Q: During the validation phase when both JSON and Markdown files exist, which format should Gatsby use? → A: Prioritize Markdown - use Markdown if exists, fall back to JSON only if Markdown missing
- Q: What specific checks must pass before JSON files can be safely deleted? → A: All automated checks pass (build succeeds, zero GraphQL errors, file count matches, URLs unchanged) + manual visual comparison of 5 sample articles
- Q: When should GraphQL queries be updated from JSON to Markdown format? → A: After migration - convert all files first, then update all queries at once, validate with Markdown format

---

### Edge Cases

- Article content with HTML: Simple HTML tags (p, strong, em, a, ul, ol, li, blockquote, h1-h6) will be converted to Markdown equivalents. Complex HTML (tables, nested structures, custom attributes) will be preserved as inline HTML within the Markdown file, ensuring zero data loss.
- How does the system handle articles with empty or missing fields (e.g., no excerpt, no tags)? Migration script will validate all required fields exist before conversion and abort if any are missing.
- Migration failure scenarios: Script failure during conversion triggers complete rollback (delete all created Markdown files), logs error details (file path, field name, error message), exits with non-zero status code. Original JSON files remain untouched.
- What happens if an article slug conflicts with existing file system names?
- How are article images referenced if paths change during migration?
- Dual-format handling during validation: When both JSON and Markdown exist for the same article (matching slug), Gatsby will prioritize the Markdown version via gatsby-transformer-remark. JSON version is ignored for that article. This allows testing Markdown format while keeping JSON as a rollback safety net.
- Migration verification process: Before deleting JSON files, automated checks verify: development server starts successfully, production build completes without GraphQL errors, page count equals 26 (20 articles + 5 categories + 1 author), all article URLs match pre-migration URLs. Additionally, 5 representative articles (one from each category) are manually compared via screenshots to confirm identical visual rendering.
- How does the system handle very long article content or content with unusual formatting? Standard Markdown rendering applies with no length limits. Unusual formatting (excessive nesting, custom styles) may require inline HTML preservation as specified in HTML conversion strategy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST convert all 20 existing JSON articles to Markdown files with YAML frontmatter without data loss
- **FR-002**: System MUST preserve all article metadata fields (title, excerpt, featuredImage, category, tags, author, publishedAt, updatedAt) in frontmatter
- **FR-003**: System MUST convert article content to Markdown format: simple HTML tags (p, strong, em, a, ul, ol, li, blockquote, headings) converted to Markdown syntax; complex HTML (tables, nested structures) preserved inline; plain text passed through unchanged
- **FR-004**: System MUST use file slugs as article identifiers (e.g., `the-journey-not-the-arrival-matters.md`)
- **FR-005**: System MUST update Gatsby configuration to use `gatsby-transformer-remark` instead of `gatsby-transformer-json`
- **FR-006**: System MUST update all GraphQL queries from `allArticlesJson` to `allMarkdownRemark` with field mapping after file conversion is complete; queries are updated as a single atomic step before validation phase begins
- **FR-007**: System MUST maintain backward compatibility during migration with Markdown-first priority: gatsby-transformer-remark processes Markdown files; gatsby-transformer-json only processes articles without corresponding Markdown files; both transformers remain active until validation is complete
- **FR-008**: System MUST validate converted Markdown files for correct YAML frontmatter syntax
- **FR-009**: System MUST ensure all article URLs/paths remain unchanged after migration
- **FR-010**: System MUST update search indexing to read from Markdown instead of JSON
- **FR-011**: System MUST store Markdown articles in a content directory following Gatsby conventions (e.g., `content/posts/`)
- **FR-012**: System MUST handle special characters and HTML entities correctly in Markdown conversion
- **FR-013**: System MUST preserve article ordering by date after migration
- **FR-014**: System MUST update TypeScript types/interfaces to reflect MarkdownRemark query structure
- **FR-015**: System MUST remove JSON article files only after migration verification passes all criteria: (1) gatsby develop runs without errors, (2) gatsby build completes with zero GraphQL errors, (3) exactly 26 pages generated (20 articles + 5 categories + 1 author), (4) all article URLs remain unchanged from pre-migration, (5) manual visual comparison confirms 5 sample articles render identically to pre-migration screenshots
- **FR-016**: Migration script MUST abort entire process on any error (invalid data, file system failure, validation failure), rollback all created Markdown files, and log detailed error information for troubleshooting
- **FR-017**: System MUST provide a verification checklist documenting each validation criterion's pass/fail status before JSON file deletion is authorized

### Key Entities

- **Article (Markdown)**: Represents a blog post in Markdown format with YAML frontmatter containing metadata (slug, title, excerpt, featuredImage, category, tags, author, publishedAt, updatedAt) and Markdown body containing the article content
- **Frontmatter**: YAML metadata block at the top of each Markdown file, containing all structured data previously stored in JSON fields
- **Content Directory**: File system location for Markdown articles, following Gatsby conventions (e.g., `content/posts/[slug].md`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 20 existing articles are converted to Markdown format with zero data loss (100% field preservation)
- **SC-002**: Gatsby build completes successfully with zero GraphQL errors after migration
- **SC-003**: All article pages (20), category pages (5), and author page (1) render identically before and after migration
- **SC-004**: Site build time remains under 10 seconds (no performance regression from Markdown processing)
- **SC-005**: All article URLs and routes remain unchanged (no broken links or SEO impact)
- **SC-006**: Search functionality returns identical results for the same queries before and after migration
- **SC-007**: New articles can be created in Markdown format and appear on the site within 5 seconds of saving (development mode)
- **SC-008**: Content authors can read and understand article content in version control without needing special tools

## Assumptions

- Article content is currently stored as HTML or plain text that can be converted to Markdown
- No custom Markdown plugins or syntax extensions are required initially
- Featured image paths in frontmatter will continue to work with existing image optimization setup
- Category and tag data (categories.json, tags if exists) will remain in JSON format
- Author data (authors.json) will remain in JSON format for now
- The site uses a single content language (no i18n complications)
- Gatsby's `gatsby-transformer-remark` plugin will be used for Markdown processing
- Article slugs are unique and safe for use as filenames
- Migration follows three-phase sequence: (1) File conversion - create all Markdown files, (2) Query update - refactor all GraphQL queries to use MarkdownRemark, (3) Validation - verify system works correctly, then delete JSON files

## Dependencies

- Gatsby must support `gatsby-transformer-remark` plugin
- Existing GraphQL queries must be refactored to work with MarkdownRemark nodes
- TypeScript interfaces must be updated to reflect new query structure
- Build pipeline must successfully parse YAML frontmatter
- No breaking changes in Gatsby's Markdown transformer between current and target version

## Scope

### In Scope

- Converting 20 existing JSON articles to Markdown with frontmatter
- Updating Gatsby configuration to use Markdown transformer
- Refactoring all GraphQL queries to use MarkdownRemark
- Updating TypeScript types for new data structure
- Validating data preservation and correctness
- Updating documentation with new content authoring guidelines
- Creating a migration script for reproducibility

### Out of Scope

- Converting category or author data to Markdown (remains JSON)
- Implementing Markdown preview in a CMS interface
- Adding advanced Markdown features (MDX, custom components)
- Migrating images to a co-located structure (images remain in static folder)
- Implementing content versioning or revision history
- Creating a UI for non-technical content editing
- Automated content migration from external sources

## Non-Functional Considerations

- **Performance**: Markdown processing should not significantly increase build time
- **Maintainability**: Markdown files should be easily editable by humans without special tools
- **Version Control**: Markdown diffs should be readable and meaningful in Git
- **Error Handling**: Clear error messages for malformed frontmatter or Markdown syntax
- **Documentation**: Comprehensive guide for creating new articles in Markdown format
