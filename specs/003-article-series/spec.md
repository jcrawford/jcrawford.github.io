# Feature Specification: Article Series Navigation

**Feature Branch**: `003-article-series`  
**Created**: 2025-11-13  
**Last Updated**: 2025-11-13  
**Status**: In Specification  
**Input**: User description: "Article Series - Next we will work on a feature that will allow an article to be part of a series. If the article is part of a series when we are on the article view page we will need a sidebar section that will have a header that states 'This article is part of a series called [SERIES_NAME]' and this should link to the first article in the series when clicked. When scrolling the article page when this sidebar element reaches the top of the screen it should stick in place allowing you to scroll the page while the sidebar remains in place."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Series Metadata Declaration (Priority: P1)

As a content author, I need to add series metadata to article frontmatter so that multi-part articles can be grouped together and presented with navigation.

**Why this priority**: Without series metadata, the feature cannot function. This is the foundational requirement that enables all other series functionality.

**Independent Test**: Can be fully tested by adding series metadata to a sample article's frontmatter, building the site, and verifying that the article is recognized as part of a series with no build errors.

**Acceptance Scenarios**:

1. **Given** an article without series metadata, **When** viewing the article page, **Then** no series navigation is displayed
2. **Given** an article with series metadata including name and navigation links, **When** the article is built, **Then** the series data is accessible in the article template
3. **Given** series metadata with optional references and attachments, **When** parsing frontmatter, **Then** all fields are correctly extracted and available for display
4. **Given** invalid series metadata (malformed YAML), **When** building the site, **Then** a clear error message indicates the validation issue and which article has the problem

---

### User Story 2 - Series Table of Contents Display (Priority: P1)

As a reader, I want to see a table of contents showing all articles in the current series so that I can understand the series structure and navigate to other parts.

**Why this priority**: This is the core value proposition of the series feature - helping readers understand multi-part content and navigate between articles.

**Independent Test**: Can be fully tested by creating a 3-article series, viewing the middle article, and verifying that all three articles appear in the table of contents with the current article clearly distinguished from linked articles.

**Acceptance Scenarios**:

1. **Given** an article that is part of a series, **When** viewing the article page, **Then** a sidebar widget displays with the series name prominently shown
2. **Given** a series with 5 articles, **When** viewing any article in the series, **Then** all 5 articles are listed in order with their titles
3. **Given** the current article in the series, **When** viewing the table of contents, **Then** the current article's title appears without a link (non-clickable)
4. **Given** other articles in the series, **When** viewing the table of contents, **Then** each article title is a clickable link to that article
5. **Given** articles numbered in sequence, **When** viewing the table of contents, **Then** each article is prefixed with its position number (1., 2., 3., etc.)

---

### User Story 3 - Sticky Sidebar Behavior (Priority: P1)

As a reader on desktop, I want the series navigation to stick to the top of the viewport when scrolling so that I can access series navigation at any point while reading a long article.

**Why this priority**: This significantly improves user experience by keeping navigation accessible during reading, which is essential for multi-part technical articles on desktop devices.

**Independent Test**: Can be fully tested by viewing a series article with long content on desktop (≥ 768px viewport), scrolling down 500px, and verifying that the series widget remains visible at the top of the viewport.

**Acceptance Scenarios**:

1. **Given** a series article page on desktop with content longer than the viewport, **When** the page first loads, **Then** the series widget appears in its normal sidebar position
2. **Given** the series widget is visible on desktop, **When** the user scrolls down until the widget reaches the top of the viewport, **Then** the widget becomes fixed and stops scrolling with the page
3. **Given** a fixed series widget on desktop, **When** the user continues scrolling down, **Then** the widget remains visible at the top of the viewport
4. **Given** a fixed series widget on desktop, **When** the user scrolls back up, **Then** the widget returns to its normal sidebar position when appropriate
5. **Given** a desktop viewport too small to show the entire series widget, **When** sticky behavior is active, **Then** the widget becomes scrollable independently without breaking the page layout
6. **Given** a series article page on mobile (< 768px viewport), **When** viewing the page, **Then** the series widget appears below article content without sticky behavior

---

### User Story 4 - Series References Display (Priority: P2)

As a reader, I want to see a list of external references related to the series so that I can access additional resources and source materials.

**Why this priority**: While valuable for comprehensive series, this is supplementary information that doesn't affect core navigation functionality.

**Independent Test**: Can be fully tested by adding references metadata to a series article, viewing the page, and verifying that references appear below the table of contents with proper numbering and links.

**Acceptance Scenarios**:

1. **Given** a series article with references in metadata, **When** viewing the article page, **Then** a "References" section appears below the table of contents
2. **Given** multiple references, **When** viewing the references section, **Then** each reference is numbered (1., 2., 3., etc.)
3. **Given** a reference URL, **When** clicking on a reference link, **Then** it opens in a new tab to avoid losing reading position
4. **Given** a series article without references, **When** viewing the article page, **Then** no references section is displayed

---

### User Story 5 - Series Attachments Display (Priority: P2)

As a reader, I want to download supplementary files related to the series so that I can access code samples, datasets, or other materials mentioned in the articles.

**Why this priority**: Similar to references, this provides additional value but is not essential for basic series navigation.

**Independent Test**: Can be fully tested by adding attachments metadata to a series article, viewing the page, and verifying that attachments appear with download links and proper numbering.

**Acceptance Scenarios**:

1. **Given** a series article with attachments in metadata, **When** viewing the article page, **Then** an "Attachments" section appears below the table of contents
2. **Given** multiple attachments, **When** viewing the attachments section, **Then** each attachment is numbered (1., 2., 3., etc.)
3. **Given** an attachment file path, **When** clicking on an attachment link, **Then** the file is downloaded or opens appropriately based on file type
4. **Given** a series article without attachments, **When** viewing the article page, **Then** no attachments section is displayed

---

### User Story 6 - Previous/Next Article Navigation (Priority: P1)

As a reader, I want quick navigation buttons to move to the previous or next article in the series so that I can read the series sequentially without returning to the table of contents.

**Why this priority**: This is essential for smooth reading flow through a series, providing the expected navigation pattern users are familiar with from books and tutorials.

**Independent Test**: Can be fully tested by creating a 3-article series, viewing the middle article, and verifying that both "Previous" and "Next" buttons work correctly.

**Acceptance Scenarios**:

1. **Given** an article with a previous article in the series, **When** viewing the article page, **Then** a "Previous" navigation link is visible at both top and bottom of article content
2. **Given** an article with a next article in the series, **When** viewing the article page, **Then** a "Next" navigation link is visible at both top and bottom of article content
3. **Given** the first article in a series, **When** viewing the article page, **Then** no "Previous" link is shown at either location
4. **Given** the last article in a series, **When** viewing the article page, **Then** no "Next" link is shown at either location
5. **Given** previous/next navigation links, **When** clicking them from either location, **Then** the correct article loads immediately

---

### Edge Cases

- **Series with missing articles**: If an article references a prev/next article that doesn't exist or hasn't been published, the navigation link should be hidden gracefully without breaking the widget display
- **Series name inconsistency**: If articles claim to be in the same series but have slight variations in the series name (capitalization, punctuation), they should be treated as separate series
- **Very long series (20+ articles)**: Table of contents should remain usable and scrollable without breaking sidebar layout, even if the article list exceeds viewport height
- **Articles with very long titles**: Article titles in the table of contents should wrap appropriately without breaking layout or causing horizontal scrolling
- **Circular references**: If prev/next links create a circular reference (e.g., Article A → Article B → Article A), validation should catch this during build and report an error
- **Missing series name**: If series metadata exists but name field is empty or missing, build validation should report an error
- **Invalid reference URLs**: If a reference URL is malformed or empty, the reference should be skipped with a build warning
- **Inaccessible attachments**: If an attachment file path points to a non-existent file, a build warning should be shown and the attachment link omitted from display
- **Mobile viewport constraints**: On narrow viewports (< 768px), series widget appears below article content instead of in sidebar, maintaining all functionality while prioritizing article readability
- **Multiple concurrent scroll events**: Sticky behavior should remain stable and performant when user rapidly scrolls up and down
- **Series with single article**: If a series contains only one article, table of contents should still display correctly, though prev/next navigation would be absent
- **Broken internal links**: If prev/next metadata references an article slug that doesn't exist, validation should catch this and report which articles have broken series links

---

## Clarifications

### Session 2025-11-13

- Q: How should articles be ordered in the table of contents when multiple ordering methods could apply? → A: Explicit order field takes precedence - add `series.order` number field, fall back to published date if missing
- Q: Should the series name in the widget header be clickable, and if so, what should it link to? → A: Not clickable - series name is plain text only for identification, navigation happens via TOC only
- Q: Where should the previous/next navigation buttons be located on the article page? → A: Top and bottom of article - buttons appear both above and below article content for convenience
- Q: On mobile devices (< 768px viewport), where should the series widget be positioned? → A: Below article content - series widget appears after article ends, prioritizes reading the article
- Q: Should the series widget have sticky positioning behavior on mobile viewports where it appears below the article content? → A: No sticky behavior on mobile - widget remains static below content, only desktop sidebar sticks

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support series metadata in article frontmatter with fields: name (series title), order (optional numeric position), prev (path to previous article), next (path to next article), references (array of URLs), attachments (array of file paths)
- **FR-002**: System MUST display a series navigation widget in the article sidebar when series metadata is present
- **FR-003**: System MUST display series name in the widget header as plain text (non-clickable) with format: "This is part of a series named: [SERIES_NAME]"
- **FR-004**: System MUST generate a table of contents listing all articles in the series in sequential order
- **FR-005**: System MUST number each article in the table of contents (1., 2., 3., etc.)
- **FR-006**: System MUST render the current article title as plain text (non-linked) in the table of contents
- **FR-007**: System MUST render other article titles as clickable links in the table of contents
- **FR-008**: System MUST implement sticky positioning behavior on desktop viewports (≥ 768px): when the series widget reaches the top of the viewport during scrolling, it remains visible at the top while the rest of the page scrolls
- **FR-009**: System MUST return the series widget to its original sidebar position when scrolling back up past the initial widget location (desktop only)
- **FR-010**: System MUST handle viewport constraints on desktop: if the series widget is taller than the viewport, it must be independently scrollable
- **FR-011**: System MUST NOT apply sticky positioning behavior on mobile viewports (< 768px) where the widget appears below article content
- **FR-012**: System MUST display a "References" section below the table of contents when references metadata exists
- **FR-013**: System MUST number each reference item sequentially (1., 2., 3., etc.)
- **FR-014**: System MUST render reference URLs as clickable links that open in new tabs
- **FR-015**: System MUST display an "Attachments" section below references when attachments metadata exists
- **FR-016**: System MUST number each attachment item sequentially (1., 2., 3., etc.)
- **FR-017**: System MUST render attachment paths as download links with descriptive file names
- **FR-018**: System MUST provide previous article navigation when prev metadata is specified, displayed at both the top and bottom of article content
- **FR-019**: System MUST provide next article navigation when next metadata is specified, displayed at both the top and bottom of article content
- **FR-020**: System MUST hide previous navigation for the first article in a series
- **FR-021**: System MUST hide next navigation for the last article in a series
- **FR-022**: System MUST validate series metadata during build and report clear errors for missing or malformed data
- **FR-023**: System MUST automatically generate the table of contents from all articles that share the same series name
- **FR-024**: System MUST sort articles in the table of contents with precedence: (1) if series.order field exists, sort by order ascending, (2) otherwise sort by publishedAt date ascending
- **FR-025**: System MUST ensure series widget is only displayed on article pages (not on index, category, or other pages)
- **FR-026**: System MUST display series widget in sidebar on desktop viewports (≥ 768px) and below article content on mobile viewports (< 768px)

### Key Entities

- **Series**: A collection of related articles with a shared name, appearing as a navigable group with table of contents, references, and attachments
- **Series Metadata**: Structured data in article frontmatter containing series name, navigation links (prev/next), optional references (URLs), and optional attachments (file paths)
- **Series Widget**: A sidebar component that displays series information including header, table of contents, references, and attachments
- **Table of Contents**: An ordered list of all articles in a series, showing article numbers and titles with appropriate linking behavior
- **Reference**: An external URL resource related to the series, displayed as a numbered link
- **Attachment**: A downloadable file related to the series, displayed as a numbered link with file name

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Readers can navigate between all articles in a series using table of contents links with zero broken links
- **SC-002**: Series navigation widget remains visible and accessible during scrolling on articles longer than 3 screen heights
- **SC-003**: Current article in table of contents is clearly distinguishable from other articles (non-linked vs linked)
- **SC-004**: All external references and attachments are clickable and functional (100% link success rate)
- **SC-005**: Series widget appears within 100ms of page load (no layout shift or flash of unstyled content)
- **SC-006**: Previous/next navigation allows readers to sequentially read an entire series without returning to index
- **SC-007**: Series metadata validation catches 100% of malformed series data during build with clear error messages
- **SC-008**: Table of contents accurately reflects series structure with correct article count and ordering
- **SC-009**: Sticky behavior works consistently on desktop browsers (≥ 768px viewports) with smooth scrolling performance (60fps minimum); mobile displays static widget below content
- **SC-010**: Series widget is responsive and functional on mobile devices (viewport widths down to 320px), appearing below article content for optimal readability

## Assumptions

- Articles in a series are manually linked via prev/next metadata fields (no automatic series detection)
- Series name is consistent across all articles in the same series (exact string match)
- Article ordering in the table of contents uses series.order field when present, otherwise falls back to publishedAt date ascending
- Featured images, author data, and other standard article metadata remain independent of series membership
- Series can have 2 to 20 articles (reasonable range for multi-part content)
- References are simple URLs without additional metadata (title extracted from URL or specified separately)
- Attachments are static files accessible via relative or absolute paths
- One article can only belong to one series at a time
- Series metadata is optional - not all articles need to be part of a series
- Sticky positioning behavior is supported on all modern browsers and degrades gracefully on older browsers

## Dependencies

- Article metadata system must support nested series data structure with multiple fields
- Article querying capability must support filtering and grouping by series name
- Page layout must accommodate variable-height sidebar widgets
- Build process must validate series metadata and report errors before site generation completes
- Site must support smooth scrolling interactions for sticky positioning behavior

## Scope

### In Scope

- Series metadata schema definition and frontmatter support
- Series navigation widget component with sticky behavior
- Table of contents generation showing all articles in a series
- Current article identification (non-linked) in table of contents
- Previous/next article navigation links
- References section with numbered external links
- Attachments section with numbered download links
- Responsive design for series widget on mobile devices
- Series metadata validation during build process
- Visual styling for series widget to match site design

### Out of Scope

- Automatic series detection based on article content or tags
- Series landing pages or dedicated series archive
- Series progress tracking (e.g., "You've read 3 of 5 articles")
- Reading time estimates for entire series
- Series RSS feeds or email subscriptions
- Commenting or discussion threads specific to series
- Series-level analytics or reading statistics
- Cross-series recommendations or related series suggestions
- Series export functionality (e.g., PDF of entire series)
- Multi-series membership (one article in multiple series)
- Series editing UI or CMS integration

## Non-Functional Considerations

- **Performance**: Series widget rendering should not increase page load time by more than 50ms
- **Accessibility**: Keyboard navigation must work for all series links; screen readers must announce series structure clearly
- **SEO**: Series relationships should be indicated with appropriate structured data (schema.org)
- **Visual Design**: Series widget should be visually distinct but harmonious with existing sidebar components
- **Error Handling**: Missing series articles should show graceful degradation (skip missing links, don't break widget)
- **Maintainability**: Series metadata format should be documented with clear examples for content authors

