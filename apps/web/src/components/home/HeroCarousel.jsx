import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Truck, HeartHandshake, Zap, ArrowRight } from 'lucide-react';

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Spesial Waktu Indonesia Belanja',
    badgeIcon: Zap,
    title: 'Diskon s/d 70% & Cashback Mantap',
    subtitle: 'Rayakan promo belanja terbesar se-Nusantara dengan ekstra voucher diskon hingga Rp 500.000.',
    ctaText: 'Serbu Promo Sekarang',
    gradient: 'from-emerald-700 via-emerald-600 to-[#03AC0E]',
    textColor: 'text-white',
    highlightBadge: 'Diskon s/d 70%',
    category: 'gadget-smartphone',
    pattern: 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]',
  },
  {
    id: 'slide-2',
    badge: 'Bebas Ongkir Extra',
    badgeIcon: Truck,
    title: 'Kirim Bebas Ongkir ke Seluruh Nusantara',
    subtitle: 'Tanpa syarat minimal belanja. Nikmati subsidi pengiriman ke Sabang sampai Merauke.',
    ctaText: 'Klaim Kupon Ongkir',
    gradient: 'from-blue-700 via-indigo-600 to-sky-600',
    textColor: 'text-white',
    highlightBadge: 'Bebas Ongkir Rp 0',
    category: 'all',
    pattern: 'bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_60%)]',
  },
  {
    id: 'slide-3',
    badge: 'Bangga Buatan Indonesia',
    badgeIcon: HeartHandshake,
    title: 'Karya Terbaik UMKM & Pengrajin Nusantara',
    subtitle: 'Dukung produk lokal berkualitas: Kopi Arabika Gayo Aceh, Batik Keris Solo, hingga Sneakers Bandung.',
    ctaText: 'Jelajahi Produk Lokal',
    gradient: 'from-amber-700 via-orange-600 to-rose-600',
    textColor: 'text-white',
    highlightBadge: '100% Produk Asli',
    category: 'makanan-minuman',
    pattern: 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_65%)]',
  },
  {
    id: 'slide-4',
    badge: 'Mega Gadget Festival',
    badgeIcon: Sparkles,
    title: 'Upgrade Smartphone & Audio Premium',
    subtitle: 'iPhone 16 Pro Max garansi resmi iBox dan Sony WH-1000XM5 dengan jaminan original.',
    ctaText: 'Cek Gadget Favorit',
    gradient: 'from-purple-800 via-indigo-700 to-violet-600',
    textColor: 'text-white',
    highlightBadge: 'Cicilan 0% 24 Bln',
    category: 'gadget-smartphone',
    pattern: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]',
  },
];

export default function HeroCarousel({ slides = DEFAULT_SLIDES, onSelectBanner }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const total = slides.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-lg select-none mb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Promo Banners"
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const BadgeIcon = slide.badgeIcon || Sparkles;
          return (
            <div
              key={slide.id || idx}
              className={`w-full flex-shrink-0 min-h-[220px] sm:min-h-[300px] md:min-h-[340px] bg-gradient-to-r ${slide.gradient} ${slide.pattern} p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Subtle background SVG watermark */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12 w-64 h-64 sm:w-96 sm:h-96">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-white">
                  <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                </svg>
              </div>

              {/* Top Banner Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold tracking-wide">
                  <BadgeIcon className="w-4 h-4 text-amber-300" />
                  <span>{slide.badge}</span>
                </div>
                <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                  {slide.highlightBadge}
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 max-w-2xl my-3 sm:my-4">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  {slide.title}
                </h2>
                <p className="mt-2 text-white/85 text-xs sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {slide.subtitle}
                </p>
              </div>

              {/* Action Button & Highlight */}
              <div className="relative z-10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectBanner && onSelectBanner(slide)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-[#03AC0E]" />
                </button>
                <span className="sm:hidden text-xs text-white/90 font-medium bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  {slide.highlightBadge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-20 shadow-md"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-20 shadow-md"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === idx
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
