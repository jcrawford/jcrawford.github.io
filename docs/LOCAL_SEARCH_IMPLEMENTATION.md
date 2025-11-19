# Local Search Implementation

## Overview

This document describes the implementation of `gatsby-plugin-local-search` for improved search capabilities on the site.

## What Changed

### 1. Installed Dependencies

```bash
npm install gatsby-plugin-local-search react-use-flexsearch
```

### 2. Updated `gatsby-config.ts`

Added the `gatsby-plugin-local-search` configuration:

```typescript
{
  resolve: 'gatsby-plugin-local-search',
  options: {
    name: 'articles',
    engine: 'flexsearch',
    engineOptions: {
      encode: 'icase',
      tokenize: 'forward',
      threshold: 0,
      resolution: 3,
    },
    query: `
      {
        allMarkdownRemark(filter: { frontmatter: { slug: { ne: null } } }) {
          nodes {
            id
            html
            frontmatter {
              slug
              title
              excerpt
              category
              tags
              publishedAt
            }
          }
        }
      }
    `,
    ref: 'id',
    index: ['title', 'excerpt', 'body'],
    store: ['id', 'slug', 'title', 'excerpt', 'category', 'publishedAt'],
    normalizer: ({ data }: any) =>
      data.allMarkdownRemark.nodes.map((node: any) => ({
        id: node.id,
        slug: node.frontmatter.slug,
        title: node.frontmatter.title,
        excerpt: node.frontmatter.excerpt,
        category: node.frontmatter.category,
        publishedAt: node.frontmatter.publishedAt,
        body: node.html.replace(/<[^>]*>/g, ''),
      })),
  },
}
```

### 3. Updated `SearchOverlay.tsx`

Replaced the manual search logic with FlexSearch:

**Before:**
- Used `useStaticQuery` to fetch all articles
- Manually filtered articles based on search term
- Used `useState` to manage results

**After:**
- Uses `useStaticQuery` to fetch the search index
- Uses `useFlexSearch` hook to perform searches
- Much faster and more efficient
- Better search results with fuzzy matching

## Benefits

### 1. **Performance**
- FlexSearch is extremely fast (searches happen in milliseconds)
- Pre-built index at build time means no runtime processing
- Efficient memory usage

### 2. **Better Search Results**
- Fuzzy matching for typos
- Tokenization for better word matching
- Configurable search options (case-insensitive, forward tokenization)

### 3. **Scalability**
- Can handle thousands of articles without performance degradation
- Index is built once at build time
- No client-side filtering overhead

### 4. **User Experience**
- Instant search results as you type
- More relevant results
- Searches across title, excerpt, and body content

## How It Works

1. **Build Time**: Gatsby builds a search index from all markdown articles
2. **Query Time**: The index is loaded into the browser
3. **Search Time**: FlexSearch queries the index instantly
4. **Results**: Matching articles are returned with their metadata

## Configuration Options

### Engine Options

- `encode: 'icase'`: Case-insensitive encoding
- `tokenize: 'forward'`: Forward tokenization (matches from the start of words)
- `threshold: 0`: No threshold for matching (more results)
- `resolution: 3`: Search resolution level

### Indexed Fields

- `title`: Article title
- `excerpt`: Article excerpt
- `body`: Full article content (HTML stripped)

### Stored Fields

- `id`: Unique identifier
- `slug`: Article URL slug
- `title`: Article title
- `excerpt`: Article excerpt
- `category`: Article category
- `publishedAt`: Publication date

## Testing

To test the search functionality:

1. Start the dev server: `npm run develop`
2. Navigate to `http://localhost:8000`
3. Click the search icon in the header
4. Type a search query
5. Results should appear instantly

## Future Enhancements

Potential improvements:

1. **Highlighting**: Highlight matching terms in results
2. **Filters**: Add category/tag filters
3. **Sorting**: Sort by relevance, date, etc.
4. **Analytics**: Track popular search terms
5. **Suggestions**: Show search suggestions as you type

## Troubleshooting

### Search not working

1. Clear Gatsby cache: `npm run clean`
2. Rebuild: `npm run develop`
3. Check browser console for errors

### No results found

1. Verify articles have proper frontmatter
2. Check that `slug` is not null
3. Verify the GraphQL query in `gatsby-config.ts`

### Slow search

1. Check the index size (should be small)
2. Verify FlexSearch options are optimized
3. Consider reducing the number of indexed fields

## Related Files

- `/gatsby-config.ts`: Plugin configuration
- `/src/components/SearchOverlay.tsx`: Search UI component
- `/docs/LOCAL_SEARCH_IMPLEMENTATION.md`: This document

## References

- [gatsby-plugin-local-search](https://www.gatsbyjs.com/plugins/gatsby-plugin-local-search/)
- [FlexSearch](https://github.com/nextapps-de/flexsearch)
- [react-use-flexsearch](https://github.com/angeloashmore/react-use-flexsearch)

