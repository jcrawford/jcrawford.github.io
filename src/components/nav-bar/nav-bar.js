import React from "react"
import { Link } from "gatsby"

import navBarStyles from "./nav-bar.module.scss"

class NavBar extends React.Component {
  render() {
    return (
      <nav id={navBarStyles.menu}>
        <label for="tm" id={navBarStyles.toggleMenu}>
          Navigation <span className={navBarStyles.dropIcon}>▾</span>
        </label>
        <input type="checkbox" id={navBarStyles.tm} />
        <ul className={navBarStyles.mainMenu}>
          <li>
            <Link to="#">Sample</Link>
          </li>
          <li>
            <Link to="#">
              2-level DD
              <span className={navBarStyles.dropIcon}>▾</span>
              <label
                title="Toggle Drop-down"
                className={navBarStyles.dropIcon}
                for="sm1"
              >
                ▾
              </label>
            </Link>
            <input type="checkbox" id={navBarStyles.sm1} />
            <ul className={navBarStyles.subMenu}>
              <li>
                <Link to="#">Item 2.1</Link>
              </li>
              <li>
                <Link to="#">
                  Item 2.2
                  <span className={navBarStyles.dropIcon}>▸</span>
                  <label
                    title="Toggle Drop-down"
                    className={navBarStyles.dropIcon}
                    for="sm2"
                  >
                    ▾
                  </label>
                </Link>
                <input type="checkbox" id={navBarStyles.sm2} />
                <ul className={navBarStyles.subMenu}>
                  <li>
                    <Link to="#">Item 2.2.1</Link>
                  </li>
                  <li>
                    <Link to="#">Item 2.2.2</Link>
                  </li>
                  <li>
                    <Link to="#">Item 2.2.3</Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="#">Item 3.4</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link to="#">Another Sample</Link>
          </li>
        </ul>
      </nav>
    )
  }
}

export default NavBar
