import { Link, useStaticQuery } from "gatsby"
import React from "react"
import NavBar from "../nav-bar/nav-bar"

import headerStyles from "./header.module.scss"

function findInNavigation(articles, title) {
  if (articles) {
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].title == title) {
        return true
      }
    }
  }
  return false
}

function parseArticles(data) {
  let articles = {}
  data.allMarkdownRemark.group.forEach(data => {
    data.edges.forEach(edge => {
      let article = {
        title: edge.node.fields.series
          ? `[S] ${edge.node.fields.series}`
          : edge.node.frontmatter.title,
        path: edge.node.fields.slug,
      }

      let current = articles
      let entries
      for (const topic of edge.node.fields.navpath.split(",")) {
        if (!current[topic]) {
          current[topic] = {
            entries: [],
            subtopics: {},
          }
        }
        entries = current[topic].entries
        current = current[topic].subtopics
      }

      if (!findInNavigation(entries, article.title)) {
        entries.push(article)
      }
    })
  })
  return articles
}

const Header = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          titleFirst
          titleLast
          menuLinks {
            name
            link
          }
        }
      }
      allMarkdownRemark(
        sort: { fields: fields___priority }
        filter: { fields: { type: { in: ["article"] } } }
      ) {
        group(field: fields___topic) {
          edges {
            node {
              fields {
                slug
                priority
                type
                topic
                series
                navpath
              }
              excerpt
              frontmatter {
                title
              }
            }
          }
        }
      }
    }
  `)

  let articles = parseArticles(data)

  return (
    <React.Fragment>
      <header>
        <NavBar articles={articles} />
      </header>
    </React.Fragment>
  )
}

export default Header

let arts = {
  PHP: {
    entries: [
      {
        title: "Getting Started with PHP 7",
        path: "/articles/php/getting-started-with-php-7",
      },
      {
        title: "PHP Sessions in Depth",
        path: "/articles/php/php-sessions-in-depth",
      },
    ],
    subtopics: {
      Laravel: {
        entries: [
          {
            title: "A First Look at Notifications",
            path: "/articles/php/laravel/a-first-look-at-notifications",
          },
        ],
        subtopics: {
          Eloquent: {
            entries: [
              {
                title: "What is Eloquent",
                path: "/articles/php/laravel/eloquent/what-is-eloquent",
              },
            ],
          },
        },
      },
      PHPUnit: {
        entries: [
          {
            title: "Where to begin",
            path: "/articles/php/phpunit/where-to-begin",
          },
        ],
      },
    },
  },
  JavaScript: {
    entries: [
      {
        title: "What is JavaScript?",
        path: "/articles/javascript/what-is-javascript",
      },
    ],
    subtopics: {
      Gatsby: {
        entries: [
          {
            title: "What is Gatsby?",
            path: "/articles/javascript/gatsby/what-is-gatsby",
          },
        ],
      },
      React: {
        entries: [
          {
            title: "What is React?",
            path: "/articles/javascript/react/what-is-react",
          },
        ],
      },
    },
  },
}
