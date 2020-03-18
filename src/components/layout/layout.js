import React from "react"
import Header from "../header/header"
import Footer from "../footer/footer"
import Sidebar from "../sidebar/sidebar"

import "../../styles/index.scss"
import layoutStyles from "./layout.module.scss"

const Layout = props => {
  return (
    <div id={layoutStyles.container}>
      <Header />
      <main>{props.children}</main>
      <Sidebar />
      <Footer />
    </div>
  )
}

export default Layout
