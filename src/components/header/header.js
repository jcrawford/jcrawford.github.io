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
  data = data.allMarkdownRemark.group
  let articles = { entries: [], subtopics: {} }

  data.map(({ edges }) => {
    edges.map(({ node }) => {
      let article = {
        title: node.fields.series
          ? `[S] ${node.fields.series}`
          : node.frontmatter.title,
        path: node.fields.slug,
      }

      let current = articles.subtopics
      let entries = articles.entries
      if (
        "undefined" !== typeof node.fields.navpath &&
        node.fields.navpath !== ""
      ) {
        for (const topic of node.fields.navpath.split(",")) {
          if ("undefined" == typeof current[topic]) {
            current[topic] = {
              entries: [],
              subtopics: {},
            }
          }
          entries = current[topic].entries
          current = current[topic].subtopics
        }
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
