import type { GatsbyNode } from 'gatsby';
import path from 'path';
import fs from 'fs';
import { normalizeTagSlug } from './src/utils/tagUtils';

/**
 * @giscus/react uses Lit custom elements that call browser globals (window,
 * document, customElements) at module evaluation time. embla-carousel also
 * uses browser globals (self, window, ownerWindow) at module scope.
 *
 * Gatsby's SSR/HTML rendering runs in Node, where those globals don't exist.
 * We replace these modules with null-returning stubs during SSR so they're
 * never evaluated in the server bundle. The real modules are loaded
 * client-only via dynamic import() or conditional require() in components.
 */
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ stage, actions, getConfig }) => {
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          '@giscus/react': path.resolve(__dirname, 'src/components/ssr-stubs/GiscusStub.tsx'),
          'embla-carousel-react': path.resolve(__dirname, 'src/components/ssr-stubs/EmblaCarouselStub.tsx'),
        },
      },
    });
  }
};

/**
 * Define custom schema types to ensure draft field is queryable
 */
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type MarkdownRemarkFrontmatter {
      draft: Boolean
      date: Date
      description: String
      coverImage: String
      category: String
      series: SeriesFrontmatter
      review: MarkdownRemarkFrontmatterReview
      photos: [GalleryPhoto]
      videos: JSON
      imageSpinner: [SpinnerImage]
      imageSpinners: [NamedSpinner]
      galleryEmbeds: JSON
      type: String
      rating: Float
      brewData: BrewingBrewData
      ingredients: [String]
      steps: [BrewingStep]
    }

    type BrewingBrewData {
      originalGravity: Float
      finalGravity: Float

      startDate: Date
      primaryEndDate: Date
      secondaryStartDate: Date
      bottlingDate: Date
      drinkingReadyDate: Date
      abv: Float
      batchSize: String
      yeast: String
      fermentationTime: String
    }

    type BrewingStep {
      title: String
      description: String
      image: String
    }

    type MarkdownRemarkFrontmatterReview {
      rating: Float
      pros: [String]
      cons: [String]
      price: String
      brand: String
      productUrl: String
      affiliateLink: String
    }

    type GalleryPhoto {
      src: String
      alt: String
      width: Int
      height: Int
      caption: String
    }

    type GalleryVideo {
      src: String
      alt: String
      caption: String
    }

    type SpinnerImage {
      src: String
      alt: String
      caption: String
    }

    type NamedSpinner {
      id: String
      images: [SpinnerImage]
    }

    type SeriesFrontmatter {
      name: String
      order: Int
      prev: String
      next: String
      references: [SeriesReferenceFrontmatter]
      attachments: [SeriesAttachmentFrontmatter]
    }

    type SeriesReferenceFrontmatter {
      url: String
      title: String
    }

    type SeriesAttachmentFrontmatter {
      filename: String
      title: String
    }

    type AuthorsJson implements Node {
      id: String
      jsonId: String
      slug: String
      name: String
      bio: String
      avatar: String
      socialLinks: AuthorsJsonSocialLinks
    }

    type AuthorsJsonSocialLinks {
      linkedin: String
      github: String
    }

    type TagsJson implements Node {
      id: String
      jsonId: String
      slug: String
      name: String
      description: String
      featured: Boolean
    }
  `);
};


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
  fileAbsolutePath: string;
  frontmatter: {
    slug: string;
    tags: string[];
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

interface PagesQueryResult {
  allMarkdownRemark: {
    nodes: Article[];
  };
  allTagsJson: {
    nodes: Tag[];
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
      allMarkdownRemark(filter: { frontmatter: { slug: { ne: null }, draft: { ne: true } }, fileAbsolutePath: { regex: "//content/(posts|reviews|brewing)/" } }) {
        nodes {
          id
          fileAbsolutePath
          frontmatter {
            slug
            tags
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
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Error loading data for page creation', result.errors);
    return;
  }

  const articles = result.data?.allMarkdownRemark.nodes || [];
  const tags = result.data?.allTagsJson.nodes || [];

  if (articles.length === 0) {
    reporter.warn('No articles found to create pages');
    return;
  }

  // Load popular-articles.json (generated at deploy start by generate:popular script)
  // to inject view counts and comment counts at build time — no client-side pop-in.
  const popularDataPath = path.resolve('./static/data/popular-articles.json');
  const metricsByPath = new Map<string, { views: number; comments: number; shares?: { facebook: number; linkedin: number; copy: number } }>();
  try {
    const rawJson = fs.readFileSync(popularDataPath, 'utf-8');
    const parsed = JSON.parse(rawJson);
    if (parsed?.entries && Array.isArray(parsed.entries)) {
      for (const entry of parsed.entries) {
        if (entry.id) {
          metricsByPath.set(entry.id, {
            views: entry.views || 0,
            comments: entry.comments || 0,
            shares: entry.shares || { facebook: 0, linkedin: 0, copy: 0 },
          });
        }
      }
    }
    reporter.info(`Loaded ${metricsByPath.size} article metrics from popular-articles.json`);
  } catch {
    reporter.warn('No popular-articles.json found or invalid — view counts will default to 0');
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
    const isReview = article.fileAbsolutePath.includes('/content/reviews/');
    const isBrewing = article.fileAbsolutePath.includes('/content/brewing/');
    
    // Determine the path based on article type
    let articlePath: string;
    if (isSeries) {
      articlePath = `/series/${article.frontmatter.slug}`;
    } else if (isReview) {
      articlePath = `/reviews/${article.frontmatter.slug}`;
    } else if (isBrewing) {
      articlePath = `/brewing/${article.frontmatter.slug}`;
    } else {
      articlePath = `/posts/${article.frontmatter.slug}`;
    }
    
    // Look up view/comment counts for this article path
    const metrics = metricsByPath.get(articlePath) || { views: 0, comments: 0, shares: { facebook: 0, linkedin: 0, copy: 0 } };

    createPage({
      path: articlePath,
      component: isSeries ? seriesArticleTemplate : articleTemplate,
      context: {
        slug: article.frontmatter.slug,
        author: article.frontmatter.author,
        publishedAt: article.frontmatter.publishedAt,
        seriesName: article.frontmatter.series?.name || null,
        isReview,
        isBrewing,
        viewCount: metrics.views,
        commentCount: metrics.comments,
        shareCounts: metrics.shares || { facebook: 0, linkedin: 0, copy: 0 },
      },
    });
  });

  reporter.info(`Created ${articles.length} article pages`);

  // Create tag pages with pagination
  const tagTemplate = path.resolve('./src/templates/tag.tsx');
  const articlesPerPage = 15;

  tags.forEach((tag) => {
    const tagArticles = articles.filter((article) =>
      article.frontmatter.tags?.some((articleTag) => normalizeTagSlug(articleTag) === tag.slug)
    );
    const numPages = Math.ceil(tagArticles.length / articlesPerPage);

    Array.from({ length: numPages }).forEach((_, i) => {
      const currentPage = i + 1;
      const canonicalPagePath = currentPage === 1 
        ? `/tag/${tag.slug}` 
        : `/tag/${tag.slug}/${currentPage}`;
      const pageContext = {
        slug: tag.slug,
        articleSlugs: tagArticles.map((article) => article.frontmatter.slug),
        limit: articlesPerPage,
        skip: i * articlesPerPage,
        numPages,
        currentPage,
      };

      createPage({
        path: canonicalPagePath,
        component: tagTemplate,
        context: pageContext,
      });
    });

    reporter.info(`Created ${numPages} page(s) for tag: ${tag.name}`);
  });

  // Create gallery pages only if gallery content exists
  // Gallery pages are skipped if no gallery albums are found
  const galleryIndexTemplate = path.resolve('./src/templates/gallery-index.tsx');
  const galleryAlbumTemplate = path.resolve('./src/templates/gallery-album.tsx');
  const galleryCategoryTemplate = path.resolve('./src/templates/gallery-category.tsx');

  const galleryResult = await graphql<{
    allMarkdownRemark: {
      nodes: Array<{
        frontmatter: {
          slug: string;
          title: string;
          category?: string;
        };
      }>;
    };
  }>(`
    query GalleryAlbumsQuery {
      allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/content/galleries/" }
          frontmatter: { slug: { ne: null }, draft: { ne: true } }
        }
      ) {
        nodes {
          frontmatter {
            slug
            title
            category
          }
        }
      }
    }
  `);

  if (!galleryResult.errors && galleryResult.data?.allMarkdownRemark.nodes && galleryResult.data.allMarkdownRemark.nodes.length > 0) {
    // Load photo view counts from GA4 data (generated at deploy start)
    const photoViewsPath = path.resolve('./static/data/photo-view-counts.json');
    let photoViewCounts: Record<string, number> = {};
    if (fs.existsSync(photoViewsPath)) {
      try {
        const photoViewsData = JSON.parse(fs.readFileSync(photoViewsPath, 'utf-8'));
        photoViewCounts = photoViewsData.counts || {};
      } catch {
        reporter.warn('Failed to parse photo-view-counts.json, using empty counts');
      }
    }

    // Load category metadata from gallery-categories.json
    interface CategoryMeta {
      slug: string;
      title: string;
      description: string;
      coverImage: string;
      parent: string | null;
    }

    const categoriesPath = path.resolve('./src/data/gallery-categories.json');
    const categoriesData: CategoryMeta[] = fs.existsSync(categoriesPath) ? JSON.parse(fs.readFileSync(categoriesPath, 'utf-8')) : [];

    // Build lookups
    const categoryMap = new Map<string, CategoryMeta>();
    const topLevelCategories: CategoryMeta[] = [];
    const childCategories = new Map<string, CategoryMeta[]>(); // parent slug -> children

    for (const cat of categoriesData) {
      categoryMap.set(cat.slug, cat);
      if (cat.parent === null) {
        topLevelCategories.push(cat);
      } else {
        const existing = childCategories.get(cat.parent) || [];
        existing.push(cat);
        childCategories.set(cat.parent, existing);
      }
    }

    // Collect distinct category slugs from gallery frontmatter
    const albumCategorySlugs = new Set<string>();
    const galleryAlbums = galleryResult.data.allMarkdownRemark.nodes;

    for (const album of galleryAlbums) {
      const cat = album.frontmatter.category;
      if (cat) {
        albumCategorySlugs.add(cat);
      }
    }

    // Gallery index page — pass all categories (index builds hierarchy)
    createPage({
      path: '/gallery',
      component: galleryIndexTemplate,
      context: {
        categories: categoriesData,
      },
    });

    reporter.info('Created gallery index page: /gallery');

    // Build a full URL path for a category slug by walking up the parent chain.
    // e.g. "disney-vacation" with parent "2026" with parent "family-trips"
    //   → "/gallery/family-trips/2026/disney-vacation"
    const getFullPath = (slug: string): string => {
      const pathParts: string[] = [];
      let currentSlug: string | undefined = slug;
      while (currentSlug) {
        pathParts.unshift(currentSlug);
        const cat = categoryMap.get(currentSlug);
        currentSlug = cat?.parent ?? undefined;
      }
      return `/gallery/${pathParts.join('/')}`;
    };

    // Build an ordered chain of { slug, title } from root → leaf for a slug.
    // Used by templates to render multi-level breadcrumbs.
    const getCategoryChain = (slug: string): Array<{ slug: string; title: string }> => {
      const chain: Array<{ slug: string; title: string }> = [];
      let currentSlug: string | undefined = slug;
      while (currentSlug) {
        const cat = categoryMap.get(currentSlug);
        if (!cat) break;
        chain.unshift({ slug: cat.slug, title: cat.title });
        currentSlug = cat.parent ?? undefined;
      }
      return chain;
    };

    // Create a page for every category that has albums or children.
    // URL reflects the full hierarchy: /gallery/{root}/.../{slug}
    for (const cat of categoriesData) {
      const hasAlbums = albumCategorySlugs.has(cat.slug);
      const hasChildren = (childCategories.get(cat.slug) || []).length > 0;
      if (!hasAlbums && !hasChildren) continue;

      const fullPath = getFullPath(cat.slug);
      const chain = getCategoryChain(cat.slug);

      createPage({
        path: fullPath,
        component: galleryCategoryTemplate,
        context: {
          categorySlug: cat.slug,
          categoryTitle: cat.title,
          categoryDescription: cat.description,
          categoryCoverImage: cat.coverImage,
          categoryPath: fullPath,
          isTopLevel: cat.parent === null,
          childCategories: childCategories.get(cat.slug) || [],
          categoryChain: chain,
        },
      });

      reporter.info(`Created gallery category page: ${fullPath}`);
    }

    // Create individual album pages.
    // URL: /gallery/{root}/.../{leaf-category}/{album-slug}
    galleryAlbums.forEach((album) => {
      const catSlug = album.frontmatter.category || null;
      const catMeta = catSlug ? categoryMap.get(catSlug) : null;

      let albumPath = `/gallery/${album.frontmatter.slug}`;
      let categoryChain: Array<{ slug: string; title: string }> = [];
      if (catMeta) {
        albumPath = `${getFullPath(catMeta.slug)}/${album.frontmatter.slug}`;
        categoryChain = getCategoryChain(catMeta.slug);
      }

      createPage({
        path: albumPath,
        component: galleryAlbumTemplate,
        context: {
          slug: album.frontmatter.slug,
          categorySlug: catSlug,
          categoryTitle: catMeta?.title || null,
          categoryPath: catMeta ? getFullPath(catMeta.slug) : null,
          categoryChain,
          photoViewCounts,
        },
      });

      reporter.info(`Created gallery album page: ${albumPath}`);
    });
  } else {
    reporter.info('No gallery albums found, skipping gallery pages');
  }
};
