import React from "react"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faNewspaper, faMedal } from "@fortawesome/free-solid-svg-icons"
import navBarStyles from "./nav-bar.module.scss"

class NavBar extends React.Component {
  render() {
    return (
      <div className={`${navBarStyles.menu_container} ${navBarStyles.blue}`}>
        <ul className={navBarStyles.menuUl}>
          <li>
            <Link to="#">
              <FontAwesomeIcon icon={faHome} />
              Home
            </Link>
          </li>
          <li className={navBarStyles.hasDropdown}>
            <a href="#">
              <FontAwesomeIcon icon={faMedal} /> Three columns
            </a>
            <div
              className={`${navBarStyles.menuDropdown} ${navBarStyles.w900}`}
            >
              <div className={navBarStyles.columns}>
                <div className={navBarStyles.span4}>
                  <div className={navBarStyles.columnContent}>
                    <p>
                      <img
                        src="images/image3.jpg"
                        alt=""
                        style={{ width: `100%` }}
                      />
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a
                      type specimen book.
                    </p>
                  </div>
                </div>
                <div className={navBarStyles.span4}>
                  <div className={navBarStyles.columnContent}>
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
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry.
                    </p>
                  </div>
                </div>
                <div className={navBarStyles.span4}>
                  <div className={navBarStyles.columnContent}>
                    <h2 className={navBarStyles.columnTitle}>Lorem Ipsum</h2>
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a
                      type specimen book.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li
            className={`${navBarStyles.hasDropdown} ${navBarStyles.fullWidth}`}
          >
            <Link to="#">
              <FontAwesomeIcon icon={faMedal} /> Reviews
            </Link>
            <div className={navBarStyles.menuDropdown}>
              <div className={navBarStyles.columns}>
                <div className={navBarStyles.span3}>
                  <div className={navBarStyles.columnContent}>
                    <p>
                      <img
                        src="./images/image3.jpg"
                        alt=""
                        style={{ width: `100%` }}
                      />
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a
                      type specimen book.
                    </p>
                  </div>
                </div>
                <div className={navBarStyles.span3}>
                  <div className={navBarStyles.columnContent}>
                    <p className={navBarStyles.links}>
                      <Link to="#">Incredible structure</Link>
                      <br />
                      <Link to="#">Modern articles of association</Link>
                      <br />
                      <Link to="#">Wonderful trial</Link>
                      <br />
                      <Link to="#">Meaninglessness as construction</Link>
                      <br />
                      <Link to="#">Strong document</Link>
                    </p>
                    <br />
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry.
                    </p>
                  </div>
                </div>
                <div className={navBarStyles.span3}>
                  <div className={navBarStyles.columnContent}>
                    <p className={navBarStyles.links}>
                      <Link to="#">Incredible structure</Link>
                      <br />
                      <Link to="#">Modern articles of association</Link>
                      <br />
                      <Link to="#">Wonderful trial</Link>
                      <br />
                      <Link to="#">Meaninglessness as construction</Link>
                      <br />
                      <Link to="#">Strong document</Link>
                    </p>
                    <br />
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry.
                    </p>
                  </div>
                </div>
                <div className={navBarStyles.span3}>
                  <div className={navBarStyles.columnContent}>
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a
                      type specimen book.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li className={navBarStyles.hasDropdown}>
            <Link to="#">
              <FontAwesomeIcon icon={faNewspaper} /> Articles
            </Link>
            <div
              className={`${navBarStyles.menuDropdown} ${navBarStyles.submenu}`}
            >
              <ul className={navBarStyles.submenuList}>
                <li>
                  <Link to="#">Amazing motivation</Link>
                </li>
                <li>
                  <Link to="#">Three-level lesson</Link>
                </li>
                <li>
                  <Link to="#">Splendid law</Link>
                </li>
                <li className={navBarStyles.hasDropdown}>
                  <Link to="#">Strong statement</Link>
                  <ul className={navBarStyles.menuDropdown}>
                    <li>
                      <Link to="#"> Hypothesis as trick</Link>
                    </li>
                    <li>
                      <Link to="#">Teen crime</Link>
                    </li>
                    <li>
                      <Link to="#">Random article</Link>
                    </li>
                    <li>
                      <Link to="#">Incredible plan</Link>
                    </li>
                    <li className={navBarStyles.hasDropdown}>
                      <Link to="#">Crafty motivation</Link>
                      <ul className={navBarStyles.menuDropdown}>
                        <li>
                          <Link to="#">Outrageous construction</Link>
                        </li>
                        <li>
                          <Link to="#">Wonderful standard</Link>
                        </li>
                        <li>
                          <Link to="#">Conflict articles of association</Link>
                        </li>
                        <li className={navBarStyles.hasDropdown}>
                          <Link to="#">Crafty motivation</Link>
                          <ul
                            className={`${navBarStyles.menuDropdown} ${navBarStyles.rightAlign}`}
                          >
                            <li>
                              <Link to="#">Outrageous construction</Link>
                            </li>
                            <li>
                              <Link to="#">Wonderful standard</Link>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Link to="#">Brave benchmark</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="#">Fairy political system</Link>
                </li>
                <li>
                  <Link to="#">Modern motivation</Link>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="#">Menu item #4</Link>
          </li>
        </ul>
      </div>
    )
  }
}

export default NavBar
