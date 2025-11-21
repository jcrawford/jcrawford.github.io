#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to organize blog posts into YYYY/MM/ directories based on publishedAt date
 * This is purely for organizational purposes and won't affect site functionality
 */

const POSTS_DIR = path.join(__dirname, '../content/posts');
const DRY_RUN = process.argv.includes('--dry-run');
const TEST_MODE = process.argv.includes('--test');

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

// Get all markdown files recursively
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Extract year and month from publishedAt date
function getYearMonth(publishedAt) {
  if (!publishedAt) {
    return null;
  }
  
  const date = new Date(publishedAt);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return { year, month };
}

// Main function
function organizePostsByDate() {
  console.log('🔍 Scanning posts directory...\n');
  
  const allFiles = getAllMarkdownFiles(POSTS_DIR);
  const moves = [];
  const errors = [];
  
  // Filter to only process files directly in posts/ directory (not already organized)
  const filesToProcess = allFiles.filter(file => {
    const relativePath = path.relative(POSTS_DIR, file);
    // Only process files that are directly in posts/ (no subdirectories)
    return !relativePath.includes(path.sep);
  });
  
  console.log(`Found ${filesToProcess.length} posts to organize\n`);
  
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Processing only first 5 posts\n');
    filesToProcess.splice(5);
  }
  
  // Analyze each file
  for (const filePath of filesToProcess) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    
    if (!frontmatter) {
      errors.push({ file: fileName, reason: 'No frontmatter found' });
      continue;
    }
    
    if (!frontmatter.publishedAt) {
      errors.push({ file: fileName, reason: 'No publishedAt date' });
      continue;
    }
    
    const yearMonth = getYearMonth(frontmatter.publishedAt);
    if (!yearMonth) {
      errors.push({ 
        file: fileName, 
        reason: `Invalid date: ${frontmatter.publishedAt}` 
      });
      continue;
    }
    
    const { year, month } = yearMonth;
    const targetDir = path.join(POSTS_DIR, String(year), month);
    const targetPath = path.join(targetDir, fileName);
    
    moves.push({
      from: filePath,
      to: targetPath,
      year,
      month,
      date: frontmatter.publishedAt,
      fileName
    });
  }
  
  // Display summary
  console.log('📊 Organization Summary:\n');
  
  const byYear = {};
  for (const move of moves) {
    if (!byYear[move.year]) {
      byYear[move.year] = {};
    }
    if (!byYear[move.year][move.month]) {
      byYear[move.year][move.month] = 0;
    }
    byYear[move.year][move.month]++;
  }
  
  for (const year of Object.keys(byYear).sort()) {
    console.log(`  ${year}/`);
    for (const month of Object.keys(byYear[year]).sort()) {
      console.log(`    ${month}/ - ${byYear[year][month]} posts`);
    }
  }
  
  console.log(`\n✅ ${moves.length} posts will be organized`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} posts skipped:\n`);
    for (const error of errors) {
      console.log(`  - ${error.file}: ${error.reason}`);
    }
  }
  
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No files will be moved');
    console.log('\nTo actually move files, run without --dry-run flag');
    return;
  }
  
  // Execute moves
  console.log('\n📦 Moving files...\n');
  
  let movedCount = 0;
  for (const move of moves) {
    try {
      // Create target directory if it doesn't exist
      const targetDir = path.dirname(move.to);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(move.from, move.to);
      movedCount++;
      
      if (movedCount % 10 === 0) {
        console.log(`  Moved ${movedCount}/${moves.length} files...`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to move ${move.fileName}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Successfully moved ${movedCount} posts!`);
  console.log('\n💡 Next steps:');
  console.log('  1. Run: npm run clean');
  console.log('  2. Run: npm run develop');
  console.log('  3. Verify all posts are accessible\n');
}

// Run the script
try {
  organizePostsByDate();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}


