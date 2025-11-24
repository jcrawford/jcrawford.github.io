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
 * Calculates the maximum width needed for each column based on the data.
 * 
 * @param {Array} posts - Array of post objects
 * @returns {Object} Object with width for each column
 */
function calculateColumnWidths(posts) {
  const STATUS_WIDTH = 8; // Fixed for status icons
  const DATE_WIDTH = 10; // Fixed for YYYY-MM-DD dates
  
  // Start with header widths as minimum
  let maxFilenameWidth = 'Filename'.length;
  let maxTitleWidth = 'Title'.length;
  
  // Find the longest content in each column
  for (const post of posts) {
    maxFilenameWidth = Math.max(maxFilenameWidth, post.filename.length);
    maxTitleWidth = Math.max(maxTitleWidth, post.title.length);
  }
  
  return {
    status: STATUS_WIDTH,
    filename: maxFilenameWidth,
    title: maxTitleWidth,
    date: DATE_WIDTH
  };
}

/**
 * Formats a table row with aligned columns using dynamic widths.
 * 
 * @param {string} status - Status icon (✓ or ✗) with or without color codes
 * @param {string} filename - Relative file path
 * @param {string} title - Post title
 * @param {string} publishedAt - Publication date
 * @param {Object} widths - Object containing width for each column
 * @returns {string} Formatted table row
 */
function formatTableRow(status, filename, title, publishedAt, widths) {
  // Calculate visible length of status (excluding ANSI codes)
  const statusVisible = status.replace(/\x1b\[\d+m/g, '');
  const statusWidth = getDisplayWidth(statusVisible);
  const statusPadding = widths.status - statusWidth;
  const statusCol = status + ' '.repeat(Math.max(0, statusPadding));
  
  // Pad each column to its calculated width
  const filenameCol = filename.padEnd(widths.filename);
  const titleCol = title.padEnd(widths.title);
  const dateCol = publishedAt.padEnd(widths.date);
  
  return `| ${statusCol} | ${filenameCol} | ${titleCol} | ${dateCol} |`;
}

/**
 * Main execution function for the featured posts audit.
 */
function main() {
  const contentDir = path.join(__dirname, '../content');
  
  console.log('\n========================================');
  console.log('Featured Posts Audit');
  console.log('========================================\n');
  
  try {
    const allFiles = getAllMarkdownFiles(contentDir);
    const featuredPosts = [];
    
    // Parse frontmatter and collect featured posts
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const { data: frontmatter } = matter(content);
      
      if (frontmatter.featured === true) {
        const relativePath = path.relative(contentDir, file);
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
        featuredPosts.push({
          filename: relativePath,
          title: frontmatter.title || 'Untitled',
          publishedAt: frontmatter.publishedAt || 'Unknown',
          isFamilyPost: tags.includes('family')
        });
      }
    }
    
    // Sort by publication date (most recent first)
    featuredPosts.sort((a, b) => {
      if (a.publishedAt === 'Unknown' || b.publishedAt === 'Unknown') return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    
    // Group by family tag
    const familyPosts = featuredPosts.filter(p => p.isFamilyPost);
    const nonFamilyPosts = featuredPosts.filter(p => !p.isFamilyPost);
    
    // Display results
    console.log(`Found ${featuredPosts.length} featured post(s):\n`);
    
    if (featuredPosts.length > 0) {
      // Calculate dynamic column widths based on content
      const widths = calculateColumnWidths(featuredPosts);
      
      // Table header with dynamic column widths
      const headerRow = `| ${'Display'.padEnd(widths.status)} | ${'Filename'.padEnd(widths.filename)} | ${'Title'.padEnd(widths.title)} | ${'Published'.padEnd(widths.date)} |`;
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
        console.log(formatTableRow(status, post.filename, post.title, post.publishedAt, widths));
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

