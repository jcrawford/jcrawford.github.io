# Quickstart Guide: Gatsby Magazine Website

**Feature**: 001-gatsby-site  
**Date**: 2025-11-05  
**Branch**: `001-gatsby-site`

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm** 9.x or later (comes with Node.js)
- **Git** installed and configured
- Code editor (VS Code recommended for TypeScript support)

## Initial Setup

### 1. Install Dependencies

```bash
# From repository root
npm install
```

This will install:
- Gatsby 5.x
- React 18.x
- TypeScript 5.x
- All Gatsby plugins
- dayjs for date handling
- Development dependencies

### 2. Project Structure

After setup, your project structure should look like:

```text
/
├── src/
│   ├── components/       # React components (to be created)
│   ├── templates/        # Gatsby page templates (to be created)
│   ├── pages/            # Static pages (to be created)
│   ├── styles/           # CSS and design system (to be created)
│   ├── data/             # Mock article data (to be created)
│   │   ├── articles/     # Individual article JSON files
│   │   ├── categories.json
│   │   └── authors.json
│   ├── types/            # TypeScript definitions (to be created)
│   └── utils/            # Helper functions (to be created)
├── static/               # Static assets (to be created)
│   ├── images/           # Article and UI images
│   └── fonts/            # Figtree font files
├── gatsby-config.ts      # Gatsby configuration
├── gatsby-node.ts        # Page generation logic
├── gatsby-browser.ts     # Browser APIs (dark mode)
├── gatsby-ssr.ts         # Server-side rendering APIs
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

### 3. Configuration Files

See `specs/001-gatsby-site/research.md` for detailed configuration examples.

## Development Workflow

### Start Development Server

```bash
npm run develop
```

- Opens at `http://localhost:8000`
- GraphQL playground at `http://localhost:8000/___graphql`
- Hot reload enabled
- TypeScript compilation watch mode

### Build for Production

```bash
npm run build
```

This command:
- Generates static HTML/CSS/JS files
- Optimizes images
- Creates search index
- Outputs to `public/` directory
- **Run after every change** (per spec requirement)

### Preview Production Build

```bash
npm run serve
```

- Serves the production build locally
- Opens at `http://localhost:9000`
- Tests static site behavior

### Type Check

```bash
npm run type-check
```

- Validates TypeScript without emitting files
- Catches type errors early
- Run before committing

### Clean Cache

```bash
npm run clean
```

- Removes `.cache/` and `public/` directories
- Use when experiencing build issues
- Forces fresh build

## Creating Content

### Adding Articles

1. Create JSON file in `src/data/articles/`:

```json
{
  "id": "021",
  "slug": "your-article-slug",
  "title": "Your Article Title",
  "excerpt": "A brief summary of your article content.",
  "content": "<p>Full HTML content goes here...</p>",
  "featuredImage": "/images/your-image.jpg",
  "category": "lifestyle",
  "tags": ["lifestyle", "inspiration"],
  "author": "admin",
  "publishedAt": "2025-01-20"
}
```

2. Add corresponding image to `static/images/`

3. Run `npm run develop` to see changes

### Content Guidelines

**Article Distribution** (per spec):
- 20 total articles
- 4 per category (Fashion, Lifestyle, Food, Travel, Sports)
- 3 tagged with "featured" for homepage slider
- Varied content lengths:
  - Short: 100-200 words
  - Medium: 300-500 words
  - Long: 500-800 words

**Required Fields**:
- All fields in Article interface are required
- Slugs must be unique
- Category must be one of: fashion, lifestyle, food, travel, sports
- Dates in ISO 8601 format (YYYY-MM-DD)

## GraphQL Queries

### Test Queries in GraphQL Playground

Navigate to `http://localhost:8000/___graphql` and try:

**All Articles**:
```graphql
query {
  allArticlesJson {
    nodes {
      slug
      title
      category
      publishedAt
    }
  }
}
```

**Featured Articles** (slider):
```graphql
query {
  allArticlesJson(filter: { tags: { in: ["featured"] } }, limit: 3) {
    nodes {
      slug
      title
      featuredImage
    }
  }
}
```

**Articles by Category**:
```graphql
query {
  allArticlesJson(filter: { category: { eq: "travel" } }) {
    nodes {
      slug
      title
      excerpt
    }
  }
}
```

## Common Tasks

### Update Site Metadata

Edit `gatsby-config.ts`:

```typescript
export default {
  siteMetadata: {
    title: 'HybridMag',
    description: 'Your site description',
    siteUrl: 'https://yourusername.github.io/site',
    // ...
  }
}
```

### Add Navigation Link

Update `navigation` array in `gatsby-config.ts`:

```typescript
navigation: [
  { name: 'Home', path: '/' },
  { name: 'Fashion', path: '/category/fashion' },
  // Add new item here
]
```

### Implement Dark Mode

Dark mode toggle is implemented in `gatsby-browser.ts` using CSS custom properties and localStorage. See `research.md` for implementation details.

### Create Search Functionality

Search index is generated during build and used for client-side search. See `data-model.md` for SearchIndexEntry interface.

## Deployment

### Deploy to GitHub Pages

1. Update `pathPrefix` in `gatsby-config.ts`:

```typescript
export default {
  pathPrefix: '/your-repo-name',
  // ...
}
```

2. Deploy:

```bash
npm run deploy
```

This command:
- Runs `gatsby build --prefix-paths`
- Pushes to `gh-pages` branch
- Site available at `https://yourusername.github.io/your-repo-name`

### First-Time GitHub Pages Setup

1. Go to repository Settings > Pages
2. Select `gh-pages` branch as source
3. Wait for deployment (usually < 1 minute)

## Troubleshooting

### Build Fails

```bash
# Clean cache and rebuild
npm run clean
npm run build
```

### TypeScript Errors

```bash
# Run type check to see all errors
npm run type-check
```

### GraphQL Errors

- Check JSON file syntax in `src/data/`
- Ensure all required fields are present
- Verify field types match schema

### Images Not Loading

- Images must be in `static/images/`
- Use paths relative to static directory: `/images/filename.jpg`
- Check file names and extensions match

### Hot Reload Not Working

- Restart development server
- Clear browser cache
- Check console for errors

## Next Steps

1. Review `research.md` for technology decisions
2. Review `data-model.md` for content structure
3. Check `contracts/` for type definitions
4. Start implementing based on `tasks.md` (when created)

## Constitution Compliance

Ensure all code follows project constitution:

- ✅ TypeScript-first (all `.ts` or `.tsx` files)
- ✅ No `any` types (use proper types or `unknown`)
- ✅ Use dayjs for dates
- ✅ Native fetch for HTTP (if needed)
- ✅ No utility libraries (lodash, etc.)
- ✅ Minimal comments (self-documenting code)
- ✅ No FR-XXX comments in code

See `.specify/memory/constitution.md` for full details.

## Resources

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [dayjs Documentation](https://day.js.org/)
- [Design Reference](../../../design/) - HTML/CSS to replicate
- [Feature Spec](./spec.md) - Requirements and success criteria
- [Research](./research.md) - Technology decisions and rationale
- [Data Model](./data-model.md) - Content structure

