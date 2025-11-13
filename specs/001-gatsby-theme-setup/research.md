# Research Findings: HybridMag WordPress to Gatsby Conversion

**Feature**: 001-gatsby-theme-setup  
**Date**: November 5, 2025  
**Purpose**: Document research findings and technical decisions for converting HybridMag WordPress theme to Gatsby

## Overview

This document consolidates research findings for the HybridMag WordPress theme conversion. Key research areas include WordPress to React conversion patterns, Swiper integration, dark mode implementation, CSS custom properties, and content transformation strategies.

---

## 1. WordPress to React Conversion Patterns

### Decision: Component Composition Pattern

**Rationale**: WordPress uses an action/filter hook system for template flexibility. React achieves similar flexibility through component composition and render props.

**WordPress Hook Pattern**:
```php
// WordPress
do_action('hybridmag_before_header');
do_action('hybridmag_header');  
do_action('hybridmag_after_header');

// Functions can add content to hooks
add_action('hybridmag_header', 'hybridmag_header_template');
```

**React Composition Pattern**:
```typescript
// React equivalent
<>
  {beforeHeader}
  <Header>
    <HeaderTop />
    <HeaderInner>
      <HeaderMain />
      {headerLayout === 'large' && <HeaderGadgets />}
    </HeaderInner>
    <HeaderBottom />
  </Header>
  {afterHeader}
</>
```

**Alternatives Considered**:
- Higher-Order Components (HOCs) - More complex, less readable
- Render props - Verbose for nested structures
- Context API - Overkill for static composition

**Implementation Guide**:
1. Map each WordPress hook to a component slot or children prop
2. Use conditional rendering for layout variants (if/else, ternary)
3. Pass configuration via props instead of get_theme_mod()
4. Replace WordPress loops with .map() over arrays
5. Convert conditional tags (is_front_page) to Gatsby page context

**Key Mappings**:
- `do_action()` → Component slots with children props
- `add_action()` → Component composition in parent
- `get_theme_mod()` → siteConfig object properties
- `has_nav_menu()` → Check array/object existence
- `dynamic_sidebar()` → WidgetArea component with config
- `wp_nav_menu()` → Navigation component with items array

---

## 2. Swiper React Integration

### Decision: Use Swiper React Components (swiper/react)

**Rationale**: Swiper provides official React components with better TypeScript support and React lifecycle integration compared to vanilla Swiper.

**Installation**:
```bash
yarn add swiper@^11.0.0
```

**Basic Implementation**:
```typescript
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Lazy } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const FeaturedSlider: React.FC<Props> = ({ articles }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, Lazy]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      lazy={true}
      slidesPerView={1}
    >
      {articles.map(article => (
        <SwiperSlide key={article.id}>
          <img data-src={article.image} className="swiper-lazy" />
          <div className="swiper-lazy-preloader" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
```

**Alternatives Considered**:
- Vanilla Swiper with useEffect initialization - More complex, needs cleanup
- React Slick - Older library, less actively maintained
- Custom slider implementation - Reinventing the wheel, missing touch gestures

**Performance Considerations**:
- Lazy load Swiper component for faster initial page load
- Use lazy loading for images within slides
- Enable hardware acceleration (built-in to Swiper)
- Limit autoplay delay to reasonable values (3-7 seconds)

**CSS Customization**:
```css
/* Override Swiper defaults to match HybridMag theme */
.swiper {
  --swiper-theme-color: #65bc7b; /* Primary color */
  --swiper-navigation-size: 44px;
}

.swiper-button-next,
.swiper-button-prev {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 44px;
  height: 44px;
}
```

**Accessibility**:
- Swiper includes ARIA attributes by default
- Ensure keyboard navigation works (Tab, Arrow keys)
- Add aria-label to navigation buttons
- Provide pause button for autoplay (accessibility best practice)

---

## 3. Dark Mode Implementation with localStorage

### Decision: Tailwind Dark Mode + React State + localStorage

**Rationale**: Tailwind's built-in dark mode (`class` strategy) combined with React state and localStorage provides instant theme switching, persists user preference, and leverages Tailwind's `dark:` prefix for styling.

**Implementation Architecture**:

**1. Custom Hook (useDarkMode.ts)**:
```typescript
export const useDarkMode = (): [boolean, () => void] => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('hybridmagDarkMode');
    if (stored === 'enabled') return true;
    if (stored === 'disabled') return false;
    
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('hybridmagDarkMode', 'enabled');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('hybridmagDarkMode', 'disabled');
    }
  }, [darkMode]);

  const toggle = () => setDarkMode(!darkMode);
  
  return [darkMode, toggle];
};
```

**2. Tailwind Dark Mode Classes**:
```typescript
// Component example with Tailwind dark mode
export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="bg-white dark:bg-dark-bg text-text-main dark:text-dark-text">
      {children}
    </div>
  );
};

// Tailwind config defines dark mode colors
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      dark: {
        bg: '#0f1419',
        text: '#e2e8f0',
        border: '#2d3748',
      }
    }
  }
}
```

**3. Toggle Component**:
```typescript
export const DarkModeToggle: React.FC = () => {
  const [darkMode, toggleDarkMode] = useDarkMode();
  
  return (
    <button onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      {darkMode ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
```

**Alternatives Considered**:
- Context API for dark mode state - Overkill for simple boolean
- CSS-in-JS theme switching - Performance overhead, flash on load
- Cookies instead of localStorage - More complex, requires server

**Edge Cases Handled**:
- localStorage unavailable (private browsing) → Falls back to prefers-color-scheme
- Server-side rendering → Use useEffect to avoid hydration mismatch
- Flash of incorrect theme → Can add inline script in HTML head (optional)

**Browser Compatibility**:
- CSS custom properties: All modern browsers ✅
- localStorage: All modern browsers ✅
- prefers-color-scheme: All modern browsers ✅

---

## 4. Tailwind CSS Integration with HybridMag Design Tokens

### Decision: Use Tailwind CSS with HybridMag Design System

**Rationale**: Tailwind provides a utility-first approach that ensures consistent styling, reduces custom CSS, and improves maintainability. HybridMag's design tokens (colors, typography, spacing) will be extracted and ported to Tailwind configuration.

**HybridMag Design Token Extraction**:

From `inspiration/style.css`, extract these design tokens:

**Color System** → Tailwind Theme Colors:
```typescript
// tailwind.config.ts
colors: {
  primary: '#65bc7b',
  tertiary: '#272c30',
  text: {
    main: '#404040',
    light: '#7D7D7D',
    headings: '#222222',
  },
  link: {
    DEFAULT: '#0a0808',
    hover: '#65bc7b',
  },
  border: '#E0E0E0',
  // Dark mode colors
  dark: {
    bg: '#0f1419',
    text: '#e2e8f0',
    border: '#2d3748',
  }
}
```

**Typography System** → Tailwind Font Config:
```typescript
// tailwind.config.ts
fontSize: {
  'xs': '0.875rem',    // 14px
  'sm': '0.938rem',    // 15px
  'base': '1rem',      // 16px
  'md': '1.063rem',    // 17px
  'lg': '1.125rem',    // 18px
  // ... additional sizes from HybridMag
},
lineHeight: {
  'body': '1.5',
  'headings': '1.3',
},
fontFamily: {
  'figtree': ['Figtree', 'sans-serif'],
}
```

**Spacing System** → Tailwind Spacing:
```typescript
// tailwind.config.ts
spacing: {
  // Extend default Tailwind spacing
  'global': '35px',
  'sidebar': '35px',
  'post-gap': '35px',
}
```

**Dark Mode Configuration**:
```typescript
// tailwind.config.ts
darkMode: 'class', // Use class-based dark mode
```

**Tailwind Plugins Required**:
```bash
yarn add -D tailwindcss@^3.4.0 postcss autoprefixer
yarn add -D @tailwindcss/typography # For blog content formatting
yarn add -D @tailwindcss/forms # For form styling
```

**Component Styling Approach**:
```typescript
// Example: ArticleCard component
export const ArticleCard: React.FC<Props> = ({ article }) => {
  return (
    <article className="bg-white dark:bg-dark-bg border border-border dark:border-dark-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <GatsbyImage 
        image={article.featuredImage} 
        alt={article.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-global">
        <span className="text-primary text-sm font-semibold uppercase">
          {article.category.name}
        </span>
        <h3 className="text-text-headings dark:text-dark-text text-xl font-bold mt-2 line-height-headings">
          {article.title}
        </h3>
        <p className="text-text-light dark:text-dark-text text-base line-height-body mt-3">
          {article.excerpt}
        </p>
      </div>
    </article>
  );
};
```

**Benefits**:
- Utility-first approach ensures consistency
- No custom CSS files per component
- Purge unused styles in production (smaller bundle)
- Dark mode with simple `dark:` prefix
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- JIT (Just-In-Time) compiler for fast builds

**Configuration Files**:
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/templates/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { /* HybridMag colors */ },
      fontSize: { /* HybridMag typography */ },
      spacing: { /* HybridMag spacing */ },
      fontFamily: { /* Figtree font */ },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
```

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Figtree font faces */
@font-face {
  font-family: 'Figtree';
  src: url('/fonts/figtree/figtree-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Additional font weights as needed */
```

**Gatsby Integration**:
```typescript
// gatsby-browser.tsx
import './src/styles/global.css'
```

**Alternatives Considered**:
- CSS Modules - More boilerplate, harder to maintain
- Styled Components - Runtime cost, larger bundle
- Native CSS with custom properties - More custom CSS to maintain
- Emotion - Similar to styled-components, same drawbacks

**Migration from HybridMag CSS**:
1. Extract all CSS custom properties from `inspiration/style.css`
2. Map to Tailwind config theme tokens
3. Reference HybridMag CSS for component structures
4. Implement with Tailwind utility classes in JSX
5. No need to copy entire `style.css` file

---

## 5. Markdown vs MDX Selection

### Decision: Support Both (.md and .mdx files)

**Rationale**: Provides flexibility for different content needs. Simple posts use Markdown, advanced posts with interactive elements use MDX.

**Use Case Differentiation**:

**Markdown (.md)** - Use for:
- Standard blog posts with text, images, code blocks
- Content that doesn't need interactive elements
- Content authored by non-developers
- Faster build times (simpler transformation)

**MDX (.mdx)** - Use for:
- Posts needing embedded React components (charts, interactive demos)
- Custom layouts or styling for specific posts
- Component-based content (tabs, accordions, etc.)
- Technical tutorials with live code examples

**Configuration**:

**gatsby-transformer-remark**:
```javascript
{
  resolve: 'gatsby-transformer-remark',
  options: {
    plugins: [
      'gatsby-remark-images',
      'gatsby-remark-prismjs', // Syntax highlighting
      'gatsby-remark-copy-linked-files',
      'gatsby-remark-smartypants',
    ],
  },
}
```

**gatsby-plugin-mdx**:
```javascript
{
  resolve: 'gatsby-plugin-mdx',
  options: {
    extensions: ['.mdx'],
    gatsbyRemarkPlugins: [
      'gatsby-remark-images',
      'gatsby-remark-prismjs',
    ],
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  },
}
```

**Frontmatter Structure** (same for both):
```yaml
---
title: "Article Title"
date: "2024-01-15"
author: "Joseph Crawford"
category: "Technology"
featuredImage: "./images/featured.jpg"
excerpt: "Brief description for cards and SEO"
tags: ["gatsby", "react", "typescript"]
---
```

**Alternatives Considered**:
- MDX only - Overkill for simple posts, steeper learning curve
- Markdown only - Limits future flexibility for interactive content
- Custom solution - Reinventing the wheel

**Performance Impact**:
- MDX has slightly longer build times (JSX compilation)
- Minimal runtime impact (both compile to HTML)
- Can optimize by using .md for majority of content

---

## 6. Gatsby Plugin Ecosystem

### Decision: Minimal, Purpose-Driven Plugin Selection

**Rationale**: Each plugin adds complexity and build time. Select only essential plugins that provide clear value.

**Selected Plugins**:

**gatsby-plugin-image** (Essential):
- Responsive images with blur-up placeholder
- WebP format with fallbacks
- Lazy loading built-in
- Significant performance improvement

**gatsby-plugin-sharp** + **gatsby-transformer-sharp** (Required by image plugin):
- Image processing at build time
- Multiple size generation for responsive images

**gatsby-source-filesystem** (Essential):
- Sources files from content/ and static/ directories
- Required for Markdown/MDX transformation

**gatsby-transformer-remark** (Essential):
- Transforms .md files to HTML
- Plugin ecosystem for images, code highlighting, etc.

**gatsby-plugin-mdx** (Essential):
- Transforms .mdx files with React components
- Enables interactive content

**gatsby-plugin-manifest** (Essential):
- Generates manifest.json for PWA
- Creates favicon and app icons

**gatsby-plugin-sitemap** (Essential):
- Generates sitemap.xml for SEO
- Automatic, no configuration needed

**Plugins Explicitly Avoided**:
- gatsby-plugin-styled-components - Not using CSS-in-JS (constitution P5)
- gatsby-plugin-lodash - No utility libraries (constitution P6)
- gatsby-plugin-google-analytics - Not in initial scope
- gatsby-plugin-offline - PWA features deferred to future iteration

**Build Performance**:
- Minimal plugin set keeps build times under 2 minutes target
- Each plugin adds ~5-10 seconds to build time
- Can add more plugins in future iterations if needed

---

## 7. TypeScript Strict Mode Configuration

### Decision: Enable All Strict Mode Flags

**Rationale**: Strict mode catches bugs early and improves code quality. Constitution P2 requires strict type safety.

**tsconfig.json Configuration**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "bundler",
    
    // Strict mode flags (all enabled)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    // Module resolution
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["./src/**/*", "./*.ts"],
  "exclude": ["node_modules", "public", ".cache"]
}
```

**Common Strict Mode Issues & Solutions**:

**1. Implicit Any**:
```typescript
// ❌ Error: Parameter 'item' implicitly has 'any' type
items.map(item => item.name)

// ✅ Fixed: Explicit type annotation
items.map((item: Article) => item.name)
// OR use typed array
const items: Article[] = []
items.map(item => item.name)
```

**2. Null/Undefined Checks**:
```typescript
// ❌ Error: Object is possibly 'undefined'
const name = user.name

// ✅ Fixed: Optional chaining
const name = user?.name

// OR null check
if (user) {
  const name = user.name
}
```

**3. Strict Function Types**:
```typescript
// ❌ Error: Type '(x: string | number) => void' not assignable
type Handler = (x: string) => void
const fn: Handler = (x: string | number) => {}

// ✅ Fixed: Match exact signature
const fn: Handler = (x: string) => {}
```

**Benefits**:
- Catches 70%+ of bugs at compile time
- Better IDE autocomplete and IntelliSense
- Safer refactoring
- Self-documenting code through types

---

## 8. Keyboard Navigation Accessibility

### Decision: Full Keyboard Navigation with Focus Management

**Rationale**: WCAG 2.1 Level AA compliance requires keyboard navigation. HybridMag WordPress theme has keyboard support that must be preserved.

**Focus Management Patterns**:

**1. Focus Trapping in Modals/Sidebars**:
```typescript
const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const focusableElements = ref.current.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    ref.current.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => ref.current?.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
};
```

**2. Escape Key to Close Overlays**:
```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

**3. Focus Return After Close**:
```typescript
const MobileMenu = ({ isOpen, onClose }) => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleClose = () => {
    onClose();
    openButtonRef.current?.focus(); // Return focus to trigger button
  };
  
  return (
    <>
      <button ref={openButtonRef} onClick={() => onClose(false)}>
        Open Menu
      </button>
      {isOpen && <Sidebar onClose={handleClose} />}
    </>
  );
};
```

**4. Dropdown Menu Keyboard Navigation** (from HybridMag main.js):
```typescript
const handleMenuKeyboard = (e: React.KeyboardEvent) => {
  const menuItem = e.currentTarget as HTMLElement;
  
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // Toggle dropdown
  } else if (e.key === 'Escape') {
    // Close dropdown
  } else if (e.key === 'ArrowDown') {
    // Focus next item
  } else if (e.key === 'ArrowUp') {
    // Focus previous item
  }
};
```

**ARIA Attributes Required**:
```typescript
<button
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
  aria-label="Toggle mobile menu"
>
  Menu
</button>

<div
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-labelledby="menu-title"
>
  {/* Menu content */}
</div>
```

**Testing Checklist**:
- [ ] Tab key navigates through all interactive elements
- [ ] Shift+Tab navigates backwards
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes overlays and returns focus
- [ ] Arrow keys navigate menus
- [ ] Focus is visible (outline or custom indicator)
- [ ] Focus doesn't escape modals
- [ ] Screen reader announces state changes

---

## 9. Widget Configuration System

### Decision: TypeScript Configuration Files

**Rationale**: WordPress dynamic_sidebar() is replaced by a type-safe configuration system that's easier to maintain and version control.

**Widget Configuration Structure**:
```typescript
// src/data/widgetConfig.ts
export interface WidgetConfig {
  area: 'header-2' | 'header-3' | 'primary' | 'mobile-sidebar' | 'slideout-sidebar';
  widgets: Widget[];
}

type Widget =
  | { type: 'sidebar-posts'; title: string; count: number; source: 'popular' | 'recent' }
  | { type: 'categories'; title: string; showCount: boolean }
  | { type: 'newsletter'; title: string; description: string };

export const widgetAreas: WidgetConfig[] = [
  {
    area: 'primary',
    widgets: [
      {
        type: 'sidebar-posts',
        title: 'Popular Posts',
        count: 5,
        source: 'popular',
      },
      {
        type: 'categories',
        title: 'Categories',
        showCount: true,
      },
      {
        type: 'newsletter',
        title: 'Newsletter',
        description: 'Subscribe for updates',
      },
    ],
  },
  // ... other widget areas
];
```

**Widget Rendering**:
```typescript
// src/components/common/WidgetArea.tsx
export const WidgetArea: React.FC<{ area: string }> = ({ area }) => {
  const config = widgetAreas.find(w => w.area === area);
  if (!config) return null;
  
  return (
    <aside className={`widget-area widget-area-${area}`}>
      {config.widgets.map((widget, index) => {
        switch (widget.type) {
          case 'sidebar-posts':
            return <SidebarPosts key={index} {...widget} />;
          case 'categories':
            return <Categories key={index} {...widget} />;
          case 'newsletter':
            return <Newsletter key={index} {...widget} />;
          default:
            return null;
        }
      })}
    </aside>
  );
};
```

**Benefits vs WordPress Approach**:
- Type safety prevents configuration errors
- Version controlled (no database state)
- Easy to test (pure functions)
- No runtime widget registration needed
- Clear widget capabilities via TypeScript unions

**Alternatives Considered**:
- JSON configuration files - No type safety
- CMS-based widget management - Too complex for initial setup
- Hardcoded widgets in components - Not flexible enough

---

## 10. Image Optimization Strategy

### Decision: gatsby-plugin-image with Local Assets

**Rationale**: Gatsby's image plugin provides automatic optimization, responsive images, and lazy loading with minimal configuration.

**Implementation**:

**1. GraphQL Query for Images**:
```typescript
export const query = graphql`
  query ArticleQuery($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      frontmatter {
        title
        featuredImage {
          childImageSharp {
            gatsbyImageData(
              width: 1200
              placeholder: BLURRED
              formats: [AUTO, WEBP, AVIF]
            )
          }
        }
      }
    }
  }
`;
```

**2. Component Usage**:
```typescript
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

export const Article = ({ data }) => {
  const image = getImage(data.mdx.frontmatter.featuredImage);
  
  return (
    <GatsbyImage
      image={image}
      alt={data.mdx.frontmatter.title}
      className="featured-image"
    />
  );
};
```

**Optimization Features**:
- Multiple formats (WebP, AVIF with fallbacks)
- Responsive srcset for different screen sizes
- Blur-up placeholder or dominant color
- Lazy loading with Intersection Observer
- Optimized at build time (no runtime cost)

**Image Placement**:
- Article images: `content/posts/images/`
- Theme assets: `static/images/`
- Generated icons: `static/images/icon.svg`

**Build Performance**:
- Images processed in parallel
- Results cached between builds
- Typically adds 10-20 seconds to build time

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **WordPress Hooks** | Component Composition | React idiom, type-safe, maintainable |
| **Slider** | Swiper React Components | Official React support, TypeScript types |
| **Dark Mode** | Tailwind class + localStorage | Tailwind dark: prefix, persists preference |
| **CSS** | Tailwind CSS with HybridMag tokens | Utility-first, consistent, maintainable |
| **Content** | Both Markdown and MDX | Flexibility for simple & advanced posts |
| **Plugins** | Minimal, essential only | Fast builds, low complexity |
| **TypeScript** | Strict mode enabled | Catch bugs early, better DX |
| **Keyboard Nav** | Full focus management | WCAG compliance, accessibility |
| **Widgets** | TypeScript config files | Type-safe, version controlled |
| **Images** | gatsby-plugin-image | Automatic optimization, responsive |

---

## Technical Risks & Mitigations

**Risk 1: WordPress hook system too complex to replicate**  
**Mitigation**: Start with simplest hooks, establish patterns early, document mappings

**Risk 2: Dark mode localStorage unavailable**  
**Mitigation**: Fallback to prefers-color-scheme media query

**Risk 3: Swiper bundle size impacts performance**  
**Mitigation**: Lazy load, use tree-shaking, monitor Lighthouse scores

**Risk 4: CSS custom properties browser support**  
**Mitigation**: Target modern browsers only (per spec assumptions)

**Risk 5: Build time exceeds 2-minute target**  
**Mitigation**: Optimize images beforehand, use Gatsby cache, monitor incremental builds

---

## References

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [Swiper React Documentation](https://swiperjs.com/react)
- [TypeScript Handbook - Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [WCAG 2.1 Keyboard Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [gatsby-plugin-image Documentation](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/)

---

**Next Steps**: Use these research findings to guide implementation tasks. Refer back when making technical decisions or encountering implementation challenges.
