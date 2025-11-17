import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: number;
  showScore?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 24, showScore = true }) => {
  // Clamp rating between 0 and 5
  const clampedRating = Math.min(Math.max(rating, 0), 5);
  
  // Generate array of 5 stars with their fill percentages
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starPosition = index + 1;
    
    if (clampedRating >= starPosition) {
      // Full star
      return 100;
    } else if (clampedRating > index) {
      // Partial star - calculate percentage
      return (clampedRating - index) * 100;
    } else {
      // Empty star
      return 0;
    }
  });

  return (
    <div className="star-rating">
      <div className="star-rating-stars" style={{ display: 'flex', gap: '2px' }}>
        {stars.map((fillPercentage, index) => (
          <svg
            key={index}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="star"
          >
            <defs>
              <linearGradient id={`star-gradient-${index}-${fillPercentage}`}>
                <stop offset={`${fillPercentage}%`} stopColor="#FFC107" />
                <stop offset={`${fillPercentage}%`} stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill={`url(#star-gradient-${index}-${fillPercentage})`}
              stroke="#FFC107"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      {showScore && (
        <div className="star-rating-score">
          <span className="star-rating-value">{clampedRating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};

export default StarRating;

