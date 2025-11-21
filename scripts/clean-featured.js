#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const readline = require('readline');

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
 * Removes the featured property from a markdown file.
 * 
 * @param {string} filePath - Absolute path to the markdown file
 * @returns {boolean} True if file was modified, false otherwise
 */
function removeFeaturedFlag(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    // Check if featured property exists
    if (parsed.data.featured === undefined) {
      return false;
    }
    
    // Remove featured property
    delete parsed.data.featured;
    
    // Stringify back to markdown with frontmatter
    const newContent = matter.stringify(parsed.content, parsed.data);
    
    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Prompts user for y/N confirmation.
 * 
 * @param {string} question - The question to ask
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
function promptConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Main execution function for cleaning featured posts.
 */
async function main() {
  const postsDir = path.join(__dirname, '../content/posts');
  
  console.log('\n========================================');
  console.log('Clean Featured Posts');
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
          absolutePath: file,
          filename: relativePath,
          title: frontmatter.title || 'Untitled',
          category: frontmatter.category || 'uncategorized',
          publishedAt: frontmatter.publishedAt || 'Unknown',
          slug: frontmatter.slug || relativePath,
          isFamilyPost: frontmatter.category === 'family'
        });
      }
    }
    
    console.log('Analyzing featured posts...\n');
    
    // Sort by publication date DESC, then by slug ASC (same as homepage)
    featuredPosts.sort((a, b) => {
      if (a.publishedAt === 'Unknown' || b.publishedAt === 'Unknown') return 0;
      
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      
      if (dateA !== dateB) {
        return dateB - dateA; // Most recent first
      }
      
      // Secondary sort: slug alphabetically ascending
      return a.slug.localeCompare(b.slug);
    });
    
    // Filter out family posts (they should always be removed)
    const nonFamilyPosts = featuredPosts.filter(p => !p.isFamilyPost);
    const familyPosts = featuredPosts.filter(p => p.isFamilyPost);
    
    // First 7 keep featured flag, rest lose it
    const postsToKeep = nonFamilyPosts.slice(0, 7);
    const postsToClean = nonFamilyPosts.slice(7);
    
    // Always clean family posts
    const allPostsToClean = [...postsToClean, ...familyPosts];
    
    // Display what will be kept
    console.log(`Posts that will KEEP featured flag (first 7):\n`);
    if (postsToKeep.length > 0) {
      for (const post of postsToKeep) {
        console.log(`  ✓ ${post.filename}`);
        console.log(`    "${post.title}" (${post.publishedAt})\n`);
      }
    } else {
      console.log('  (none)\n');
    }
    
    // Display what will lose the flag
    if (allPostsToClean.length > 0) {
      console.log(`Posts that will LOSE featured flag:\n`);
      for (const post of allPostsToClean) {
        const reason = post.isFamilyPost ? '(family post)' : '(excess - beyond first 7)';
        console.log(`  ✗ ${post.filename} ${reason}`);
        console.log(`    "${post.title}" (${post.publishedAt})\n`);
      }
    }
    
    // Summary
    console.log('========================================');
    console.log(`Posts to clean: ${allPostsToClean.length}`);
    console.log(`  Excess posts (8+): ${postsToClean.length}`);
    console.log(`  Family posts: ${familyPosts.length}`);
    console.log('========================================\n');
    
    // Check if any posts need cleaning
    if (allPostsToClean.length === 0) {
      console.log('✅ No posts need cleaning. Configuration is already optimal!\n');
      return;
    }
    
    // Prompt for confirmation
    const confirmed = await promptConfirmation('🔹 Remove featured flag from these posts? (y/N): ');
    
    if (!confirmed) {
      console.log('\n❌ Operation cancelled. No files were modified.\n');
      return;
    }
    
    console.log('\n🧹 Removing featured flag from posts...\n');
    
    let modifiedCount = 0;
    const modifiedFiles = [];
    
    for (const post of allPostsToClean) {
      const wasModified = removeFeaturedFlag(post.absolutePath);
      if (wasModified) {
        modifiedCount++;
        modifiedFiles.push(post.filename);
        console.log(`  ✓ ${post.filename}`);
      }
    }
    
    console.log();
    console.log('========================================');
    console.log('Summary:');
    console.log(`  Featured posts before: ${featuredPosts.length}`);
    console.log(`  Featured posts after: ${postsToKeep.length}`);
    console.log(`  Files modified: ${modifiedCount}`);
    console.log('========================================');
    console.log();
    console.log('✅ Done! Your featured posts are now optimized.\n');
    
  } catch (error) {
    console.error('❌ Error running clean-featured:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

