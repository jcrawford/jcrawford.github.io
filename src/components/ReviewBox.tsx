import React from 'react';
import StarRating from './StarRating';

interface ReviewBoxProps {
  rating: number;
  childRating?: number;
  pros: string[];
  cons: string[];
  price?: string;
  brand?: string;
  productUrl?: string;
  affiliateLink?: string;
}

const ReviewBox: React.FC<ReviewBoxProps> = ({
  rating,
  childRating,
  pros,
  cons,
  price,
  brand,
  productUrl,
  affiliateLink,
}) => {
  const targetUrl = affiliateLink || productUrl;
  const hasChildRating = childRating != null && !isNaN(childRating);
  const overallRating = hasChildRating ? (rating + childRating!) / 2 : rating;

  return (
    <div className="review-box">
      <div className="review-box-header">
        {/* Composite Rating - Prominent */}
        <div 
          className={`review-composite ${hasChildRating ? 'review-composite-interactive' : ''}`}
        >
          <div className="review-composite-score">
            <span className="review-composite-number">{overallRating.toFixed(1)}</span>
            <span className="review-composite-star">★</span>
          </div>
          
          {hasChildRating ? (
            <>
              <div className="review-composite-label">
                <svg className="review-composite-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.8507 18.1676 4.55232C18.7122 5.25394 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75607 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Blended Rating
              </div>
              
              {/* Always visible breakdown */}
              <div className="review-breakdown review-breakdown-visible">
                <div className="review-breakdown-item">
                  <span className="review-breakdown-label">My Rating</span>
                  <div className="review-breakdown-stars">
                    <StarRating rating={rating} size={16} showScore={false} color="#2196F3" />
                    <span className="review-breakdown-value">{rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="review-breakdown-item">
                  <span className="review-breakdown-label">Kids' Rating</span>
                  <div className="review-breakdown-stars">
                    <StarRating rating={childRating} size={16} showScore={false} color="#4CAF50" />
                    <span className="review-breakdown-value">{childRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="review-composite-label">My Rating</div>
          )}
        </div>
      </div>

      {(brand || price) && (
        <div className="review-meta">
          {brand && (
            <div className="review-meta-item">
              <span className="review-meta-label">Brand:</span>
              <span className="review-meta-value">{brand}</span>
            </div>
          )}
          {price && (
            <div className="review-meta-item">
              <span className="review-meta-label">Price:</span>
              <span className="review-meta-value">{price}</span>
            </div>
          )}
        </div>
      )}

      {pros && pros.length > 0 && (
        <div className="review-pros">
          <h4 className="review-section-title">Pros</h4>
          <ul className="review-list">
            {pros.map((pro, index) => (
              <li key={index} className="review-list-item review-pro-item">
                <svg className="review-icon review-icon-pro" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cons && cons.length > 0 && (
        <div className="review-cons">
          <h4 className="review-section-title">Cons</h4>
          <ul className="review-list">
            {cons.map((con, index) => (
              <li key={index} className="review-list-item review-con-item">
                <svg className="review-icon review-icon-con" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {targetUrl && (
        <div className="review-box-footer">
          <a 
            href={targetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="review-cta-button"
          >
            {affiliateLink ? 'Check Price' : 'Learn More'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default ReviewBox;
