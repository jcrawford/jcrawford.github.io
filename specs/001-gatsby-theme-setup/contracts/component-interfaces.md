# Component Interfaces (Contracts)

**Feature**: 001-gatsby-theme-setup  
**Date**: November 5, 2025  
**Purpose**: Define TypeScript interfaces and behavior contracts for all React components

## Overview

This document specifies the props interfaces, behavior contracts, and integration points for all React components in the HybridMag Gatsby site. Each component must implement these interfaces with strict TypeScript typing as per constitution P2.

---

## Table of Contents

1. [Layout Components](#layout-components)
2. [Navigation Components](#navigation-components)
3. [Featured Components](#featured-components)
4. [Interactive Components](#interactive-components)
5. [Widget Components](#widget-components)
6. [Common Components](#common-components)
7. [SEO Components](#seo-components)
8. [Utility Components](#utility-components)

---

## Layout Components

### Layout

**Purpose**: Main layout wrapper for all pages

**File**: `src/components/layout/Layout.tsx`

**Props Interface**:
```typescript
interface LayoutProps {
  children: React.ReactNode;
  headerLayout?: 'default' | 'large';
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  className?: string;
}
```

**Behavior Contract**:
- MUST render `<Header>` component with headerLayout prop
- MUST render children in `<main>` element with appropriate ARIA roles
- MUST render `<Footer>` component
- MUST conditionally render sidebar based on `showSidebar` prop
- MUST apply dark mode class (`hm-dark`) from useDarkMode hook
- MUST include skip-to-content link for accessibility
- SHOULD apply sticky header behavior on scroll

**Usage**:
```typescript
<Layout headerLayout="large" showSidebar={true}>
  <HomePage />
</Layout>
```

---

### Header

**Purpose**: Site header with branding, navigation, and interactive elements

**File**: `src/components/layout/Header.tsx`

**Props Interface**:
```typescript
interface HeaderProps {
  layout: 'default' | 'large';
  className?: string;
}
```

**Behavior Contract**:
- MUST render site branding (logo/title) with link to homepage
- MUST render `<PrimaryNav>` component
- MUST render `<SecondaryNav>` component (if items exist)
- MUST render `<SearchToggle>` component
- MUST render `<DarkModeToggle>` component
- MUST render `<MobileMenuToggle>` component (mobile viewport only)
- MUST apply conditional layout classes based on `layout` prop
- MUST render breaking news ticker if configured
- MUST include ARIA landmarks (`role="banner"`)
- SHOULD become sticky on scroll down
- SHOULD slide up/hide on scroll down, show on scroll up

**Layout Variants**:

**Default Layout**:
- Top bar with secondary nav + social links
- Main header row with logo, primary nav, search/dark mode toggles

**Large Layout**:
- Top bar with secondary nav
- Large header inner section with left/right columns
- Widget areas in header (header-2, header-3)
- Primary navigation below header inner

**Usage**:
```typescript
<Header layout="large" />
```

---

### Footer

**Purpose**: Site footer with widget areas, social links, and legal information

**File**: `src/components/layout/Footer.tsx`

**Props Interface**:
```typescript
interface FooterProps {
  className?: string;
}
```

**Behavior Contract**:
- MUST render 4 footer widget areas (`footer-1` through `footer-4`)
- MUST render footer bottom section with copyright text
- MUST render legal links (Privacy, Terms, etc.)
- MUST render `<SocialNav>` if configured
- MUST include ARIA landmark (`role="contentinfo"`)
- SHOULD render newsletter signup if configured
- MAY render back-to-top button

**Usage**:
```typescript
<Footer />
```

---

## Navigation Components

### PrimaryNav

**Purpose**: Main site navigation with dropdown support

**File**: `src/components/navigation/PrimaryNav.tsx`

**Props Interface**:
```typescript
interface PrimaryNavProps {
  items: NavigationItem[];
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  external?: boolean;
  icon?: string;
  children?: NavigationItem[];
  megaMenu?: boolean;
}
```

**Behavior Contract**:
- MUST render all top-level navigation items as links
- MUST render dropdown menus for items with `children`
- MUST support nested dropdowns (2 levels deep minimum)
- MUST show dropdown on hover (desktop) and click (mobile)
- MUST apply `aria-expanded` to parent items with dropdowns
- MUST apply `aria-haspopup="true"` to dropdown triggers
- MUST support keyboard navigation (Tab, Arrow keys, Enter, Escape)
- MUST close dropdown when clicking outside or pressing Escape
- MUST apply active/current classes to active page link
- SHOULD render icon if provided in NavigationItem

**Keyboard Navigation**:
- Tab: Move to next menu item
- Shift+Tab: Move to previous menu item
- Enter/Space: Activate link or toggle dropdown
- Escape: Close dropdown
- Arrow Down: Open dropdown or move to first child
- Arrow Up: Move to previous child
- Arrow Right: Open nested dropdown
- Arrow Left: Close nested dropdown and return to parent

**Usage**:
```typescript
import { primaryNav } from '@/data/navigation';

<PrimaryNav items={primaryNav} />
```

---

### SecondaryNav

**Purpose**: Top bar navigation for secondary/utility links

**File**: `src/components/navigation/SecondaryNav.tsx`

**Props Interface**:
```typescript
interface SecondaryNavProps {
  items: NavigationItem[];
  className?: string;
}
```

**Behavior Contract**:
- MUST render all navigation items as links
- MUST NOT support dropdown menus (flat list only)
- MUST support external links (open in new tab with `rel="noopener noreferrer"`)
- SHOULD render icons if provided
- MAY apply special styling to CTA links

**Usage**:
```typescript
import { secondaryNav } from '@/data/navigation';

<SecondaryNav items={secondaryNav} />
```

---

### SocialNav

**Purpose**: Social media link icons

**File**: `src/components/navigation/SocialNav.tsx`

**Props Interface**:
```typescript
interface SocialNavProps {
  links: SocialLinks;
  className?: string;
  iconSize?: number;
}

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
  pinterest?: string;
  website?: string;
}
```

**Behavior Contract**:
- MUST render icon links for all provided social platforms
- MUST open links in new tab with `target="_blank" rel="noopener noreferrer"`
- MUST include `aria-label` for each icon (e.g., "Follow us on Twitter")
- MUST render SVG icons from `src/utils/icons.tsx`
- SHOULD support configurable icon size via `iconSize` prop
- SHOULD hide if no links provided

**Usage**:
```typescript
import { siteConfig } from '@/data/siteConfig';

<SocialNav links={siteConfig.social} iconSize={20} />
```

---

### MobileNav

**Purpose**: Mobile slideout navigation menu

**File**: `src/components/navigation/MobileNav.tsx`

**Props Interface**:
```typescript
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  primaryItems: NavigationItem[];
  secondaryItems?: NavigationItem[];
}
```

**Behavior Contract**:
- MUST render in a slideout panel (slide from left or right)
- MUST render primary navigation items with accordion-style dropdowns
- MUST render secondary navigation items (if provided)
- MUST render `<DarkModeToggle>` in mobile menu
- MUST render `<SocialNav>` in mobile menu
- MUST apply focus trap when open (Tab cycles within menu)
- MUST close on Escape key press
- MUST close on overlay/backdrop click
- MUST return focus to trigger button when closed
- MUST add `mobile-menu-opened` class to `<body>` when open
- MUST prevent body scroll when open
- MUST include close button with accessible label
- SHOULD animate slide-in/slide-out transition

**Usage**:
```typescript
const [menuOpen, setMenuOpen] = useState(false);

<MobileNav
  isOpen={menuOpen}
  onClose={() => setMenuOpen(false)}
  primaryItems={primaryNav}
  secondaryItems={secondaryNav}
/>
```

---

## Featured Components

### FeaturedSlider

**Purpose**: Hero slider for featured articles using Swiper

**File**: `src/components/featured/FeaturedSlider.tsx`

**Props Interface**:
```typescript
interface FeaturedSliderProps {
  articles: FeaturedArticle[];
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

interface FeaturedArticle {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: IGatsbyImageData;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  date: string;
}
```

**Behavior Contract**:
- MUST use Swiper React components (Swiper, SwiperSlide)
- MUST enable Navigation module (prev/next arrows)
- MUST enable Pagination module (dots)
- MUST enable Autoplay module if `autoplay={true}`
- MUST enable Lazy loading module for images
- MUST support touch/swipe gestures
- MUST pause autoplay on hover or focus
- MUST render article title, excerpt, category badge, and date
- MUST render GatsbyImage for featuredImage
- MUST link entire slide to article URL
- MUST support keyboard navigation (Arrow keys, Tab)
- MUST include `aria-label="Featured articles slider"`
- SHOULD gracefully handle single slide (hide navigation)
- SHOULD show loading placeholder while images load

**Swiper Configuration**:
```typescript
modules={[Navigation, Pagination, Autoplay, Lazy]}
navigation={true}
pagination={{ clickable: true }}
autoplay={{ delay: autoplayDelay || 5000, pauseOnMouseEnter: true }}
lazy={true}
slidesPerView={1}
loop={articles.length > 1}
```

**Usage**:
```typescript
<FeaturedSlider
  articles={featuredArticles}
  autoplay={true}
  autoplayDelay={5000}
/>
```

---

### FeaturedSmall

**Purpose**: Small featured posts widget for sidebar

**File**: `src/components/featured/FeaturedSmall.tsx`

**Props Interface**:
```typescript
interface FeaturedSmallProps {
  articles: FeaturedArticle[];
  count?: number;
  className?: string;
}
```

**Behavior Contract**:
- MUST limit displayed articles to `count` prop (default 3)
- MUST render article thumbnail, title, and date
- MUST link to article URL
- MUST display category badge
- SHOULD use GatsbyImage for thumbnails

**Usage**:
```typescript
<FeaturedSmall articles={articles} count={3} />
```

---

### FeaturedTabs

**Purpose**: Tabbed featured content (Popular, Recent, Comments)

**File**: `src/components/featured/FeaturedTabs.tsx`

**Props Interface**:
```typescript
interface FeaturedTabsProps {
  tabs: FeaturedTab[];
  defaultTab?: number;
  className?: string;
}

interface FeaturedTab {
  id: string;
  label: string;
  articles: FeaturedArticle[];
}
```

**Behavior Contract**:
- MUST render tab buttons for each tab
- MUST render active tab content
- MUST apply ARIA attributes (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
- MUST support keyboard navigation (Arrow keys to switch tabs, Tab to enter panel)
- MUST apply `aria-selected` to active tab
- MUST link `aria-controls` to tab panel ID
- SHOULD animate content transition between tabs

**Usage**:
```typescript
<FeaturedTabs
  tabs={[
    { id: 'popular', label: 'Popular', articles: popularArticles },
    { id: 'recent', label: 'Recent', articles: recentArticles },
  ]}
  defaultTab={0}
/>
```

---

## Interactive Components

### DarkModeToggle

**Purpose**: Toggle button for dark mode theme

**File**: `src/components/interactive/DarkModeToggle.tsx`

**Props Interface**:
```typescript
interface DarkModeToggleProps {
  className?: string;
  showLabel?: boolean;
}
```

**Behavior Contract**:
- MUST use `useDarkMode` custom hook
- MUST toggle `hm-dark` class on `<html>` element
- MUST persist state to localStorage (`hybridmagDarkMode` key)
- MUST render sun icon when light mode active
- MUST render moon icon when dark mode active
- MUST include `aria-label` describing current state
- MUST update `aria-pressed` based on state
- SHOULD animate icon transition
- MAY show text label if `showLabel={true}`

**Usage**:
```typescript
<DarkModeToggle showLabel={false} />
```

---

### MobileMenuToggle

**Purpose**: Hamburger button to open mobile navigation

**File**: `src/components/interactive/MobileMenuToggle.tsx`

**Props Interface**:
```typescript
interface MobileMenuToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}
```

**Behavior Contract**:
- MUST render hamburger icon (3 horizontal lines)
- MUST transition to "X" close icon when `isOpen={true}`
- MUST trigger `onClick` handler when clicked
- MUST include `aria-label="Toggle mobile menu"`
- MUST include `aria-expanded` based on `isOpen` state
- MUST include `aria-controls="mobile-menu"`
- SHOULD animate icon transition

**Usage**:
```typescript
<MobileMenuToggle
  isOpen={menuOpen}
  onClick={() => setMenuOpen(!menuOpen)}
/>
```

---

### SearchToggle

**Purpose**: Toggle button for search overlay (UI-only placeholder)

**File**: `src/components/interactive/SearchToggle.tsx`

**Props Interface**:
```typescript
interface SearchToggleProps {
  className?: string;
}
```

**Behavior Contract**:
- MUST render search icon button
- MUST toggle search overlay visibility on click
- MUST include `aria-label="Toggle search"`
- MUST include `aria-expanded` based on overlay state
- MUST focus search input when overlay opens
- MUST close overlay on Escape key
- MUST close overlay on backdrop click
- NOTE: Search functionality is UI-only placeholder for initial setup

**Usage**:
```typescript
<SearchToggle />
```

---

### SearchOverlay

**Purpose**: Full-screen search overlay (UI-only placeholder)

**File**: `src/components/interactive/SearchOverlay.tsx`

**Props Interface**:
```typescript
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Behavior Contract**:
- MUST render full-screen overlay when `isOpen={true}`
- MUST render search input field
- MUST render close button
- MUST focus search input on mount
- MUST close on Escape key press
- MUST close on backdrop click
- MUST prevent body scroll when open
- MUST include `role="dialog"` and `aria-modal="true"`
- NOTE: Search results/functionality deferred to future iteration

**Usage**:
```typescript
<SearchOverlay
  isOpen={searchOpen}
  onClose={() => setSearchOpen(false)}
/>
```

---

### SlideoutSidebar

**Purpose**: Slideout sidebar for additional content (e.g., filters, widgets)

**File**: `src/components/interactive/SlideoutSidebar.tsx`

**Props Interface**:
```typescript
interface SlideoutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}
```

**Behavior Contract**:
- MUST slide in from `position` side (default 'right')
- MUST render `children` as sidebar content
- MUST render close button
- MUST add `slideout-opened` class to `<body>` when open
- MUST prevent body scroll when open
- MUST render overlay/backdrop
- MUST close on Escape key press
- MUST close on backdrop click
- MUST apply focus trap when open
- MUST return focus to trigger button when closed
- MUST include `role="complementary"` or `role="dialog"`
- SHOULD animate slide-in/slide-out transition

**Usage**:
```typescript
<SlideoutSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  position="right"
>
  <WidgetArea area="slideout-sidebar" />
</SlideoutSidebar>
```

---

### BreakingNews

**Purpose**: Breaking news ticker in header

**File**: `src/components/interactive/BreakingNews.tsx`

**Props Interface**:
```typescript
interface BreakingNewsProps {
  items: BreakingNewsItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

interface BreakingNewsItem {
  id: string;
  text: string;
  url: string;
  startDate?: string;
  endDate?: string;
}
```

**Behavior Contract**:
- MUST render "Breaking News" label
- MUST render scrolling/rotating news items
- MUST filter items by startDate/endDate (if provided)
- MUST link each item to its URL
- MUST support autoplay rotation if `autoplay={true}`
- MUST pause autoplay on hover
- SHOULD use Swiper for smooth transitions
- MAY include prev/next arrows

**Usage**:
```typescript
<BreakingNews
  items={siteConfig.breakingNews}
  autoplay={true}
  autoplayDelay={5000}
/>
```

---

## Widget Components

### WidgetArea

**Purpose**: Container for rendering widget areas from configuration

**File**: `src/components/common/WidgetArea.tsx`

**Props Interface**:
```typescript
interface WidgetAreaProps {
  area: WidgetAreaType;
  className?: string;
}

type WidgetAreaType = 
  | 'header-2' 
  | 'header-3' 
  | 'primary' 
  | 'mobile-sidebar' 
  | 'slideout-sidebar' 
  | 'footer-1' 
  | 'footer-2' 
  | 'footer-3' 
  | 'footer-4';
```

**Behavior Contract**:
- MUST load widget configuration from `widgetConfig.ts` for specified `area`
- MUST render each configured widget in order
- MUST map widget type to corresponding component (switch statement)
- MUST return `null` if no widgets configured for area
- MUST apply area-specific class names
- SHOULD wrap in `<aside>` element with ARIA role

**Widget Type Mapping**:
```typescript
switch (widget.type) {
  case 'sidebar-posts': return <SidebarPosts {...widget} />;
  case 'categories': return <Categories {...widget} />;
  case 'newsletter': return <Newsletter {...widget} />;
  case 'search': return <Search {...widget} />;
  case 'tag-cloud': return <TagCloud {...widget} />;
  default: return null;
}
```

**Usage**:
```typescript
<WidgetArea area="primary" />
<WidgetArea area="footer-1" />
```

---

### SidebarPosts

**Purpose**: Display popular or recent posts in sidebar

**File**: `src/components/widgets/SidebarPosts.tsx`

**Props Interface**:
```typescript
interface SidebarPostsProps {
  type: 'sidebar-posts';
  title: string;
  count: number;
  source: 'popular' | 'recent';
  showThumbnail?: boolean;
}
```

**Behavior Contract**:
- MUST render widget title as `<h3>`
- MUST fetch `count` articles from GraphQL based on `source`
- MUST render article list with title, date, and optional thumbnail
- MUST link each article to its URL
- SHOULD use GatsbyImage for thumbnails if `showThumbnail={true}`
- SHOULD display placeholder if no articles found

**GraphQL Query**:
```graphql
# For recent posts
sort: { frontmatter: { date: DESC } }
limit: $count

# For popular posts
sort: { frontmatter: { views: DESC } } # Or custom popularity metric
limit: $count
```

**Usage**:
```typescript
<SidebarPosts
  type="sidebar-posts"
  title="Popular Posts"
  count={5}
  source="popular"
  showThumbnail={true}
/>
```

---

### Categories

**Purpose**: Display category list widget

**File**: `src/components/widgets/Categories.tsx`

**Props Interface**:
```typescript
interface CategoriesProps {
  type: 'categories';
  title: string;
  showCount: boolean;
  hierarchical?: boolean;
}
```

**Behavior Contract**:
- MUST render widget title as `<h3>`
- MUST fetch all categories from GraphQL or `categories.ts`
- MUST render category list as `<ul>`
- MUST link each category to its archive page
- MUST display post count if `showCount={true}`
- SHOULD support hierarchical display if `hierarchical={true}`

**Usage**:
```typescript
<Categories
  type="categories"
  title="Categories"
  showCount={true}
  hierarchical={false}
/>
```

---

### Newsletter

**Purpose**: Newsletter signup form widget

**File**: `src/components/widgets/Newsletter.tsx`

**Props Interface**:
```typescript
interface NewsletterProps {
  type: 'newsletter';
  title: string;
  description: string;
}
```

**Behavior Contract**:
- MUST render widget title as `<h3>`
- MUST render description text
- MUST render email input field with `type="email"`
- MUST render submit button
- MUST validate email format before submission
- MUST display success/error messages
- MUST include link to privacy policy
- SHOULD disable submit button during submission
- NOTE: Form submission endpoint configured in `siteConfig.newsletter.submitUrl`

**Usage**:
```typescript
<Newsletter
  type="newsletter"
  title="Stay Updated"
  description="Subscribe for weekly updates"
/>
```

---

### TagCloud

**Purpose**: Display tag cloud widget

**File**: `src/components/widgets/TagCloud.tsx`

**Props Interface**:
```typescript
interface TagCloudProps {
  type: 'tag-cloud';
  title: string;
  maxTags: number;
}
```

**Behavior Contract**:
- MUST render widget title as `<h3>`
- MUST fetch tags from all articles (GraphQL)
- MUST limit to `maxTags` most popular tags
- MUST render tags as links to tag archive pages
- SHOULD apply font-size weighting based on tag frequency

**Usage**:
```typescript
<TagCloud
  type="tag-cloud"
  title="Popular Tags"
  maxTags={20}
/>
```

---

## Common Components

### ArticleCard

**Purpose**: Reusable article preview card

**File**: `src/components/common/ArticleCard.tsx`

**Props Interface**:
```typescript
interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage?: IGatsbyImageData;
    category: {
      name: string;
      slug: string;
      color: string;
    };
    author: {
      name: string;
      avatar?: IGatsbyImageData;
    };
    date: string;
    readingTime?: number;
  };
  variant?: 'default' | 'horizontal' | 'minimal';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
  className?: string;
}
```

**Behavior Contract**:
- MUST render article featured image (GatsbyImage)
- MUST render category badge with link to category page
- MUST render article title as `<h3>` linked to article URL
- MUST render publish date (formatted with dayjs)
- MUST conditionally render excerpt if `showExcerpt={true}`
- MUST conditionally render author info if `showAuthor={true}`
- MUST conditionally render reading time if `showReadingTime={true}`
- MUST apply variant class for layout styling
- SHOULD render placeholder image if featuredImage missing
- SHOULD use semantic HTML (`<article>` element)

**Variants**:
- **default**: Vertical card with image on top
- **horizontal**: Image on left, content on right
- **minimal**: No image, title + date only

**Usage**:
```typescript
<ArticleCard
  article={article}
  variant="default"
  showExcerpt={true}
  showAuthor={true}
  showReadingTime={true}
/>
```

---

### Button

**Purpose**: Reusable button component (CTA, primary, secondary)

**File**: `src/components/common/Button.tsx`

**Props Interface**:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'cta' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  external?: boolean;
}
```

**Behavior Contract**:
- MUST render as `<button>` if `onClick` provided
- MUST render as `<a>` (Gatsby Link) if `href` provided
- MUST apply variant class for styling
- MUST apply size class for sizing
- MUST handle disabled state
- MUST open external links in new tab if `external={true}`
- MUST include `rel="noopener noreferrer"` for external links
- SHOULD support icon rendering alongside children

**Usage**:
```typescript
<Button variant="cta" size="md" href="/subscribe">
  Subscribe Now
</Button>

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

---

### Icon

**Purpose**: Wrapper for SVG icons from utils/icons.tsx

**File**: `src/components/common/Icon.tsx`

**Props Interface**:
```typescript
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  'aria-label'?: string;
}
```

**Behavior Contract**:
- MUST load SVG icon from `src/utils/icons.tsx` by `name`
- MUST apply `size` to width/height (default 24px)
- MUST apply `color` to fill/stroke if provided
- MUST return null if icon name not found
- SHOULD include `aria-label` for standalone icons
- SHOULD apply `aria-hidden="true"` for decorative icons

**Usage**:
```typescript
<Icon name="search" size={20} color="#404040" />
<Icon name="moon" size={24} aria-label="Dark mode" />
```

---

### Pagination

**Purpose**: Pagination controls for blog archives

**File**: `src/components/common/Pagination.tsx`

**Props Interface**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}
```

**Behavior Contract**:
- MUST render page number links
- MUST render "Previous" and "Next" buttons
- MUST disable Previous on page 1
- MUST disable Next on last page
- MUST highlight current page
- MUST apply ARIA attributes (`aria-current="page"`, `aria-label`)
- SHOULD show ellipsis (...) for large page ranges
- SHOULD limit visible page numbers to 5-7 around current page

**Usage**:
```typescript
<Pagination
  currentPage={2}
  totalPages={10}
  baseUrl="/blog"
/>
```

---

### Breadcrumbs

**Purpose**: Breadcrumb navigation trail

**File**: `src/components/common/Breadcrumbs.tsx`

**Props Interface**:
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  url?: string;
}
```

**Behavior Contract**:
- MUST render breadcrumb list with `<nav>` and `<ol>`
- MUST link all items except the last (current page)
- MUST apply `aria-current="page"` to last item
- MUST include `aria-label="Breadcrumbs"` on `<nav>`
- MUST use structured data (Schema.org BreadcrumbList)
- SHOULD separate items with "/" or "›" character

**Usage**:
```typescript
<Breadcrumbs
  items={[
    { label: 'Home', url: '/' },
    { label: 'Blog', url: '/blog' },
    { label: 'Article Title' },
  ]}
/>
```

---

## SEO Components

### SEO

**Purpose**: Meta tags and structured data for SEO

**File**: `src/components/seo/SEO.tsx`

**Props Interface**:
```typescript
interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  article?: boolean;
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  category?: string;
  tags?: string[];
}
```

**Behavior Contract**:
- MUST set page title with site name suffix
- MUST set meta description
- MUST set Open Graph tags (og:title, og:description, og:image, og:type)
- MUST set Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- MUST set canonical URL
- MUST set viewport meta tag
- MUST set charset meta tag
- SHOULD include Article schema if `article={true}`
- SHOULD include BreadcrumbList schema
- SHOULD include Organization schema for homepage

**Usage**:
```typescript
<SEO
  title="Article Title"
  description="Article description"
  image="/images/article-featured.jpg"
  article={true}
  publishedDate="2024-01-15"
  author="Joseph Crawford"
  category="Web Development"
  tags={["gatsby", "react"]}
/>
```

---

## Utility Components

### Image

**Purpose**: Wrapper for GatsbyImage with fallback handling

**File**: `src/components/common/Image.tsx`

**Props Interface**:
```typescript
interface ImageProps {
  image?: IGatsbyImageData;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}
```

**Behavior Contract**:
- MUST render GatsbyImage if `image` provided
- MUST render fallback `<img>` if `image` missing and `fallbackSrc` provided
- MUST render placeholder if both missing
- MUST include `alt` attribute
- SHOULD use default placeholder from `static/images/default.jpg`

**Usage**:
```typescript
<Image
  image={article.featuredImage}
  alt={article.title}
  fallbackSrc="/images/default.jpg"
/>
```

---

## Custom Hooks Contracts

### useDarkMode

**Purpose**: Manage dark mode state with localStorage persistence

**File**: `src/hooks/useDarkMode.ts`

**Return Type**:
```typescript
type UseDarkModeReturn = [
  darkMode: boolean,
  toggleDarkMode: () => void
];
```

**Behavior Contract**:
- MUST check localStorage on mount (`hybridmagDarkMode` key)
- MUST fallback to `prefers-color-scheme` media query if localStorage empty
- MUST add/remove `hm-dark` class on `<html>` element
- MUST persist state to localStorage on change
- MUST return current state and toggle function
- SHOULD handle localStorage unavailable (private browsing)

---

### useKeyboardNav

**Purpose**: Manage keyboard navigation for dropdowns/menus

**File**: `src/hooks/useKeyboardNav.ts`

**Return Type**:
```typescript
interface UseKeyboardNavReturn {
  handleKeyDown: (e: React.KeyboardEvent) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}
```

**Behavior Contract**:
- MUST handle Arrow keys (Up/Down for vertical, Left/Right for horizontal)
- MUST handle Enter/Space for activation
- MUST handle Escape for closing
- MUST handle Tab for natural flow (don't prevent default)
- MUST cycle focus within bounds
- SHOULD prevent default for handled keys

---

### useLocalStorage

**Purpose**: Abstraction for localStorage with error handling

**File**: `src/hooks/useLocalStorage.ts`

**Return Type**:
```typescript
type UseLocalStorageReturn<T> = [
  value: T,
  setValue: (value: T) => void,
  removeValue: () => void
];
```

**Behavior Contract**:
- MUST read from localStorage on mount
- MUST parse JSON values
- MUST handle localStorage unavailable (return default value)
- MUST handle JSON parse errors (return default value)
- MUST update localStorage on setValue call
- MUST remove key on removeValue call

---

### useMediaQuery

**Purpose**: React hook for responsive breakpoints

**File**: `src/hooks/useMediaQuery.ts`

**Return Type**:
```typescript
type UseMediaQueryReturn = boolean;
```

**Behavior Contract**:
- MUST use matchMedia API
- MUST add event listener for media query changes
- MUST return current match state
- MUST clean up listener on unmount
- SHOULD handle SSR (return false during SSR)

**Usage**:
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
```

---

## Summary

**Total Components**: 35+  
**Custom Hooks**: 4

### Component Hierarchy

```
<Layout>
  <Header>
    <SecondaryNav />
    <BreakingNews />
    <PrimaryNav />
    <SearchToggle />
    <DarkModeToggle />
    <MobileMenuToggle />
  </Header>
  
  <main>
    <FeaturedSlider />
    
    <div className="content-area">
      <ArticleCard />
      <ArticleCard />
      <Pagination />
    </div>
    
    <aside className="sidebar">
      <WidgetArea area="primary">
        <SidebarPosts />
        <Categories />
        <Newsletter />
      </WidgetArea>
    </aside>
  </main>
  
  <Footer>
    <WidgetArea area="footer-1" />
    <WidgetArea area="footer-2" />
    <WidgetArea area="footer-3" />
    <WidgetArea area="footer-4" />
    <SocialNav />
  </Footer>
  
  <MobileNav />
  <SearchOverlay />
  <SlideoutSidebar />
</Layout>
```

### Required Shared Types

All interfaces should be defined in `src/types/index.ts` and imported where needed:

```typescript
// src/types/index.ts
export interface Article { /* ... */ }
export interface Author { /* ... */ }
export interface Category { /* ... */ }
export interface NavigationItem { /* ... */ }
export interface SocialLinks { /* ... */ }
export interface WidgetConfig { /* ... */ }
export interface BreakingNewsItem { /* ... */ }
// ... etc
```

### Testing Strategy

While unit testing is not required (Constitution P10), each component should be manually tested for:

1. **Rendering**: Component renders without errors
2. **Props**: All required props handled correctly
3. **State**: Internal state changes work as expected
4. **Events**: Click/keyboard handlers trigger correctly
5. **Accessibility**: ARIA attributes present and correct
6. **Responsive**: Component adapts to mobile/desktop viewports
7. **Dark Mode**: Component styles adapt in dark mode

---

**Next Steps**: Use these contracts when implementing components to ensure consistency and type safety across the codebase.
