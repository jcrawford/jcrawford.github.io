import React from "react"

import navBarStyles from "./nav-bar.module.scss"

const StaticNavBar = () => {
  return (
    <div className={navBarStyles.menu_container}>
      <ul className={navBarStyles.menuUl}>
        <li className={navBarStyles.hasDropdown}>
          <a href="#">
            <i className="icon-th"></i> Three columns
          </a>
          <div className={`${navBarStyles.menuDropdown} ${navBarStyles.w600}`}>
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
        <li className={`${navBarStyles.hasDropdown} ${navBarStyles.fullWidth}`}>
          <a href="#">
            <i className="icon-th-list"></i> Columns different width
          </a>
          <div className={navBarStyles.menuDropdown}>
            <div className={navBarStyles.columns}>
              <div className={navBarStyles.span6}>
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
              <div className={navBarStyles.span3}>
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
        <li>
          <a href="#">
            <i className="icon-coffee"></i> Menu item #1
          </a>
        </li>
        <li className={navBarStyles.hasDropdown}>
          <a href="#"> Menu item #2</a>
          <div
            className={`${navBarStyles.menuDropdown} ${navBarStyles.submenu}`}
          >
            <ul className={navBarStyles.submenuList}>
              <li>
                <a href="#">Submenu level 1</a>
              </li>
              <li className={navBarStyles.hasDropdown}>
                <a href="#">Submenu level 1</a>
                <ul className={navBarStyles.menuDropdown}>
                  <li>
                    <a href="#">Submenu level 2</a>
                  </li>
                  <li>
                    <a href="#">Submenu level 2</a>
                  </li>
                  <li className={navBarStyles.hasDropdown}>
                    <a href="#">Submenu level 2</a>
                    <ul className={navBarStyles.menuDropdown}>
                      <li>
                        <a href="#">Submenu level 3</a>
                      </li>
                      <li>
                        <a href="#">Submenu level 3</a>
                      </li>
                      <li className={navBarStyles.hasDropdown}>
                        <a href="#">Submenu level 3</a>
                        <ul
                          className={`${navBarStyles.menuDropdown} ${navBarStyles.rightAlign}`}
                        >
                          <li>
                            <a href="#">Submenu level 4</a>
                          </li>
                          <li>
                            <a href="#">Submenu level 4</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#">Submenu level 1</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default StaticNavBar
