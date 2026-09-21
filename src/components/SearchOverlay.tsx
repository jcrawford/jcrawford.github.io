import React, { useState, useEffect, useRef } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { useFlexSearch } from 'react-use-flexsearch';
import { formatDate } from '../utils/dateUtils';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  path: string;
}

interface LocalSearchData {
  localSearchArticles: {
    index: string;
    store: string;
  };
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const data = useStaticQuery<LocalSearchData>(graphql`
    query SearchQuery {
      localSearchArticles {
        index
        store
      }
    }
  `);

  const results = useFlexSearch(
    searchTerm,
    data.localSearchArticles.index,
    data.localSearchArticles.store
  ) as SearchResult[];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="hm-search-overlay" onClick={onClose}>
      <div className="hm-search-container" onClick={(e) => e.stopPropagation()}>
        <div className="hm-search-header">
          <input
            ref={inputRef}
            type="search"
            className="hm-search-input"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search"
          />
          <button
            className="hm-search-close"
            onClick={onClose}
            aria-label="Close search"
          >
            ×
          </button>
        </div>

        <div className="hm-search-results">
          {searchTerm && results.length === 0 && (
            <div className="hm-search-empty">
              <p>No results found for "{searchTerm}"</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="hm-search-count">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              <ul className="hm-search-list">
                {results.slice(0, 10).map((article) => (
                  <li key={article.id} className="hm-search-item">
                    <Link
                      to={article.path}
                      className="hm-search-link"
                      onClick={onClose}
                    >
                      <h3 className="hm-search-item-title">{article.title}</h3>
                      <p className="hm-search-item-excerpt">{article.excerpt}</p>
                      <div className="hm-search-item-meta">
                        <span className="hm-search-item-category">{article.category}</span>
                        <span className="hm-search-item-separator">•</span>
                        <span className="hm-search-item-date">{formatDate(article.publishedAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;

