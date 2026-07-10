import React from 'react';
import { graphql, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import FeaturedPosts from '../components/FeaturedPosts';
import EmptyFeaturedState from '../components/EmptyFeaturedState';
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

interface Author {
  slug: string;
  name: string;
}

interface IndexPageData {
  allMarkdownRemark: {
    nodes: Article[];
  };
  allAuthorsJson: {
    nodes: Author[];
  };
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const authors = data.allAuthorsJson.nodes;
  
  // All published posts and reviews
  const articles = data.allMarkdownRemark.nodes.filter(
    article => article.frontmatter
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

  // Get the first 7 posts for the featured section (5 slider + 2 highlighted)
  // Posts live here until pushed out by newer content
  const latestArticles = allDisplayArticles.slice(0, 7);

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
  
  // Exclude ALL posts shown in the featured section from the article grid below
  const featuredSlugs = latestArticles.map(article => article.frontmatter.slug);

  // Recent articles: non-featured posts only
  const recentArticles = allDisplayArticles
    .filter(
      (article) =>
        !featuredSlugs.includes(article.frontmatter.slug)
    )
    .slice(0, 12)
    .map(mapArticleForSlider);

  return (
    <Layout>
      <div className="hm-container">
        {featuredArticles.length === 0 ? (
          <EmptyFeaturedState message="No recent posts" />
        ) : (
          <FeaturedPosts 
            sliderArticles={featuredArticles}
            highlightedArticles={highlightedArticles}
          />
        )}

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

export const Head: HeadFC = () => (
  <SEO title={undefined} />
);

export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 150
      filter: { frontmatter: { draft: { ne: true } }, fileAbsolutePath: { regex: "//content/(posts|reviews)/" } }
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
          series {
            name
            order
          }
        }
      }
    }
    allAuthorsJson {
      nodes {
        slug
        name
      }
    }
  }
`;
