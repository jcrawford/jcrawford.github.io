import React from "react"
import { Link } from "gatsby"

import navBarStyles from "./nav-bar.module.scss"

const NavBarMenuNestedMenuItem = ({ articles }) => {
  return (
    <React.Fragment>
      {articles.entries.forEach(entry => {
        return (
          <li>
            <Link to={entry.path}>{entry.title}</Link>
          </li>
        )
      })}

      {Object.keys(articles.subtopics).length &&
        Object.keys(articles.subtopics).forEach(subtopic => {
          return (
            <li className={navBarStyles.hasDropdown}>
              <a href="#">{subtopic}</a>
              <ul className={navBarStyles.menuDropdown}>
                {articles.subtopics[subtopic].entries.map(entry => {
                  return (
                    <li>
                      <Link to={entry.path}>{entry.title}</Link>
                    </li>
                  )
                })}
                {Object.keys(articles.subtopics[subtopic].subtopics).length && (
                  <NavBarMenuNestedMenuItem
                    articles={articles.subtopics[subtopic].subtopics}
                  />
                )}
              </ul>
            </li>
          )
        })}
    </React.Fragment>
  )
}

export default NavBarMenuNestedMenuItem
