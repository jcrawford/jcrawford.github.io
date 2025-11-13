# Implementation Plan: Gatsby with HybridMag WordPress Theme

**Feature**: 001-gatsby-theme-setup  
**Branch**: `001-gatsby-theme-setup`  
**Created**: November 5, 2025  
**Updated**: November 5, 2025  
**Spec**: [spec.md](./spec.md)

## Summary

Convert the HybridMag WordPress theme into a Gatsby-powered static site with full TypeScript support. The theme features dark mode toggle, Swiper sliders, multiple layout options, slideout sidebars, and a customizable header system. All WordPress PHP templates and hooks will be converted to React/TypeScript components while preserving functionality and design. Content will be authored in Markdown/MDX files, widgets configured via TypeScript files, and the site will be deployable to GitHub Pages.

## Technical Context

**Language/Runtime**: TypeScript 5.3+ (strict mode), Node.js 20+  
**Framework**: Gatsby 5.x (React 18.x-based static site generator)  
**Package Manager**: Yarn Berry v4.x with Plug'n'Play (PnP) mode  
**Content Format**: Markdown (.md) and MDX (.mdx) files with YAML frontmatter  
**Styling**: Tailwind CSS 3.4+ with HybridMag design tokens, Figtree font (local woff2)  
**Interactive Libraries**: Swiper 11.x (React components), dayjs for dates  
**Image Processing**: gatsby-plugin-image with Sharp for optimization  
**Content Transformation**: gatsby-transformer-remark (for .md) and gatsby-plugin-mdx (for .mdx)  
**Deployment Target**: GitHub Pages with custom domain (no path prefix)  
**Development Environment**: Hot-reloading dev server, localhost testing only

**WordPress to Gatsby Conversion**:
- PHP templates → TypeScript React components
- WordPress hooks (`do_action`, `add_action`) → React component composition
- WordPress functions (`get_theme_mod`, `has_nav_menu`) → Configuration objects
- WordPress loops → JavaScript `.map()` operations
- Dynamic sidebars → Widget configuration files
- WordPress conditionals → Gatsby page context and GraphQL queries

## Constitution Check

### P1: TypeScript-First ✅ PASS
All components, pages, and configuration files use TypeScript with `.ts` and `.tsx` extensions.

### P2: Strict Type Safety ✅ PASS
`tsconfig.json` configured with `strict: true` and all strict-mode compiler flags enabled.

### P3: Best Practices ✅ PASS
- Named exports for components
- Explicit return types for functions
- Props interfaces defined separately
- React hooks for state management
- Semantic HTML5 elements

### P4: Latest Package Versions ✅ PASS
- `gatsby@^5.15.0` (latest 5.x)
- `react@^18.3.0` (latest 18.x)
- `typescript@^5.3.0` (latest 5.x)
- `swiper@^11.0.0` (latest 11.x)
- `dayjs@^1.11.0` (latest 1.x)

### P5: Theme-Based Architecture with Tailwind CSS ✅ PASS
All components follow HybridMag design system from `inspiration/` folder. Design tokens extracted and configured in `tailwind.config.ts`. Components use Tailwind utility classes.

### P6: No Utility Libraries ✅ PASS
No lodash, underscore, or similar dependencies. Native TypeScript/JavaScript methods only.

### P7: dayjs for Dates ✅ PASS
Using `dayjs` for all date formatting and manipulation tasks.

### P8: Native Fetch API ✅ PASS
Static site with no runtime API calls. If needed in future, will use native `fetch()`.

### P9: Static Site Generation ✅ PASS
Gatsby generates static HTML at build time. No server-side rendering at runtime.

### P10: No Unit Testing ✅ PASS
Manual browser testing only. No jest, vitest, or testing library dependencies.

### P11: Minimal Code Comments ✅ PASS
Comments only for complex logic. No FR-XXX references in code. Self-documenting code preferred.

**All constitution principles satisfied** ✅

## Project Structure

```
/Users/josephcrawford/Projects/site/
├── .yarn/                          # Yarn Berry PnP files
├── gatsby-config.ts                # Gatsby configuration
├── gatsby-node.ts                  # Build-time Node APIs
├── gatsby-browser.tsx              # Browser APIs
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration for Tailwind
├── package.json                    # Dependencies
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Converted from header.php
│   │   │   ├── Footer.tsx          # Converted from footer.php
│   │   │   └── Layout.tsx          # Main layout wrapper
│   │   ├── navigation/
│   │   │   ├── PrimaryNav.tsx      # Desktop navigation
│   │   │   ├── MobileNav.tsx       # Mobile slideout menu
│   │   │   ├── SecondaryNav.tsx    # Top bar navigation
│   │   │   └── SocialNav.tsx       # Social links menu
│   │   ├── interactive/
│   │   │   ├── DarkModeToggle.tsx  # Theme switcher with localStorage
│   │   │   ├── SearchToggle.tsx    # Search overlay (UI-only)
│   │   │   ├── MobileMenuToggle.tsx
│   │   │   └── SlideoutSidebar.tsx
│   │   ├── featured/
│   │   │   ├── FeaturedSlider.tsx  # Swiper slider
│   │   │   ├── FeaturedSmall.tsx   # Small featured posts
│   │   │   └── FeaturedTabs.tsx    # Tabbed featured content
│   │   ├── widgets/
│   │   │   ├── SidebarPosts.tsx    # Popular/recent posts widget
│   │   │   ├── Categories.tsx      # Category list widget
│   │   │   └── Newsletter.tsx      # Newsletter signup widget
│   │   ├── common/
│   │   │   ├── ArticleCard.tsx     # Blog post card
│   │   │   ├── Icon.tsx            # SVG icon component
│   │   │   └── Button.tsx          # CTA button
│   │   └── seo/
│   │       └── SEO.tsx              # Meta tags component
│   ├── pages/
│   │   ├── index.tsx                # Homepage (from index.php)
│   │   ├── 404.tsx                  # Not found page
│   │   └── about.tsx                # About page example
│   ├── templates/
│   │   ├── blog-post.tsx            # Single post (from single.php)
│   │   ├── archive.tsx              # Archive pages (from archive.php)
│   │   └── page-fullwidth.tsx       # Full width template
│   ├── styles/
│   │   └── global.css               # Tailwind directives + font faces
│   ├── data/
│   │   ├── siteConfig.ts            # Site configuration
│   │   ├── navigation.ts            # Menu data
│   │   └── widgetConfig.ts          # Widget configuration
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── hooks/
│   │   ├── useDarkMode.ts           # Dark mode state management
│   │   ├── useLocalStorage.ts       # localStorage abstraction
│   │   ├── useKeyboardNav.ts        # Keyboard navigation
│   │   └── useMediaQuery.ts         # Responsive breakpoints
│   └── utils/
│       ├── icons.tsx                 # SVG icon definitions
│       └── formatters.ts             # Date/string formatting
├── static/
│   ├── fonts/
│   │   └── figtree/                  # Figtree woff2 files
│   └── images/
│       └── default.jpg               # Fallback image
├── content/
│   └── posts/                        # Markdown/MDX blog posts
│       ├── 2024-01-15-first-post.md
│       └── 2024-01-20-second-post.mdx
└── inspiration/                      # Original WordPress theme (reference)
```

## Research (Phase 0)

See [research.md](./research.md) for detailed findings on:
- WordPress to React conversion patterns
- Swiper React integration best practices
- Dark mode with Tailwind's class strategy + localStorage
- Tailwind CSS integration with HybridMag design tokens
- Markdown vs MDX selection criteria
- Gatsby plugin ecosystem evaluation
- TypeScript strict mode configuration
- Keyboard navigation accessibility patterns

## Data Model (Phase 1)

See [data-model.md](./data-model.md) for entity definitions including:
- Article (Markdown/MDX with frontmatter)
- SiteConfig (global settings)
- Navigation (menus and links)
- Widget (sidebar components configuration)
- DarkModeState (localStorage persistence)

## Component Contracts (Phase 1)

See [contracts/component-interfaces.md](./contracts/component-interfaces.md) for TypeScript interfaces defining:
- Component props (Header, Footer, Layout, Navigation, Widgets)
- Data types (Article, Author, Category, MenuItem)
- Hook signatures (useDarkMode, useLocalStorage, useKeyboardNav)
- Configuration shapes (SiteConfig, WidgetConfig, SliderConfig)

## Implementation Phases

### Phase 1: Foundation Setup (Weeks 1-2)
**Goal**: Working Gatsby development environment with HybridMag CSS integrated

**Tasks**:
- Initialize Gatsby project with TypeScript strict mode
- Configure Yarn Berry PnP mode
- Install dependencies (React, Gatsby plugins, Swiper, dayjs, remark, MDX)
- Copy and integrate HybridMag CSS from `inspiration/style.css`
- Setup Figtree fonts from local woff2 files
- Create base Layout component structure
- Configure gatsby-config.ts with all required plugins
- Setup content/ directory structure for Markdown/MDX files

**Deliverables**:
- Working `yarn develop` command starts dev server
- HybridMag CSS loads and applies correctly
- Figtree fonts render properly
- No console errors in browser

### Phase 2: Core Components (Weeks 3-4)
**Goal**: All WordPress templates converted to React components

**Tasks**:
- Convert header.php → Header.tsx (support default/large layouts)
- Convert footer.php → Footer.tsx
- Create navigation components (Primary, Mobile, Secondary, Social)
- Implement dark mode toggle with localStorage persistence
- Create mobile menu with slideout sidebar
- Build search toggle overlay (UI-only placeholder)
- Convert WordPress SVG icon system to React Icon component
- Create Layout wrapper integrating all components

**Deliverables**:
- Header renders with both layout options
- Footer displays correctly
- Dark mode toggle works and persists
- Mobile menu slides out properly
- All navigation menus functional

### Phase 3: Interactive Features (Week 5)
**Goal**: All JavaScript functionality converted to React

**Tasks**:
- Implement useDarkMode hook
- Implement useLocalStorage hook
- Implement useKeyboardNav hook for accessibility
- Create overlay mask system for mobile/slideout menus
- Add focus trapping to mobile sidebar
- Implement keyboard Escape to close overlays
- Add ARIA attributes for accessibility
- Create custom hooks for menu interactions

**Deliverables**:
- Dark mode persists across page reloads
- Keyboard navigation works correctly
- Focus management in mobile menu
- All ARIA attributes present
- Screen reader compatibility

### Phase 4: Content & Slider (Week 6)
**Goal**: Markdown/MDX content rendering and featured slider working

**Tasks**:
- Configure gatsby-transformer-remark for .md files
- Configure gatsby-plugin-mdx for .mdx files with React components
- Create GraphQL queries for article data
- Integrate Swiper React components
- Build FeaturedSlider component with lazy loading
- Create ArticleCard component
- Build blog post template (templates/blog-post.tsx)
- Query and display most recent articles in slider

**Deliverables**:
- Markdown posts render correctly
- MDX posts support embedded React components
- Featured slider displays with smooth transitions
- Article cards show properly
- Single post pages work

### Phase 5: Widgets & Sidebars (Week 7)
**Goal**: All sidebar widgets implemented and configurable

**Tasks**:
- Create widgetConfig.ts configuration file
- Build SidebarPosts widget component
- Build Categories widget component
- Build Newsletter widget component
- Create WidgetArea container component
- Implement widget rendering from configuration
- Add widgets to homepage sidebar
- Configure widgets for all sidebar positions

**Deliverables**:
- Widget configuration system works
- All widget types render correctly
- Widgets appear in correct sidebar positions
- Widget content dynamically populated

### Phase 6: Polish & Testing (Week 8)
**Goal**: Production-ready site meeting all success criteria

**Tasks**:
- Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- Responsive testing at all breakpoints (320px, 768px, 1024px, 1200px+)
- Keyboard navigation testing
- Dark mode testing (persistence, default behavior)
- Lighthouse audits (Performance >80, Accessibility >90, etc.)
- Image optimization verification
- Build time optimization
- Production build testing
- GitHub Pages deployment configuration

**Deliverables**:
- All browsers render correctly
- All breakpoints work properly
- Lighthouse scores meet targets
- Production build completes in <2 minutes
- Site ready for GitHub Pages deployment

## Risk Mitigation

### High-Impact Risks

**Risk**: WordPress hook system complexity may be difficult to replicate in React  
**Mitigation**: Use component composition patterns extensively. Document WordPress→React mappings in research.md. Start with simplest hooks first to establish patterns.

**Risk**: Dark mode localStorage may not work in all browsers/scenarios  
**Mitigation**: Implement fallback to prefers-color-scheme media query. Test in private browsing mode. Provide system preference detection.

**Risk**: Swiper library size may impact initial page load  
**Mitigation**: Lazy load Swiper component. Use code splitting. Implement loading skeleton while Swiper loads.

**Risk**: CSS custom properties may have browser compatibility issues  
**Mitigation**: Target modern browsers only per spec assumptions. Test thoroughly in target browsers. Provide fallback values where critical.

### Medium-Impact Risks

**Risk**: Markdown transformer plugin choice (remark vs MDX) may need reconsideration  
**Mitigation**: Implement both plugins as clarified. Start with remark for simple posts, add MDX support incrementally.

**Risk**: Build time may exceed 2-minute target with large content sets  
**Mitigation**: Optimize images before adding. Use Gatsby cache effectively. Implement incremental builds for future.

**Risk**: Widget configuration approach may prove inflexible  
**Mitigation**: Design widgetConfig.ts with extensibility in mind. Support multiple widget types through discriminated unions.

## Dependencies

### Production Dependencies
```json
{
  "gatsby": "^5.15.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "gatsby-plugin-image": "^3.13.0",
  "gatsby-plugin-sharp": "^5.13.0",
  "gatsby-transformer-sharp": "^5.13.0",
  "gatsby-source-filesystem": "^5.13.0",
  "gatsby-plugin-manifest": "^5.13.0",
  "gatsby-plugin-sitemap": "^6.13.0",
  "gatsby-transformer-remark": "^6.13.0",
  "gatsby-plugin-mdx": "^5.13.0",
  "@mdx-js/react": "^3.0.0",
  "swiper": "^11.0.0",
  "dayjs": "^1.11.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.3.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "@types/node": "^20.0.0"
}
```

## Success Metrics

- ✅ Dev server starts in <30s
- ✅ Hot reload updates in <2s
- ✅ Build completes in <2min
- ✅ All interactive features functional
- ✅ Dark mode persists correctly
- ✅ Lighthouse Performance >80
- ✅ Lighthouse Accessibility >90
- ✅ Lighthouse Best Practices >90
- ✅ Lighthouse SEO >90
- ✅ No console errors
- ✅ Responsive at all breakpoints
- ✅ Keyboard navigation works
- ✅ Successfully deploys to GitHub Pages

## Next Steps

After plan completion:
1. Generate detailed tasks with `/speckit.tasks`
2. Begin Phase 1 implementation
3. Test incrementally after each phase
4. Deploy to GitHub Pages after Phase 6
