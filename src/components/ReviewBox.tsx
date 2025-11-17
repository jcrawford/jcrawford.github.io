import React from 'react';
import StarRating from './StarRating';

interface ReviewBoxProps {
  rating: number;
  pros: string[];
  cons: string[];
  price?: string;
  brand?: string;
  productUrl?: string;
  affiliateLink?: string;
}

const ReviewBox: React.FC<ReviewBoxProps> = ({
  rating,
  pros,
  cons,
  price,
  brand,
  productUrl,
  affiliateLink,
}) => {
  const targetUrl = affiliateLink || productUrl;

  return (
    <div className="review-box">
      <div className="review-box-header">
        <h3 className="review-box-title">Our Review</h3>
        <StarRating rating={rating} size={28} showScore={true} />
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

      {pros.length > 0 && (
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

      {cons.length > 0 && (
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

