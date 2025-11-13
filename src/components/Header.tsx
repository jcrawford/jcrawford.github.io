import React, { useState, useEffect } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import SearchOverlay from './SearchOverlay';

interface SiteMetadata {
  site: {
    siteMetadata: {
      title: string;
      navigation: Array<{
        name: string;
        path: string;
      }>;
      socialLinks: {
        facebook: string;
        twitter: string;
        instagram: string;
      };
    };
  };
}

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('hm-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('hm-dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const data = useStaticQuery<SiteMetadata>(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
          navigation {
            name
            path
          }
          socialLinks {
            facebook
            twitter
            instagram
          }
        }
      }
    }
  `);

  const { title, navigation, socialLinks } = data.site.siteMetadata;

  return (
    <>
      <header id="masthead" className="site-header">
      <div className="hm-header-inner-wrapper">
        <div className="hm-header-inner hm-container">
          
          {/* Site Branding */}
          <div className="site-branding-container">
            <div className="site-branding">
              <h1 className="site-title">
                <Link to="/" rel="home">{title}</Link>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="site-navigation" className="main-navigation hm-menu desktop-only">
            <ul id="primary-menu" className="menu">
              {navigation.map((item) => (
                <li key={item.path} className="menu-item">
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Header Gadgets (Social, Subscribe, Theme Toggle, Search) */}
          <div className="hm-header-gadgets">
            
            {/* Social Menu */}
            <nav className="hm-social-menu hm-social-nav" aria-label="Social links">
              <ul className="hm-social-menu hm-social-icons">
                <li className="menu-item">
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <span className="screen-reader-text">Facebook</span>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 320 512" className="hm-svg-icon hm-facebook">
                      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                    </svg>
                  </a>
                </li>
                <li className="menu-item">
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <span className="screen-reader-text">Twitter</span>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" className="hm-svg-icon hm-twitter">
                      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                    </svg>
                  </a>
                </li>
                <li className="menu-item">
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <span className="screen-reader-text">Instagram</span>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 448 512" className="hm-svg-icon hm-instagram">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Subscribe Button */}
            <a href="#" className="hm-cta-btn">Subscribe</a>

            {/* Dark Mode Toggle */}
            <div className="hm-light-dark-switch">
              <button 
                className="hm-light-dark-toggle"
                aria-label="Toggle dark mode"
                onClick={toggleDarkMode}
              >
                <span className="screen-reader-text">Toggle dark mode</span>
                <span className="hm-light-icon">{isDarkMode ? '🌙' : '☀️'}</span>
              </button>
            </div>

            {/* Search Toggle */}
            <div className="hm-search-toggle-wrapper">
              <button 
                className="hm-search-toggle"
                aria-label="Open search"
                onClick={() => setIsSearchOpen(true)}
              >
                <span className="screen-reader-text">Open Search</span>
                <span className="hm-search-icon">🔍</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="hm-mobile-menu-toggle" aria-label="Open mobile menu">
              <span className="screen-reader-text">Main Menu</span>
              <span className="hm-menu-bars">☰</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <SearchOverlay 
      isOpen={isSearchOpen} 
      onClose={() => setIsSearchOpen(false)} 
    />
  </>
  );
};

export default Header;

