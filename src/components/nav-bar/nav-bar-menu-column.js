import React from "react"
import navBarStyles from "./nav-bar.module.scss"

const NavBarMenuColumn = props => {
  return (
    <div className={navBarStyles.span4}>
      <div className={navBarStyles.columnContent}>{props.children}</div>
    </div>
  )
}

export default NavBarMenuColumn
