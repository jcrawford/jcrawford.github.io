# Quick Reference Guide - Joseph Crawford Blog

A handy reference for common tasks and commands.

## Daily Development Commands

```bash
# Start development server
npm run develop
# → Opens http://localhost:8000

# Check TypeScript errors
npm run type-check

# Clear Gatsby cache (if things are broken)
npm run clean && npm run develop

# Build for production
npm run build

# Preview production build
npm run serve
# → Opens http://localhost:9000

# Deploy to GitHub Pages
npm run deploy
```

## Creating a New Article

### Quick Method
1. Copy an existing article from `content/posts/`
2. Rename to `your-slug.md`
3. Update the frontmatter fields
4. Replace the content
5. Save (auto-reload will show it)

### Required Frontmatter Fields
```yaml
---
slug: "your-article-slug"              # Must be unique, URL-friendly
title: "Your Article Title"            # Keep under 80 characters
excerpt: "Brief description..."        # Keep under 160 characters
featuredImage: "https://images.unsplash.com/photo-..."  # Unsplash URL
category: "fashion"                    # One of: fashion, lifestyle, food, travel, sports
tags: ["tag1", "tag2", "tag3"]        # Array of tags, add "featured" for homepage slider
author: "admin"                        # Must match authors.json
publishedAt: "2025-01-10"             # ISO date: YYYY-MM-DD
updatedAt: "2025-01-10"               # ISO date: YYYY-MM-DD
---

Your article content goes here in Markdown format.

## Heading 2
Paragraphs are separated by blank lines.

**Bold text** and *italic text* are supported.

- Bullet points
- Work like this

1. Numbered lists
2. Work like this

[Links](https://example.com) are supported.

Images can be embedded:
![Alt text](https://images.unsplash.com/photo-...)
```

### Tips for Writing Articles
- Use descriptive titles (good for SEO)
- Write concise excerpts (appear in cards)
- Use Unsplash for high-quality images: `https://images.unsplash.com/photo-ID?w=1200&h=800&fit=crop`
- Add "featured" tag to make it appear in homepage slider (limit to 5 total)
- Keep publishedAt current or future (controls display order)

## Finding Unsplash Images

1. Go to https://unsplash.com/
2. Search for your topic
3. Click on an image
4. Right-click and "Copy image address"
5. Add size parameters: `?w=1200&h=800&fit=crop`

Example:
```
https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop
```

## Modifying Site Configuration

### Change Site Metadata
Edit `gatsby-config.ts`:
```typescript
siteMetadata: {
  title: 'Your Site Name',
  description: 'Your description',
  siteUrl: 'https://yoursite.com',
  // ...
}
```

### Add/Remove Navigation Items
Edit `gatsby-config.ts`:
```typescript
navigation: [
  { name: 'Home', path: '/' },
  { name: 'Your Category', path: '/category/your-category' },
  // ...
]
```

### Configure Footer Widgets
Edit `gatsby-config.ts`:
```typescript
footerWidgets: [
  {
    title: 'Widget Title',
    type: 'posts',
    category: 'category-slug',
    count: 3,
  },
  // ...
]
```

### After Config Changes
Always restart the dev server:
```bash
npm run clean
npm run develop
```

## Categories & Tags

### Available Categories
- `fashion` - Fashion
- `lifestyle` - Lifestyle  
- `food` - Food
- `travel` - Travel
- `sports` - Sports

To add a new category:
1. Edit `src/data/categories.json`
2. Add navigation item in `gatsby-config.ts`
3. Restart dev server

### Tag Best Practices
- Use lowercase, hyphenated tags: `web-development`
- Be consistent across articles
- Use "featured" to highlight on homepage
- Use descriptive tags for future search functionality

## Homepage Featured Section

### Slider (Left Side)
- Shows first 3 articles tagged with "featured"
- Auto-rotates every 5 seconds
- 500px height

### Highlighted Posts (Right Side)
- Shows articles 4-5 tagged with "featured"
- 249px each with 2px gap
- Total height matches slider (500px)

**Important**: Tag exactly 5 articles with "featured" to fully populate this section.

## Dark Mode

Dark mode toggle is in the header (sun/moon icon).
- Preference saved to localStorage
- Persists across page navigation
- All components automatically themed

## Troubleshooting

### GraphQL Errors
```bash
npm run clean
npm run develop
```

### Images Not Loading
- Check image URL is valid
- Try opening URL in browser
- Ensure Unsplash URL has `?w=1200&h=800&fit=crop`

### Port Already in Use
```bash
lsof -ti:8000 | xargs kill -9
npm run develop
```

### Changes Not Showing
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Restart dev server

### TypeScript Errors
```bash
npm run type-check
# Fix any errors shown
```

### Site Won't Build
```bash
# Check for syntax errors in Markdown frontmatter
# Check for missing required fields
# Check for invalid category or author slugs
npm run type-check
npm run clean
npm run build
```

## File Locations Cheat Sheet

- **Articles**: `content/posts/*.md`
- **Categories**: `src/data/categories.json`
- **Authors**: `src/data/authors.json`
- **Tags**: `src/data/tags.json`
- **Global Styles**: `src/styles/global.css`
- **Theme Variables**: `src/styles/variables.css`
- **Site Config**: `gatsby-config.ts`
- **Components**: `src/components/*.tsx`
- **Page Templates**: `src/templates/*.tsx`

## URLs to Remember

### Local Development
- **Homepage**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/___graphql
- **Article**: http://localhost:8000/articles/your-slug
- **Category**: http://localhost:8000/category/fashion
- **Author**: http://localhost:8000/author/admin

### Production (After Deploy)
- **Site**: https://josephcraw.github.io/site
- **Article**: https://josephcraw.github.io/site/articles/your-slug
- **Category**: https://josephcraw.github.io/site/category/fashion

## Keyboard Shortcuts (VS Code)

- `Cmd/Ctrl + P` - Quick file search
- `Cmd/Ctrl + Shift + F` - Search in files
- `Cmd/Ctrl + B` - Toggle sidebar
- `Cmd/Ctrl + \`` - Toggle terminal

## Git Workflow (Recommended)

```bash
# Make changes to content/posts/

# Check what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Add new article: Your Title"

# Push to GitHub
git push origin main

# Deploy to GitHub Pages
npm run deploy
```

## Performance Tips

- Keep articles under 2000 words for fast loading
- Use optimized images (Unsplash auto-optimizes)
- Don't add 100+ articles at once (build time increases)
- Run `gatsby clean` periodically to clear cache

## Getting Help

1. Check this guide first
2. Check `specs/IMPLEMENTATION_SUMMARY.md` for technical details
3. Check `specs/002-markdown-articles/quickstart.md` for Markdown guide
4. Check Gatsby docs: https://www.gatsbyjs.com/docs/

## Common Customizations

### Change Colors
Edit `src/styles/variables.css`:
```css
:root {
  --hybridmag-color-primary: #e91e63;  /* Change to your color */
  /* ... */
}
```

### Change Fonts
Edit `src/styles/variables.css`:
```css
:root {
  --hybridmag-font-family-base: 'Your Font', sans-serif;
}
```
Then add font import at top of `src/styles/global.css`.

### Adjust Layout Spacing
Edit `src/styles/global.css`:
- Search for `.hm-container` for page width
- Search for `gap:` for spacing between elements
- Search for `padding:` for internal spacing

---

**Quick Start**: `npm run develop` → Edit `content/posts/` → Save → View at http://localhost:8000

**Deploy**: `npm run deploy` → Visit https://josephcraw.github.io/site




