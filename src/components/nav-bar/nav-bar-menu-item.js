import React from "react"
import { Link } from "gatsby"
import classNames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import navBarStyles from "./nav-bar.module.scss"

const NavBarMenuItem = props => {
  return (
    <li
      className={classNames({
        [navBarStyles.hasDropdown]: props.hasDropdown,
        [navBarStyles.fullWidth]: props.fullWidth,
      })}
    >
      <Link to={props.to}>
        <FontAwesomeIcon icon={props.icon} /> {props.title}
      </Link>

      {props.children}
    </li>
  )
}

export default NavBarMenuItem
