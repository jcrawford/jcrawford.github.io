# Quick Start: Article Series Navigation

**Feature**: Article Series Navigation  
**Status**: In Specification  
**Last Updated**: 2025-11-13

## Overview

This feature enables articles to be grouped into navigable series with table of contents, previous/next navigation, references, and attachments.

---

## Quick Example

### Adding Series to an Article

```yaml
---
slug: "getting-started-gatsby"
title: "Getting Started with Gatsby"
excerpt: "Set up your first Gatsby project."
featuredImage: "https://images.unsplash.com/photo-..."
category: "technology"
tags: ["gatsby", "tutorial"]
author: "alex-thompson"
publishedAt: "2024-01-08T10:00:00.000Z"
updatedAt: "2024-01-08T10:00:00.000Z"
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/intro-to-gatsby"
  next: "/articles/gatsby-configuration"
  references:
    - url: "https://www.gatsbyjs.com/docs/"
      title: "Official Gatsby Documentation"
    - url: "https://reactjs.org/docs/"
      title: "React Documentation"
  attachments:
    - filename: "/downloads/gatsby-starter.zip"
      title: "Gatsby Starter Template"
---

Article content here...
```

---

## What You Get

When you add series metadata to an article, the article page will display:

### 1. Series Widget (Sidebar)

- **Header**: "This is part of a series named: [SERIES_NAME]"
- **Table of Contents**: Numbered list of all articles in the series
- **Current Article**: Shown as plain text (non-linked)
- **Other Articles**: Shown as clickable links
- **Sticky Behavior**: Widget stays visible when scrolling

### 2. Navigation Buttons

- **Previous Button**: Links to previous article (if specified)
- **Next Button**: Links to next article (if specified)

### 3. References Section (Optional)

- Numbered list of external resources
- Opens in new tabs

### 4. Attachments Section (Optional)

- Numbered list of downloadable files
- Direct download links

---

## Series Metadata Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `series.name` | Yes* | Series display name | `"Gatsby Fundamentals"` |
| `series.prev` | No | Path to previous article | `"/articles/intro-gatsby"` |
| `series.next` | No | Path to next article | `"/articles/gatsby-config"` |
| `series.references` | No | Array of external URLs | See below |
| `series.attachments` | No | Array of file downloads | See below |

**\* Required if series object exists**

---

## Creating a Series

### Step 1: Create First Article

```yaml
series:
  name: "Gatsby Fundamentals"
  next: "/articles/getting-started-gatsby"
```

### Step 2: Create Second Article

```yaml
series:
  name: "Gatsby Fundamentals"  # Must match exactly!
  prev: "/articles/intro-gatsby"
  next: "/articles/gatsby-config"
```

### Step 3: Create Remaining Articles

```yaml
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/getting-started-gatsby"
  # next omitted for last article
```

---

## Adding References

```yaml
series:
  name: "Gatsby Fundamentals"
  references:
    - url: "https://www.gatsbyjs.com/docs/"
      title: "Official Gatsby Documentation"
    - url: "https://reactjs.org/docs/"
      title: "React Documentation"
```

**Notes**:
- `title` is optional (will be generated from URL if omitted)
- Maximum 20 references per article
- URLs must start with `http://` or `https://`

---

## Adding Attachments

```yaml
series:
  name: "Gatsby Fundamentals"
  attachments:
    - filename: "/downloads/gatsby-starter.zip"
      title: "Gatsby Starter Template"
    - filename: "/downloads/sample-code.js"
      title: "Sample Code File"
```

**Notes**:
- `title` is optional (will be generated from filename if omitted)
- Maximum 10 attachments per article
- Files must exist at specified path
- Absolute paths start with `/` (relative to site root)
- External URLs supported (e.g., CDN links)

---

## Important Rules

### ✅ DO

- Use the exact same `series.name` across all articles in a series
- Ensure prev/next links point to existing articles
- Keep series names between 3-60 characters
- Provide descriptive titles for references and attachments
- Place attachment files in `/public/downloads/` or similar

### ❌ DON'T

- Create circular references (A → B → A)
- Use different capitalizations for series name
- Reference non-existent articles in prev/next
- Exceed 20 references or 10 attachments per article
- Use invalid URLs for references
- Point to non-existent files for attachments

---

## How Table of Contents is Generated

The system automatically:

1. Finds all articles with matching `series.name`
2. Sorts them by `publishedAt` date (oldest first)
3. Numbers them sequentially (1, 2, 3, ...)
4. Marks the current article as non-linked
5. Renders other articles as clickable links

**Example Output**:

```
Table of Contents
1. Introduction to Gatsby
2. Getting Started with Gatsby  ← (current article, not linked)
3. Gatsby Configuration
4. Deploying Your Gatsby Site
```

---

## Sticky Behavior

The series widget uses sticky positioning:

- **Normal State**: Widget appears in sidebar at its normal position
- **Scrolling Down**: When widget reaches top of viewport, it becomes fixed
- **Fixed State**: Widget stays visible at top while page scrolls
- **Scrolling Up**: Widget returns to normal position when appropriate

This keeps navigation accessible while reading long articles.

---

## Validation

### Build Errors (Will Fail Build)

- Missing `series.name` when series object exists
- Invalid prev/next references (articles don't exist)
- Circular references in series chain
- Invalid reference URLs
- Missing attachment files

### Build Warnings (Won't Fail Build)

- Series with only 1 article
- Very large attachment files (>50MB)
- Broken reference URLs (can't fetch title)
- Series name case inconsistencies

---

## Minimal Example (First Article)

```yaml
---
slug: "intro-gatsby"
title: "Introduction to Gatsby"
# ... other required fields ...
series:
  name: "Gatsby Fundamentals"
  next: "/articles/getting-started-gatsby"
---
```

## Complete Example (Middle Article)

```yaml
---
slug: "getting-started-gatsby"
title: "Getting Started with Gatsby"
# ... other required fields ...
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/intro-gatsby"
  next: "/articles/gatsby-config"
  references:
    - url: "https://www.gatsbyjs.com/docs/"
      title: "Gatsby Docs"
  attachments:
    - filename: "/downloads/starter.zip"
      title: "Starter Template"
---
```

## Last Article Example

```yaml
---
slug: "deploying-gatsby"
title: "Deploying Your Gatsby Site"
# ... other required fields ...
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/gatsby-config"
  # next omitted (last article)
---
```

---

## Next Steps

1. ✅ Review [spec.md](./spec.md) for complete requirements
2. ✅ Check [data-model.md](./data-model.md) for detailed data structure
3. ✅ See [contracts/series-metadata-schema.md](./contracts/series-metadata-schema.md) for validation rules
4. 🔄 Proceed to `/speckit.plan` to create implementation plan
5. 🔄 Begin implementation after plan approval

---

## Questions?

Refer to:
- [spec.md](./spec.md) - Full feature specification
- [data-model.md](./data-model.md) - Data structures and relationships
- [contracts/series-metadata-schema.md](./contracts/series-metadata-schema.md) - Validation contracts
- [checklists/requirements.md](./checklists/requirements.md) - Quality checklist

