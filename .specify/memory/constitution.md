<!--
Sync Impact Report - Constitution v1.0.0
========================================

Version Change: [TEMPLATE] → 1.0.0 (Initial ratification)

Modified Principles:
- All template placeholders replaced with concrete principles

Added Sections:
- Core Principles (7 principles)
- Testing & Quality Standards
- Development Workflow
- Governance

Removed Sections:
- None (template placeholders removed)

Templates Requiring Updates:
- ✅ plan-template.md - Constitution Check section will reference these principles
- ✅ spec-template.md - Aligned with documentation standards (no FR-XXX in comments rule)
- ✅ tasks-template.md - Testing principles reflected in task structure

Follow-up TODOs:
- None - all placeholders resolved

Rationale for v1.0.0:
- First production constitution
- Establishes foundational governance
- All core principles defined
-->

# Joseph Crawford Blog Constitution

## Core Principles

### I. Type Safety First (NON-NEGOTIABLE)

TypeScript MUST be used with strict type checking enabled. The `any` type is prohibited except in extraordinarily rare circumstances that MUST be documented and approved.

**Rules:**
- Avoid `any` type at all costs
- Use proper, specific types for all variables, parameters, and return values
- Use `unknown` only as a last resort when the type truly cannot be determined
- Every use of `unknown` MUST be accompanied by a comment explaining why a specific type cannot be used
- Enable `strict: true` in `tsconfig.json` and maintain zero type errors in builds

**Rationale:** Type safety prevents runtime errors, improves developer experience with autocomplete, and serves as living documentation. The `any` type defeats the purpose of TypeScript and introduces hidden bugs.

### II. Type Discipline

Type coercion using the `as` keyword MUST be limited and justified. Custom type guard functions are the preferred solution for type narrowing.

**Rules:**
- Limit use of type assertions (`as` keyword) to only when absolutely necessary
- Always prefer type guards over type assertions
- Create custom type guard functions (using `is` predicates) when discriminating between types
- Document why a type assertion is required when it must be used
- Never use double assertions (`as unknown as Type`) without explicit approval

**Example Type Guard:**
```typescript
function isArticleFrontmatter(data: unknown): data is ArticleFrontmatter {
  return (
    typeof data === 'object' &&
    data !== null &&
    'slug' in data &&
    'title' in data &&
    typeof (data as any).slug === 'string'
  );
}
```

**Rationale:** Type guards provide runtime safety and make type narrowing explicit. Type assertions bypass the type system and can hide bugs.

### III. Date Handling Standard

The `dayjs` library MUST be used for all date transformations, formatting, and manipulation. No other date libraries or native Date methods for formatting are permitted.

**Rules:**
- Use `dayjs` exclusively for all date operations
- Never use `moment`, `date-fns`, or other date libraries
- Limit use of native JavaScript `Date` object to instantiation only
- Centralize date formatting logic in utility functions (e.g., `src/utils/dateUtils.ts`)
- Always use consistent date format strings across the application

**Rationale:** Standardizing on one date library prevents bundle size bloat, ensures consistent behavior across the application, and simplifies maintenance. The `dayjs` library is already included in dependencies.

### IV. Vanilla JavaScript Preferred

Native JavaScript methods and APIs MUST be preferred over utility libraries like lodash. External utilities are only permitted when native solutions are significantly more complex or error-prone.

**Rules:**
- Prefer native JavaScript array methods (`.map()`, `.filter()`, `.reduce()`, etc.)
- Prefer native object methods (`Object.keys()`, `Object.entries()`, etc.)
- Avoid importing utility libraries (lodash, underscore, ramda) unless absolutely necessary
- If a utility library is required, document the specific reason native JS is insufficient
- Consider extracting complex operations into well-tested utility functions

**Rationale:** Native JavaScript is more performant, reduces bundle size, aligns with modern web standards, and ensures the codebase remains maintainable as JavaScript evolves.

### V. Documentation Standards

Functions MUST be documented with JSDoc blocks that describe purpose, parameters, return values, and any side effects. Inline comments should be minimal and used only for non-obvious code.

**Rules:**
- All exported functions MUST have JSDoc comments
- Private/internal functions SHOULD have JSDoc if non-trivial
- JSDoc MUST include:
  - Function description
  - `@param` for each parameter with type and description
  - `@returns` describing return value
  - `@throws` if function can throw errors
- Limit inline comments to code that is not easily readable
- Comments explain **why**, not **what** (code should be self-explanatory)
- NEVER reference specification markers (FR-XXX, SC-XXX, etc.) in code comments

**Example:**
```typescript
/**
 * Filters posts to include only those marked as featured and not in the family category.
 * Sorts results by publication date (descending) with slug as secondary sort.
 * 
 * @param posts - Array of article posts with frontmatter
 * @param limit - Maximum number of featured posts to return (default: 7)
 * @returns Sorted array of featured posts, limited to the specified count
 */
export function getFeaturedPosts(
  posts: Article[],
  limit: number = 7
): Article[] {
  // Implementation...
}
```

**Rationale:** Good documentation improves maintainability and developer onboarding. Referencing spec markers (FR-XXX) in code creates confusion for engineers who don't have access to specifications.

### VI. Gatsby & React Best Practices

All code MUST follow official Gatsby and React best practices, patterns, and conventions as documented in their official documentation.

**Rules:**
- Use Gatsby's GraphQL data layer for all content queries
- Implement React components as functional components with hooks
- Follow React naming conventions (PascalCase for components, camelCase for functions)
- Use Gatsby's built-in image optimization (`gatsby-plugin-image`)
- Leverage static queries (`useStaticQuery`) for non-page components
- Follow Gatsby's page creation patterns in `gatsby-node.ts`
- Use TypeScript interfaces for all component props
- Implement proper error boundaries for component failures
- Follow React Hooks rules (no conditional hooks, correct dependency arrays)

**Rationale:** Following framework conventions ensures optimal performance, maintainability, and compatibility with ecosystem tools. Gatsby and React best practices are battle-tested and prevent common pitfalls.

### VII. Build-Time Optimization

Static generation MUST be preferred over client-side processing. All data transformations, filtering, and content processing SHOULD occur at build time when possible.

**Rules:**
- Process and transform data during Gatsby build (in `gatsby-node.ts` or page queries)
- Avoid client-side data fetching for content that can be statically generated
- Minimize JavaScript bundle size sent to the client
- Use Gatsby's built-in code splitting and lazy loading
- Prefer CSS over JavaScript for styling and animations when possible
- Measure and monitor build times; optimize if exceeding reasonable thresholds

**Rationale:** Static site generation is Gatsby's core strength. Build-time processing results in faster page loads, better SEO, and reduced client-side JavaScript overhead.

## Testing & Quality Standards

### Test Coverage Requirements

All new features MUST include appropriate test coverage. Test types depend on the feature complexity and risk profile.

**Rules:**
- Unit tests REQUIRED for:
  - Complex business logic functions
  - Data transformation utilities
  - Type guard functions
  - Custom hooks
- Integration tests REQUIRED for:
  - GraphQL queries with data transformations
  - Page generation logic in `gatsby-node.ts`
  - User flows that span multiple components
- Manual testing checklist REQUIRED for:
  - All user-facing features
  - Cross-browser compatibility verification
  - Responsive design validation

**Test Framework:**
- Use Jest for unit and integration tests
- Use React Testing Library for component tests
- Use Playwright for end-to-end tests (when needed)

**Rationale:** Testing prevents regressions, documents expected behavior, and enables confident refactoring. The level of testing should match the risk profile of the feature.

### Type Checking & Linting

All code MUST pass TypeScript type checking and linting before commit.

**Rules:**
- Zero TypeScript errors in `npm run type-check`
- Enable and enforce ESLint rules for React, TypeScript, and Gatsby
- Use Prettier for consistent code formatting
- Configure pre-commit hooks to enforce quality gates (if desired)
- Fix linting warnings; do not suppress without documented reason

**Rationale:** Automated quality checks catch errors early, ensure consistency, and reduce code review burden.

## Development Workflow

### Feature Development

Feature development MUST follow the specification-first workflow established in the `.specify/` directory structure.

**Process:**
1. Create or update feature specification (`/speckit.specify`)
2. Clarify ambiguities (`/speckit.clarify`)
3. Generate implementation plan (`/speckit.plan`)
4. Generate task breakdown (`/speckit.tasks`)
5. Implement following the task sequence
6. Test according to acceptance criteria
7. Update documentation as needed

**Branch Strategy:**
- Use feature branches for new development (when not on `develop`)
- Branch naming: `###-feature-name` (e.g., `004-featured-posts-filtering`)
- Merge to `develop` or `main` after review and testing

**Rationale:** Specification-first development ensures features are well-understood before implementation, reducing rework and improving quality.

### Code Review Standards

All code changes SHOULD be reviewed before merging (when working in a team context).

**Review Checklist:**
- Code follows all constitution principles
- Tests are included and passing
- TypeScript types are specific (no `any`, minimal `unknown`)
- Documentation is complete (JSDoc on exported functions)
- No specification markers (FR-XXX) in code comments
- Build completes without errors or warnings
- Changes align with feature specification

**Rationale:** Code review catches issues early, spreads knowledge across the team, and ensures compliance with standards.

### Commit Hygiene

Commits MUST be atomic, well-described, and follow conventional commit format when practical.

**Guidelines:**
- Write clear, descriptive commit messages
- Use conventional commit prefixes when appropriate:
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `test:` - Adding or updating tests
  - `chore:` - Tooling, dependencies, etc.
- Reference issue/task numbers when applicable
- Keep commits focused on a single logical change

**Rationale:** Good commit history aids debugging, rollbacks, and understanding project evolution.

## Governance

### Constitution Authority

This constitution defines the standards and practices for the Joseph Crawford Blog project. All development work MUST comply with these principles unless explicitly documented exceptions are approved.

**Hierarchy:**
1. Constitution principles (this document) - highest authority
2. Feature specifications (`specs/*/spec.md`) - feature-level requirements
3. Implementation plans (`specs/*/plan.md`) - technical approach
4. Code comments and inline documentation - implementation details

**Rationale:** Clear hierarchy prevents conflicts and ensures consistent decision-making.

### Amendment Process

Constitution amendments require documentation of rationale, version increment, and sync impact analysis.

**Process:**
1. Identify need for amendment (new principle, change, or removal)
2. Document rationale and impact
3. Update constitution using `/speckit.constitution` command
4. Increment version following semantic versioning:
   - **MAJOR**: Breaking changes to principles, removal of non-negotiable rules
   - **MINOR**: New principles added, material expansions to guidance
   - **PATCH**: Clarifications, typo fixes, non-semantic refinements
5. Update sync impact report (automated by command)
6. Review dependent templates and documentation for consistency
7. Commit with message: `docs: amend constitution to vX.Y.Z (description)`

**Rationale:** Formal amendment process ensures changes are intentional, documented, and consistently applied.

### Compliance Verification

Constitution compliance MUST be verified during code review and at key feature milestones.

**Verification Points:**
- During code review (all principles apply)
- Before feature completion (Constitution Check in `plan.md`)
- During architecture decisions (principles guide technical choices)
- When evaluating new dependencies (align with principles)

**Exceptions:**
- Any deviation from constitution principles MUST be documented
- Document: **What** principle is violated, **Why** necessary, **Alternatives** rejected
- Record in `plan.md` under "Complexity Tracking" section
- Temporary exceptions MUST include plan to resolve and return to compliance

**Rationale:** Consistent enforcement maintains code quality and prevents gradual erosion of standards.

### Living Document

This constitution is a living document and SHOULD evolve as the project grows and best practices change.

**Review Triggers:**
- After completing major features (every 3-6 months)
- When adopting new technologies or frameworks
- When recurring issues suggest a principle gap
- When community best practices evolve significantly

**Rationale:** Rigid adherence to outdated principles harms the project. Regular review ensures the constitution remains relevant and valuable.

---

**Version**: 1.0.0 | **Ratified**: 2025-11-21 | **Last Amended**: 2025-11-21
