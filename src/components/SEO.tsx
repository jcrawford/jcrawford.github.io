import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  pathname?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image,
  article = false,
  pathname = '/',
}) => {
  const data = useStaticQuery(graphql`
    query SEOQuery {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
    }
  `);

  const siteMetadata = data.site.siteMetadata;
  
  const seo = {
    title: title ? `${title} | ${siteMetadata.title}` : siteMetadata.title,
    description: description || siteMetadata.description,
    url: `${siteMetadata.siteUrl}${pathname}`,
    image: image || `${siteMetadata.siteUrl}/og-image.jpg`,
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content={siteMetadata.title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <link rel="canonical" href={seo.url} />
    </>
  );
};

export default SEO;

