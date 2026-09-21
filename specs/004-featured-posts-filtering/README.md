# Featured Posts Filtering - Feature Specification

## Quick Summary

**What**: Replace the homepage featured section logic from "7 most recent posts" to "posts explicitly marked with `featured: true`"

**Why**: Give editorial control to curate the most prominent homepage content rather than automatically showing recent posts

**When**: To be implemented on the develop branch (no feature branch)

**Effort**: ~2-2.5 hours (development + testing)

## What's Changing

### Before
- Homepage featured section automatically shows the 7 most recent posts (excluding family posts)
- No control over which posts appear in this prominent section
- Recent posts may not be the best posts to showcase

### After
- Homepage featured section shows only posts marked with `featured: true` in frontmatter
- Content editors manually curate which posts appear
- Family posts are excluded even if marked as featured
- Maximum 7 featured posts displayed (5 slider + 2 highlighted)
- New npm script (`npm run list-featured`) to audit featured posts

## Key Documents

- **[spec.md](./spec.md)**: Complete feature specification with user stories, requirements, and success criteria
- **[data-model.md](./data-model.md)**: Frontmatter structure, data flow, and relationships
- **[quickstart.md](./quickstart.md)**: Implementation guide with code snippets and testing checklist
- **[checklists/requirements.md](./checklists/requirements.md)**: Specification quality validation

## Implementation Phases

### Phase 1: Homepage Logic Update
- Update GraphQL query to include `featured` field
- Change filtering logic to check `featured: true`
- Maintain family post exclusion
- Handle edge cases (< 7 or > 7 featured posts)

### Phase 2: Audit Script
- Create `scripts/list-featured.js`
- Parse markdown frontmatter
- Display featured posts with metadata
- Warn about excess or family featured posts
- Add npm script for easy execution

### Phase 3: Content Curation
- Select 7 posts to feature
- Add `featured: true` to frontmatter
- Verify with audit script
- Test and deploy

## User Impact

### Content Editors
- **Benefit**: Full control over homepage featured content
- **Action Required**: Mark exactly 7 non-family posts with `featured: true`
- **Workflow**: Edit markdown → add `featured: true` → run `npm run list-featured` → commit

### Site Visitors
- **Benefit**: See curated, high-quality content in featured section
- **Change**: Featured posts may not be the most recent, but will be the most relevant/valuable

### Developers
- **Benefit**: Clear audit tooling to validate configuration
- **Maintenance**: Minimal - just frontmatter-based filtering logic

## Technical Details

### Frontmatter Addition

```yaml
---
# Existing fields...
featured: true  # Add this line to feature a post
---
```

### GraphQL Query Update

Add `featured` to the frontmatter selection in `src/pages/index.tsx`

### Filtering Logic

```typescript
const featuredPosts = articles.filter(
  article => article.frontmatter.featured === true && 
             article.frontmatter.category !== 'family'
).slice(0, 7);
```

### Audit Script Usage

```bash
npm run list-featured
```

## Edge Cases Handled

1. ✅ More than 7 posts marked as featured → Show 7 most recent
2. ✅ Fewer than 7 posts marked as featured → Show all available
3. ✅ No posts marked as featured → Empty featured section
4. ✅ Family posts marked as featured → Excluded from display
5. ✅ Featured post in a series → Display as series entity

## Success Criteria

- ✅ Homepage featured section respects `featured: true` frontmatter
- ✅ Family posts never appear in featured section
- ✅ Exactly 7 posts display when 7+ are marked as featured
- ✅ Audit script provides clear, actionable feedback
- ✅ Content editors can curate featured posts without code changes

## Testing Strategy

### Manual Testing
1. Mark 7 non-family posts with `featured: true`
2. Verify they appear on homepage
3. Mark an 8th post → verify only 7 appear
4. Mark a family post → verify it's excluded
5. Run `npm run list-featured` → verify output

### Automated Testing
- Unit tests for filtering logic
- Integration tests for GraphQL query
- Script tests for audit functionality

## Rollout Plan

1. **Implement**: Update code on develop branch
2. **Test**: Verify all scenarios work correctly
3. **Curate**: Select and mark 7 posts as featured
4. **Validate**: Run audit script to confirm configuration
5. **Deploy**: Build and deploy to production
6. **Monitor**: Verify featured section displays correctly

## Future Enhancements (Out of Scope)

- Visual UI for managing featured posts
- Automated featured post rotation
- Featured post performance analytics
- Preview mode for featured post changes
- Scheduled featured post changes

## Questions?

Refer to:
- **Implementation details**: [quickstart.md](./quickstart.md)
- **Data structures**: [data-model.md](./data-model.md)
- **Complete requirements**: [spec.md](./spec.md)

## Status

- ✅ Specification complete and validated
- ⏳ Implementation pending
- ⏳ Testing pending
- ⏳ Deployment pending

