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
    series?: {
      name: string;
      order?: number;
    };
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
    const categoryArticles = articles.filter(
      (article) => article.frontmatter.category === categorySlug
    );

    // Group series articles - show only the first article of each series
    const seriesMap = new Map<string, Article>();
    const standaloneArticles: Article[] = [];

    categoryArticles.forEach((article) => {
      if (article.frontmatter.series?.name) {
        const seriesName = article.frontmatter.series.name;
        const existing = seriesMap.get(seriesName);

        // Keep the article with lowest order, or earliest publishedAt if no order
        if (!existing) {
          seriesMap.set(seriesName, article);
        } else {
          const currentOrder = article.frontmatter.series.order ?? Infinity;
          const existingOrder = existing.frontmatter.series?.order ?? Infinity;

          if (
            currentOrder < existingOrder ||
            (currentOrder === existingOrder &&
              new Date(article.frontmatter.publishedAt) <
                new Date(existing.frontmatter.publishedAt))
          ) {
            seriesMap.set(seriesName, article);
          }
        }
      } else {
        standaloneArticles.push(article);
      }
    });

    // Combine series first articles and standalone articles
    const displayArticles = [...Array.from(seriesMap.values()), ...standaloneArticles];

    return displayArticles.slice(0, 4);
  };

  // Helper to map article for display (series vs standalone)
  const mapArticleForDisplay = (article: Article) => {
    if (article.frontmatter.series?.name) {
      const seriesSlug = article.frontmatter.slug.split('/')[0];
      const seriesCount = articles.filter(
        (a) => a.frontmatter.series?.name === article.frontmatter.series?.name
      ).length;

      return {
        slug: article.frontmatter.slug,
        title: article.frontmatter.series.name,
        featuredImage: `/images/content/${seriesSlug}/series-cover.jpg`,
      };
    }

    return {
      slug: article.frontmatter.slug,
      title: article.frontmatter.title,
      featuredImage: article.frontmatter.featuredImage,
    };
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
              {getArticlesByCategory(category.slug).map((article) => {
                const displayData = mapArticleForDisplay(article);
                return (
                  <div key={article.id} className="hm-tab-post-card">
                    <div className="hm-tab-post-img">
                      <Link to={`/articles/${displayData.slug}`} aria-label={displayData.title}>
                        <OptimizedImage 
                          src={displayData.featuredImage} 
                          alt={displayData.title}
                          loading="lazy"
                        />
                      </Link>
                    </div>
                    <div className="hm-tab-post-details">
                      <h3 className="hm-tab-post-title">
                        <Link to={`/articles/${displayData.slug}`}>{displayData.title}</Link>
                      </h3>
                      <div className="entry-meta">
                        <span className="posted-on">
                          <Link to={`/articles/${displayData.slug}`}>
                            <time className="entry-date published" dateTime={article.frontmatter.publishedAt}>
                              {formatDate(article.frontmatter.publishedAt)}
                            </time>
                          </Link>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;

