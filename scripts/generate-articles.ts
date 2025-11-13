import * as fs from 'fs';
import * as path from 'path';

interface ArticleTemplate {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  publishedAt: string;
  updatedAt: string;
}

const CONTENT_DIR = path.join(__dirname, '../content/posts');
const AUTHOR = 'admin';

// Unsplash image collections by category
const unsplashImages = {
  fashion: [
    'photo-1490481651871-ab68de25d43d',
    'photo-1483985988355-763728e1935b',
    'photo-1485462537746-965f33f7f6a7',
    'photo-1469334031218-e382a71b716b',
    'photo-1467043237213-65f2da53396f',
    'photo-1487222477894-8943e31ef7b2',
    'photo-1515886657613-9f3515b0c78f',
    'photo-1496747611176-843222e1e57c',
    'photo-1558769132-cb1aea1f1c85',
    'photo-1509631179647-0177331693ae',
  ],
  lifestyle: [
    'photo-1519389950473-47ba0277781c',
    'photo-1542601906990-b4d3fb778b09',
    'photo-1513097633097-329a3a64e0d4',
    'photo-1484480974693-6ca0a78fb36b',
    'photo-1506126613408-eca07ce68773',
    'photo-1501594907352-04cda38ebc29',
    'photo-1522202176988-66273c2fd55f',
    'photo-1511632765486-a01980e01a18',
    'photo-1527169400375-f90d04c4c6b7',
    'photo-1516450360452-9312f5e86fc7',
  ],
  food: [
    'photo-1476224203421-9ac39bcb3327',
    'photo-1504674900247-0877df9cc836',
    'photo-1565299624946-b28f40a0ae38',
    'photo-1540189549336-e6e99c3679fe',
    'photo-1567620905732-2d1ec7ab7445',
    'photo-1482049016688-2d3e1b311543',
    'photo-1498837167922-ddd27525d352',
    'photo-1563379926898-05f4575a45d8',
    'photo-1551782450-a2132b4ba21d',
    'photo-1547592180-85f173990554',
  ],
  travel: [
    'photo-1506905925346-21bda4d32df4',
    'photo-1469854523086-cc02fe5d8800',
    'photo-1488646953014-85cb44e25828',
    'photo-1476514525535-07fb3b4ae5f1',
    'photo-1530789253388-582c481c54b0',
    'photo-1507525428034-b723cf961d3e',
    'photo-1503220317375-aaad61436b1b',
    'photo-1500835556837-99ac94a94552',
    'photo-1504150558240-0b4fd8946624',
    'photo-1533587851505-d119e13fa0d7',
  ],
  sports: [
    'photo-1461896836934-ffe607ba8211',
    'photo-1517838277536-f5f99be501cd',
    'photo-1552674605-db6ffd4facb5',
    'photo-1484480974693-6ca0a78fb36b',
    'photo-1558618666-fcd25c85cd64',
    'photo-1571902943202-507ec2618e8f',
    'photo-1517838277536-f5f99be501cd',
    'photo-1574629810360-7efbbe195018',
    'photo-1549060279-7e168fcee0c2',
    'photo-1517838277536-f5f99be501cd',
  ],
};

const categories = ['fashion', 'lifestyle', 'food', 'travel', 'sports'];

// Article title templates by category
const titleTemplates = {
  fashion: [
    'The Ultimate Guide to {topic}',
    '{number} Ways to Elevate Your {topic}',
    'How {topic} Changed Fashion Forever',
    'Why {topic} Is the Next Big Trend',
    'Mastering {topic}: A Complete Guide',
    'The Art of {topic} in Modern Fashion',
    '{topic}: Past, Present, and Future',
    'Essential {topic} Tips for Every Wardrobe',
    'Discovering the Beauty of {topic}',
    'Transform Your Style with {topic}',
  ],
  lifestyle: [
    'Finding Balance Through {topic}',
    '{number} Life Lessons About {topic}',
    'How {topic} Transforms Daily Life',
    'The Power of {topic} in Modern Living',
    'Embracing {topic} for Better Living',
    'Why {topic} Matters More Than Ever',
    'Creating Your Best Life with {topic}',
    '{topic}: A Journey to Self-Discovery',
    'The Simple Joy of {topic}',
    'Living Intentionally Through {topic}',
  ],
  food: [
    'The Perfect {topic} Recipe',
    '{number} Secrets to Amazing {topic}',
    'Mastering the Art of {topic}',
    'Why {topic} Is the Ultimate Comfort Food',
    'Exploring the World Through {topic}',
    'The History and Magic of {topic}',
    '{topic}: From Farm to Table',
    'Elevating {topic} to the Next Level',
    'The Science Behind Perfect {topic}',
    'Celebrating Culture Through {topic}',
  ],
  travel: [
    'Discovering Hidden Gems in {topic}',
    '{number} Reasons to Visit {topic}',
    'The Ultimate {topic} Travel Guide',
    'How {topic} Changed My Perspective',
    'Exploring the Beauty of {topic}',
    'Adventures in {topic}: A Journey',
    '{topic}: Off the Beaten Path',
    'Finding Yourself in {topic}',
    'The Magic of {topic} Awaits',
    'Why {topic} Should Be Your Next Destination',
  ],
  sports: [
    'The Mental Game of {topic}',
    '{number} Training Tips for {topic}',
    'How {topic} Builds Character',
    'Pushing Limits with {topic}',
    'The Science of {topic} Performance',
    'Why {topic} Is More Than a Game',
    'Mastering {topic}: Mind and Body',
    'The Evolution of {topic}',
    '{topic}: Lessons in Perseverance',
    'Breaking Barriers in {topic}',
  ],
};

const topics = {
  fashion: [
    'Minimalist Fashion', 'Sustainable Style', 'Vintage Clothing', 'Street Style',
    'Color Theory', 'Seasonal Wardrobes', 'Accessorizing', 'Designer Collaborations',
    'Fashion Photography', 'Textile Innovation', 'Ethical Fashion', 'Capsule Wardrobes',
    'Pattern Mixing', 'Tailoring', 'Fashion History', 'Global Fashion', 'Footwear',
    'Layering Techniques', 'Fashion Icons', 'Luxury Brands'
  ],
  lifestyle: [
    'Morning Routines', 'Mindfulness', 'Work-Life Balance', 'Self-Care', 'Productivity',
    'Minimalism', 'Digital Detox', 'Relationships', 'Personal Growth', 'Gratitude',
    'Time Management', 'Wellness', 'Home Organization', 'Reading Habits', 'Creativity',
    'Goal Setting', 'Stress Management', 'Social Connection', 'Life Philosophy', 'Happiness'
  ],
  food: [
    'Sourdough Bread', 'Farm-to-Table', 'Fermentation', 'Pasta Making', 'Baking',
    'Plant-Based Cuisine', 'Food Preservation', 'Seasonal Cooking', 'Comfort Food',
    'Culinary Techniques', 'Food Photography', 'Wine Pairing', 'Spice Blends',
    'Breakfast Classics', 'Street Food', 'Desserts', 'Food Culture', 'Meal Prep',
    'Cooking Methods', 'Ingredient Sourcing'
  ],
  travel: [
    'Japan', 'Iceland', 'New Zealand', 'Morocco', 'Peru', 'Norway', 'Thailand',
    'Portugal', 'Greece', 'Patagonia', 'Bali', 'Scotland', 'Costa Rica', 'Vietnam',
    'South Africa', 'Nepal', 'Croatia', 'Chile', 'Turkey', 'Ireland'
  ],
  sports: [
    'Marathon Running', 'Rock Climbing', 'Yoga', 'Swimming', 'Cycling', 'Tennis',
    'Basketball', 'Soccer', 'CrossFit', 'Martial Arts', 'Hiking', 'Surfing',
    'Weightlifting', 'Boxing', 'Trail Running', 'Triathlon', 'Skiing', 'Rowing',
    'Golf', 'Team Sports'
  ],
};

const tagPools = {
  fashion: ['style', 'trends', 'designer', 'wardrobe', 'outfit', 'clothing', 'accessories', 'runway'],
  lifestyle: ['wellness', 'mindfulness', 'productivity', 'habits', 'inspiration', 'personal-growth', 'balance', 'happiness'],
  food: ['recipes', 'cooking', 'nutrition', 'ingredients', 'culinary', 'dining', 'flavors', 'kitchen'],
  travel: ['adventure', 'wanderlust', 'destinations', 'culture', 'exploration', 'journey', 'tourism', 'vacation'],
  sports: ['fitness', 'training', 'performance', 'athletics', 'motivation', 'competition', 'endurance', 'strength'],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function generateContent(category: string, topic: string): string {
  const paragraphs = [
    `In today's world, ${topic.toLowerCase()} represents more than just a trend—it's a fundamental shift in how we approach ${category}. Understanding the nuances and deeper meaning behind this concept can transform your perspective and enrich your experience.`,
    
    `Through years of research and personal experience, experts have identified key principles that make ${topic.toLowerCase()} so compelling. These insights provide a framework for anyone looking to explore this fascinating subject more deeply.`,
    
    `## Understanding the Fundamentals\n\nThe foundation of ${topic.toLowerCase()} lies in attention to detail and commitment to excellence. Whether you're a beginner or experienced practitioner, mastering these basics opens doors to new possibilities and deeper understanding.`,
    
    `What sets exceptional ${topic.toLowerCase()} apart is the intersection of technique, creativity, and authentic passion. It's not just about following rules—it's about understanding when to break them and how to innovate while respecting tradition.`,
    
    `## Practical Applications\n\nImplementing these concepts in daily life requires both patience and practice. Start small, focusing on one aspect at a time, and gradually build your skills and confidence. Remember that mastery is a journey, not a destination.`,
    
    `The community around ${topic.toLowerCase()} continues to grow and evolve, bringing together diverse perspectives and approaches. This collective wisdom enriches everyone's experience and pushes the boundaries of what's possible.`,
    
    `As we look to the future, ${topic.toLowerCase()} will undoubtedly continue to evolve. By staying curious, remaining open to new ideas, and maintaining dedication to excellence, we can all contribute to this ongoing evolution and benefit from its transformative power.`,
  ];
  
  return paragraphs.join('\n\n');
}

function generateArticle(index: number, startingNumber: number): ArticleTemplate {
  const category = categories[index % categories.length] as keyof typeof topics;
  const topic = getRandomElement(topics[category]);
  const titleTemplate = getRandomElement(titleTemplates[category]);
  const number = getRandomNumber(5, 10);
  
  const title = titleTemplate
    .replace('{topic}', topic)
    .replace('{number}', number.toString());
  
  const slug = `${generateSlug(title)}-${startingNumber + index}`;
  
  const categoryTags = getRandomElements(tagPools[category], 3);
  const tags = [category, ...categoryTags];
  
  const imageId = getRandomElement(unsplashImages[category]);
  const featuredImage = `https://images.unsplash.com/${imageId}?w=1200&h=800&fit=crop`;
  
  const daysAgo = getRandomNumber(1, 180);
  const publishedAt = generateDate(daysAgo);
  const updatedAt = publishedAt;
  
  const excerpt = `Explore the fascinating world of ${topic.toLowerCase()} and discover how it can transform your approach to ${category}. Learn practical tips and insights from experts.`;
  
  const content = generateContent(category, topic);
  
  return {
    slug,
    title,
    excerpt,
    content,
    category,
    tags,
    featuredImage,
    publishedAt,
    updatedAt,
  };
}

function generateMarkdownFile(article: ArticleTemplate): string {
  const frontmatter = `---
slug: "${article.slug}"
title: "${article.title}"
excerpt: "${article.excerpt}"
featuredImage: "${article.featuredImage}"
category: "${article.category}"
tags: [${article.tags.map(tag => `"${tag}"`).join(', ')}]
author: "${AUTHOR}"
publishedAt: "${article.publishedAt}"
updatedAt: "${article.updatedAt}"
---

${article.content}
`;
  
  return frontmatter;
}

async function generateArticles(count: number) {
  console.log(`[INFO] Generating ${count} articles...`);
  console.log(`[INFO] Target directory: ${CONTENT_DIR}`);
  
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`[ERROR] Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }
  
  // Get existing articles to determine starting number
  const existingFiles = fs.readdirSync(CONTENT_DIR);
  const startingNumber = existingFiles.length + 1;
  
  let successCount = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      const article = generateArticle(i, startingNumber);
      const markdown = generateMarkdownFile(article);
      const filename = `${article.slug}.md`;
      const filepath = path.join(CONTENT_DIR, filename);
      
      fs.writeFileSync(filepath, markdown, 'utf-8');
      successCount++;
      
      if ((i + 1) % 10 === 0) {
        console.log(`[INFO] Generated ${i + 1}/${count} articles...`);
      }
    } catch (error: any) {
      console.error(`[ERROR] Failed to generate article ${i + 1}: ${error.message}`);
    }
  }
  
  console.log(`[✓] Successfully generated ${successCount}/${count} articles`);
  console.log(`[INFO] Total articles in ${CONTENT_DIR}: ${fs.readdirSync(CONTENT_DIR).length}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const count = args[0] ? parseInt(args[0], 10) : 100;

if (isNaN(count) || count <= 0) {
  console.error('[ERROR] Please provide a valid number of articles to generate');
  console.error('Usage: npm run ts-node scripts/generate-articles.ts [count]');
  process.exit(1);
}

generateArticles(count);

