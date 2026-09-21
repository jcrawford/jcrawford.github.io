import fs from 'fs';
import path from 'path';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
}

interface MigrationOptions {
  dryRun: boolean;
}

const REQUIRED_FIELDS: Array<keyof Article> = [
  'slug',
  'title',
  'excerpt',
  'content',
  'featuredImage',
  'category',
  'tags',
  'author',
  'publishedAt',
  'updatedAt',
];

const createdFiles: string[] = [];
let hasErrors = false;

function logInfo(message: string): void {
  console.log(`[INFO] ${message}`);
}

function logSuccess(message: string): void {
  console.log(`[✓] ${message}`);
}

function logWarning(message: string): void {
  console.warn(`[WARNING] ${message}`);
}

function logError(message: string): void {
  console.error(`[ERROR] ${message}`);
  hasErrors = true;
}

function validateArticle(article: Article, filePath: string): boolean {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!article[field] || (Array.isArray(article[field]) && article[field].length === 0)) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    logError(`Missing required fields in ${filePath}: ${missingFields.join(', ')}`);
    return false;
  }

  return true;
}

function convertHtmlToMarkdown(html: string): string {
  let markdown = html;

  const simpleConversions: Array<[RegExp, string]> = [
    [/<p>(.*?)<\/p>/gs, '$1\n\n'],
    [/<strong>(.*?)<\/strong>/g, '**$1**'],
    [/<b>(.*?)<\/b>/g, '**$1**'],
    [/<em>(.*?)<\/em>/g, '*$1*'],
    [/<i>(.*?)<\/i>/g, '*$1*'],
    [/<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g, '[$2]($1)'],
    [/<h1>(.*?)<\/h1>/g, '# $1\n\n'],
    [/<h2>(.*?)<\/h2>/g, '## $1\n\n'],
    [/<h3>(.*?)<\/h3>/g, '### $1\n\n'],
    [/<h4>(.*?)<\/h4>/g, '#### $1\n\n'],
    [/<h5>(.*?)<\/h5>/g, '##### $1\n\n'],
    [/<h6>(.*?)<\/h6>/g, '###### $1\n\n'],
    [/<blockquote>(.*?)<\/blockquote>/gs, '> $1\n\n'],
    [/<br\s*\/?>/g, '  \n'],
    [/<hr\s*\/?>/g, '\n---\n\n'],
  ];

  for (const [pattern, replacement] of simpleConversions) {
    markdown = markdown.replace(pattern, replacement);
  }

  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/g);
    if (!items) return match;
    return items.map((item: string) => {
      const text = item.replace(/<li>(.*?)<\/li>/, '$1');
      return `- ${text}`;
    }).join('\n') + '\n\n';
  });

  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/g);
    if (!items) return match;
    return items.map((item: string, index: number) => {
      const text = item.replace(/<li>(.*?)<\/li>/, '$1');
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n\n';
  });

  markdown = markdown.trim();

  return markdown;
}

function generateFrontmatter(article: Article): string {
  const frontmatter = [
    '---',
    `slug: "${article.slug}"`,
    `title: "${article.title.replace(/"/g, '\\"')}"`,
    `excerpt: "${article.excerpt.replace(/"/g, '\\"')}"`,
    `featuredImage: "${article.featuredImage}"`,
    `category: "${article.category}"`,
    `tags: [${article.tags.map(tag => `"${tag}"`).join(', ')}]`,
    `author: "${article.author}"`,
    `publishedAt: "${article.publishedAt}"`,
    `updatedAt: "${article.updatedAt}"`,
    '---',
  ];

  return frontmatter.join('\n');
}

function createMarkdownFile(article: Article, outputDir: string, dryRun: boolean): boolean {
  try {
    const filename = `${article.slug}.md`;
    const filePath = path.join(outputDir, filename);

    const frontmatter = generateFrontmatter(article);
    const content = convertHtmlToMarkdown(article.content);
    const markdownContent = `${frontmatter}\n\n${content}\n`;

    if (dryRun) {
      logInfo(`[DRY RUN] Would create: ${filePath}`);
      return true;
    }

    fs.writeFileSync(filePath, markdownContent, 'utf-8');
    createdFiles.push(filePath);
    logSuccess(`Created: ${filename}`);
    return true;
  } catch (error) {
    logError(`Failed to create Markdown file for ${article.slug}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

function rollbackFiles(): void {
  logWarning('Rolling back created files...');
  
  for (const filePath of createdFiles) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logInfo(`Deleted: ${filePath}`);
      }
    } catch (error) {
      logError(`Failed to delete ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logWarning(`Rollback complete. Deleted ${createdFiles.length} files.`);
}

function migrateArticles(options: MigrationOptions): number {
  const articlesDir = path.join(__dirname, '../src/data/articles');
  const outputDir = path.join(__dirname, '../content/posts');

  logInfo('Starting migration...');
  logInfo(`Source: ${articlesDir}`);
  logInfo(`Target: ${outputDir}`);
  logInfo(`Mode: ${options.dryRun ? 'DRY RUN' : 'REAL'}`);

  if (!fs.existsSync(articlesDir)) {
    logError(`Articles directory not found: ${articlesDir}`);
    return 1;
  }

  if (!options.dryRun && !fs.existsSync(outputDir)) {
    logError(`Output directory not found: ${outputDir}`);
    return 1;
  }

  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    logWarning('No JSON files found in articles directory');
    return 0;
  }

  logInfo(`Found ${files.length} article files`);

  let processedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const article = JSON.parse(rawData) as Article;

      if (!validateArticle(article, file)) {
        errorCount++;
        continue;
      }

      const success = createMarkdownFile(article, outputDir, options.dryRun);
      
      if (success) {
        processedCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      logError(`Failed to process ${file}: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  if (errorCount > 0 && !options.dryRun) {
    logError(`Migration failed with ${errorCount} errors`);
    rollbackFiles();
    return 1;
  }

  logSuccess(`Migration completed: ${processedCount} files processed, ${errorCount} errors`);
  
  if (options.dryRun) {
    logInfo('This was a dry run. No files were created.');
  }

  return hasErrors ? 1 : 0;
}

function main(): void {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const exitCode = migrateArticles({ dryRun });
  process.exit(exitCode);
}

main();




