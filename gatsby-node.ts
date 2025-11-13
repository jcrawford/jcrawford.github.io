import type { GatsbyNode } from 'gatsby';
import path from 'path';

interface Article {
  id: string;
  frontmatter: {
    slug: string;
    category: string;
    author: string;
    publishedAt: string;
  };
}

interface Category {
  slug: string;
  name: string;
}

interface Author {
  slug: string;
  name: string;
}

interface PagesQueryResult {
  allMarkdownRemark: {
    nodes: Article[];
  };
  allCategoriesJson: {
    nodes: Category[];
  };
  allAuthorsJson: {
    nodes: Author[];
  };
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql<PagesQueryResult>(`
    query {
      allMarkdownRemark(filter: { frontmatter: { slug: { ne: null } } }) {
        nodes {
          id
          frontmatter {
            slug
            category
            author
            publishedAt
          }
        }
      }
      allCategoriesJson {
        nodes {
          slug
          name
        }
      }
      allAuthorsJson {
        nodes {
          slug
          name
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Error loading data for page creation', result.errors);
    return;
  }

  const articles = result.data?.allMarkdownRemark.nodes || [];
  const categories = result.data?.allCategoriesJson.nodes || [];
  const authors = result.data?.allAuthorsJson.nodes || [];

  if (articles.length === 0) {
    reporter.warn('No articles found to create pages');
    return;
  }

  // Create article pages
  const articleTemplate = path.resolve('./src/templates/article.tsx');

  articles.forEach((article) => {
    createPage({
      path: `/articles/${article.frontmatter.slug}`,
      component: articleTemplate,
      context: {
        slug: article.frontmatter.slug,
        category: article.frontmatter.category,
        author: article.frontmatter.author,
        publishedAt: article.frontmatter.publishedAt,
      },
    });
  });

  reporter.info(`Created ${articles.length} article pages`);

  // Create category pages with pagination
  const categoryTemplate = path.resolve('./src/templates/category.tsx');
  const articlesPerPage = 15;

  categories.forEach((category) => {
    const categoryArticles = articles.filter((article) => article.frontmatter.category === category.slug);
    const numPages = Math.ceil(categoryArticles.length / articlesPerPage);

    Array.from({ length: numPages }).forEach((_, i) => {
      const currentPage = i + 1;
      const path = currentPage === 1 
        ? `/category/${category.slug}` 
        : `/category/${category.slug}/${currentPage}`;

      createPage({
        path,
        component: categoryTemplate,
        context: {
          slug: category.slug,
          limit: articlesPerPage,
          skip: i * articlesPerPage,
          numPages,
          currentPage,
        },
      });
    });

    reporter.info(`Created ${numPages} page(s) for category: ${category.name}`);
  });

  // Create author pages
  const authorTemplate = path.resolve('./src/templates/author.tsx');

  authors.forEach((author) => {
    createPage({
      path: `/author/${author.slug}`,
      component: authorTemplate,
      context: {
        slug: author.slug,
      },
    });

    reporter.info(`Created author page: ${author.name}`);
  });
};
