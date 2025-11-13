import React, { useState } from 'react';
import { Link } from 'gatsby';
import OptimizedImage from './OptimizedImage';
import { formatDate } from '../utils/dateUtils';

interface Article {
  id: string;
  html: string;
  frontmatter: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    category: string;
    tags: string[];
    author: string;
    publishedAt: string;
    updatedAt: string;
  };
}

interface Category {
  slug: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  articles: Article[];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, articles }) => {
  const [activeTab, setActiveTab] = useState(categories[0]?.slug || '');

  const getArticlesByCategory = (categorySlug: string) => {
    return articles
      .filter((article) => article.frontmatter.category === categorySlug)
      .slice(0, 4);
  };

  const activeCategory = categories.find(cat => cat.slug === activeTab);

  return (
    <div className="hm-featured-tabs">
      <div className="hm-tab-header">
        <ul className="hm-tab-nav">
          {categories.slice(0, 4).map((category) => (
            <li key={category.slug} className="hm-tab">
              <a
                className="hm-tab-anchor"
                aria-label={`tab-posts-${category.slug}`}
                href={`#hm-tab-posts-${category.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(category.slug);
                }}
                style={{
                  borderBottom: activeTab === category.slug ? '3px solid var(--hybridmag-color-primary)' : '3px solid transparent',
                  color: activeTab === category.slug ? 'var(--hybridmag-color-text-headings)' : 'var(--hybridmag-color-text-main)',
                }}
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
        {activeCategory && (
          <Link 
            to={`/category/${activeCategory.slug}`} 
            className="hm-view-more-link"
          >
            View More
          </Link>
        )}
      </div>

      <div className="tab-content clearfix">
        {categories.slice(0, 4).map((category) => (
          <div
            key={category.slug}
            id={`hm-tab-posts-${category.slug}`}
            style={{ display: activeTab === category.slug ? 'block' : 'none' }}
          >
            <div className="hm-tab-posts-wrapper">
              {getArticlesByCategory(category.slug).map((article) => (
                <div key={article.id} className="hm-tab-post-card">
                  <div className="hm-tab-post-img">
                    <Link to={`/articles/${article.frontmatter.slug}`} aria-label={article.frontmatter.title}>
                      <OptimizedImage 
                        src={article.frontmatter.featuredImage} 
                        alt={article.frontmatter.title}
                        loading="lazy"
                      />
                    </Link>
                  </div>
                  <div className="hm-tab-post-details">
                    <h3 className="hm-tab-post-title">
                      <Link to={`/articles/${article.frontmatter.slug}`}>{article.frontmatter.title}</Link>
                    </h3>
                    <div className="entry-meta">
                      <span className="posted-on">
                        <Link to={`/articles/${article.frontmatter.slug}`}>
                          <time className="entry-date published" dateTime={article.frontmatter.publishedAt}>
                            {formatDate(article.frontmatter.publishedAt)}
                          </time>
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;

