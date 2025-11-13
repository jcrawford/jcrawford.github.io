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

  const featuredArticles = articles.filter((article) =>
    article.frontmatter.tags.includes('featured')
  );

  const regularArticles = articles.filter((article) =>
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

  const mapArticleForSlider = (article: Article) => ({
    slug: article.frontmatter.slug,
    title: article.frontmatter.title,
    excerpt: article.frontmatter.excerpt,
    featuredImage: article.frontmatter.featuredImage,
    category: article.frontmatter.category,
    categoryName: getCategoryName(article.frontmatter.category),
    publishedAt: article.frontmatter.publishedAt,
    author: article.frontmatter.author,
    authorName: getAuthorName(article.frontmatter.author),
  });

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
              {featuredArticles.slice(3, 5).map((article) => (
                <HighlightedPost
                  key={article.id}
                  slug={article.frontmatter.slug}
                  title={article.frontmatter.title}
                  featuredImage={article.frontmatter.featuredImage}
                />
              ))}
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
              {regularArticles.slice(0, 12).map((article) => (
                <ArticleCard
                  key={article.id}
                  slug={article.frontmatter.slug}
                  title={article.frontmatter.title}
                  excerpt={article.frontmatter.excerpt}
                  featuredImage={article.frontmatter.featuredImage}
                  category={article.frontmatter.category}
                  categoryName={getCategoryName(article.frontmatter.category)}
                  publishedAt={article.frontmatter.publishedAt}
                  author={article.frontmatter.author}
                  authorName={getAuthorName(article.frontmatter.author)}
                />
              ))}
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
