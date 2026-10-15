import React, { useState } from 'react';
import { getSafeImageUrl, createSvgPlaceholder } from '../utils/images';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  itemType?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackTitle = 'Bassify Hub',
  itemType = 'game',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const safeSrc = getSafeImageUrl(src, itemType, fallbackTitle);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  const finalSrc = hasError ? createSvgPlaceholder(fallbackTitle, itemType) : safeSrc;

  return (
    <img
      src={finalSrc}
      alt={alt || fallbackTitle}
      className={className}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
