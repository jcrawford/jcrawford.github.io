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
 * Calculates the display width of a string, accounting for Unicode characters.
 * 
 * @param {string} str - The string to measure (should have ANSI codes removed)
 * @returns {number} The display width in terminal cells
 */
function getDisplayWidth(str) {
  let width = 0;
  for (const char of str) {
    const code = char.charCodeAt(0);
    // Most terminals render ✓ (U+2713) and ✗ (U+2717) as single-width
    // Only true emoji (U+1F300+) and some specific symbols render as double-width
    if (code >= 0x1F300 && code <= 0x1F9FF) {
      // Emoji range - these are typically double-width
      width += 2;
    } else if (code === 0x274C) {
      // ❌ (cross mark emoji) - double-width
      width += 2;
    } else {
      // Everything else including ✓ and ✗ - single-width
      width += 1;
    }
  }
  return width;
}

/**
 * Formats a table row with aligned columns.
 * 
 * @param {string} status - Status icon (✓ or ✗) with or without color codes
 * @param {string} filename - Relative file path
 * @param {string} title - Post title
 * @param {string} category - Post category
 * @param {string} publishedAt - Publication date
 * @returns {string} Formatted table row
 */
function formatTableRow(status, filename, title, category, publishedAt) {
  // Calculate visible length of status (excluding ANSI codes)
  const statusVisible = status.replace(/\x1b\[\d+m/g, '');
  const statusWidth = getDisplayWidth(statusVisible);
  const statusPadding = 8 - statusWidth; // Pad to 8 cells (for 2-cell wide symbols)
  const statusCol = status + ' '.repeat(Math.max(0, statusPadding));
  
  const filenameCol = filename.padEnd(45);
  const titleCol = title.slice(0, 40).padEnd(40);
  const categoryCol = category.padEnd(15);
  const dateCol = publishedAt.padEnd(10); // Pad published date to 10 chars (YYYY-MM-DD)
  
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
      // Calculate exact width: | Display(8) | Filename(45) | Title(40) | Category(15) | Published(10) |
      // = 1 + 1 + 8 + 1 + 1 + 1 + 45 + 1 + 1 + 1 + 40 + 1 + 1 + 1 + 15 + 1 + 1 + 1 + 10 + 1 + 1 = 135
      const headerRow = `| ${'Display'.padEnd(8)} | ${'Filename'.padEnd(45)} | ${'Title'.padEnd(40)} | ${'Category'.padEnd(15)} | ${'Published'.padEnd(10)} |`;
      const separator = '='.repeat(headerRow.length);
      console.log(separator);
      console.log(headerRow);
      console.log(separator);
      
      // Table rows - mark first 7 non-family posts with ✓, rest with ✗
      let nonFamilyCount = 0;
      for (const post of featuredPosts) {
        let status;
        if (post.isFamilyPost) {
          status = `${colors.red}❌${colors.reset}`;
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

