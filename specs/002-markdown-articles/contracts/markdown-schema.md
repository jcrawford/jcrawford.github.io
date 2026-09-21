# Contract: Markdown Article Schema

**Feature**: Convert Article Data from JSON to Markdown with Frontmatter  
**Version**: 1.0.0  
**Date**: 2025-01-07  
**Status**: Approved

## Purpose

This contract defines the exact structure and validation rules for Markdown article files. All article files MUST conform to this schema to be successfully processed by Gatsby.

---

## File Naming Contract

### Rule: Slug-Based Filenames

**Pattern**: `[slug].md`

**Requirements**:
- Filename MUST match the `slug` field in frontmatter exactly
- Extension MUST be `.md` (lowercase)
- Filename MUST use kebab-case (lowercase with hyphens)
- No spaces, underscores, or special characters except hyphens
- No leading or trailing hyphens

**Valid Examples**:
```
✅ the-journey-not-the-arrival-matters.md
✅ fashion-fades-only-style-remains.md
✅ life-is-10-what-happens-to-you.md
```

**Invalid Examples**:
```
❌ The Journey.md (spaces, capital letters)
❌ fashion_fades.md (underscore instead of hyphen)
❌ life-is-10%.md (special character %)
❌ -leading-hyphen.md (leading hyphen)
❌ article.MD (uppercase extension)
```

---

## Frontmatter Field Contracts

### Field: slug

**Type**: `string`  
**Required**: Yes  
**Validation**:
- Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Minimum length: 3 characters
- Maximum length: 100 characters
- Must be unique across all articles
- Must match filename (without .md extension)

**Examples**:
```yaml
✅ slug: "the-journey-not-the-arrival-matters"
✅ slug: "life-is-10-what-happens-to-you"
❌ slug: "The Journey" (spaces, capitals)
❌ slug: "life_is_good" (underscore)
❌ slug: "-no-leading-hyphen"
```

---

### Field: title

**Type**: `string`  
**Required**: Yes  
**Validation**:
- Minimum length: 5 characters
- Maximum length: 100 characters
- Can include: letters, numbers, punctuation, spaces
- No HTML tags
- Must be enclosed in double quotes if contains special YAML characters (`:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`)

**Examples**:
```yaml
✅ title: "The Journey, Not the Arrival Matters"
✅ title: "Life is 10% What Happens to You"
✅ title: "How Does the Place You Live Affect Your Life?"
❌ title: <h1>Title</h1> (HTML tags)
❌ title: "" (empty string)
❌ title: "A" (too short)
```

---

### Field: excerpt

**Type**: `string`  
**Required**: Yes  
**Validation**:
- Minimum length: 50 characters
- Maximum length: 300 characters
- Plain text only (no Markdown or HTML)
- Should be complete sentence(s)
- Must be enclosed in double quotes

**Examples**:
```yaml
✅ excerpt: "Life is about the experiences along the way, not just reaching the destination."
✅ excerpt: "Discover how mindfulness practices can transform your daily routine."
❌ excerpt: "Short" (too short)
❌ excerpt: "Check out <a href='...'>this link</a>" (HTML)
❌ excerpt: "This is way too long and rambles on for many sentences without providing any actual value and just keeps going and going past the reasonable character limit that we established for excerpts which should be concise summaries that give readers a quick preview..." (too long)
```

---

### Field: featuredImage

**Type**: `string`  
**Required**: Yes  
**Validation**:
- Must be valid HTTPS URL
- Pattern: `^https://[a-zA-Z0-9.-]+/.*$`
- Recommended: Unsplash URLs with width/quality params
- Format: `https://images.unsplash.com/photo-[id]?w=1200&q=90`

**Examples**:
```yaml
✅ featuredImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=90"
✅ featuredImage: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1200&q=90"
❌ featuredImage: "http://example.com/image.jpg" (HTTP, not HTTPS)
❌ featuredImage: "/images/local.jpg" (relative path)
❌ featuredImage: "" (empty)
```

---

### Field: category

**Type**: `string`  
**Required**: Yes  
**Validation**:
- Must match existing category slug exactly
- Enum values: `fashion`, `lifestyle`, `food`, `travel`, `sports`
- Lowercase only
- Must exist in `src/data/categories.json`

**Examples**:
```yaml
✅ category: "travel"
✅ category: "lifestyle"
✅ category: "food"
❌ category: "Travel" (must be lowercase)
❌ category: "technology" (category doesn't exist)
❌ category: "" (empty)
```

---

### Field: tags

**Type**: `array<string>`  
**Required**: Yes  
**Validation**:
- Must be YAML array (bracketed format)
- Minimum: 1 tag
- Maximum: 5 tags
- Each tag: lowercase string, 2-20 characters
- Common tags: `featured`, `slide`, category names
- No duplicates within array

**Examples**:
```yaml
✅ tags: ["featured", "travel", "mindfulness"]
✅ tags: ["lifestyle"]
✅ tags: ["food", "recipes", "healthy"]
❌ tags: ["Featured"] (must be lowercase)
❌ tags: [] (empty array)
❌ tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"] (too many)
❌ tags: "featured" (must be array, not string)
```

---

### Field: author

**Type**: `string`  
**Required**: Yes  
**Validation**:
- Must match existing author slug exactly
- Current valid value: `alex-thompson`
- Lowercase with hyphens
- Must exist in `src/data/authors.json`

**Examples**:
```yaml
✅ author: "alex-thompson"
❌ author: "Alex Thompson" (must be slug, not name)
❌ author: "john-doe" (author doesn't exist)
❌ author: "" (empty)
```

---

### Field: publishedAt

**Type**: `string` (ISO 8601 date)  
**Required**: Yes  
**Validation**:
- Pattern: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Must be valid ISO 8601 format with timezone
- Timezone must be UTC (Z suffix)
- Must be parseable by dayjs
- Must not be future date (for publishing)

**Examples**:
```yaml
✅ publishedAt: "2024-01-15T10:00:00.000Z"
✅ publishedAt: "2024-12-25T00:00:00.000Z"
✅ publishedAt: "2023-06-30T15:30:45.123Z"
❌ publishedAt: "2024-01-15" (missing time)
❌ publishedAt: "01/15/2024" (wrong format)
❌ publishedAt: "2024-01-15T10:00:00" (missing timezone)
❌ publishedAt: "" (empty)
```

---

### Field: updatedAt

**Type**: `string` (ISO 8601 date)  
**Required**: Yes  
**Validation**:
- Same as `publishedAt` validation rules
- Must be >= `publishedAt` (updated date cannot be before published date)
- Can be identical to `publishedAt` if never updated

**Examples**:
```yaml
✅ updatedAt: "2024-01-15T10:00:00.000Z" (same as published)
✅ updatedAt: "2024-02-20T14:30:00.000Z" (after published)
❌ updatedAt: "2024-01-10T10:00:00.000Z" (before published date)
```

---

## Content Body Contract

### Structure

**Requirements**:
- Must follow frontmatter block
- Must be valid Markdown syntax
- Recommended minimum: 300 words
- No maximum length
- UTF-8 encoding

**Example Structure**:
```markdown
---
[frontmatter here]
---

## Introduction

First paragraph of content...

### Section Heading

More content...

## Conclusion

Final thoughts...
```

### Markdown Syntax Rules

**Allowed**:
- Headings: `##` (H2), `###` (H3), `####` (H4)
- Paragraphs: Blank line separated
- Bold: `**text**`
- Italic: `*text*`
- Links: `[text](url)`
- Lists: `-` (unordered), `1.` (ordered)
- Blockquotes: `> text`
- Code blocks: ` ```language ... ``` `
- Horizontal rules: `---` (outside frontmatter)

**Not Recommended**:
- Inline images: `![alt](url)` (use featuredImage instead)
- Raw HTML: Use Markdown equivalents
- H1 headings: `#` (title comes from frontmatter)

---

## Complete File Template

```markdown
---
slug: "your-article-slug-here"
title: "Your Article Title Here"
excerpt: "A brief summary of your article content that entices readers to continue reading."
featuredImage: "https://images.unsplash.com/photo-XXXXXXXXX?w=1200&q=90"
category: "lifestyle"
tags: ["featured", "lifestyle", "mindfulness"]
author: "alex-thompson"
publishedAt: "2024-01-15T10:00:00.000Z"
updatedAt: "2024-01-15T10:00:00.000Z"
---

## Introduction

Your opening paragraph goes here. Set the stage for your readers and introduce the main topic of your article.

### First Main Point

Content for your first main section...

### Second Main Point

Content for your second main section...

## Conclusion

Wrap up your thoughts and provide a call-to-action or final reflection for your readers.
```

---

## Validation Error Messages

### Build-Time Errors

**Invalid YAML Syntax**:
```
Error: Invalid YAML frontmatter in file: [filename]
Line [number]: [specific error]
```

**Missing Required Field**:
```
Error: Missing required field '[field]' in frontmatter: [filename]
```

**Invalid Field Type**:
```
Error: Field '[field]' must be [type], got [actual_type] in: [filename]
```

**Invalid Field Value**:
```
Error: Field '[field]' has invalid value '[value]' in: [filename]
Expected: [validation rule]
```

### Migration Script Errors

**Slug Conflict**:
```
Error: Duplicate slug '[slug]' found in:
  - [file1]
  - [file2]
```

**Invalid Category Reference**:
```
Error: Category '[category]' does not exist in categories.json
File: [filename]
```

**Invalid Author Reference**:
```
Error: Author '[author]' does not exist in authors.json
File: [filename]
```

---

## Breaking Changes Policy

This schema is considered **stable** once the migration is complete.

### Minor Changes (Non-Breaking)

These changes require incrementing patch version (1.0.X):
- Adding optional fields
- Relaxing validation rules (e.g., increasing max length)
- Documentation clarifications

### Major Changes (Breaking)

These changes require incrementing major version (X.0.0):
- Removing required fields
- Renaming fields
- Changing field types
- Adding required fields
- Restricting validation rules

**Migration Path**: Breaking changes require:
1. Advance notice in changelog
2. Migration script to update all files
3. Backward compatibility period (if feasible)

---

## Testing Contract Compliance

### Manual Validation Checklist

For each Markdown file:
- [ ] Filename matches slug field exactly
- [ ] All 9 required frontmatter fields present
- [ ] YAML syntax is valid (no parser errors)
- [ ] Slug matches pattern and is unique
- [ ] Title is 5-100 characters
- [ ] Excerpt is 50-300 characters
- [ ] Featured image is valid HTTPS URL
- [ ] Category exists in categories.json
- [ ] Tags array has 1-5 items
- [ ] Author exists in authors.json
- [ ] PublishedAt is valid ISO 8601 date
- [ ] UpdatedAt is valid ISO 8601 date >= publishedAt
- [ ] Content body is valid Markdown
- [ ] File builds successfully with gatsby develop

### Automated Validation

Migration script MUST validate:
```typescript
function validateArticle(filePath: string, frontmatter: any): ValidationResult {
  const errors: string[] = [];
  
  // Check all required fields
  const requiredFields = ['slug', 'title', 'excerpt', 'featuredImage', 
                          'category', 'tags', 'author', 'publishedAt', 'updatedAt'];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check slug pattern
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(frontmatter.slug)) {
    errors.push('Invalid slug format');
  }
  
  // Check title length
  if (frontmatter.title.length < 5 || frontmatter.title.length > 100) {
    errors.push('Title must be 5-100 characters');
  }
  
  // ... more validation rules
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Version History

- **1.0.0** (2025-01-07): Initial schema definition for JSON to Markdown migration

---

## References

- [YAML 1.2 Specification](https://yaml.org/spec/1.2.2/)
- [CommonMark Spec](https://commonmark.org/)
- [ISO 8601 Date Format](https://www.iso.org/iso-8601-date-and-time-format.html)
- [Gatsby Markdown Frontmatter](https://www.gatsbyjs.com/docs/how-to/routing/adding-markdown-pages/#frontmatter-for-metadata-in-markdown-files)

---

## Approval

**Status**: ✅ Approved  
**Approved By**: Implementation Planning Process  
**Date**: 2025-01-07

This schema contract is ready for use in the migration implementation.




