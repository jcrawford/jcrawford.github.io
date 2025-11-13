import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import OptimizedImage from './OptimizedImage';
import { formatDate } from '../utils/dateUtils';

interface FooterArticle {
  id: string;
  slug: string;
  title: string;
  featuredImage: string;
  publishedAt: string;
}

interface FooterData {
  site: {
    siteMetadata: {
      title: string;
    };
  };
  foodArticles: {
    nodes: FooterArticle[];
  };
  travelArticles: {
    nodes: FooterArticle[];
  };
}

const Footer: React.FC = () => {
  const data = useStaticQuery<FooterData>(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          title
        }
      }
      foodArticles: allArticlesJson(
        filter: { category: { eq: "food" } }
        limit: 3
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
      travelArticles: allArticlesJson(
        filter: { category: { eq: "travel" } }
        limit: 3
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
    }
  `);

  const { title } = data.site.siteMetadata;
  const foodArticles = data.foodArticles.nodes;
  const travelArticles = data.travelArticles.nodes;

  return (
    <footer id="colophon" className="site-footer">
      <div className="hm-footer-widget-area">
        <div className="hm-container hm-footer-widgets-inner">
          {/* About Column */}
          <div className="hm-footer-column">
            <section className="widget widget_text">
              <h2 className="widget-title">About This Site</h2>
              <div className="textwidget">
                <p>This may be a good place to introduce yourself and your site or include some credits.</p>
                <p>
                  <strong>Address</strong><br />
                  123 Main Street<br />
                  New York, NY 10001
                </p>
                <p>
                  <strong>Hours</strong><br />
                  Monday–Friday: 9:00AM–5:00PM<br />
                  Saturday &amp; Sunday: 11:00AM–3:00PM
                </p>
              </div>
            </section>
          </div>

          {/* Food Column */}
          <div className="hm-footer-column">
            <section className="widget widget_hybridmag_sidebar_posts">
              <div className="hm-sidebar-posts">
                <h2 className="widget-title">Food</h2>
                {foodArticles.map((article) => (
                  <div key={article.id} className="hms-post clearfix">
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
                      <h3 className="hms-title">
                        <Link to={`/articles/${article.slug}`}>{article.title}</Link>
                      </h3>
                      <div className="entry-meta">
                        <time className="entry-date published" dateTime={article.publishedAt}>
                          {formatDate(article.publishedAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Travel Column */}
          <div className="hm-footer-column">
            <section className="widget widget_hybridmag_sidebar_posts">
              <div className="hm-sidebar-posts">
                <h2 className="widget-title">Travel</h2>
                {travelArticles.map((article) => (
                  <div key={article.id} className="hms-post clearfix">
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
                      <h3 className="hms-title">
                        <Link to={`/articles/${article.slug}`}>{article.title}</Link>
                      </h3>
                      <div className="entry-meta">
                        <time className="entry-date published" dateTime={article.publishedAt}>
                          {formatDate(article.publishedAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="hm-footer-bottom">
        <div className="hm-container hm-footer-bottom-content">
          <div className="hm-footer-copyright">
            Copyright © {new Date().getFullYear()} <Link to="/" title={title}>{title}</Link>.
          </div>
          <div className="hm-designer-credit">
            Powered by <a href="https://www.gatsbyjs.com/" target="_blank" rel="noopener noreferrer">Gatsby</a>, <a href="https://themezhut.com/themes/hybridmag/" target="_blank" rel="noopener noreferrer">HybridMag</a> and <a href="https://github.com/github/spec-kit" target="_blank" rel="noopener noreferrer">Spec-Kit</a>.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
