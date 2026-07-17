"use client";

import { useRef, useState } from "react";

type PhotoGalleryProps = {
  images: string[];
  alt: string;
  heightClassName?: string;
};

export default function PhotoGallery({
  images,
  alt,
  heightClassName = "h-56",
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return null;
  }

  function handleScroll() {
    const el = scrollRef.current;

    if (!el || el.clientWidth === 0) {
      return;
    }

    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), images.length - 1));
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={alt}
            className={`w-full shrink-0 snap-center object-cover ${heightClassName}`}
          />
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent"
          />

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((url, index) => (
              <span
                key={url}
                aria-hidden="true"
                className={
                  index === activeIndex
                    ? "h-1.5 w-5 rounded-full bg-white transition-all"
                    : "h-1.5 w-1.5 rounded-full bg-white/55 transition-all"
                }
              />
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            {activeIndex + 1}枚目 / 全{images.length}枚
          </p>
        </>
      ) : null}
    </div>
  );
}
