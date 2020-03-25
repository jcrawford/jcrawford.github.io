import React from "react"
import classNames from "classnames"

import navBarStyles from "./nav-bar.module.scss"

const NavBarMenuColumnPanel = props => {
  return (
    <div
      className={classNames({
        [navBarStyles.menuDropdown]: true,
        [navBarStyles[`w${props.width}`]]: props.width,
      })}
    >
      <div className={navBarStyles.columns}>{props.children}</div>
    </div>
  )
}

export default NavBarMenuColumnPanel
