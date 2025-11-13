import React from 'react';
import { graphql, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import FeaturedSlider from '../components/FeaturedSlider';
import HighlightedPost from '../components/HighlightedPost';
import CategoryTabs from '../components/CategoryTabs';
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

interface Category {
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
  allCategoriesJson: {
    nodes: Category[];
  };
  allAuthorsJson: {
    nodes: Author[];
  };
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const articles = data.allMarkdownRemark.nodes;
  const categories = data.allCategoriesJson.nodes;
  const authors = data.allAuthorsJson.nodes;

  // Group articles by series
  const seriesMap = new Map<string, Article[]>();
  const standaloneArticles: Article[] = [];

  articles.forEach((article) => {
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

  // Get first article from each series (by order or publishedAt)
  const seriesFirstArticles: Article[] = [];
  seriesMap.forEach((seriesArticles) => {
    const sorted = [...seriesArticles].sort((a, b) => {
      // Sort by order if both have it
      if (a.frontmatter.series?.order !== undefined && b.frontmatter.series?.order !== undefined) {
        return a.frontmatter.series.order - b.frontmatter.series.order;
      }
      // If only one has order, it comes first
      if (a.frontmatter.series?.order !== undefined) return -1;
      if (b.frontmatter.series?.order !== undefined) return 1;
      // Otherwise sort by publishedAt
      return new Date(a.frontmatter.publishedAt).getTime() - new Date(b.frontmatter.publishedAt).getTime();
    });
    seriesFirstArticles.push(sorted[0]);
  });

  // Combine standalone articles with series first articles
  const allDisplayArticles = [...standaloneArticles, ...seriesFirstArticles].sort((a, b) =>
    new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime()
  );

  const featuredArticles = allDisplayArticles.filter((article) =>
    article.frontmatter.tags.includes('featured')
  );

  const regularArticles = allDisplayArticles.filter((article) =>
    !article.frontmatter.tags.includes('featured')
  );

  const getCategoryName = (slug: string) => {
    const category = categories.find((cat) => cat.slug === slug);
    return category?.name || slug;
  };

  const getAuthorName = (slug: string) => {
    const author = authors.find((auth) => auth.slug === slug);
    return author?.name || slug;
  };

  const mapArticleForSlider = (article: Article) => {
    // If this is a series, show series info instead
    if (article.frontmatter.series?.name) {
      const seriesSlug = article.frontmatter.slug.split('/')[0]; // e.g., "building-better-websites"
      const seriesCount = articles.filter(a => a.frontmatter.series?.name === article.frontmatter.series?.name).length;
      return {
        slug: article.frontmatter.slug, // Still link to first article
        title: article.frontmatter.series.name, // Show series name
        excerpt: `A comprehensive ${seriesCount}-part series on ${article.frontmatter.series.name.toLowerCase()}.`,
        featuredImage: `/images/content/${seriesSlug}/series-cover.jpg`,
        category: article.frontmatter.category,
        categoryName: getCategoryName(article.frontmatter.category),
        publishedAt: article.frontmatter.publishedAt,
        author: article.frontmatter.author,
        authorName: getAuthorName(article.frontmatter.author),
      };
    }
    
    return {
      slug: article.frontmatter.slug,
      title: article.frontmatter.title,
      excerpt: article.frontmatter.excerpt,
      featuredImage: article.frontmatter.featuredImage,
      category: article.frontmatter.category,
      categoryName: getCategoryName(article.frontmatter.category),
      publishedAt: article.frontmatter.publishedAt,
      author: article.frontmatter.author,
      authorName: getAuthorName(article.frontmatter.author),
    };
  };

  return (
    <Layout>
      {/* Featured Section - 3 article slider + 2 highlighted posts */}
      <div className="hm-container">
        <div className="hm-fp1">
          <div className="hm-fp1-left">
            {featuredArticles.length > 0 && (
              <FeaturedSlider 
                articles={featuredArticles.slice(0, 3).map(mapArticleForSlider)}
              />
            )}
          </div>
          <div className="hm-fp1-right">
            <div className="hm-highlighted-posts">
              {featuredArticles.slice(3, 5).map((article) => {
                const displayData = mapArticleForSlider(article);
                return (
                  <HighlightedPost
                    key={article.id}
                    slug={displayData.slug}
                    title={displayData.title}
                    featuredImage={displayData.featuredImage}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs - Full Width */}
      <div className="hm-container">
        <CategoryTabs categories={categories} articles={articles} />
      </div>

      {/* Articles with Sidebar */}
      <div className="hm-container">
        <div className="hm-content-sidebar-wrap">
          <main className="hm-primary-content">
            {/* Sidebar - Mobile/Tablet */}
            <Sidebar />

            {/* Latest Articles Grid */}
            <div className="hm-article-grid">
              {regularArticles.slice(0, 12).map((article) => {
                const displayData = mapArticleForSlider(article);
                return (
                  <ArticleCard
                    key={article.id}
                    slug={displayData.slug}
                    title={displayData.title}
                    excerpt={displayData.excerpt}
                    featuredImage={displayData.featuredImage}
                    category={displayData.category}
                    categoryName={displayData.categoryName}
                    publishedAt={displayData.publishedAt}
                    author={displayData.author}
                    authorName={displayData.authorName}
                  />
                );
              })}
            </div>
          </main>

          {/* Sidebar - Desktop */}
          <aside className="hm-sidebar-desktop">
            <Sidebar />
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query HomePageQuery {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      filter: { frontmatter: { slug: { ne: null } } }
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
    allCategoriesJson {
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
  }
`;

export const Head: HeadFC = () => <SEO />;

export default IndexPage;
