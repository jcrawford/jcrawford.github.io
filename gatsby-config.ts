import 'dotenv/config';
import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'Joseph Crawford',
    description: 'Software engineering, AI tools, and homebrewing — written by Joseph Crawford, a developer building web applications and making mead in Vermont.',
    siteUrl: 'https://josephcrawford.com',
    socialLinks: {
      github: 'https://github.com/jcrawford',
      linkedin: 'https://www.linkedin.com/in/crawfordjoseph',
    },
    navigation: [
      { name: 'Home', path: '/' },
      { name: 'Galleries', path: '/gallery' },
      { name: 'Brewing', path: '/brewing/' },
      { name: 'Family', path: '/tag/family' },
      { name: 'Reviews', path: '/tag/reviews' },
      { name: 'Work', path: '/tag/work' },
      { name: 'Resume', path: '/resume' },
    ],
    footerWidgets: [
      {
        title: 'About This Site',
        type: 'text',
        content: {
          text: 'Joseph Crawford is a software engineer and homebrewer writing about web development, AI tools, and mead making. This blog covers programming, gear reviews, and brewing experiments from North Bennington, VT.',
          address: {
            street: 'North Bennington, VT',
            city: '',
          },
          hours: {
            weekday: '',
            weekend: '',
          },
        },
      },
      {
        title: 'Food',
        type: 'posts',
        category: 'food',
        count: 3,
      },
      {
        title: 'Family',
        type: 'posts',
        category: 'family',
        count: 3,
      },
    ],
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'resume',
        path: `${__dirname}/src/data/resume`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `${__dirname}/src/data`,
      },
    },
    // Images: Store all source images in static/images/
    // - Content images: static/images/content/post-slug/featured.jpg
    // - Resume images: static/images/resume/profile.jpg, recommendations/*.jpg
    // - Gatsby copies static/ to public/ at build time
    // - Reference in markdown/code as: /images/content/post-slug/featured.jpg
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/static/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/content/posts`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'series',
        path: `${__dirname}/content/series`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'reviews',
        path: `${__dirname}/content/reviews`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'brewing',
        path: `${__dirname}/content/brewing`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'galleries',
        path: `${__dirname}/content/galleries`,
      },
    },
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-plugin-local-search',
      options: {
        name: 'articles',
        engine: 'flexsearch',
        engineOptions: {
          encode: 'icase',
          tokenize: 'forward',
          threshold: 0,
          resolution: 3,
        },
        query: `
          {
            allMarkdownRemark(filter: { frontmatter: { slug: { ne: null }, draft: { ne: true } }, fileAbsolutePath: { regex: "//content/(posts|reviews)/" } }) {
              nodes {
                id
                html
                frontmatter {
                  slug
                  title
                  excerpt
                  tags
                  publishedAt
                  series {
                    name
                  }
                }
              }
            }
          }
        `,
        ref: 'id',
        index: ['title', 'excerpt', 'body'],
        store: ['id', 'slug', 'title', 'excerpt', 'tags', 'publishedAt', 'path'],
        normalizer: ({ data }: any) =>
          data.allMarkdownRemark.nodes.map((node: any) => {
            const isSeries = !!node.frontmatter.series?.name;
            const path = isSeries ? `/series/${node.frontmatter.slug}` : `/posts/${node.frontmatter.slug}`;
            return {
              id: node.id,
              slug: node.frontmatter.slug,
              title: node.frontmatter.title,
              excerpt: node.frontmatter.excerpt,
              tags: node.frontmatter.tags || [],
              publishedAt: node.frontmatter.publishedAt,
              path,
              body: node.html.replace(/<[^>]*>/g, ''),
            };
          }),
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        excerpt_separator: `<!-- end-excerpt -->`,
        plugins: [
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 1200,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
          {
            resolve: 'gatsby-remark-shiki-twoslash',
            options: {
              theme: 'github-dark', // Dark theme with bright colors for dark background
              defaultCompilerOptions: {
                types: ['node'],
              },
            },
          },
        ],
      },
    },
    `gatsby-plugin-image`,
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }: any) => {
              return allMarkdownRemark.nodes.map((node: any) => {
                const fm = node.frontmatter;
                const isReview = (node.fileAbsolutePath || '').includes('/content/reviews/');
                const isBrewing = (node.fileAbsolutePath || '').includes('/content/brewing/');
                const isSeries = !!fm.series?.name;
                const seriesSlug = isSeries
                  ? fm.series.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  : '';
                let url = site.siteMetadata.siteUrl;
                if (isSeries) {
                  url += `/series/${seriesSlug}/${fm.slug}/`;
                } else if (isReview) {
                  url += `/reviews/${fm.slug}/`;
                } else if (isBrewing) {
                  url += `/brewing/${fm.slug}/`;
                } else {
                  url += `/posts/${fm.slug}/`;
                }
                return {
                  title: fm.title,
                  description: fm.excerpt,
                  date: fm.publishedAt,
                  url,
                  guid: url,
                  custom_elements: [
                    { 'content:encoded': node.html },
                  ],
                };
              });
            },
            query: `
              {
                allMarkdownRemark(
                  filter: { frontmatter: { slug: { ne: null }, draft: { ne: true } }, fileAbsolutePath: { regex: "//content/(posts|reviews|brewing)/" } }
                  sort: { frontmatter: { publishedAt: DESC } }
                  limit: 20
                ) {
                  nodes {
                    frontmatter {
                      slug
                      title
                      excerpt
                      publishedAt
                      series { name }
                    }
                    fileAbsolutePath
                    html
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: 'Joseph Crawford — RSS Feed',
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-gatsby-cloud',
      options: {
        headers: {},
        allPageHeaders: [],
        mergeSecurityHeaders: true,
        mergeLinkHeaders: true,
        mergeCachingHeaders: true,
        transformHeaders: (headers: any) => headers,
      },
    },
    ...(process.env.NODE_ENV === 'production'
      ? [{
          resolve: 'gatsby-plugin-google-gtag',
          options: {
            trackingIds: [
              'G-9LLY1071M3', // GA4 Measurement ID
            ],
            gtagConfig: {
              anonymize_ip: true, // GDPR/privacy compliance
            },
            pluginConfig: {
              head: false, // Load in body, not <head>
              respectDNT: true, // Respect Do Not Track
              exclude: ['/preview/**', '/do-not-track/me/too/'],
              delayOnRouteUpdate: 0, // No delay for route changes
            },
          },
        }]
      : []),
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        output: '/',
        excludes: [
          '/dev-404-page/',
          '/404/',
          '/404.html',
          '/offline-plugin-app-shell-fallback/',
        ],
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
              }
            }
            allMarkdownRemark(
              filter: { frontmatter: { slug: { ne: null }, publishedAt: { ne: null } } }
            ) {
              nodes {
                frontmatter {
                  slug
                  updatedAt
                  publishedAt
                  series { name }
                }
                fileAbsolutePath
              }
            }
          }
        `,
        resolvePages: (data: any) => {
          // Build a map of page path → lastmod date from markdown nodes
          const pathToDate = new Map<string, string>();
          const slugify = (s: string) =>
            s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

          for (const node of data.allMarkdownRemark?.nodes || []) {
            const fm = node.frontmatter;
            if (!fm?.slug) continue;
            const isReview = (node.fileAbsolutePath || '').includes('/content/reviews/');
            const isBrewing = (node.fileAbsolutePath || '').includes('/content/brewing/');
            const isSeries = !!fm.series?.name;
            const seriesSlug = isSeries ? slugify(fm.series.name) : '';

            let pagePath: string;
            if (isSeries) {
              pagePath = `/series/${seriesSlug}/${fm.slug}/`;
            } else if (isReview) {
              pagePath = `/reviews/${fm.slug}/`;
            } else if (isBrewing) {
              pagePath = `/brewing/${fm.slug}/`;
            } else {
              pagePath = `/posts/${fm.slug}/`;
            }
            pathToDate.set(pagePath, fm.updatedAt || fm.publishedAt);

            // Also map series landing page to first article's date
            if (isSeries && seriesSlug) {
              const landingPath = `/series/${seriesSlug}/`;
              const existing = pathToDate.get(landingPath);
              const candidate = fm.updatedAt || fm.publishedAt;
              if (!existing || candidate > existing) {
                pathToDate.set(landingPath, candidate);
              }
            }
          }

          return (data.allSitePage?.nodes || []).map((node: any) => ({
            ...node,
            lastmod: pathToDate.get(node.path) || undefined,
          }));
        },
        serialize: (page: any) => {
          const { path, lastmod } = page;
          let priority = 0.5;
          let changefreq = 'monthly';

          if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
          } else if (path.startsWith('/posts/') || path.startsWith('/series/')) {
            priority = 0.8;
            changefreq = 'monthly';
          } else if (path.startsWith('/reviews/')) {
            priority = 0.7;
            changefreq = 'monthly';
          } else if (path.startsWith('/brewing/')) {
            priority = 0.6;
            changefreq = 'monthly';
          } else if (path.startsWith('/tag/')) {
            priority = 0.7;
            changefreq = 'weekly';
          } else {
            priority = 0.5;
            changefreq = 'yearly';
          }

          return {
            url: path,
            changefreq,
            priority,
            ...(lastmod ? { lastmod } : {}),
          };
        },
      },
    },
  ],
};

export default config;
