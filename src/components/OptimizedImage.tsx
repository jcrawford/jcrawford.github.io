import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
};

export default OptimizedImage;

