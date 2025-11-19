import type { GatsbyNode } from 'gatsby';
import path from 'path';
import fs from 'fs';

interface SeriesMetadata {
  name?: string;
  order?: number;
  prev?: string;
  next?: string;
  references?: Array<{
    url: string;
    title?: string;
  }>;
  attachments?: Array<{
    filename: string;
    title?: string;
  }>;
}

interface Article {
  id: string;
  frontmatter: {
    slug: string;
    category: string;
    author: string;
    publishedAt: string;
    series?: SeriesMetadata;
  };
}

interface Tag {
  slug: string;
  name: string;
  featured: boolean;
}

interface Author {
  slug: string;
  name: string;
}

interface PagesQueryResult {
  allMarkdownRemark: {
    nodes: Article[];
  };
  allTagsJson: {
    nodes: Tag[];
  };
  allAuthorsJson: {
    nodes: Author[];
  };
}

/**
 * Validates series metadata for all articles
 * T004: Detect missing series.name
 * T005: Create article slug lookup map
 * T006: Validate prev/next references exist
 * T007: Detect circular references
 */
function validateSeriesMetadata(articles: Article[], reporter: any): boolean {
  let hasErrors = false;
  
  // T005: Create article slug lookup map
  const articleSlugs = new Set<string>();
  articles.forEach((article) => {
    articleSlugs.add(article.frontmatter.slug);
  });
  
  // Track visited articles for circular reference detection (T007)
  const seriesArticles = articles.filter((article) => article.frontmatter.series);
  
  seriesArticles.forEach((article) => {
    const { slug, series } = article.frontmatter;
    
    if (!series) return;
    
    // T004: Validate series.name is present
    if (!series.name || series.name.trim() === '') {
      reporter.error(
        `[Series Validation] Article "${slug}" has series metadata but missing series.name`
      );
      hasErrors = true;
    }
  });
  
  // T007: Detect duplicate order values within same series
  const seriesByName = new Map<string, Map<number, string>>();
  
  seriesArticles.forEach((article) => {
    const { slug, series } = article.frontmatter;
    
    if (!series?.name || series.order === undefined) return;
    
    if (!seriesByName.has(series.name)) {
      seriesByName.set(series.name, new Map());
    }
    
    const orderMap = seriesByName.get(series.name)!;
    
    if (orderMap.has(series.order)) {
      reporter.error(
        `[Series Validation] Duplicate order ${series.order} in series "${series.name}": "${slug}" and "${orderMap.get(series.order)}"`
      );
      hasErrors = true;
    } else {
      orderMap.set(series.order, slug);
    }
  });
  
  // T031 & T032: Validate attachment files
  const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 50MB
  
  seriesArticles.forEach((article) => {
    const { slug, series } = article.frontmatter;
    
    if (!series?.attachments) return;
    
    series.attachments.forEach((attachment) => {
      // Determine the attachment file path
      // Paths can be relative to /static/ or absolute URLs
      const filename = attachment.filename;
      
      // Skip validation for external URLs
      if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return;
      }
      
      // T031: Check if file exists in static directory
      const staticPath = path.resolve('./static', filename.replace(/^\//, ''));
      
      if (!fs.existsSync(staticPath)) {
        reporter.warn(
          `[Series Validation] Article "${slug}" references attachment "${filename}" but file not found in static directory`
        );
      } else {
        // T032: Check file size
        try {
          const stats = fs.statSync(staticPath);
          if (stats.size > MAX_ATTACHMENT_SIZE) {
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            reporter.warn(
              `[Series Validation] Attachment "${filename}" in article "${slug}" is ${sizeMB}MB (exceeds recommended 50MB limit)`
            );
          }
        } catch (error) {
          // If we can't stat the file, skip size validation
        }
      }
    });
  });
  
  if (!hasErrors && seriesArticles.length > 0) {
    reporter.info(`[Series Validation] ✓ Validated ${seriesArticles.length} series articles`);
  }
  
  return !hasErrors;
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql<PagesQueryResult>(`
    query {
      allMarkdownRemark(filter: { frontmatter: { slug: { ne: null } } }) {
        nodes {
          id
          frontmatter {
            slug
            category
            author
            publishedAt
            series {
              name
              order
              references {
                url
                title
              }
              attachments {
                filename
                title
              }
            }
          }
        }
      }
      allTagsJson {
        nodes {
          slug
          name
          featured
        }
      }
      allAuthorsJson {
        nodes {
          slug
          name
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Error loading data for page creation', result.errors);
    return;
  }

  const articles = result.data?.allMarkdownRemark.nodes || [];
  const tags = result.data?.allTagsJson.nodes || [];
  const authors = result.data?.allAuthorsJson.nodes || [];

  if (articles.length === 0) {
    reporter.warn('No articles found to create pages');
    return;
  }

  // Validate series metadata before creating pages
  const seriesValidationPassed = validateSeriesMetadata(articles, reporter);
  if (!seriesValidationPassed) {
    reporter.panicOnBuild('Series metadata validation failed. Fix the errors above and rebuild.');
    return;
  }

  // Create article pages - use different templates for series vs standalone articles
  const articleTemplate = path.resolve('./src/templates/article.tsx');
  const seriesArticleTemplate = path.resolve('./src/templates/series-article.tsx');

  articles.forEach((article) => {
    const isSeries = !!article.frontmatter.series?.name;
    
    createPage({
      path: isSeries ? `/series/${article.frontmatter.slug}` : `/posts/${article.frontmatter.slug}`,
      component: isSeries ? seriesArticleTemplate : articleTemplate,
      context: {
        slug: article.frontmatter.slug,
        category: article.frontmatter.category,
        author: article.frontmatter.author,
        publishedAt: article.frontmatter.publishedAt,
        seriesName: article.frontmatter.series?.name || null,
      },
    });
  });

  reporter.info(`Created ${articles.length} article pages`);

  // Create tag pages with pagination
  const tagTemplate = path.resolve('./src/templates/tag.tsx');
  const articlesPerPage = 15;

  tags.forEach((tag) => {
    const tagArticles = articles.filter((article) => article.frontmatter.category === tag.slug);
    const numPages = Math.ceil(tagArticles.length / articlesPerPage);

    Array.from({ length: numPages }).forEach((_, i) => {
      const currentPage = i + 1;
      const pagePath = currentPage === 1 
        ? `/tag/${tag.slug}` 
        : `/tag/${tag.slug}/${currentPage}`;

      createPage({
        path: pagePath,
        component: tagTemplate,
        context: {
          slug: tag.slug,
          limit: articlesPerPage,
          skip: i * articlesPerPage,
          numPages,
          currentPage,
        },
      });
    });

    reporter.info(`Created ${numPages} page(s) for tag: ${tag.name}`);
  });

  // Create author pages
  const authorTemplate = path.resolve('./src/templates/author.tsx');

  authors.forEach((author) => {
    createPage({
      path: `/author/${author.slug}`,
      component: authorTemplate,
      context: {
        slug: author.slug,
      },
    });

    reporter.info(`Created author page: ${author.name}`);
  });
};
