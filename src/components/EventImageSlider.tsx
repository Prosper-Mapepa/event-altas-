"use client";

import { useState, useEffect } from "react";
const TRANSITION_MS = 4500;

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export function EventImageSlider({ images, alt, className = "" }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, TRANSITION_MS);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/85 ${className}`}>
        <img src={images[0]} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/85 ${className}`}>
      <div className="relative h-full w-full">
        {images.map((url, i) => (
          <img
            key={url}
            src={url}
            alt={`${alt} ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-sky-400" : "bg-slate-500/80 hover:bg-slate-400"
            }`}
            aria-label={`View image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
