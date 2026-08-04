import React from 'react';

interface SEOData {
  siteMetadata: {
    title: string;
    description: string;
    siteUrl: string;
  };
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  pathname?: string;
  siteMetadata: SEOData['siteMetadata'];
}

/**
 * SEO component for use within Gatsby's Head API export
 * Does NOT use hooks - receives siteMetadata via props
 * 
 * Usage in Head export:
 * export const Head: HeadFC<DataType> = ({ data }) => (
 *   <SEO 
 *     title={data.markdownRemark.frontmatter.title}
 *     description={data.markdownRemark.frontmatter.excerpt}
 *     image={data.markdownRemark.frontmatter.featuredImage}
 *     pathname={`/posts/${data.markdownRemark.frontmatter.slug}`}
 *     siteMetadata={data.site.siteMetadata}
 *   />
 * );
 */
const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image,
  article = false,
  pathname = '/',
  siteMetadata,
}) => {
  const seo = {
    title: title ? `${title} | ${siteMetadata.title}` : siteMetadata.title,
    description: description || siteMetadata.description,
    url: `${siteMetadata.siteUrl}${pathname.endsWith('/') ? pathname : `${pathname}/`}`,
    image: image?.startsWith('http') ? image : `${siteMetadata.siteUrl}${image || '/og-image.jpg'}`,
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />

      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:secure_url" content={seo.image} />
      <meta property="og:image:alt" content={title || siteMetadata.title} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content={siteMetadata.title} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <link rel="canonical" href={seo.url} />
    </>
  );
};

export default SEO;
