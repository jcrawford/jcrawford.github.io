import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'Joseph Crawford',
    description: 'A blog relating to technical topics such as programming, web development, and software engineering.',
    siteUrl: 'https://josephcrawford.com',
    socialLinks: {
      github: 'https://github.com/jcrawford',
      linkedin: 'https://www.linkedin.com/in/crawfordjoseph',
    },
    navigation: [
      { name: 'Home', path: '/' },
      { name: 'Fashion', path: '/tag/fashion' },
      { name: 'Lifestyle', path: '/tag/lifestyle' },
      { name: 'Food', path: '/tag/food' },
      { name: 'Family', path: '/tag/family' },
      { name: 'Reviews', path: '/tag/reviews' },
      { name: 'Resume', path: '/resume' },
    ],
    footerWidgets: [
      {
        title: 'About This Site',
        type: 'text',
        content: {
          text: 'This may be a good place to introduce yourself and your site or include some credits.',
          address: {
            street: '123 Main Street',
            city: 'New York, NY 10001',
          },
          hours: {
            weekday: 'Monday–Friday: 9:00AM–5:00PM',
            weekend: 'Saturday & Sunday: 11:00AM–3:00PM',
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
            allMarkdownRemark(filter: { frontmatter: { slug: { ne: null } } }) {
              nodes {
                id
                html
                frontmatter {
                  slug
                  title
                  excerpt
                  category
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
        store: ['id', 'slug', 'title', 'excerpt', 'category', 'publishedAt', 'path'],
        normalizer: ({ data }: any) =>
          data.allMarkdownRemark.nodes.map((node: any) => {
            const isSeries = !!node.frontmatter.series?.name;
            const path = isSeries ? `/series/${node.frontmatter.slug}` : `/posts/${node.frontmatter.slug}`;
            return {
              id: node.id,
              slug: node.frontmatter.slug,
              title: node.frontmatter.title,
              excerpt: node.frontmatter.excerpt,
              category: node.frontmatter.category,
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
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
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
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [
          'G-9LLY1071M3', // GA4 Measurement ID
        ],
        gtagConfig: {
          anonymize_ip: true, // GDPR/privacy compliance
          cookie_expires: 0,
        },
        pluginConfig: {
          head: false, // Load via Partytown (not in head)
          respectDNT: true, // Respect Do Not Track
          exclude: ['/preview/**', '/do-not-track/me/too/'],
          delayOnRouteUpdate: 0, // No delay for route changes
        },
      },
    },
  ],
};

export default config;
