import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';
import { formatDate } from '../utils/dateUtils';

interface RecentArticle {
  id: string;
  frontmatter: {
    slug: string;
    title: string;
    featuredImage: string;
    publishedAt: string;
    series?: {
      name: string;
    };
  };
}

interface RecentArticlesData {
  recentArticles: {
    nodes: RecentArticle[];
  };
}

const RecentArticles: React.FC = () => {
  const data = useStaticQuery<RecentArticlesData>(graphql`
    query RecentArticlesQuery {
      recentArticles: allMarkdownRemark(
        limit: 5
        sort: { frontmatter: { publishedAt: DESC } }
        filter: { frontmatter: { slug: { ne: null } } }
      ) {
        nodes {
          id
          frontmatter {
            slug
            title
            featuredImage
            publishedAt
            series {
              name
            }
          }
        }
      }
    }
  `);

  const recentArticles = data.recentArticles.nodes;

  return (
    <div className="widget hm-sidebar-posts">
      <h3 className="widget-title">Popular</h3>
      {recentArticles.map((article) => {
        const articlePath = getArticlePath(article.frontmatter.slug, !!article.frontmatter.series?.name);
        return (
          <article key={article.id} className="hms-post">
            <div className="hms-thumb">
              <Link to={articlePath}>
                <OptimizedImage 
                  src={article.frontmatter.featuredImage} 
                  alt={article.frontmatter.title}
                  className="attachment-thumbnail size-thumbnail wp-post-image"
                />
              </Link>
            </div>
            <div className="hms-details">
              <h4 className="hms-title">
                <Link to={articlePath}>{article.frontmatter.title}</Link>
              </h4>
            <span className="hms-date">
              {formatDate(article.frontmatter.publishedAt)}
            </span>
          </div>
        </article>
        );
      })}
    </div>
  );
};

export default RecentArticles;

