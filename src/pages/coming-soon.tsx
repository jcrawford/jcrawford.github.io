import React from 'react';
import { HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import '../styles/coming-soon.css';

const ComingSoonPage: React.FC = () => {
  return (
    <Layout className="coming-soon-page">
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <h1 className="coming-soon-title">Coming Soon</h1>
          <p className="coming-soon-description">
            Something amazing is in the works. Check back soon!
          </p>
          <div className="coming-soon-divider"></div>
          <p className="coming-soon-tagline">
            Building better experiences, one line at a time.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoonPage;

export const Head: HeadFC = () => (
  <SEO title="Coming Soon" />
);
