import React from 'react';
import { graphql, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import FeaturedPosts from '../components/FeaturedPosts';
import TagTabs from '../components/TagTabs';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';

interface ArticleFrontmatter {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
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
  // If production, render coming soon overlay (but still render layout underneath to avoid build errors)
  if (IS_PRODUCTION) {
    return (
      <Layout>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              body {
                margin: 0;
                padding: 0;
                overflow: hidden !important;
              }
              
              #___gatsby,
              #gatsby-focus-wrapper {
                height: 100%;
                overflow: hidden !important;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `
          }} />
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '600px',
            animation: 'fadeIn 1s ease-in',
            color: '#fff',
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '2rem',
            }}>✨</div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 700,
              marginBottom: '1.5rem',
              lineHeight: 1.2,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}>
              Coming Soon
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              marginBottom: '3rem',
              opacity: 0.95,
              lineHeight: 1.6,
              fontWeight: 300,
            }}>
              Something amazing is in the works. We're crafting a beautiful experience and can't wait to share it with you.
            </p>
            <div style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
              Stay Tuned
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
  
  // Filter out family posts from homepage and articles with null frontmatter
  const articles = data.allMarkdownRemark.nodes.filter(
    article => article.frontmatter && article.frontmatter.category !== 'family'
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

  // Get latest articles for featured slider (5 for slider + 2 for highlighted posts)
  const latestArticles = allDisplayArticles.slice(0, 7);

  const featuredArticles = latestArticles.slice(0, 5).map(article => {
    const mappedArticle = mapArticleForSlider(article);
    return {
      slug: mappedArticle.frontmatter.slug,
      title: mappedArticle.frontmatter.title,
      excerpt: mappedArticle.frontmatter.excerpt,
      featuredImage: mappedArticle.frontmatter.featuredImage,
      category: mappedArticle.frontmatter.category,
      categoryName: tags.find(t => t.slug === mappedArticle.frontmatter.category)?.name || mappedArticle.frontmatter.category,
      publishedAt: mappedArticle.frontmatter.publishedAt,
      author: mappedArticle.frontmatter.author,
      authorName: authors.find(a => a.slug === mappedArticle.frontmatter.author)?.name || mappedArticle.frontmatter.author,
      isSeries: !!mappedArticle.frontmatter.series?.name,
    };
  });
  
  const highlightedArticles = latestArticles.slice(5, 7).map(article => {
    const mappedArticle = mapArticleForSlider(article);
    return {
      slug: mappedArticle.frontmatter.slug,
      title: mappedArticle.frontmatter.title,
      excerpt: mappedArticle.frontmatter.excerpt,
      featuredImage: mappedArticle.frontmatter.featuredImage,
      category: mappedArticle.frontmatter.category,
      categoryName: tags.find(t => t.slug === mappedArticle.frontmatter.category)?.name || mappedArticle.frontmatter.category,
      publishedAt: mappedArticle.frontmatter.publishedAt,
      author: mappedArticle.frontmatter.author,
      authorName: authors.find(a => a.slug === mappedArticle.frontmatter.author)?.name || mappedArticle.frontmatter.author,
      isSeries: !!mappedArticle.frontmatter.series?.name,
    };
  });
  const recentArticles = allDisplayArticles.slice(7, 19).map(mapArticleForSlider);

  // Extract slugs of featured articles (top 5 in slider) to exclude from category tabs
  const featuredSlugs = featuredArticles.map(article => article.slug);

  return (
    <Layout>
      <div className="hm-container">
        <FeaturedPosts 
          sliderArticles={featuredArticles}
          highlightedArticles={highlightedArticles}
        />

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
                  category={article.frontmatter.category}
                  categoryName={tags.find(t => t.slug === article.frontmatter.category)?.name || article.frontmatter.category}
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
  if (IS_PRODUCTION) {
    return (
      <>
        <title>Coming Soon | Joseph Crawford</title>
        <meta name="description" content="Something amazing is coming soon." />
        <meta name="robots" content="noindex, nofollow" />
      </>
    );
  }
  
  // Regular SEO in development
  return <SEO />;
};

export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 100
    ) {
      nodes {
        id
        html
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          category
          tags
          author
          publishedAt
          updatedAt
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
