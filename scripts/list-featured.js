#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

/**
 * Recursively retrieves all markdown files from a directory.
 * 
 * @param {string} dir - The directory to search
 * @param {string[]} files - Accumulator array for found files
 * @returns {string[]} Array of absolute file paths to markdown files
 */
function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Formats a table row with aligned columns.
 * Note: Status column handles ANSI color codes, so we don't pad it here
 * 
 * @param {string} status - Status icon (✓ or ✗) with or without color codes
 * @param {string} filename - Relative file path
 * @param {string} title - Post title
 * @param {string} category - Post category
 * @param {string} publishedAt - Publication date
 * @returns {string} Formatted table row
 */
function formatTableRow(status, filename, title, category, publishedAt) {
  // For status, we need to account for ANSI codes that don't display
  // ANSI codes add 9 chars for color start (\x1b[32m) + 4 for reset (\x1b[0m) = 13 extra chars
  const hasColorCodes = status.includes('\x1b[');
  const statusPadding = hasColorCodes ? 6 + 13 : 6; // 6 visible chars + 13 for ANSI codes
  const statusCol = status.padEnd(statusPadding);
  
  const filenameCol = filename.padEnd(50);
  const titleCol = title.slice(0, 40).padEnd(40);
  const categoryCol = category.padEnd(15);
  const dateCol = publishedAt;
  
  return `| ${statusCol} | ${filenameCol} | ${titleCol} | ${categoryCol} | ${dateCol} |`;
}

/**
 * Main execution function for the featured posts audit.
 */
function main() {
  const postsDir = path.join(__dirname, '../content/posts');
  
  console.log('\n========================================');
  console.log('Featured Posts Audit');
  console.log('========================================\n');
  
  try {
    const allFiles = getAllMarkdownFiles(postsDir);
    const featuredPosts = [];
    
    // Parse frontmatter and collect featured posts
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const { data: frontmatter } = matter(content);
      
      if (frontmatter.featured === true) {
        const relativePath = path.relative(postsDir, file);
        featuredPosts.push({
          filename: relativePath,
          title: frontmatter.title || 'Untitled',
          category: frontmatter.category || 'uncategorized',
          publishedAt: frontmatter.publishedAt || 'Unknown',
          isFamilyPost: frontmatter.category === 'family'
        });
      }
    }
    
    // Sort by publication date (most recent first)
    featuredPosts.sort((a, b) => {
      if (a.publishedAt === 'Unknown' || b.publishedAt === 'Unknown') return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    
    // Group by category
    const familyPosts = featuredPosts.filter(p => p.isFamilyPost);
    const nonFamilyPosts = featuredPosts.filter(p => !p.isFamilyPost);
    
    // Display results
    console.log(`Found ${featuredPosts.length} featured post(s):\n`);
    
    if (featuredPosts.length > 0) {
      // Table header
      const separator = '='.repeat(140);
      console.log(separator);
      // Header row - pad to visible width only (ANSI codes don't count as visible)
      const headerStatusCol = 'Status'.padEnd(6); // Just 6 visible characters
      const headerFilenameCol = 'Filename'.padEnd(50);
      const headerTitleCol = 'Title'.padEnd(40);
      const headerCategoryCol = 'Category'.padEnd(15);
      const headerDateCol = 'Published';
      console.log(`| ${headerStatusCol} | ${headerFilenameCol} | ${headerTitleCol} | ${headerCategoryCol} | ${headerDateCol} |`);
      console.log(separator);
      
      // Table rows - mark first 7 non-family posts with ✓, rest with ✗
      let nonFamilyCount = 0;
      for (const post of featuredPosts) {
        let status;
        if (post.isFamilyPost) {
          status = '❌';
        } else {
          nonFamilyCount++;
          status = nonFamilyCount <= 7 
            ? `${colors.green}✓${colors.reset}` 
            : `${colors.red}✗${colors.reset}`;
        }
        console.log(formatTableRow(status, post.filename, post.title, post.category, post.publishedAt));
      }
      console.log(separator + '\n');
    }
    
    // Validation and warnings
    let hasErrors = false;
    
    // Check for family posts marked as featured
    if (familyPosts.length > 0) {
      console.log('❌ ERROR: Family posts marked as featured (these will be excluded):');
      console.log('   Family posts should NOT be marked as featured on the homepage.\n');
      for (const post of familyPosts) {
        console.log(`   - ${post.filename}`);
        console.log(`     "${post.title}"`);
        console.log(`     Published: ${post.publishedAt}\n`);
      }
      hasErrors = true;
    }
    
    // Check if more than 7 posts featured
    if (nonFamilyPosts.length > 7) {
      const excessCount = nonFamilyPosts.length - 7;
      console.log(`⚠️  WARNING: ${nonFamilyPosts.length} posts marked as featured`);
      console.log('⚠️  Only the 7 most recent will be displayed on the homepage');
      console.log(`⚠️  ${excessCount} post(s) will be IGNORED (see red ✗ in table above)\n`);
    }
    
    // Check if exactly 7 non-family posts
    if (nonFamilyPosts.length === 7 && familyPosts.length === 0) {
      console.log('✅ Status: OPTIMAL - Exactly 7 non-family posts marked as featured');
      console.log('   Your featured posts configuration is perfect!\n');
    } else if (nonFamilyPosts.length < 7 && !hasErrors) {
      console.log(`ℹ️  Info: Only ${nonFamilyPosts.length} non-family post(s) marked as featured`);
      console.log('   Consider marking more posts to fill all 7 featured slots.\n');
    }
    
    // Summary with status icons
    const willBeDisplayed = Math.min(nonFamilyPosts.length, 7);
    const willBeIgnored = Math.max(nonFamilyPosts.length - 7, 0);
    
    console.log('Summary:');
    console.log(`  Total featured posts: ${featuredPosts.length}`);
    if (familyPosts.length > 0) {
      console.log(`  Family posts: ${familyPosts.length}`);
    }
    console.log(`  Will be displayed: ${willBeDisplayed} ${colors.green}✓${colors.reset}`);
    if (willBeIgnored > 0) {
      console.log(`  Will be ignored: ${willBeIgnored} ${colors.red}✗${colors.reset}`);
    }
    console.log();
    
  } catch (error) {
    console.error('❌ Error running featured posts audit:', error.message);
    process.exit(1);
  }
}

// Run the audit
main();

