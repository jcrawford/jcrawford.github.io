import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';

interface TagCloudItem {
  slug: string;
  name: string;
  count: number;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color: string;
}

const TagCloud: React.FC = () => {
  const data = useStaticQuery(graphql`
    query TagCloudQuery {
      allTagsJson {
        nodes {
          slug
          name
        }
      }
      allMarkdownRemark {
        nodes {
          frontmatter {
            category
          }
        }
      }
    }
  `);

  const tags = data.allTagsJson.nodes;
  const articles = data.allMarkdownRemark.nodes;

  // Color assignment based on size tier - consistent mapping
  const getColor = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    const colorMap: Record<string, string> = {
      'xs': 'blue-1',      // Smallest tags - blue
      'sm': 'green-1',     // Small tags - green
      'md': 'purple-1',    // Medium tags - purple
      'lg': 'brown-1',     // Large tags - brown
      'xl': 'brown-2'      // Largest tags - darker brown
    };
    return colorMap[size] || 'blue-1';
  };

  // Count articles per tag
  const tagCounts = new Map<string, { name: string; count: number }>();
  
  tags.forEach((tag: { slug: string; name: string }) => {
    const count = articles.filter(
      (article: any) => article.frontmatter.category === tag.slug
    ).length;
    
    if (count > 0) {
      tagCounts.set(tag.slug, { name: tag.name, count });
    }
  });

  // Convert to array and calculate size tiers
  const tagArray = Array.from(tagCounts.entries()).map(([slug, data]) => ({
    slug,
    name: data.name,
    count: data.count,
    size: 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    color: 'blue-1',
  }));

  if (tagArray.length === 0) {
    return null;
  }

  // Find min and max counts
  const counts = tagArray.map(t => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = maxCount - minCount;

  // Assign size classes based on quintiles (5 tiers)
  const tagCloudItems: TagCloudItem[] = tagArray.map(tag => {
    let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
    
    if (range > 0) {
      const normalized = (tag.count - minCount) / range;
      
      if (normalized <= 0.2) {
        size = 'xs';
      } else if (normalized <= 0.4) {
        size = 'sm';
      } else if (normalized <= 0.6) {
        size = 'md';
      } else if (normalized <= 0.8) {
        size = 'lg';
      } else {
        size = 'xl';
      }
    }
    
    const color = getColor(size);
    return { ...tag, size, color };
  });

  // Sort by name for better visual distribution
  tagCloudItems.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="widget widget-tag-cloud">
      <h3 className="widget-title">Tag Cloud</h3>
      <div className="tag-cloud">
        {tagCloudItems.map((tag) => (
          <Link
            key={tag.slug}
            to={`/tag/${tag.slug}`}
            className={`tag-cloud-item tag-${tag.size} tag-color-${tag.color}`}
            aria-label={`${tag.name} (${tag.count} ${tag.count === 1 ? 'article' : 'articles'})`}
            title={`${tag.count} ${tag.count === 1 ? 'article' : 'articles'}`}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;

