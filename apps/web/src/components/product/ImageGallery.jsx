import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export default function ImageGallery({ images = [], title = 'Product Image' }) {
  // Normalize images array to list of image url strings
  const normalizedImages = (Array.isArray(images) && images.length > 0)
    ? images.map((img) => (typeof img === 'string' ? img : img.image_url || img.imageUrl || FALLBACK_IMAGE))
    : [FALLBACK_IMAGE];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const activeImage = normalizedImages[activeIndex] || FALLBACK_IMAGE;

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % normalizedImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Image Stage */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-xs cursor-crosshair select-none"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={`${title} - tampilan ${activeIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }
              : undefined
          }
        />

        {/* Zoom Hint Indicator */}
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white backdrop-blur-xs opacity-75 pointer-events-none text-xs flex items-center gap-1">
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px]">Arahkan kursor untuk zoom</span>
        </div>

        {/* Carousel Arrow Buttons for Multi-image */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {normalizedImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Thumbnail ${idx + 1}`}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 ${
                activeIndex === idx
                  ? 'border-[#03AC0E] ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
