import React from 'react';
import { graphql, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import FeaturedPosts from '../components/FeaturedPosts';
import EmptyFeaturedState from '../components/EmptyFeaturedState';
import TagTabs from '../components/TagTabs';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';
import '../styles/empty-featured.css';

interface ArticleFrontmatter {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
  series?: {
    name: string;
    order?: number;
  };
}

interface Article {
  id: string;
  html: string;
  frontmatter: ArticleFrontmatter;
}

interface Tag {
  slug: string;
  name: string;
}

interface Author {
  slug: string;
  name: string;
}

interface IndexPageData {
  allMarkdownRemark: {
    nodes: Article[];
  };
  allTagsJson: {
    nodes: Tag[];
  };
  allAuthorsJson: {
    nodes: Author[];
  };
  allFile?: {
    nodes: Array<{
      name: string;
      internal: {
        content: string;
      };
    }>;
  };
}

// Check if we're in production at build time
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  // Production homepage is live — no more Coming Soon overlay

  // Development: Show full homepage (excluding family posts)
  const allTags = data.allTagsJson.nodes;
  const authors = data.allAuthorsJson.nodes;
  
  // Get configured tag slugs, or fallback to first 4 tags if config doesn't exist or is malformed
  let configuredTagSlugs: string[] = [];
  
  try {
    const tagTabsFile = data.allFile?.nodes.find(node => node.name === 'tag-tabs');
    if (tagTabsFile && tagTabsFile.internal.content) {
      const parsed = JSON.parse(tagTabsFile.internal.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        configuredTagSlugs = parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to parse tag-tabs.json, using fallback', error);
  }
  
  // Fallback: use first 4 tags from tags.json
  if (configuredTagSlugs.length === 0) {
    configuredTagSlugs = allTags.slice(0, 4).map(tag => tag.slug);
  }
  
  // Filter tags based on configuration (preserving order from config)
  const tags = configuredTagSlugs
    .map(slug => allTags.find(tag => tag.slug === slug))
    .filter((tag): tag is Tag => tag !== undefined);
  
  // Filter out family posts and reviews from homepage — reviews have their own page
  const articles = data.allMarkdownRemark.nodes.filter(
    article => article.frontmatter && 
      !article.frontmatter.tags?.some(t => t.toLowerCase() === 'family') &&
      !article.frontmatter.tags?.some(t => t.toLowerCase() === 'reviews')
  );

  // Group articles by series
  const seriesMap = new Map<string, Article[]>();
  const standaloneArticles: Article[] = [];

  articles.forEach(article => {
    if (article.frontmatter.series?.name) {
      const seriesName = article.frontmatter.series.name;
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, []);
      }
      seriesMap.get(seriesName)!.push(article);
    } else {
      standaloneArticles.push(article);
    }
  });

  // Extract first article from each series (sorted by order, then publishedAt)
  const seriesFirstArticles: Article[] = [];
  seriesMap.forEach((seriesArticles) => {
    const sortedArticles = [...seriesArticles].sort((a, b) => {
      const orderA = a.frontmatter.series?.order ?? 999;
      const orderB = b.frontmatter.series?.order ?? 999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      return new Date(a.frontmatter.publishedAt).getTime() - 
             new Date(b.frontmatter.publishedAt).getTime();
    });
    
    seriesFirstArticles.push(sortedArticles[0]);
  });

  // Combine standalone articles and series first articles
  const allDisplayArticles = [...standaloneArticles, ...seriesFirstArticles].sort((a, b) => {
    return new Date(b.frontmatter.publishedAt).getTime() - 
           new Date(a.frontmatter.publishedAt).getTime();
  });

  // Helper to map article for display (handles series vs standalone)
  const mapArticleForSlider = (article: Article) => {
    const isSeries = !!article.frontmatter.series?.name;
    
    if (isSeries) {
      const seriesName = article.frontmatter.series!.name;
      const seriesArticles = seriesMap.get(seriesName) || [];
      
      return {
        ...article,
        frontmatter: {
          ...article.frontmatter,
          title: seriesName,
          excerpt: `A comprehensive ${seriesArticles.length}-part series on ${seriesName.toLowerCase()}.`,
          featuredImage: `/images/content/${article.frontmatter.slug.split('/')[0]}/series-cover.jpg`,
        },
      };
    }
    
    return article;
  };

  /**
   * Filters posts to include only those marked as featured and not tagged with "family".
   * Sorts results by publication date (descending) with slug as secondary sort (ascending).
   * Limits to first 7 posts for the featured section (5 slider + 2 highlighted).
   * 
   * @returns Array of featured posts, limited to 7
   */
  const featuredPosts = allDisplayArticles.filter(
    article => article.frontmatter.featured === true
  );

  // Sort featured posts: primary by publishedAt DESC, secondary by slug ASC
  const sortedFeaturedPosts = featuredPosts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.publishedAt).getTime();
    const dateB = new Date(b.frontmatter.publishedAt).getTime();
    
    if (dateA !== dateB) {
      return dateB - dateA; // Most recent first
    }
    
    // Secondary sort: slug alphabetically ascending
    return a.frontmatter.slug.localeCompare(b.frontmatter.slug);
  });

  // Get latest articles for featured slider (5 for slider + 2 for highlighted posts)
  const latestArticles = sortedFeaturedPosts.slice(0, 7);

  // Ensure we have data to map
  const featuredArticles = latestArticles.length > 0 ? latestArticles.slice(0, Math.min(5, latestArticles.length)).map(article => {
    const mappedArticle = mapArticleForSlider(article);
    return {
      slug: mappedArticle.frontmatter.slug,
      title: mappedArticle.frontmatter.title,
      excerpt: mappedArticle.frontmatter.excerpt,
      featuredImage: mappedArticle.frontmatter.featuredImage,
      tags: mappedArticle.frontmatter.tags,
      publishedAt: mappedArticle.frontmatter.publishedAt,
      author: mappedArticle.frontmatter.author,
      authorName: authors.find(a => a.slug === mappedArticle.frontmatter.author)?.name || mappedArticle.frontmatter.author,
      isSeries: !!mappedArticle.frontmatter.series?.name,
    };
  }) : [];
  
  const highlightedArticles = latestArticles.length > 5 ? latestArticles.slice(5, 7).map(article => {
    const mappedArticle = mapArticleForSlider(article);
    return {
      slug: mappedArticle.frontmatter.slug,
      title: mappedArticle.frontmatter.title,
      excerpt: mappedArticle.frontmatter.excerpt,
      featuredImage: mappedArticle.frontmatter.featuredImage,
      tags: mappedArticle.frontmatter.tags,
      publishedAt: mappedArticle.frontmatter.publishedAt,
      author: mappedArticle.frontmatter.author,
      authorName: authors.find(a => a.slug === mappedArticle.frontmatter.author)?.name || mappedArticle.frontmatter.author,
      isSeries: !!mappedArticle.frontmatter.series?.name,
    };
  }) : [];
  
  // Exclude ALL featured posts from tag tabs and the article grid below
  const featuredSlugs = sortedFeaturedPosts.map(article => article.frontmatter.slug);

  // Recent articles: non-featured posts only (skip the featured section entirely)
  const recentArticles = allDisplayArticles
    .filter(article => article.frontmatter.featured !== true)
    .slice(0, 12)
    .map(mapArticleForSlider);

  return (
    <Layout>
      <div className="hm-container">
        {featuredArticles.length === 0 ? (
          <EmptyFeaturedState message="No featured posts configured" />
        ) : (
          <FeaturedPosts 
            sliderArticles={featuredArticles}
            highlightedArticles={highlightedArticles}
          />
        )}

        <TagTabs tags={tags} articles={articles} excludeSlugs={featuredSlugs} />

        <div className="hm-content-sidebar-wrap">
          <main className="hm-primary-content">
            <div className="hm-article-grid">
              {recentArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  slug={article.frontmatter.slug}
                  title={article.frontmatter.title}
                  excerpt={article.frontmatter.excerpt}
                  featuredImage={article.frontmatter.featuredImage}
                  tags={article.frontmatter.tags || []}
                  publishedAt={article.frontmatter.publishedAt}
                  author={article.frontmatter.author}
                  authorName={authors.find(a => a.slug === article.frontmatter.author)?.name || article.frontmatter.author}
                  isSeries={!!article.frontmatter.series?.name}
                />
              ))}
            </div>
          </main>
          <aside className="hm-sidebar-desktop">
            <Sidebar />
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;

export const Head: HeadFC = () => {
  // Show Coming Soon title in production
  return <SEO />;
};

export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 150
      filter: { frontmatter: { draft: { ne: true } } }
    ) {
      nodes {
        id
        html
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          tags
          author
          publishedAt
          updatedAt
          featured
          series {
            name
            order
          }
        }
      }
    }
    allTagsJson {
      nodes {
        slug
        name
      }
    }
    allAuthorsJson {
      nodes {
        slug
        name
      }
    }
    allFile(filter: { name: { eq: "tag-tabs" }, sourceInstanceName: { eq: "data" } }) {
      nodes {
        name
        internal {
          content
        }
      }
    }
  }
`;
