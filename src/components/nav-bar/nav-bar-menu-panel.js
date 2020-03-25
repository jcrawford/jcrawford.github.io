import React from "react"
import classNames from "classnames"

import navBarStyles from "./nav-bar.module.scss"

const NavBarMenuPanel = props => {
  return (
    <div
      className={classNames({
        [navBarStyles.menuDropdown]: props.menuDropdown,
        [`navBarStyles.w${props.width}`]: props.width,
      })}
    >
      {props.children}
    </div>
  )
}

export default NavBarMenuPanel
