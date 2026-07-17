import React from 'react';
import Header from './Header';
import Footer from './Footer';
import '../styles/variables.css';
import '../styles/reset.css';
import '../styles/global.css';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, className, hideFooter }) => {
  return (
    <div id="page" className="site hm-cl-sep">
      <Header />
      
      <div id="content" className="site-content">
        <main 
          id="primary" 
          className={`site-main ${className || ''}`}
        >
          {children}
        </main>
      </div>

      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;

