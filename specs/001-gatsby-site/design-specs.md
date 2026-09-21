# Design Specifications: HybridMag Theme

**Source**: `design/` folder (HybridMag WordPress theme)  
**Date**: November 5, 2025  
**Purpose**: Complete design specifications extracted from reference design to ensure 100% replication accuracy

---

## 1. Typography Specifications

### 1.1 Font Family

**Primary Font**: Figtree  
**Fallback**: System fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif`)  
**Font Loading**: `font-display: swap` for optimal performance

### 1.2 Font Weights Available

| Weight | Usage |
|--------|-------|
| 300 | Light (rarely used) |
| 400 | Regular (body text, default) |
| 500 | Medium (emphasis) |
| 600 | Semibold (headings, navigation) |
| 700 | Bold (strong emphasis) |
| 800 | Extra Bold (rarely used) |
| 900 | Black (rarely used) |

**Primary Weights Used**: 400 (body), 600 (headings), 700 (category labels)

### 1.3 Font Sizes

Extracted from CSS custom properties:

| Variable | Value | rem | Usage |
|----------|-------|-----|-------|
| `--hybridmag-font-size-base` | 16px | 1rem | Base font size |
| `--hybridmag-font-size-xxxs` | 0.75rem | 12px | Tiny text |
| `--hybridmag-font-size-xxs` | 0.813rem | 13px | Category labels, meta |
| `--hybridmag-font-size-xs` | 0.875rem | 14px | Small meta text |
| `--hybridmag-font-size-sm` | 0.938rem | 15px | Small body text |
| `--hybridmag-font-size-md` | 1.063rem | 17px | Medium body text |
| `--hybridmag-font-size-amd` | 1.125rem | 18px | Above medium |
| `--hybridmag-font-size-lg` | 1.313rem | 21px | Large text, section headers |
| `--hybridmag-font-size-xl` | 1.5rem | 24px | Article titles (standard cards) |
| `--hybridmag-font-size-xxl` | 1.625rem | 26px | Large titles |
| `--hybridmag-font-size-xxxl` | 2rem | 32px | Site title, hero headings |
| `--hybridmag-font-size-xxxxl` | 2.25rem | 36px | Extra large headings |

### 1.4 Line Heights

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-line-height-body` | 1.5 | Body text, general content |
| `--hybridmag-line-height-article` | 1.7 | Article body content (increased readability) |
| `--hybridmag-line-height-headings` | 1.3 | Headings, titles |
| `--hybridmag-line-height-pre` | 1.6 | Code blocks, preformatted text |

### 1.5 Font Weight for Headings

| Element | Weight | Font Size | Line Height |
|---------|--------|-----------|-------------|
| Site Title (H1) | 600 | 2rem (32px) @ desktop, 2rem @ mobile | 1.3 |
| Article Title (Large Card) | 600 | 1.5rem (24px) | 1.2 |
| Article Title (Small Card) | 600 | 1rem (16px) | 1.2 |
| Slider Title | 600 | 1.313rem (21px) | 1.2 |
| Section Headers | 600 | 1.313rem (21px) | Normal |
| Body Text | 400 | 1rem (16px) | 1.5/1.7 |

### 1.6 Letter Spacing

**Default**: Normal (no custom letter-spacing applied)  
**Special Cases**: None detected in design reference

---

## 2. Color Palette

### 2.1 Light Mode Colors (Default)

#### Brand Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-color-primary` | `#65bc7b` | Primary accent (links on hover, buttons, highlights) |
| `--hybridmag-color-tertiary` | `#272c30` | Secondary dark color |
| `--hybridmag-color-main-menu` | `#272c30` | Navigation menu text |

#### Text Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-color-text-main` | `#404040` | Primary body text |
| `--hybridmag-color-text-light` | `#7D7D7D` | Secondary text, meta information |
| `--hybridmag-color-text-headings` | `#222222` | Headings, titles |
| `--hybridmag-color-link` | `#0a0808` | Default link color |
| `--hybridmag-color-link-hover` | `var(--hybridmag-color-primary)` | Link hover state (#65bc7b) |
| `--hybridmag-color-link-visited` | `#5d7ddb` | Visited links |

#### UI Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-color-border` | `#E0E0E0` | Borders, dividers |
| `--hybridmag-color-input-border` | `#ccc` | Form input borders |
| `--hybridmag-color-background-pre` | `#eeeeee` | Code block backgrounds |
| `--hybridmag-color-bg-cl-sep-content` | `#ffffff` | Main content background |

#### Button Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-color-button-background` | `var(--hybridmag-color-primary)` | Button background (#65bc7b) |
| `--hybridmag-color-button-text` | `#ffffff` | Button text color |
| `--hybridmag-color-button-hover-text` | `#ffffff` | Button hover text |
| `--hybridmag-color-button-hover-background` | `#222222` | Button hover background |
| `--hybridmag-color-button-focus-background` | `#111111` | Button focus background |

### 2.2 Dark Mode Colors

**Implementation**: CSS custom properties should be overridden when `[data-theme="dark"]` or `.dark-mode` class is applied to `<body>` or `:root`.

**Dark Mode Palette** (to be defined during implementation based on light mode inversions):

- Background: Dark (near black)
- Text: Light (near white)
- Primary: Maintain #65bc7b or adjust for better contrast
- Borders: Lighter shade of dark background

### 2.3 Category Colors

**Default**: Categories inherit text colors  
**Badge Style**: Background color on hover: `#eee` (light mode)

### 2.4 Color Usage Guidelines

- **Hover States**: Use primary color (#65bc7b) for link and button hovers
- **Focus States**: Slightly darker than hover (#222222 for buttons)
- **Contrast Ratios**: Ensure WCAG AA compliance (4.5:1 for body text, 3:1 for large text)
- **Transitions**: Color transitions should use `transition: color 0.2s linear`

---

## 3. Layout & Spacing

### 3.1 Spacing Scale

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-global-spacing` | 35px | Global spacing between sections |
| `--hybridmag-sidebar-spacing` | 35px | Spacing around sidebar |
| `--hybridmag-post-cols-gap` | 35px | Gap between post columns in grid |
| `--hybridmag-post-row-gap` | 35px | Gap between post rows in grid |
| `--hybridmag-global-inner-spacing` | 20px (mobile), 30px (480px+) | Inner content padding |
| `--hybridmag-footer-cols-gap` | 40px | Gap between footer columns |

**Enhanced Spacing (`.hm-cl-one` class)**:
- Global spacing: 50px
- Sidebar spacing: 50px
- Post gaps: 50px

### 3.2 Container & Max-Widths

| Element | Max-Width | Padding |
|---------|-----------|---------|
| `.hm-container` | ~1200px (implied from design) | 20px horizontal (mobile) |
| `.site-content` | 100% | 30px vertical (mobile), 35px (600px+) |
| `.hm-wide-header .hm-container` | 100% | 20px horizontal (600px+) |

### 3.3 Grid Layouts

#### Article Card Grid

- **Mobile (<768px)**: 1 column
- **Tablet (768px-1023px)**: 2 columns
- **Desktop (1024px+)**: 3 columns (implied from standard magazine layout)
- **Column Gap**: 35px (--hybridmag-post-cols-gap)
- **Row Gap**: 35px (--hybridmag-post-row-gap)

#### Footer Grid

- **Columns**: 3 columns (indicated by `hm-footer-cols-3` class)
- **Gap**: 40px (--hybridmag-footer-cols-gap)

### 3.4 Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-global-border-radius` | 6px | Cards, buttons, images |

### 3.5 Box Shadow

| Variable | Value | Usage |
|----------|-------|-------|
| `--hybridmag-global-box-shadow` | `0 0 15px 0 rgba(0, 0, 0, 0.06)` | Cards, elevated elements |

### 3.6 Z-Index Hierarchy

**Note**: Specific z-index values to be determined during implementation based on stacking context needs.

- Header: High (sticky/fixed positioning)
- Mobile menu overlay: Very high
- Search overlay: Very high
- Slideout sidebar: Very high
- Slider controls: Medium
- Card overlays: Low-medium

---

## 4. Responsive Breakpoints

### 4.1 Breakpoint Definitions

| Breakpoint | Min-Width | Usage |
|------------|-----------|-------|
| **Mobile (Small)** | < 480px | Compact mobile view |
| **Mobile (Large)** | 480px | Adjusted inner spacing (20px → 30px) |
| **Mobile/Tablet** | 600px | Site content padding increase, footer adjustments |
| **Tablet** | 768px | 2-column grid, site title size increase, flex layouts |
| **Desktop** | 959px | Full desktop navigation, larger header spacing |
| **Large Desktop** | 1024px+ | Maximum layout width, 3-column grids |

### 4.2 Breakpoint-Specific Changes

#### 480px+
- Inner spacing: 20px → 30px

#### 600px+
- Site content padding: 30px → 35px
- Header inner padding adjustments
- Button sizing adjustments

#### 768px+
- Site title font size: 2rem (32px)
- 2-column post grid
- Flex layouts for content area
- Featured post layouts (50% width for large posts)

#### 959px+
- Header inner padding: 10px → 50px (top/bottom)
- Desktop navigation visible
- Search container hidden in large header
- Mobile menu hidden

### 4.3 Typography Responsive Adjustments

| Element | Mobile | Tablet (768px+) | Desktop (959px+) |
|---------|--------|-----------------|------------------|
| Site Title | 2rem (32px) | 2rem (32px) | 2rem (32px) |
| Article Title (Large) | 24px | 24px | 24px |
| Article Title (Small) | 16px | 16px | 18px |
| Body Text | 16px | 16px | 16px |
| Meta Text | 13px | 14px | 14px |

---

## 5. Component Visual Specifications

### 5.1 Header

#### Structure
- `.site-header` container
  - `.hm-header-inner` (flex container, space-between)
    - `.site-branding` (site logo/title)
    - `nav.main-navigation` (desktop only @959px+)
    - `.hm-header-gadgets` (social, subscribe, theme toggle, search, mobile menu)

#### Dimensions
- **Height**: Variable based on content + padding
- **Padding (Mobile)**: 10px top/bottom
- **Padding (Desktop 959px+)**: 50px top/bottom (`.hm-h-lg` variant)
- **Sticky Element Height**: 80px (`--hybridmag-sticky-element-height`)

#### Visual Styling
- **Background**: Inherits from body (white in light mode)
- **Border**: None specified
- **Box Shadow**: None in default state

#### Site Title
- **Font Size**: 2rem (32px)
- **Font Weight**: 600
- **Color**: Inherits link color (#0a0808)
- **Hover Color**: Primary (#65bc7b)

### 5.2 Navigation Menu

#### Desktop Navigation (`nav.main-navigation`)
- **Display**: Visible at 959px+, hidden below
- **Font Size**: Inherits (approximately 16px)
- **Font Weight**: 600 (implied from navigation styling)
- **Text Color**: `--hybridmag-color-main-menu` (#272c30)
- **Hover Color**: Primary (#65bc7b)
- **Active State**: Underline or color change

#### Mobile Navigation
- **Trigger**: Hamburger icon (`.hm-mobile-menu-toggle`)
- **Icon**: Three horizontal lines (SVG)
- **Behavior**: Slideout or dropdown menu
- **Background**: Likely white with overlay

### 5.3 Header Gadgets

#### Social Media Icons
- **Size**: ~1em (matches font-size of container, ~24px implied)
- **Spacing**: Inline list with gaps
- **Color**: Inherits text color
- **Hover Color**: Primary (#65bc7b)
- **SVG Icons**: Facebook, Twitter, Instagram

#### Subscribe Button (`.hm-cta-btn`)
- **Background**: Primary (#65bc7b)
- **Text Color**: White (#ffffff)
- **Padding**: 8px 10px (mobile @600px), larger on desktop
- **Border Radius**: 6px (global)
- **Font Weight**: 600 (implied)
- **Hover Background**: #222222
- **Hover Text**: White
- **Focus Background**: #111111

#### Theme Toggle (`.hm-light-dark-toggle`)
- **Icon Size**: ~1em (24px implied)
- **Light Icon**: Sun SVG
- **Dark Icon**: Moon SVG
- **Background**: Transparent
- **Hover**: Icon color change to primary
- **Active State**: Toggle switches icon displayed

#### Search Toggle (`.hm-search-toggle`)
- **Icon**: Magnifying glass SVG
- **Size**: ~1em
- **Behavior**: Expands search box on click
- **Search Box**: Dropdown/overlay with input field
- **Input**: Standard form input with border (#ccc)

#### Mobile Menu Toggle (`.hm-slideout-toggle`)
- **Icon**: Hamburger (three bars) / Close (X) SVG
- **Display**: Always visible
- **Size**: ~1em

### 5.4 Article Cards

#### Standard Card (`.bnm-pb1-large`, `.bnm-pb2-large`)
- **Layout**: Vertical (thumbnail on top, content below)
- **Thumbnail**: 100% width
- **Aspect Ratio**: Flexible (maintains original aspect)
- **Image Border Radius**: 6px
- **Title Font Size**: 24px (1.5rem)
- **Title Line Height**: 1.2
- **Title Font Weight**: 600
- **Title Margin**: 0 0 0.4em 0
- **Excerpt Font Size**: 16px
- **Excerpt Line Height**: 1.5
- **Excerpt Margin**: 0 0 20px
- **Excerpt Max Length**: 200 characters (per spec clarification)
- **Meta Font Size**: 14px
- **Meta Color**: #7D7D7D (text-light)
- **Meta Spacing**: 15px between items
- **Category Font Size**: 13px
- **Category Font Weight**: 700
- **Category Padding**: 2px 8px (if badge style)
- **Category Background**: Transparent default, #eee on hover
- **Card Margin Bottom**: 17px (thumbnail), 25px (overall)

#### Small Card (`.bnm-pb1-small`, `.bnm-pb2-small`)
- **Layout**: Horizontal (thumbnail on left, content on right)
- **Thumbnail Width**: 33% (`--bnm-image-width`)
- **Content Width**: 67% (`--bnm-content-width`)
- **Thumbnail Margin**: 0 1em 0 0
- **Title Font Size**: 16px
- **Title Line Height**: 1.2
- **Title Margin**: 0 0 8px
- **Meta Font Size**: 13px
- **Excerpt Font Size**: 14px

#### Featured Post Card (`.bnm-fp2-large`, `.bnm-fp2-small`)
- **Layout**: Image with overlay content
- **Aspect Ratio**: 58.96% (large), 59.36% (small)
- **Overlay**: Linear gradient (transparent to black, opacity 0.5)
- **Overlay Hover**: Opacity 0.7
- **Content Position**: Absolute, bottom
- **Content Padding**: 20px 25px
- **Title Color**: White (#fff)
- **Title Shadow**: 0 1px 1px #000
- **Meta Color**: #eee
- **Hover Effect**: Image scale 1.1 (zoom)

### 5.5 Featured Slider

#### Slider Container (`.hm-swiper`)
- **Framework**: Swiper.js (detected from CSS reference)
- **Wrapper**: `.hm-swiper-wrapper`
- **Slide**: `.hm-swiper-slide`
- **Layout**: Full-width slides
- **Aspect Ratio**: Maintains image aspect ratio
- **Transition**: Slide or fade effect

#### Slider Content
- **Overlay**: Gradient overlay for text contrast
- **Title**: Prominent white text with shadow
- **Position**: Bottom of slide
- **Padding**: 20px-30px

#### Slider Controls
- **Navigation**: Arrows (prev/next)
- **Pagination**: Dots (bullets)
- **Autoplay**: To be determined (likely 5-7 seconds per slide)

### 5.6 Footer

#### Structure
- **Columns**: 3 columns (`.hm-footer-cols-3`)
- **Column Gap**: 40px
- **Background**: Likely dark (#272c30 or similar)
- **Text Color**: Light/white
- **Link Color**: Light/white
- **Link Hover**: Primary (#65bc7b)

#### Content
- **Column 1**: Site navigation links (per FR-011)
- **Column 2**: Category links (per FR-011)
- **Column 3**: Copyright & social media (per FR-011)

#### Typography
- **Font Size**: Smaller than body (14px implied)
- **Line Height**: 1.5

### 5.7 Buttons & Links

#### Primary Button
- **Background**: Primary (#65bc7b)
- **Text**: White (#fff)
- **Padding**: 8px 10px (small), larger for prominent CTAs
- **Border Radius**: 6px
- **Font Weight**: 600
- **Hover Background**: #222222
- **Transition**: 0.2s linear

#### Links
- **Color**: #0a0808 (default)
- **Hover**: Primary (#65bc7b)
- **Visited**: #5d7ddb
- **Underline**: None (default), underline on hover (optional)
- **Transition**: color 0.2s linear

### 5.8 Pagination

**Specification to be determined during design extraction**:
- Style: Numbered or prev/next
- Active page styling
- Hover states
- Disabled states

---

## 6. Interactive States & Animations

### 6.1 Hover States

#### Links
- **Transition**: `color 0.2s linear`
- **Color Change**: Default → Primary (#65bc7b)

#### Buttons
- **Transition**: `background-color 0.2s linear, color 0.2s linear`
- **Background Change**: Primary (#65bc7b) → Dark (#222222)

#### Article Cards
- **Image**: Scale transform (1 → 1.1)
- **Transition**: `transform 0.3s ease-in-out`
- **Title**: Color change to primary

#### Featured Posts
- **Image**: Scale 1.1
- **Overlay**: Opacity 0.5 → 0.7

### 6.2 Focus States

**Keyboard Navigation Requirements**:
- **Visible Outline**: Required for accessibility
- **Focus Indicator**: 2px solid outline, primary color or high-contrast
- **Focus-Visible**: Use `:focus-visible` pseudo-class for keyboard-only focus
- **Skip Links**: Implement "Skip to content" link

### 6.3 Active States

**Button Active**:
- **Background**: Slightly darker than hover (#111111)

**Link Active**:
- **Color**: Primary (#65bc7b)

### 6.4 Loading States

**To be defined during implementation**:
- Skeleton loaders for article cards
- Spinner for search results
- Progressive image loading with blur-up effect

### 6.5 Error States

**Search No Results**:
- **Message**: "No articles found"
- **Styling**: Centered text, muted color

**404 Page**:
- **To be designed** based on site branding

### 6.6 Disabled States

**Buttons**:
- **Background**: Lighter/muted version of primary
- **Opacity**: 0.6
- **Cursor**: not-allowed

### 6.7 Transition Durations

| Element | Duration | Easing |
|---------|----------|--------|
| Color changes | 0.2s | linear |
| Background changes | 0.2s | linear |
| Transform (scale, translate) | 0.3s | ease-in-out |
| Opacity | 0.2s | linear |
| Height/width changes | 0.3s | ease-in-out |

---

## 7. Image & Media Specifications

### 7.1 Image Aspect Ratios

#### Article Card Thumbnails
- **Standard Cards**: Flexible (16:9 or 4:3 preferred)
- **Small Cards**: Flexible, constrained by width (33%)
- **Featured Posts Large**: 58.96% padding-top (approx 16:9.35)
- **Featured Posts Small**: 59.36% padding-top (approx 16:9.35)
- **Slider Images**: Flexible, full-width

#### Author Avatar
- **Aspect Ratio**: 1:1 (square)
- **Size**: ~80px × 80px (typical)

### 7.2 Image Optimization

#### Format
- **Modern Formats**: WebP with fallback to JPEG/PNG
- **SVG**: For icons and logos

#### Sizes
- **Mobile**: 375px-767px width
- **Tablet**: 768px-1023px width
- **Desktop**: 1024px+ width
- **Thumbnail**: ~400px width
- **Featured**: ~800px width
- **Full**: ~1280px width

#### Compression
- **JPEG Quality**: 80-85%
- **WebP Quality**: 75-80%
- **File Size Target**: <200KB for featured images, <100KB for thumbnails

### 7.3 Responsive Images

**`srcset` Implementation**:
```html
<img 
  src="image-800.jpg" 
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
  alt="Description"
/>
```

**Gatsby Image Plugin**:
- Use `gatsby-plugin-image` with `GatsbyImage` component
- Implement blur-up loading effect
- Generate multiple sizes automatically

### 7.4 Image Styling

#### Border Radius
- **Cards**: 6px (top corners for vertical cards, left corners for horizontal)
- **Author Avatar**: 50% (circular)

#### Box Shadow
- **Default**: None
- **Hover**: Optional subtle shadow

#### Object Fit
- **Cards**: `cover` (fills container, crops if necessary)
- **Article Page**: `contain` or `cover` depending on layout

### 7.5 Lazy Loading

**Implementation**:
- **Native**: `loading="lazy"` attribute
- **Gatsby**: Built-in lazy loading with `gatsby-plugin-image`
- **Threshold**: Load images 200px before entering viewport

### 7.6 Fallback Images

**Missing Image Placeholder**:
- **Background**: Light gray (#f5f5f5)
- **Icon**: Camera or image icon (centered)
- **Size**: Matches expected image dimensions

### 7.7 Image Alt Text

**Requirements**:
- **Mandatory**: All images must have alt text
- **Descriptive**: Describe image content concisely
- **Decorative Images**: Use empty alt (`alt=""`)

---

## 8. Accessibility Specifications

### 8.1 Color Contrast

**WCAG AA Compliance**:
- **Body Text**: 4.5:1 minimum (#404040 on #ffffff = 9.76:1 ✓)
- **Large Text**: 3:1 minimum
- **UI Components**: 3:1 minimum

**Current Contrast Ratios**:
- Text main (#404040) on white: 9.76:1 ✓
- Text headings (#222222) on white: 16.03:1 ✓
- Text light (#7D7D7D) on white: 4.47:1 ✓
- Primary (#65bc7b) on white: 2.65:1 ✗ (use for accents only, not body text)

### 8.2 Keyboard Navigation

**Requirements**:
- **Tab Order**: Logical, follows visual flow
- **Focus Indicators**: Visible on all interactive elements
- **Skip Links**: "Skip to content" link at top
- **Keyboard Shortcuts**: Enter/Space for buttons, Arrow keys for sliders

### 8.3 Touch Targets

**Mobile Touch Targets**:
- **Minimum Size**: 44px × 44px (iOS), 48px × 48px (Android)
- **Spacing**: 8px minimum between targets

### 8.4 ARIA Labels

**Required ARIA**:
- **Navigation**: `aria-label="Main navigation"`
- **Search**: `aria-label="Search"`, `aria-expanded` for toggle
- **Mobile Menu**: `aria-expanded`, `aria-controls`
- **Slider**: `aria-label`, `aria-live` for announcements

### 8.5 Screen Reader Text

**`.screen-reader-text` Class**:
- **Position**: absolute
- **Width**: 1px
- **Height**: 1px
- **Overflow**: hidden
- **Clip**: rect(1px, 1px, 1px, 1px)

---

## 9. Design Extraction Methodology

### 9.1 Source Files

**Primary References**:
- `design/index.html` - Homepage structure and components
- `design/the-journey-not-the-arrival-matters/index.html` - Article page template
- `design/category/fashion/index.html` - Category page template
- `design/author/admin/index.html` - Author page template
- `design/wp-content/themes/hybridmag/style_1225677685.css` - Main theme CSS
- `design/wp-content/themes/hybridmag/assets/css/font-figtree.css` - Font definitions

### 9.2 Color Extraction

**Method**:
1. Inspect CSS custom properties in `:root`
2. Use browser DevTools color picker for visual elements
3. Convert all colors to hex format for consistency
4. Document color usage patterns

### 9.3 Spacing Measurement

**Method**:
1. Inspect CSS custom properties for spacing scale
2. Use browser DevTools computed styles for specific elements
3. Measure actual pixel values in rendered design
4. Apply ±5px tolerance per success criteria (SC-002)

### 9.4 Typography Extraction

**Method**:
1. Identify all font-face declarations
2. Extract font-size custom properties
3. Measure computed styles for specific elements
4. Document font stack and fallbacks

### 9.5 Component Analysis

**Method**:
1. Identify component boundaries in HTML
2. Extract CSS classes and structure
3. Document layout patterns (flex, grid, float)
4. Capture state variations (hover, focus, active)

---

## 10. Acceptance Criteria for 100% Match

### 10.1 Visual Comparison

**Typography Match**:
- ✅ Font family, sizes, weights match exactly
- ✅ Line heights within ±0.1 of design
- ✅ Letter spacing matches (or normal if none specified)

**Colors Match**:
- ✅ Exact hex values from design
- ✅ Hover/focus states match
- ✅ Dark mode colors provide equivalent contrast

**Spacing Match**:
- ✅ Within ±5px of design measurements
- ✅ Consistent spacing scale applied
- ✅ Responsive spacing adjustments at breakpoints

**Layout Match**:
- ✅ Identical component arrangement
- ✅ Same grid structure and column counts
- ✅ Correct flex/grid properties

### 10.2 Testing Methodology

**Visual Regression Testing**:
1. Capture screenshots of reference design at all breakpoints
2. Capture screenshots of implemented design at same breakpoints
3. Overlay and compare using diff tools
4. Identify discrepancies > 5px

**Manual Inspection**:
1. Side-by-side comparison in browser
2. Measure element dimensions with DevTools
3. Verify spacing with ruler tools
4. Check responsive behavior at each breakpoint

**Automated Checks**:
1. CSS custom properties match
2. Font families loaded correctly
3. Color values match exactly
4. Breakpoints trigger at correct widths

### 10.3 Pixel-Perfect Comparison Tools

**Recommended Tools**:
- **Browser Extensions**: PerfectPixel, Pixel Perfect Pro
- **DevTools**: Firefox/Chrome inspect tools with ruler
- **Design Tools**: Figma overlay (if design exported)
- **Diff Tools**: Percy, Applitools, BackstopJS (for automated regression)

---

## 11. Implementation Notes

### 11.1 CSS Architecture

**Approach**:
- Use CSS custom properties for all design tokens
- Organize CSS by component (header.css, footer.css, etc.)
- Extract and adapt CSS from design folder (per constitution P5)
- Maintain design/ folder structure reference

### 11.2 Font Loading Strategy

**Implementation**:
- Copy font files from `design/wp-content/themes/hybridmag/assets/fonts/figtree/` to `static/fonts/`
- Use @font-face with `font-display: swap`
- Include only used weights (300, 400, 500, 600, 700)
- Subset fonts if possible (Latin only)

### 11.3 Responsive Implementation

**Mobile-First Approach**:
1. Start with mobile styles (base)
2. Add tablet styles at 768px breakpoint
3. Add desktop styles at 959px/1024px breakpoints
4. Test at all standard device sizes

### 11.4 Dark Mode Implementation

**Strategy**:
- Use CSS custom properties for all colors
- Override properties when `[data-theme="dark"]` applied
- Store preference in localStorage
- Implement toggle with client-side JavaScript (gatsby-browser.ts)

### 11.5 Image Implementation

**Gatsby Configuration**:
- Install `gatsby-plugin-image`, `gatsby-plugin-sharp`, `gatsby-transformer-sharp`
- Configure image quality and format options
- Generate responsive sizes automatically
- Implement blur-up placeholder

---

## 12. Gap Analysis & Recommendations

### 12.1 Specifications Still Needed

Based on design-fidelity checklist, these items require further design inspection or decisions:

1. **CHK038**: Pagination control visual requirements (arrows, numbers, active state)
2. **CHK048**: Touch target sizes verification (ensure 44px minimum)
3. **CHK058**: Slider autoplay behavior and timing (recommend 5-7 seconds)
4. **CHK065**: Image lazy-loading threshold (recommend 200px before viewport)
5. **CHK079**: Pixel-perfect comparison tool selection (recommend Percy or manual)

### 12.2 Dark Mode Palette

**Action Required**: Generate dark mode color palette by:
1. Inverting backgrounds (white → dark)
2. Adjusting text colors for contrast
3. Maintaining primary accent color or adjusting for visibility
4. Testing all color combinations for WCAG AA compliance

### 12.3 Interactive State Details

**Needs Specification**:
- Exact transition timing for all interactions
- Loading spinner design and placement
- Error message styling and layout
- Disabled button opacity and styling

---

## Conclusion

This document provides comprehensive design specifications extracted from the HybridMag theme reference design. All specifications are based on actual CSS values and HTML structure found in the `design/` folder. 

**Implementation Path**:
1. Copy font files to `static/fonts/`
2. Create CSS custom properties file with all variables
3. Extract and adapt CSS from design folder by component
4. Implement responsive breakpoints
5. Add interactive states and transitions
6. Implement dark mode toggle
7. Optimize images with Gatsby plugins
8. Test visual match against reference design

**Success Metrics**:
- Typography matches exactly (font family, sizes, weights, line-heights)
- Colors match exact hex values
- Spacing within ±5px tolerance
- Layout structure identical
- Responsive behavior matches at all breakpoints
- Interactive states smooth and consistent
- 100% visual match validated through side-by-side comparison

