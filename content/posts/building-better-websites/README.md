# Building Better Websites Series

This folder contains all articles for the "Building Better Websites" series.

## Series Structure

- **Part 1**: Planning & Architecture (slug: `building-better-websites/part-1-planning-architecture`)
- **Part 2**: Implementation & Development (slug: `building-better-websites/part-2-implementation-development`)
- **Part 3**: Deployment & Maintenance (slug: `building-better-websites/part-3-deployment-maintenance`)

## Navigation Flow

```text
Part 1 → Part 2 → Part 3
```

## Series Metadata

Each article includes:
- **Series name**: "Building Better Websites"
- **Order**: Explicit numbering (1, 2, 3)
- **Navigation**: prev/next slugs for sequential reading
- **References**: External resources and documentation
- **Attachments**: Downloadable supplementary materials (Part 3 only)

## Adding Articles to This Series

To add a new article to this series:

1. Create a new `.md` file in this folder
2. Add series metadata to frontmatter:

```yaml
series:
  name: "Building Better Websites"
  order: 4  # Next sequential number
  prev: "building-better-websites/part-3-deployment-maintenance"
  # Add 'next' field when you create part 5
```

3. Update the previous article's `next` field to point to your new article
4. Ensure slug follows pattern: `building-better-websites/part-X-descriptive-name`

