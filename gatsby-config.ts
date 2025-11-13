import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'Joseph Crawford',
    description: 'A blog relating to technical topics such as programming, web development, and software engineering.',
    siteUrl: 'https://josephcraw.github.io/site',
    socialLinks: {
      facebook: 'https://www.facebook.com/wordpress',
      twitter: 'https://twitter.com/wordpress',
      instagram: 'https://instagram.com',
    },
    navigation: [
      { name: 'Home', path: '/' },
      { name: 'Fashion', path: '/category/fashion' },
      { name: 'Lifestyle', path: '/category/lifestyle' },
      { name: 'Food', path: '/category/food' },
      { name: 'Travel', path: '/category/travel' },
      { name: 'Sports', path: '/category/sports' },
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
        title: 'Travel',
        type: 'posts',
        category: 'travel',
        count: 3,
      },
    ],
  },
  pathPrefix: '/site',
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'articles',
        path: `${__dirname}/src/data/articles`,
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
    'gatsby-transformer-json',
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
        ],
      },
    },
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
  ],
};

export default config;
