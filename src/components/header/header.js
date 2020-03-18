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

  data.allMarkdownRemark.group.map(data => {
    const topic = data.edges[0].node.fields.topic

    articles[topic] = {}
    articles[topic].entries = []

    data.edges.map(edge => {
      let article = {
        title: edge.node.frontmatter.title,
        path: edge.node.fields.slug,
      }

      if (edge.node.fields.series) {
        article.title = `[S] ${edge.node.fields.series}`
      }

      if (!findInNavigation(articles[topic].entries, article.title)) {
        articles[topic].entries.push(article)
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
        <div>Logo Here</div>
        <div>
          <NavBar />
        </div>
      </header>
    </React.Fragment>
  )
}

export default Header
