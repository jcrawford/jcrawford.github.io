# Contract: Article Series Metadata Schema

**Feature**: Article Series Navigation  
**Version**: 1.0.0  
**Date**: 2025-11-13  
**Status**: In Specification

## Purpose

This contract defines the exact structure and validation rules for series metadata in article frontmatter. Articles with series metadata MUST conform to this schema to enable proper series navigation, table of contents generation, and reference/attachment display.

---

## Series Object Contract

### Rule: Optional Series Metadata

**Location**: Article frontmatter as nested `series` object

**Requirements**:
- Series object is OPTIONAL in article frontmatter
- If `series` object exists, `name` field is REQUIRED
- Other fields (`prev`, `next`, `references`, `attachments`) are OPTIONAL
- Series object must be valid YAML syntax

**Valid Examples**:
```yaml
# Article without series (valid)
---
slug: "standalone-article"
title: "Standalone Article"
# ... no series field
---

# Article with minimal series (valid)
---
slug: "series-article"
title: "Series Article"
series:
  name: "My Article Series"
---

# Article with complete series (valid)
---
slug: "series-article-2"
title: "Series Article Part 2"
series:
  name: "My Article Series"
  prev: "/articles/series-article"
  next: "/articles/series-article-3"
  references:
    - url: "https://example.com"
      title: "Example Resource"
  attachments:
    - filename: "/downloads/code.zip"
      title: "Source Code"
---
```

**Invalid Examples**:
```yaml
# Empty series object (invalid - must have name if present)
❌ series: {}

# Series with only prev/next (invalid - name required)
❌ series:
    prev: "/articles/previous"
    next: "/articles/next"

# Series as string (invalid - must be object)
❌ series: "My Series Name"
```

---

## Field: series.name

**Type**: `string`  
**Required**: Yes (if series object exists)  
**Validation**:
- Minimum length: 3 characters
- Maximum length: 60 characters
- Can include: letters, numbers, spaces, punctuation
- Case-sensitive (must match exactly across all articles in series)
- No leading or trailing whitespace
- Must be enclosed in quotes if contains special YAML characters

**Examples**:
```yaml
✅ series:
    name: "Gatsby Fundamentals"

✅ series:
    name: "Advanced TypeScript: A Deep Dive"

✅ series:
    name: "React Hooks 101"

❌ series:
    name: "" (empty string)

❌ series:
    name: "AB" (too short)

❌ series:
    name: "This is an extremely long series name that exceeds the maximum character limit" (too long)

❌ series:
    name: "  Gatsby Fundamentals  " (leading/trailing whitespace)
```

---

## Field: series.prev

**Type**: `string` or `null`  
**Required**: No  
**Validation**:
- Must be valid article path or slug
- Pattern: Absolute path starting with `/` or relative slug
- Must reference an existing published article
- Cannot create circular references (A → B → A)
- Cannot reference self (article cannot be its own previous)
- Omit field or use `null` for first article in series

**Examples**:
```yaml
✅ series:
    name: "Gatsby Fundamentals"
    prev: "/articles/intro-to-gatsby"

✅ series:
    name: "Gatsby Fundamentals"
    prev: "intro-to-gatsby"

✅ series:
    name: "Gatsby Fundamentals"
    prev: null  # First article

✅ series:
    name: "Gatsby Fundamentals"
    # prev field omitted (first article)

❌ series:
    name: "Gatsby Fundamentals"
    prev: "https://external-site.com/article" (external URLs not allowed)

❌ series:
    name: "Gatsby Fundamentals"
    prev: "/articles/nonexistent" (article must exist)

❌ series:
    name: "Gatsby Fundamentals"
    prev: "/articles/current-article" (cannot reference self)

❌ series:
    name: "Gatsby Fundamentals"
    prev: "" (empty string not allowed, use null or omit)
```

---

## Field: series.next

**Type**: `string` or `null`  
**Required**: No  
**Validation**:
- Same validation rules as `series.prev`
- Must reference an existing published article
- Cannot create circular references
- Cannot reference self
- Omit field or use `null` for last article in series

**Examples**:
```yaml
✅ series:
    name: "Gatsby Fundamentals"
    next: "/articles/gatsby-config"

✅ series:
    name: "Gatsby Fundamentals"
    next: "gatsby-config"

✅ series:
    name: "Gatsby Fundamentals"
    next: null  # Last article

✅ series:
    name: "Gatsby Fundamentals"
    # next field omitted (last article)

❌ series:
    name: "Gatsby Fundamentals"
    next: "/articles/nonexistent" (article must exist)

❌ series:
    name: "Gatsby Fundamentals"
    next: "/articles/current-article" (cannot reference self)
```

---

## Field: series.references

**Type**: `array<object>` or `null`  
**Required**: No  
**Validation**:
- Must be YAML array of reference objects
- Minimum: 0 references (can omit field)
- Maximum: 20 references per article
- Order is preserved (display order)
- Each reference must have `url` field
- Each reference may have optional `title` field

**Array Example**:
```yaml
✅ series:
    name: "Gatsby Fundamentals"
    references:
      - url: "https://www.gatsbyjs.com/docs/"
        title: "Official Gatsby Documentation"
      - url: "https://reactjs.org/docs/getting-started.html"
        title: "React Documentation"

✅ series:
    name: "Gatsby Fundamentals"
    references:
      - url: "https://example.com/resource"
        # title omitted (will be generated from URL)

✅ series:
    name: "Gatsby Fundamentals"
    # references field omitted (no references)

✅ series:
    name: "Gatsby Fundamentals"
    references: []  # Empty array (no references)

❌ series:
    name: "Gatsby Fundamentals"
    references: "https://example.com" (must be array, not string)

❌ series:
    name: "Gatsby Fundamentals"
    references:
      - url: "invalid-url" (malformed URL)
      
❌ series:
    name: "Gatsby Fundamentals"
    references:
      - title: "Missing URL" (url field required)
```

---

## Field: series.references[].url

**Type**: `string`  
**Required**: Yes (for each reference object)  
**Validation**:
- Must be valid URL
- Pattern: `^https?://[a-zA-Z0-9.-]+/.+$`
- Must start with `http://` or `https://`
- Must contain valid domain name
- Path, query parameters, and fragments allowed

**Examples**:
```yaml
✅ url: "https://www.gatsbyjs.com/docs/"
✅ url: "https://example.com/page?query=value"
✅ url: "http://example.com/resource#section"
✅ url: "https://api.github.com/repos/owner/repo"

❌ url: "example.com" (missing protocol)
❌ url: "ftp://example.com" (FTP not supported)
❌ url: "/local/path" (relative path)
❌ url: "" (empty string)
```

---

## Field: series.references[].title

**Type**: `string`  
**Required**: No  
**Validation**:
- Minimum length: 3 characters (if provided)
- Maximum length: 100 characters
- Can include any characters
- Must be enclosed in quotes if contains special YAML characters

**Title Generation**: If not provided, title will be generated from:
1. URL hostname and path (e.g., "gatsbyjs.com/docs")
2. Capitalized domain name (e.g., "Gatsbyjs.com")
3. Full URL as fallback

**Examples**:
```yaml
✅ title: "Official Gatsby Documentation"
✅ title: "React Docs: Getting Started"
✅ title: "GitHub API Reference"

❌ title: "" (empty string if provided)
❌ title: "AB" (too short if provided)
```

---

## Field: series.attachments

**Type**: `array<object>` or `null`  
**Required**: No  
**Validation**:
- Must be YAML array of attachment objects
- Minimum: 0 attachments (can omit field)
- Maximum: 10 attachments per article
- Order is preserved (display order)
- Each attachment must have `filename` field
- Each attachment may have optional `title` field

**Array Example**:
```yaml
✅ series:
    name: "Gatsby Fundamentals"
    attachments:
      - filename: "/downloads/gatsby-starter.zip"
        title: "Gatsby Starter Template"
      - filename: "/downloads/sample-data.json"
        title: "Sample Dataset"

✅ series:
    name: "Gatsby Fundamentals"
    attachments:
      - filename: "/downloads/code.zip"
        # title omitted (will be generated from filename)

✅ series:
    name: "Gatsby Fundamentals"
    # attachments field omitted (no attachments)

✅ series:
    name: "Gatsby Fundamentals"
    attachments: []  # Empty array (no attachments)

❌ series:
    name: "Gatsby Fundamentals"
    attachments: "/downloads/file.zip" (must be array, not string)

❌ series:
    name: "Gatsby Fundamentals"
    attachments:
      - title: "Missing Filename" (filename field required)
```

---

## Field: series.attachments[].filename

**Type**: `string`  
**Required**: Yes (for each attachment object)  
**Validation**:
- Must be valid file path or URL
- Absolute paths: Start with `/` (relative to site root)
- Relative paths: Resolved from article location
- External URLs: Start with `http://` or `https://`
- File must exist at specified path (validated at build time)
- Any file extension allowed (zip, pdf, csv, json, etc.)

**Examples**:
```yaml
✅ filename: "/downloads/sample-code.zip"
✅ filename: "/downloads/dataset.csv"
✅ filename: "attachments/local-file.pdf"
✅ filename: "https://cdn.example.com/file.zip"

❌ filename: "" (empty string)
❌ filename: "/downloads/nonexistent.zip" (file must exist)
```

---

## Field: series.attachments[].title

**Type**: `string`  
**Required**: No  
**Validation**:
- Minimum length: 3 characters (if provided)
- Maximum length: 100 characters
- Can include any characters
- Must be enclosed in quotes if contains special YAML characters

**Title Generation**: If not provided, title will be generated from filename:
1. Remove extension: `"sample-code.zip"` → `"sample-code"`
2. Replace hyphens/underscores with spaces: `"sample-code"` → `"sample code"`
3. Capitalize words: `"sample code"` → `"Sample Code"`

**Examples**:
```yaml
✅ title: "Source Code Package"
✅ title: "Sample Dataset (CSV)"
✅ title: "Project Template"

❌ title: "" (empty string if provided)
❌ title: "AB" (too short if provided)
```

---

## Complete Series Metadata Template

### Minimal Series (First Article)

```yaml
---
slug: "intro-to-gatsby"
title: "Introduction to Gatsby"
excerpt: "Learn the basics of Gatsby static site generator."
featuredImage: "https://images.unsplash.com/photo-..."
category: "technology"
tags: ["gatsby", "tutorial"]
author: "alex-thompson"
publishedAt: "2024-01-01T10:00:00.000Z"
updatedAt: "2024-01-01T10:00:00.000Z"
series:
  name: "Gatsby Fundamentals"
  next: "/articles/getting-started-gatsby"
---
```

### Full Series (Middle Article)

```yaml
---
slug: "getting-started-gatsby"
title: "Getting Started with Gatsby"
excerpt: "Set up your first Gatsby project and understand the basics."
featuredImage: "https://images.unsplash.com/photo-..."
category: "technology"
tags: ["gatsby", "tutorial", "featured"]
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
    - url: "https://reactjs.org/docs/getting-started.html"
      title: "React Documentation"
    - url: "https://graphql.org/learn/"
      title: "GraphQL Introduction"
  attachments:
    - filename: "/downloads/gatsby-starter-template.zip"
      title: "Gatsby Starter Template"
    - filename: "/downloads/sample-gatsby-config.js"
      title: "Sample Configuration File"
---
```

### Last Article in Series

```yaml
---
slug: "deploying-gatsby"
title: "Deploying Your Gatsby Site"
excerpt: "Learn how to deploy your Gatsby site to various platforms."
featuredImage: "https://images.unsplash.com/photo-..."
category: "technology"
tags: ["gatsby", "deployment"]
author: "alex-thompson"
publishedAt: "2024-01-22T10:00:00.000Z"
updatedAt: "2024-01-22T10:00:00.000Z"
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/gatsby-configuration"
  references:
    - url: "https://pages.github.com/"
      title: "GitHub Pages"
    - url: "https://www.netlify.com/docs/"
      title: "Netlify Documentation"
---
```

---

## Validation Error Messages

### Build-Time Errors

**Missing Series Name**:
```
Error: series.name is required when series object exists
File: getting-started-gatsby.md
```

**Invalid Series Name Length**:
```
Error: series.name must be 3-60 characters
File: getting-started-gatsby.md
Value: "AB" (length: 2)
```

**Invalid Previous Article Reference**:
```
Error: series.prev references non-existent article
File: getting-started-gatsby.md
Value: "/articles/nonexistent"
```

**Circular Reference Detected**:
```
Error: Circular reference detected in series navigation
Chain: intro-to-gatsby → getting-started-gatsby → intro-to-gatsby
```

**Invalid Reference URL**:
```
Error: series.references[0].url is not a valid URL
File: getting-started-gatsby.md
Value: "example.com" (missing protocol)
```

**Attachment File Not Found**:
```
Error: Attachment file does not exist
File: getting-started-gatsby.md
Path: /downloads/nonexistent.zip
```

**Invalid References Array**:
```
Error: series.references must be an array
File: getting-started-gatsby.md
Value: "https://example.com" (string provided instead of array)
```

### Build-Time Warnings

**Series with Single Article**:
```
Warning: Series "Gatsby Fundamentals" contains only 1 article
Series typically have 2+ articles
```

**Broken Reference URL**:
```
Warning: Could not fetch reference URL for title extraction
File: getting-started-gatsby.md
URL: https://example.com/broken-link
Using URL hostname as fallback title
```

**Large Attachment File**:
```
Warning: Attachment file is very large (>50MB)
File: getting-started-gatsby.md
Path: /downloads/large-file.zip
Size: 75MB
Consider splitting into smaller files or using external hosting
```

**Series Name Inconsistency**:
```
Warning: Potential series name inconsistency detected
"Gatsby Fundamentals" vs "Gatsby fundamentals"
Series names are case-sensitive and must match exactly
```

---

## Validation Rules Summary

### Required Validations (Build Must Fail)

1. ✅ If `series` object exists, `name` field must be present
2. ✅ `series.name` must be 3-60 characters
3. ✅ `series.prev` must reference existing article (if provided)
4. ✅ `series.next` must reference existing article (if provided)
5. ✅ No circular references in prev/next chain
6. ✅ Article cannot reference itself in prev/next
7. ✅ `series.references[].url` must be valid URL (if references provided)
8. ✅ `series.attachments[].filename` must point to existing file (if attachments provided)
9. ✅ Valid YAML syntax for entire series object

### Optional Validations (Warnings Only)

1. ⚠️ Series with only 1 article (unusual but allowed)
2. ⚠️ Attachment files larger than 50MB
3. ⚠️ Reference URLs that cannot be fetched (broken links)
4. ⚠️ Series name case inconsistencies across articles
5. ⚠️ Missing titles for references/attachments (will be auto-generated)

---

## Testing Contract Compliance

### Manual Validation Checklist

For articles with series metadata:
- [ ] Series object is valid YAML
- [ ] Series name is 3-60 characters
- [ ] Series name matches exactly across all articles in series
- [ ] Prev/next references point to existing articles
- [ ] No circular references in series navigation
- [ ] All reference URLs are valid and well-formed
- [ ] All attachment files exist at specified paths
- [ ] References array has 0-20 items
- [ ] Attachments array has 0-10 items
- [ ] Series widget displays correctly on article page
- [ ] Table of contents shows all series articles
- [ ] Current article is non-linked in table of contents
- [ ] Prev/next navigation buttons work correctly

### Automated Validation

```typescript
function validateSeriesMetadata(article: Article): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if series object exists
  if (article.series) {
    // Validate required name field
    if (!article.series.name) {
      errors.push('series.name is required when series object exists');
    } else if (article.series.name.length < 3 || article.series.name.length > 60) {
      errors.push('series.name must be 3-60 characters');
    }
    
    // Validate prev reference
    if (article.series.prev && !articleExists(article.series.prev)) {
      errors.push(`series.prev references non-existent article: ${article.series.prev}`);
    }
    
    // Validate next reference
    if (article.series.next && !articleExists(article.series.next)) {
      errors.push(`series.next references non-existent article: ${article.series.next}`);
    }
    
    // Check for circular references
    if (hasCircularReference(article)) {
      errors.push('Circular reference detected in series navigation');
    }
    
    // Validate references
    if (article.series.references) {
      if (!Array.isArray(article.series.references)) {
        errors.push('series.references must be an array');
      } else if (article.series.references.length > 20) {
        errors.push('series.references cannot exceed 20 items');
      } else {
        article.series.references.forEach((ref, index) => {
          if (!ref.url) {
            errors.push(`series.references[${index}].url is required`);
          } else if (!isValidURL(ref.url)) {
            errors.push(`series.references[${index}].url is not valid: ${ref.url}`);
          }
        });
      }
    }
    
    // Validate attachments
    if (article.series.attachments) {
      if (!Array.isArray(article.series.attachments)) {
        errors.push('series.attachments must be an array');
      } else if (article.series.attachments.length > 10) {
        errors.push('series.attachments cannot exceed 10 items');
      } else {
        article.series.attachments.forEach((attachment, index) => {
          if (!attachment.filename) {
            errors.push(`series.attachments[${index}].filename is required`);
          } else if (!fileExists(attachment.filename)) {
            errors.push(`Attachment file not found: ${attachment.filename}`);
          } else if (getFileSize(attachment.filename) > 50 * 1024 * 1024) {
            warnings.push(`Large attachment (>50MB): ${attachment.filename}`);
          }
        });
      }
    }
    
    // Check series article count
    const seriesArticleCount = countSeriesArticles(article.series.name);
    if (seriesArticleCount === 1) {
      warnings.push(`Series "${article.series.name}" has only 1 article`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## Breaking Changes Policy

This schema is considered **draft** until feature implementation is complete.

### Minor Changes (Non-Breaking)

These changes require incrementing patch version (1.0.X):
- Adding optional fields to series object
- Increasing maximum limits (e.g., max references from 20 to 30)
- Documentation clarifications
- Adding validation warnings (non-blocking)

### Major Changes (Breaking)

These changes require incrementing major version (X.0.0):
- Changing series.name from optional to required (if no series object exists)
- Renaming fields (e.g., `prev` to `previous`)
- Changing field types (e.g., `prev` from string to object)
- Removing fields
- Decreasing maximum limits
- Making validation warnings into errors

---

## Version History

- **1.0.0** (2025-11-13): Initial schema definition for Article Series Navigation feature

---

## References

- [YAML 1.2 Specification](https://yaml.org/spec/1.2.2/)
- [URL Standard](https://url.spec.whatwg.org/)
- [Markdown Frontmatter](https://jekyllrb.com/docs/front-matter/)

---

## Approval

**Status**: 🔄 In Specification  
**Approved By**: Pending implementation planning  
**Date**: 2025-11-13

This schema contract will be finalized after specification review and before implementation begins.

