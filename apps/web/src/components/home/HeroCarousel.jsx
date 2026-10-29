import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Truck, HeartHandshake, Zap, ArrowRight } from 'lucide-react';

export const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Spesial Waktu Indonesia Belanja',
    badgeIcon: Zap,
    title: 'Diskon s/d 70% & Cashback Mantap',
    subtitle: 'Rayakan promo belanja terbesar se-Nusantara dengan ekstra voucher diskon hingga Rp 500.000.',
    ctaText: 'Beli Sekarang',
    gradient: 'from-emerald-800 via-emerald-700 to-[#03AC0E]',
    textColor: 'text-white',
    highlightBadge: 'Diskon s/d 70%',
    category: 'cat-gadget',
    pattern: 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]',
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    productName: 'Apple iPhone 16 Pro Max',
    productPrice: 'Rp 23.999.000',
  },
  {
    id: 'slide-2',
    badge: 'Bebas Ongkir Extra',
    badgeIcon: Truck,
    title: 'Kirim Bebas Ongkir ke Seluruh Nusantara',
    subtitle: 'Tanpa syarat minimal belanja. Nikmati subsidi pengiriman kurir ke Sabang sampai Merauke.',
    ctaText: 'Klaim Kupon Ongkir',
    gradient: 'from-blue-800 via-indigo-700 to-sky-600',
    textColor: 'text-white',
    highlightBadge: 'Bebas Ongkir Rp 0',
    category: 'all',
    pattern: 'bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_60%)]',
    productImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    productName: 'Pengiriman Kurir Se-Nusantara',
    productPrice: 'Subsidi Rp 40.000',
  },
  {
    id: 'slide-3',
    badge: 'Bangga Buatan Indonesia',
    badgeIcon: HeartHandshake,
    title: 'Karya Terbaik UMKM & Pengrajin Nusantara',
    subtitle: 'Dukung produk lokal berkualitas: Kopi Arabika Gayo Aceh, Batik Keris Solo, hingga Sneakers Bandung.',
    ctaText: 'Jelajahi Produk Lokal',
    gradient: 'from-amber-800 via-orange-700 to-rose-700',
    textColor: 'text-white',
    highlightBadge: '100% Produk Asli',
    category: 'cat-kuliner',
    pattern: 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_65%)]',
    productImage: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
    productName: 'Kopi Arabika Gayo Aceh',
    productPrice: 'Rp 85.000',
  },
  {
    id: 'slide-4',
    badge: 'Mega Gadget Festival',
    badgeIcon: Sparkles,
    title: 'Upgrade Smartphone & Audio Premium',
    subtitle: 'Garansi resmi iBox dan Sony WH-1000XM5 dengan jaminan 100% produk original.',
    ctaText: 'Cek Audio & Gadget',
    gradient: 'from-purple-900 via-indigo-800 to-violet-700',
    textColor: 'text-white',
    highlightBadge: 'Cicilan 0% 24 Bln',
    category: 'cat-elektronik',
    pattern: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    productName: 'Sony WH-1000XM5 Hi-Res',
    productPrice: 'Rp 4.999.000',
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
              className={`w-full flex-shrink-0 min-h-[240px] sm:min-h-[300px] md:min-h-[340px] bg-gradient-to-r ${slide.gradient} ${slide.pattern} p-6 sm:p-10 md:p-12 flex items-center justify-between relative overflow-hidden`}
            >
              {/* Subtle background SVG watermark */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12 w-64 h-64 sm:w-96 sm:h-96">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-white">
                  <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                </svg>
              </div>

              {/* Left Column: Text & CTA */}
              <div className="relative z-10 max-w-xl flex flex-col justify-between h-full py-1">
                {/* Top Banner Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold tracking-wide">
                    <BadgeIcon className="w-4 h-4 text-amber-300" />
                    <span>{slide.badge}</span>
                  </div>
                  <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium">
                    {slide.highlightBadge}
                  </div>
                </div>

                {/* Main Heading */}
                <div className="my-2">
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="mt-2 text-white/85 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2">
                    {slide.subtitle}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onSelectBanner && onSelectBanner(slide)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 text-[#03AC0E]" />
                  </button>
                  <span className="sm:hidden text-xs text-white/90 font-medium bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    {slide.highlightBadge}
                  </span>
                </div>
              </div>

              {/* Right Column: Featured Product Showcase Photo */}
              {slide.productImage && (
                <div className="hidden md:flex items-center justify-center shrink-0 w-64 lg:w-80 h-full relative z-10 ml-6">
                  <div className="relative group cursor-pointer" onClick={() => onSelectBanner && onSelectBanner(slide)}>
                    {/* Glassmorphism Card Frame */}
                    <div className="w-56 h-48 lg:w-64 lg:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md p-2 transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
                      <img
                        src={slide.productImage}
                        alt={slide.productName || slide.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    {/* Product Name & Price Floating Tag */}
                    {slide.productName && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-2">
                        <span className="text-[11px] font-semibold">{slide.productName}</span>
                        {slide.productPrice && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded">
                            {slide.productPrice}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              currentIndex === idx ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Buka slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
