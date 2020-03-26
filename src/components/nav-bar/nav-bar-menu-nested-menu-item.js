import React from "react"
import { Link } from "gatsby"

import navBarStyles from "./nav-bar.module.scss"

const NavBarMenuNestedMenuItem = props => {
  console.log(JSON.stringify(props))
  {
    props.articles.entries.map(entry => {
      return (
        <li>
          <Link to={entry.path}>{entry.title}</Link>
        </li>
      )
    })
  }

  {
    Object.keys(props.articles.subtopics).length &&
      Object.keys(props.articles.subtopics).map(subtopic => {
        return (
          <li className={navBarStyles.hasDropdown}>
            <a href="#">{subtopic}</a>
            <ul className={navBarStyles.menuDropdown}>
              {props.articles.subtopics[subtopic].entries.map(entry => {
                return (
                  <li>
                    <Link to={entry.path}>{entry.title}</Link>
                  </li>
                )
              })}
              {Object.keys(props.articles.subtopics[subtopic].subtopics)
                .length && (
                <NavBarMenuNestedMenuItem
                  articles={props.articles.subtopics[subtopic].subtopics}
                />
              )}
            </ul>
          </li>
        )
      })
  }
}

export default NavBarMenuNestedMenuItem
