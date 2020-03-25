import React from "react"

import navBarStyles from "./nav-bar.module.scss"

const NavBarMenu = props => {
  return (
    <div className={`${navBarStyles.menu_container} ${navBarStyles.blue}`}>
      <ul className={navBarStyles.menuUl}>{props.children}</ul>
    </div>
  )
}

export default NavBarMenu
