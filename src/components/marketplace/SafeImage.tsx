"use client";

import { useState, ImgHTMLAttributes } from "react";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function SafeImage({ src, fallbackSrc, alt, ...props }: SafeImageProps) {
  const defaultFallback = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80"; // Generic shopping bag
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      {...props}
      src={imgSrc || defaultFallback}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc || defaultFallback);
      }}
    />
  );
}