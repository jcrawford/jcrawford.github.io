import fs from 'fs';
import path from 'path';
import https from 'https';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface FrontMatter {
  slug: string;
  featuredImage: string;
  [key: string]: any;
}

const postsDir = path.join(__dirname, '../content/posts');
const imagesBaseDir = path.join(__dirname, '../static/images/content');

// Extract frontmatter from markdown
function extractFrontMatter(content: string): { frontmatter: FrontMatter; body: string } | null {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatterText = match[1];
  const body = match[2];
  const frontmatter: any = {};

  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      frontmatter[key] = value;
    }
  });

  return { frontmatter, body };
}

// Download image from URL
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        if (response.headers.location) {
          downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Get file extension from URL
function getFileExtension(url: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const ext = path.extname(pathname);
  return ext || '.jpg'; // Default to .jpg if no extension
}

// Process a single markdown file
async function processMarkdownFile(filename: string): Promise<void> {
  const filepath = path.join(postsDir, filename);
  const content = await readFile(filepath, 'utf-8');
  
  const parsed = extractFrontMatter(content);
  if (!parsed) {
    console.log(`⚠️  Skipping ${filename} - no frontmatter found`);
    return;
  }

  const { frontmatter } = parsed;
  const { slug, featuredImage } = frontmatter;

  if (!slug || !featuredImage) {
    console.log(`⚠️  Skipping ${filename} - missing slug or featuredImage`);
    return;
  }

  // Check if it's an Unsplash URL
  if (!featuredImage.includes('unsplash.com')) {
    console.log(`⏭️  Skipping ${filename} - not an Unsplash image`);
    return;
  }

  // Create directory for this post's images
  const postImagesDir = path.join(imagesBaseDir, slug);
  await mkdir(postImagesDir, { recursive: true });

  // Determine filename for the image
  const ext = getFileExtension(featuredImage);
  const imageFilename = `featured${ext}`;
  const localImagePath = path.join(postImagesDir, imageFilename);
  const relativeImagePath = `/images/content/${slug}/${imageFilename}`;

  // Download the image
  try {
    console.log(`📥 Downloading image for: ${slug}`);
    await downloadImage(featuredImage, localImagePath);
    console.log(`✅ Downloaded: ${imageFilename}`);

    // Update the markdown file with local path
    const updatedFrontmatter = content.replace(
      /featuredImage:\s*"[^"]+"/,
      `featuredImage: "${relativeImagePath}"`
    );

    await writeFile(filepath, updatedFrontmatter, 'utf-8');
    console.log(`✅ Updated: ${filename}\n`);
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting image download process...\n');

  // Ensure base images directory exists
  await mkdir(imagesBaseDir, { recursive: true });

  // Get all markdown files
  const files = await readdir(postsDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  console.log(`📄 Found ${markdownFiles.length} markdown files\n`);

  // Process files sequentially to avoid overwhelming the server
  for (const file of markdownFiles) {
    await processMarkdownFile(file);
    // Small delay to be respectful to Unsplash servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Image download complete!');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

