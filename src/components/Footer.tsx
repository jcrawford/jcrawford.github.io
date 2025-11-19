import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';
import { formatDate } from '../utils/dateUtils';

interface FooterArticle {
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

interface FooterData {
  site: {
    siteMetadata: {
      title: string;
    };
  };
  foodArticles: {
    nodes: FooterArticle[];
  };
  familyArticles: {
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
      foodArticles: allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "food" }, slug: { ne: null } } }
        limit: 3
        sort: { frontmatter: { publishedAt: DESC } }
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
      familyArticles: allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "family" }, slug: { ne: null } } }
        limit: 3
        sort: { frontmatter: { publishedAt: DESC } }
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

  const { title } = data.site.siteMetadata;
  const foodArticles = data.foodArticles.nodes;
  const familyArticles = data.familyArticles.nodes;

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
                {foodArticles.map((article) => {
                  const articlePath = getArticlePath(article.frontmatter.slug, !!article.frontmatter.series?.name);
                  return (
                    <div key={article.id} className="hms-post clearfix">
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
                        <h3 className="hms-title">
                          <Link to={articlePath}>{article.frontmatter.title}</Link>
                        </h3>
                      <div className="entry-meta">
                        <time className="entry-date published" dateTime={article.frontmatter.publishedAt}>
                          {formatDate(article.frontmatter.publishedAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Family Column */}
          <div className="hm-footer-column">
            <section className="widget widget_hybridmag_sidebar_posts">
              <div className="hm-sidebar-posts">
                <h2 className="widget-title">Family</h2>
                {familyArticles.map((article) => {
                  const articlePath = getArticlePath(article.frontmatter.slug, !!article.frontmatter.series?.name);
                  return (
                    <div key={article.id} className="hms-post clearfix">
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
                        <h3 className="hms-title">
                          <Link to={articlePath}>{article.frontmatter.title}</Link>
                        </h3>
                      <div className="entry-meta">
                        <time className="entry-date published" dateTime={article.frontmatter.publishedAt}>
                          {formatDate(article.frontmatter.publishedAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                  );
                })}
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
