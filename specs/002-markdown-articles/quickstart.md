# Quick Start Guide: Creating Markdown Articles

**Feature**: Convert Article Data from JSON to Markdown with Frontmatter  
**Date**: 2025-01-07  
**Audience**: Content Authors and Developers

## Overview

This guide shows you how to create new blog articles in Markdown format for the Gatsby site. After the migration from JSON to Markdown, all articles are stored as `.md` files with YAML frontmatter.

---

## Prerequisites

- Git repository cloned to your local machine
- Node.js 18+ installed
- Dependencies installed (`npm install`)
- Familiarity with basic Markdown syntax

---

## Quick Start (5 Minutes)

### Step 1: Create a New File

Navigate to the `content/posts/` directory and create a new `.md` file:

```bash
cd content/posts/
touch my-new-article-slug.md
```

**Important**: Use kebab-case (lowercase with hyphens) for the filename.

### Step 2: Copy the Template

Paste this template into your new file:

```markdown
---
slug: "my-new-article-slug"
title: "My Article Title Goes Here"
excerpt: "A brief 150-200 character summary of the article that will appear in previews and search results."
featuredImage: "https://images.unsplash.com/photo-XXXXXXXXX?w=1200&q=90"
category: "lifestyle"
tags: ["lifestyle", "mindfulness"]
author: "alex-thompson"
publishedAt: "2025-01-07T10:00:00.000Z"
updatedAt: "2025-01-07T10:00:00.000Z"
---

## Introduction

Write your opening paragraph here. This should hook the reader and introduce the topic.

### First Section

Content for your first main point...

### Second Section

Content for your second main point...

## Conclusion

Wrap up your article with final thoughts or a call to action.
```

### Step 3: Fill in the Frontmatter

Replace the placeholder values in the frontmatter (between the `---` markers):

1. **slug**: Must match your filename (without `.md`)
2. **title**: Your article's display title (5-100 characters)
3. **excerpt**: Brief summary (50-300 characters)
4. **featuredImage**: Get from Unsplash (see instructions below)
5. **category**: One of: `fashion`, `lifestyle`, `food`, `travel`, `sports`
6. **tags**: Array of 1-5 relevant tags
7. **author**: Currently only `alex-thompson`
8. **publishedAt**: Current date/time in ISO 8601 format (see below)
9. **updatedAt**: Same as publishedAt for new articles

### Step 4: Write Your Content

Replace the template content with your article. Use Markdown syntax for formatting:

- `##` for main sections (H2)
- `###` for subsections (H3)
- `**bold**` for emphasis
- `*italic*` for style
- `[link text](https://example.com)` for links

### Step 5: Preview Locally

Start the development server to see your article:

```bash
npm run develop
```

Visit `http://localhost:8000` and navigate to your article at:
```
http://localhost:8000/articles/my-new-article-slug
```

### Step 6: Commit and Push

Once you're happy with the article:

```bash
git add content/posts/my-new-article-slug.md
git commit -m "Add new article: My Article Title"
git push
```

---

## Detailed Instructions

### Getting a Featured Image from Unsplash

1. Go to [Unsplash.com](https://unsplash.com/)
2. Search for relevant images (e.g., "travel", "food", "fashion")
3. Click on an image you like
4. Right-click the image and select "Copy Image Address"
5. The URL will look like: `https://images.unsplash.com/photo-1234567890...`
6. Add quality params: `?w=1200&q=90` to the end
7. Paste in the `featuredImage` field

**Example**:
```yaml
featuredImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=90"
```

### Getting the Current Date in ISO 8601 Format

**Option 1: Command Line** (Mac/Linux):
```bash
date -u +"%Y-%m-%dT%H:%M:%S.000Z"
```

**Option 2: Online Tool**:
- Visit https://www.timestamp-converter.com/
- Copy the ISO 8601 format

**Option 3: JavaScript Console**:
```javascript
new Date().toISOString()
```

**Example Output**:
```
2025-01-07T14:30:00.000Z
```

Paste this value in both `publishedAt` and `updatedAt` fields.

### Choosing a Category

Your article MUST belong to one of these categories:

| Category | Slug | Description |
|----------|------|-------------|
| Fashion | `fashion` | Style, trends, clothing, accessories |
| Lifestyle | `lifestyle` | Personal development, mindfulness, inspiration |
| Food | `food` | Recipes, dining, nutrition, cooking |
| Travel | `travel` | Destinations, adventures, travel tips |
| Sports | `sports` | Fitness, athletics, outdoor activities |

**Example**:
```yaml
category: "travel"
```

### Choosing Tags

Tags help organize and filter articles. Use 1-5 relevant tags:

**Common Tags**:
- `featured` - Include this for articles that should appear in the homepage slider
- Category names - Often duplicate the category as a tag (e.g., `lifestyle`)
- Topic keywords - Specific themes (e.g., `mindfulness`, `recipes`, `fitness`)

**Examples**:
```yaml
tags: ["featured", "travel", "adventure"]
tags: ["food", "recipes", "healthy"]
tags: ["lifestyle"]
```

---

## Markdown Syntax Reference

### Headings

```markdown
## Main Section (H2)
### Subsection (H3)
#### Sub-subsection (H4)
```

**Don't use** `#` (H1) - the article title comes from frontmatter.

### Text Formatting

```markdown
**bold text**
*italic text*
***bold and italic***
```

### Lists

**Unordered**:
```markdown
- First item
- Second item
- Third item
```

**Ordered**:
```markdown
1. First step
2. Second step
3. Third step
```

### Links

```markdown
[Link text](https://example.com)
```

**Example**:
```markdown
Check out [this guide](https://www.gatsbyjs.com/docs/) for more info.
```

### Blockquotes

```markdown
> This is a quote.
> It can span multiple lines.
```

### Code Blocks

**Inline code**:
```markdown
Use the `console.log()` function.
```

**Code block**:
````markdown
```javascript
function example() {
  return "Hello";
}
```
````

### Horizontal Rules

```markdown
---
```

**Note**: Don't use `---` within your content near the top, as it might be confused with frontmatter delimiters.

---

## Content Writing Guidelines

### Length

- **Minimum**: 300 words (about 2-3 minutes reading time)
- **Optimal**: 500-1000 words (3-7 minutes)
- **Maximum**: No limit, but consider breaking very long articles into series

### Structure

**Good Structure**:
1. Introduction paragraph (no heading)
2. Main sections with H2 headings (`##`)
3. Subsections with H3 headings (`###`) if needed
4. Conclusion or call-to-action

**Example Outline**:
```markdown
## Introduction
Brief intro paragraph...

## First Main Point
Content...

### Supporting Detail
More content...

## Second Main Point
Content...

## Conclusion
Wrap up...
```

### Tone and Style

- Write in a conversational, engaging tone
- Use short paragraphs (3-5 sentences)
- Include concrete examples
- Break up long text with headings
- Use active voice when possible
- Proofread for grammar and spelling

---

## Validation Checklist

Before committing your article, verify:

**Frontmatter**:
- [ ] Slug matches filename exactly
- [ ] Title is 5-100 characters
- [ ] Excerpt is 50-300 characters and descriptive
- [ ] Featured image URL is valid HTTPS (Unsplash recommended)
- [ ] Category is one of the 5 valid options
- [ ] Tags array has 1-5 items
- [ ] Author is `alex-thompson`
- [ ] PublishedAt is valid ISO 8601 date (not in the future)
- [ ] UpdatedAt is same as publishedAt (for new articles)
- [ ] No YAML syntax errors (proper quotes, brackets)

**Content**:
- [ ] At least 300 words
- [ ] Uses H2 (`##`) for main sections
- [ ] No H1 headings (`#`)
- [ ] Markdown syntax is valid
- [ ] No HTML tags (use Markdown instead)
- [ ] Links work and go to correct destinations
- [ ] Spell-checked and proofread

**Build**:
- [ ] `npm run develop` runs without errors
- [ ] Article appears at `/articles/[slug]`
- [ ] Article appears in category archive
- [ ] Featured image displays correctly
- [ ] Content renders as expected
- [ ] No console errors or warnings

---

## Troubleshooting

### Error: "Invalid YAML frontmatter"

**Problem**: YAML syntax error in your frontmatter.

**Solutions**:
- Check that all strings with special characters are in quotes
- Verify tags are in array format: `["tag1", "tag2"]`
- Ensure no tabs (use spaces for indentation)
- Validate YAML at https://www.yamllint.com/

### Error: "Missing required field"

**Problem**: One or more frontmatter fields are missing.

**Solution**: Verify all 9 required fields are present:
- slug, title, excerpt, featuredImage, category, tags, author, publishedAt, updatedAt

### Error: "Category '[X]' does not exist"

**Problem**: Invalid category value.

**Solution**: Use only these values: `fashion`, `lifestyle`, `food`, `travel`, `sports` (lowercase)

### Article doesn't appear on homepage

**Problem**: Not tagged as featured.

**Solution**: Add `featured` to your tags array:
```yaml
tags: ["featured", "other-tags"]
```

### Images not loading

**Problem**: Invalid image URL or blocked by browser.

**Solutions**:
- Use HTTPS URLs only (not HTTP)
- Use Unsplash images (most reliable)
- Check browser console for specific error
- Verify URL is accessible in browser directly

### Build is slow

**Problem**: Large images or many articles.

**Solution**: 
- Use Unsplash URLs with `?w=1200&q=90` parameters
- Ensure images are reasonable size (not 10+ MB originals)
- Run `npm run clean` to clear cache

---

## Advanced Tips

### Using Excerpt Separator

To manually control where the excerpt ends, add this HTML comment:

```markdown
---
excerpt: "Auto-generated excerpt from content..."
---

This is the start of your article that will be used as the excerpt.

<!-- end-excerpt -->

This content will NOT be included in the excerpt.
```

### Scheduling Future Posts

Set `publishedAt` to a future date/time:

```yaml
publishedAt: "2025-02-01T10:00:00.000Z"
```

**Note**: The site must be rebuilt after the publish date for the article to appear. GitHub Pages auto-builds on push, not on schedule.

### Updating Existing Articles

When editing an article:

1. Make your content changes
2. Update the `updatedAt` field to the current date/time
3. Keep `publishedAt` unchanged (preserves original publish date)

```yaml
publishedAt: "2024-01-15T10:00:00.000Z"
updatedAt: "2025-01-07T14:30:00.000Z"
```

---

## Next Steps

After creating your first article:

1. Explore existing articles in `content/posts/` for examples
2. Review the [Data Model](./data-model.md) for technical details
3. Check the [Markdown Schema Contract](./contracts/markdown-schema.md) for validation rules
4. Experiment with different Markdown formatting

---

## Getting Help

**Common Issues**: See Troubleshooting section above

**Markdown Questions**: [Markdown Guide](https://www.markdownguide.org/)

**Gatsby Questions**: [Gatsby Documentation](https://www.gatsbyjs.com/docs/)

**Unsplash Images**: [Unsplash](https://unsplash.com/)

**YAML Validation**: [YAML Lint](https://www.yamllint.com/)

**Date Formatting**: [Timestamp Converter](https://www.timestamp-converter.com/)

---

## Appendix: Complete Example

Here's a complete, real-world example article:

```markdown
---
slug: "mindfulness-practices-for-busy-professionals"
title: "5 Mindfulness Practices for Busy Professionals"
excerpt: "Discover simple mindfulness techniques that fit into your hectic schedule and improve your focus, reduce stress, and enhance well-being."
featuredImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=90"
category: "lifestyle"
tags: ["lifestyle", "mindfulness", "productivity"]
author: "alex-thompson"
publishedAt: "2025-01-07T09:00:00.000Z"
updatedAt: "2025-01-07T09:00:00.000Z"
---

## Introduction

In today's fast-paced business world, finding time for mindfulness can seem impossible. However, even busy professionals can integrate simple practices into their daily routine to reap the benefits of increased focus and reduced stress.

## Morning Meditation (5 Minutes)

Start your day with a brief meditation session. Find a quiet space, sit comfortably, and focus on your breath for just five minutes. This simple practice can set a positive tone for the entire day.

### How to Begin

1. Wake up 10 minutes earlier
2. Find a quiet spot in your home
3. Sit comfortably with your back straight
4. Close your eyes and focus on your breathing
5. When your mind wanders, gently return to your breath

## Mindful Commuting

Transform your commute into a mindfulness practice. Instead of scrolling through your phone, observe your surroundings, notice your breath, or listen to a guided meditation.

## Breathing Exercises at Your Desk

Take three deep breaths before starting any new task. This simple pause helps you transition mindfully between activities and improves focus.

## Mindful Eating at Lunch

Dedicate at least ten minutes of your lunch break to eating without distractions. Pay attention to the flavors, textures, and sensations of your food.

## Evening Reflection

End your day by journaling for five minutes about three things you're grateful for. This practice shifts your mind from work stress to appreciation.

## Conclusion

These five practices require minimal time but can significantly impact your well-being and productivity. Start with one technique and gradually incorporate others as they become habit.

Remember: mindfulness isn't about perfection—it's about practice. Even a few mindful moments each day can make a meaningful difference in your life.
```

This article demonstrates:
- Complete, valid frontmatter
- Clear structure with H2 and H3 headings
- Engaging introduction and conclusion
- Practical, actionable content
- Appropriate length (around 400 words)
- Proper Markdown formatting

---

**Happy writing!** 📝




