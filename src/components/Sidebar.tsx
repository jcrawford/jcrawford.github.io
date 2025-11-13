import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import OptimizedImage from './OptimizedImage';
import { formatDate } from '../utils/dateUtils';

interface SidebarArticle {
  id: string;
  slug: string;
  title: string;
  featuredImage: string;
  publishedAt: string;
}

interface SidebarData {
  recentArticles: {
    nodes: SidebarArticle[];
  };
  allCategoriesJson: {
    nodes: Array<{
      slug: string;
      name: string;
    }>;
  };
}

const Sidebar: React.FC = () => {
  const data = useStaticQuery<SidebarData>(graphql`
    query SidebarQuery {
      recentArticles: allArticlesJson(
        limit: 5
        sort: { publishedAt: DESC }
      ) {
        nodes {
          id
          slug
          title
          featuredImage
          publishedAt
        }
      }
      allCategoriesJson {
        nodes {
          slug
          name
        }
      }
    }
  `);

  const recentArticles = data.recentArticles.nodes;
  const categories = data.allCategoriesJson.nodes;

  return (
    <aside id="secondary" className="hm-sidebar">
      {/* Popular Posts Widget */}
      <div className="widget hm-sidebar-posts">
        <h3 className="widget-title">Popular</h3>
        {recentArticles.map((article) => (
          <article key={article.id} className="hms-post">
            <div className="hms-thumb">
              <Link to={`/articles/${article.slug}`}>
                <OptimizedImage 
                  src={article.featuredImage} 
                  alt={article.title}
                  className="attachment-thumbnail size-thumbnail wp-post-image"
                />
              </Link>
            </div>
            <div className="hms-details">
              <h4 className="hms-title">
                <Link to={`/articles/${article.slug}`}>{article.title}</Link>
              </h4>
              <span className="hms-date">
                {formatDate(article.publishedAt)}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Categories Widget */}
      <div className="widget widget_categories">
        <h3 className="widget-title">Categories</h3>
        <ul>
          {categories.map((category) => (
            <li key={category.slug} className="cat-item">
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
