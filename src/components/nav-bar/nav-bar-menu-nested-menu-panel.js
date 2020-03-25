import React from "react"
import navBarStyles from "./nav-bar.module.scss"
import classNames from "classnames"

const NavBarMenuNestedMenuPanel = props => {
  return (
    <div className={`${navBarStyles.menuDropdown} ${navBarStyles.submenu}`}>
      <ul className={navBarStyles.submenuList}>{props.children}</ul>
    </div>
  )
}

export default NavBarMenuNestedMenuPanel
