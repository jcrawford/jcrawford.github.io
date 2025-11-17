import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

interface AuthorPageData {
  authorsJson: {
    name: string;
    slug: string;
    bio: string;
    avatar: string;
    socialLinks: {
      facebook: string;
      twitter: string;
      instagram: string;
    };
  };
  allMarkdownRemark: {
    nodes: Array<{
      id: string;
      html: string;
      frontmatter: {
        slug: string;
        title: string;
        excerpt: string;
        featuredImage: string;
        category: string;
        author: string;
        publishedAt: string;
      };
    }>;
    totalCount: number;
  };
  allTagsJson: {
    nodes: Array<{
      slug: string;
      name: string;
    }>;
  };
}

const AuthorTemplate: React.FC<PageProps<AuthorPageData>> = ({ data }) => {
  const author = data.authorsJson;
  const articles = data.allMarkdownRemark.nodes;
  const totalCount = data.allMarkdownRemark.totalCount;
  const tags = data.allTagsJson.nodes;

  const getTagName = (slug: string) => {
    const tag = tags.find((t) => t.slug === slug);
    return tag?.name || slug;
  };

  return (
    <Layout>
      <div className="hm-container">
        <header className="hm-author-header">
          <div className="hm-author-avatar-large">
            <OptimizedImage 
              src={author.avatar} 
              alt={author.name}
              loading="eager"
            />
          </div>
          <h1 className="hm-author-name">{author.name}</h1>
          <p className="hm-author-bio">{author.bio}</p>
          
          {author.socialLinks && (
            <div className="hm-author-social">
              {author.socialLinks.facebook && (
                <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 320 512">
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                </a>
              )}
              {author.socialLinks.twitter && (
                <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                  </svg>
                </a>
              )}
              {author.socialLinks.instagram && (
                <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </a>
              )}
            </div>
          )}
          
          <p className="hm-author-article-count">
            {totalCount} {totalCount === 1 ? 'article' : 'articles'} published
          </p>
        </header>

        {articles.length > 0 ? (
          <div className="hm-article-grid">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                slug={article.frontmatter.slug}
                title={article.frontmatter.title}
                excerpt={article.frontmatter.excerpt}
                featuredImage={article.frontmatter.featuredImage}
                category={article.frontmatter.category}
                categoryName={getTagName(article.frontmatter.category)}
                publishedAt={article.frontmatter.publishedAt}
                author={article.frontmatter.author}
                authorName={author.name}
              />
            ))}
          </div>
        ) : (
          <div className="hm-empty-state">
            <p>No articles published yet.</p>
            <Link to="/" className="hm-cta-btn">
              Browse All Articles
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const query = graphql`
  query AuthorQuery($slug: String!) {
    authorsJson(slug: { eq: $slug }) {
      name
      slug
      bio
      avatar
      socialLinks {
        facebook
        twitter
        instagram
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { author: { eq: $slug } } }
      sort: { frontmatter: { publishedAt: DESC } }
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
          author
          publishedAt
        }
      }
      totalCount
    }
    allTagsJson {
      nodes {
        slug
        name
      }
    }
  }
`;

export const Head: HeadFC<AuthorPageData> = ({ data }) => (
  <SEO 
    title={data.authorsJson.name}
    description={data.authorsJson.bio}
    image={data.authorsJson.avatar}
    pathname={`/author/${data.authorsJson.slug}`}
  />
);

export default AuthorTemplate;

