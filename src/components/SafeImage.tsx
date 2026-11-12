import React, { useState, useEffect, useRef } from 'react';
import { getSafeImageUrl, getFallbackImage } from '../utils/images';

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
  onLoad,
  onError,
  ...props
}) => {
  const safeSrc = getSafeImageUrl(src, itemType, fallbackTitle);
  const isInlineData = safeSrc.startsWith('data:') || safeSrc.startsWith('blob:');

  // stage: 0 = direct safeSrc, 1 = server /api/image-proxy (for external http/https), 2 = inline SVG fallback
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(isInlineData);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStage(0);
    setIsLoaded(safeSrc.startsWith('data:') || safeSrc.startsWith('blob:'));
  }, [safeSrc]);

  const activeSrc =
    stage === 0
      ? safeSrc
      : stage === 1 && (safeSrc.startsWith('http://') || safeSrc.startsWith('https://'))
      ? `/api/image-proxy?url=${encodeURIComponent(safeSrc)}`
      : getFallbackImage(fallbackTitle || alt || 'Bassify Hub', itemType);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, [activeSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (stage === 0 && (safeSrc.startsWith('http://') || safeSrc.startsWith('https://'))) {
      setStage(1);
    } else if (stage < 2) {
      setStage(2);
      setIsLoaded(true);
    }
    onError?.(e);
  };

  return (
    <img
      ref={imgRef}
      src={activeSrc}
      alt={alt || fallbackTitle}
      className={`${className} ${!isLoaded ? 'animate-pulse bg-[#0c1b36]' : ''}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
