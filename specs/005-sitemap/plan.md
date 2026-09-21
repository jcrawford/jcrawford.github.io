# Implementation Plan: SEO Sitemap Generation

**Branch**: `develop` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-sitemap/spec.md`

## Summary

Add automated XML sitemap generation to the Gatsby blog to enable search engine discovery and indexing of all public pages. The sitemap will be generated automatically during each build using the standard Gatsby plugin ecosystem (gatsby-plugin-sitemap), accessible at /sitemap.xml, and will include all blog posts, category pages, author pages, and static pages with appropriate metadata (lastmod, priority, changefreq).

## Technical Context

**Language/Version**: TypeScript 5.x (existing project standard)  
**Primary Dependencies**: Gatsby 5.x (existing), gatsby-plugin-sitemap (to be added)  
**Storage**: N/A (sitemap generated from GraphQL data layer at build time)  
**Testing**: Manual validation (sitemap validators, Google Search Console), build-time verification  
**Target Platform**: Static site generation (SSG), deployed to GitHub Pages  
**Project Type**: Gatsby web application (existing)  
**Performance Goals**: Sitemap generation adds < 5 seconds to build time, sitemap file < 1MB  
**Constraints**: Must follow sitemaps.org protocol, file size < 50MB, < 50,000 URLs per sitemap  
**Scale/Scope**: Current: ~20 posts, 5 categories, 1 author; Expected growth: 100-500 posts over next year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with project constitution (`.specify/memory/constitution.md`):

**Type Safety** ✓
- [x] No use of `any` type (plugin configuration uses standard Gatsby types)
- [x] Proper TypeScript types for all functions (plugin options interface)
- [x] `unknown` used only as last resort with justification (N/A for this feature)

**Type Discipline** ✓
- [x] Type assertions (`as`) limited and justified (N/A - plugin uses standard types)
- [x] Custom type guard functions implemented where needed (N/A - no custom type logic)

**Date Handling** ✓
- [x] `dayjs` used exclusively for date operations (dates come from frontmatter, no custom formatting needed in sitemap)
- [x] No other date libraries introduced (confirmed)

**Dependencies** ✓
- [x] Vanilla JavaScript preferred over utility libraries (plugin handles all sitemap generation)
- [x] New dependencies justified and documented (gatsby-plugin-sitemap is official Gatsby plugin, standard for SEO)

**Documentation** ✓
- [x] JSDoc comments on all exported functions (plugin configuration only, no custom functions)
- [x] No FR-XXX or specification markers in code comments (confirmed)

**Gatsby/React Best Practices** ✓
- [x] Follows official Gatsby and React patterns (uses official gatsby-plugin-sitemap)
- [x] Build-time optimization preferred over client-side processing (sitemap generated at build time)

**Testing** ✓
- [x] Appropriate test coverage planned (manual validation with sitemap validators)
- [x] Test framework: Manual testing + validation tools (appropriate for build-time artifact)

## Project Structure

### Documentation (this feature)

```text
specs/005-sitemap/
├── spec.md             # Feature specification (completed)
├── plan.md             # This file
├── research.md         # Phase 0 output (next)
├── data-model.md       # Phase 1 output
├── quickstart.md       # Phase 1 output
├── contracts/          # Phase 1 output
│   └── sitemap-schema.xml  # XML schema for validation
├── checklists/
│   └── requirements.md # Specification quality checklist (completed)
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
gatsby-config.ts              # Plugin configuration added here
static/robots.txt             # Updated to reference sitemap
public/sitemap.xml            # Generated at build time (gitignored)
public/sitemap-index.xml      # Generated if multiple sitemaps needed (gitignored)

src/
├── pages/                    # Existing pages (posts, categories, authors)
├── templates/                # Existing templates
└── components/               # Existing components

No new source files required - configuration only
```

**Structure Decision**: This is a build-time configuration feature that leverages Gatsby's plugin system. No custom source code is required beyond plugin configuration in `gatsby-config.ts`. The sitemap is automatically generated from the existing GraphQL data layer that already contains all page information.

## Complexity Tracking

No constitution violations - all checks pass. This feature uses standard Gatsby ecosystem tools and follows all established patterns.

## Implementation Strategy

### Phase 0: Research (Next Step)

Research tasks to be documented in `research.md`:

1. **Plugin Evaluation**:
   - Investigate gatsby-plugin-sitemap capabilities and configuration options
   - Verify compatibility with Gatsby 5.x
   - Confirm plugin supports all required metadata (lastmod, priority, changefreq)
   - Research alternative plugins if standard plugin has limitations

2. **Best Practices**:
   - Research sitemaps.org protocol specifications
   - Investigate Google Search Console submission and validation process
   - Review sitemap priority and changefreq best practices for blog content
   - Research robots.txt sitemap reference format

3. **Integration Patterns**:
   - Determine how plugin integrates with existing GraphQL queries
   - Research page filtering (exclude drafts, private pages)
   - Investigate custom URL transformation if needed
   - Research sitemap splitting strategies for large sites

4. **Validation Tools**:
   - Identify sitemap validation tools (online validators, CLI tools)
   - Research Google Search Console sitemap submission process
   - Investigate automated sitemap testing approaches

### Phase 1: Design & Contracts

Artifacts to be generated:

1. **data-model.md**:
   - Sitemap XML structure
   - URL entry schema (loc, lastmod, priority, changefreq)
   - Page type classifications and priority mappings
   - Filtering rules for page inclusion/exclusion

2. **contracts/sitemap-schema.xml**:
   - XML schema definition for sitemap validation
   - Example sitemap output with all supported fields

3. **quickstart.md**:
   - Plugin installation steps
   - Configuration examples
   - Validation commands
   - Google Search Console submission guide

### Phase 2: Tasks (Future - /speckit.tasks)

Task breakdown will be generated after research and design phases complete, likely including:
- Install and configure gatsby-plugin-sitemap
- Configure plugin options (query, filtering, metadata)
- Update robots.txt with sitemap reference
- Validate sitemap generation in development
- Test sitemap with validation tools
- Submit sitemap to Google Search Console
- Document sitemap management procedures

## Dependencies

### External Dependencies
- **gatsby-plugin-sitemap**: Official Gatsby plugin for sitemap generation
  - Current version: Check npm for latest compatible with Gatsby 5.x
  - License: MIT
  - Maintenance: Active (official Gatsby plugin)

### Internal Dependencies
- Gatsby GraphQL data layer (existing)
- Site metadata in gatsby-config.ts (existing)
- Markdown frontmatter fields: publishedAt, updatedAt, category (existing)

### Deployment Dependencies
- Build process must include sitemap in public/ directory
- GitHub Pages deployment must serve static files from public/

## Risk Assessment

### Low Risk ✓
- **Plugin Stability**: gatsby-plugin-sitemap is official, well-maintained plugin
- **Breaking Changes**: Plugin configuration is isolated in gatsby-config.ts
- **Rollback**: Easy to remove plugin if issues arise
- **Testing**: Can validate sitemap before search engine submission

### Medium Risk ⚠
- **Build Time Impact**: Plugin adds processing time to builds
  - Mitigation: Monitor build times, optimize GraphQL queries if needed
- **Large Site Scaling**: Current site is small, but may grow
  - Mitigation: Plugin handles sitemap splitting automatically if needed

### Minimal Technical Debt
- Plugin is standard solution, no custom code to maintain
- Configuration is declarative, easy to understand and modify
- No new dependencies to keep updated (plugin maintained by Gatsby team)

## Success Metrics Alignment

Mapping from spec.md Success Criteria to implementation approach:

- **SC-001** (100% page discovery): Plugin uses GraphQL to query all pages automatically
- **SC-002** (Zero validation errors): Plugin generates standards-compliant XML
- **SC-003** (<5 second build time impact): Plugin is optimized for build-time generation
- **SC-004** (<1 second load time): Static XML file, minimal size
- **SC-005** (90% indexed in 30 days): Proper metadata helps search engines prioritize
- **SC-006** (Updates within 24 hours): Sitemap regenerates on every build

## Next Steps

1. ✅ Phase 0: Generate research.md with plugin evaluation and best practices
2. ⏳ Phase 1: Generate data-model.md, contracts/, and quickstart.md
3. ⏳ Update agent context with new configuration patterns
4. ⏳ Phase 2: Generate tasks.md with implementation checklist (/speckit.tasks command)

