import React from "react"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faHome,
  faNewspaper,
  faMedal,
  faAddressCard,
  faAt,
  faFile,
} from "@fortawesome/free-solid-svg-icons"
import navBarStyles from "./nav-bar.module.scss"
import NavBarMenu from "./nav-bar-menu"
import NavBarMenuItem from "./nav-bar-menu-item"
import NavBarMenuNestedMenuPanel from "./nav-bar-menu-nested-menu-panel"
import NavBarMenuNestedMenuItem from "./nav-bar-menu-nested-menu-item"
import NavBarMenuColumnPanel from "./nav-bar-menu-column-panel"
import NavBarMenuColumn from "./nav-bar-menu-column"

class NavBar extends React.Component {
  render() {
    return (
      <NavBarMenu>
        <NavBarMenuItem title="Home" to="/" icon={faHome} />
        <NavBarMenuItem
          width="600"
          title="Reviews"
          to="/reviews"
          fullWidth={true}
          hasDropdown={true}
          menuDropdown={true}
          icon={faMedal}
        >
          <NavBarMenuColumnPanel width="600">
            <NavBarMenuColumn>
              <p>
                <img src="images/image3.jpg" alt="" style={{ width: `100%` }} />
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
              </p>
            </NavBarMenuColumn>
            <NavBarMenuColumn>
              <h3>Latest</h3>
              <p className={navBarStyles.links}>
                <a href="#">Incredible structure</a>
                <br />
                <a href="#">Modern articles of association</a>
                <br />
                <a href="#">Wonderful trial</a>
                <br />
                <a href="#">Meaninglessness as construction</a>
                <br />
                <a href="#">Strong document</a>
              </p>
              <br />
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </NavBarMenuColumn>
            <NavBarMenuColumn>
              <h2 className={navBarStyles.columnTitle}>Lorem Ipsum</h2>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
              </p>
            </NavBarMenuColumn>
          </NavBarMenuColumnPanel>
        </NavBarMenuItem>
        <NavBarMenuItem
          title="Articles"
          to="/articles"
          hasDropdown={true}
          icon={faNewspaper}
        >
          <NavBarMenuNestedMenuPanel>
            <NavBarMenuNestedMenuItem articles={this.props.articles} />
          </NavBarMenuNestedMenuPanel>
        </NavBarMenuItem>
        <NavBarMenuItem
          title="Resume"
          to="#"
          icon={faFile}
          hasDropdown={true}
          menuDropdown={true}
        >
          <NavBarMenuNestedMenuPanel>
            <li>
              <a href="#">PDF</a>
            </li>
            <li>
              <a href="#">Microsoft Word</a>
            </li>
          </NavBarMenuNestedMenuPanel>
        </NavBarMenuItem>
        <NavBarMenuItem title="About" to="/" icon={faAddressCard} />
        <NavBarMenuItem title="Contact Me" to="/" icon={faAt} />
      </NavBarMenu>
    )
  }
}

export default NavBar
