#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Migration script to remove the category field from all markdown files
 * and ensure category value is included in tags array.
 * 
 * This migration:
 * 1. Reads all markdown files in content/
 * 2. For each file with a category field:
 *    a. Extracts the category value
 *    b. Adds category value to tags array if not already present
 *    c. Removes the category field entirely
 * 3. Writes the updated frontmatter back to the file
 */

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
 * Main migration function.
 */
async function main() {
  const contentDir = path.join(__dirname, '../content');
  
  console.log('\n========================================');
  console.log('Category Removal Migration');
  console.log('========================================\n');
  console.log('This script will:');
  console.log('  1. Add category value to tags array');
  console.log('  2. Remove category field from frontmatter');
  console.log('  3. Save updated files\n');
  
  try {
    const allFiles = getAllMarkdownFiles(contentDir);
    let filesWithCategory = 0;
    let filesProcessed = 0;
    let filesSkipped = 0;
    const errors = [];
    
    console.log(`Found ${allFiles.length} markdown files\n`);
    console.log('Processing...\n');
    
    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { data: frontmatter, content: body } = matter(content);
        
        // Skip files without category field
        if (!frontmatter.category) {
          filesSkipped++;
          continue;
        }
        
        filesWithCategory++;
        const relativePath = path.relative(contentDir, file);
        const categoryValue = frontmatter.category;
        
        // Ensure tags array exists
        if (!Array.isArray(frontmatter.tags)) {
          frontmatter.tags = [];
        }
        
        // Add category value to tags if not already present
        if (!frontmatter.tags.includes(categoryValue)) {
          frontmatter.tags.push(categoryValue);
          console.log(`  ✓ ${relativePath}`);
          console.log(`    Added "${categoryValue}" to tags`);
        } else {
          console.log(`  ℹ ${relativePath}`);
          console.log(`    Tag "${categoryValue}" already exists`);
        }
        
        // Remove category field
        delete frontmatter.category;
        
        // Write updated content back to file
        const updatedContent = matter.stringify(body, frontmatter);
        fs.writeFileSync(file, updatedContent, 'utf8');
        
        filesProcessed++;
        
      } catch (err) {
        const relativePath = path.relative(contentDir, file);
        errors.push({ file: relativePath, error: err.message });
        console.log(`  ✗ ${relativePath}`);
        console.log(`    Error: ${err.message}`);
      }
    }
    
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================\n');
    console.log(`Total files scanned: ${allFiles.length}`);
    console.log(`Files with category field: ${filesWithCategory}`);
    console.log(`Files processed successfully: ${filesProcessed}`);
    console.log(`Files skipped (no category): ${filesSkipped}`);
    console.log(`Errors: ${errors.length}\n`);
    
    if (errors.length > 0) {
      console.log('Failed files:');
      errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
      console.log();
    }
    
    console.log('✅ Migration complete!\n');
    console.log('Next steps:');
    console.log('  1. Update TypeScript interfaces to remove category field');
    console.log('  2. Update React components to not use category');
    console.log('  3. Update GraphQL queries to not query category');
    console.log('  4. Test the site to ensure everything works\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
main();

