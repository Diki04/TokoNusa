import React, { useState, useEffect } from 'react';
import { Flame, Clock, ChevronRight, Zap } from 'lucide-react';
import { formatRupiah, calculateDiscountPrice } from '../../utils/formatters.js';

/**
 * Calculates remaining hours, minutes, and seconds until the target end time
 * @param {string|number|Date} endTime
 * @param {string|number|Date} [currentTime]
 * @returns {{ hours: number, minutes: number, seconds: number, isEnded: boolean }}
 */
export function calculateRemainingTime(endTime, currentTime = Date.now()) {
  if (!endTime) {
    return { hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const target = new Date(endTime).getTime();
  const now = typeof currentTime === 'number' ? currentTime : new Date(currentTime).getTime();
  const diff = target - now;

  if (diff <= 0 || isNaN(diff)) {
    return { hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const totalSeconds = Math.round(diff / 1000);
  if (totalSeconds <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    isEnded: false,
  };
}

/**
 * Calculates percentage of stock sold (capped 0 - 100)
 * @param {number} sold
 * @param {number} totalStock
 * @returns {number}
 */
export function calculateStockPercentage(sold, totalStock) {
  const s = Math.max(0, Number(sold) || 0);
  const t = Number(totalStock);

  if (t <= 0) return 100;
  const pct = Math.round((s / t) * 100);
  return Math.min(100, Math.max(0, pct));
}

const DEFAULT_FLASH_PRODUCTS = [
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone Silver',
    price: 4999000,
    original_price: 5999000,
    discount_percent: 17,
    stock: 35,
    sold_count: 28,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    city: 'Jakarta Barat',
    merchant_badge: 'Official Store',
  },
  {
    id: 'prod-kopi-gayo-specialty',
    name: 'Kopi Arabika Gayo Aceh Specialty Grade 1 - 250gr Medium Dark Roast',
    price: 85000,
    original_price: 100000,
    discount_percent: 15,
    stock: 250,
    sold_count: 215,
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
    city: 'Aceh Tengah',
    merchant_badge: 'Official Store',
  },
  {
    id: 'prod-batik-keris-parang',
    name: 'Batik Keris Kemeja Pria Lengan Panjang Motif Parang Rusak Barong',
    price: 475000,
    original_price: 550000,
    discount_percent: 14,
    stock: 65,
    sold_count: 52,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    city: 'Solo',
    merchant_badge: 'Official Store',
  },
  {
    id: 'prod-ventela-public-low',
    name: 'Ventela Public Low Black Natural Sepatu Sneakers Pria Wanita Original',
    price: 249000,
    original_price: 299000,
    discount_percent: 17,
    stock: 320,
    sold_count: 280,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    city: 'Bandung',
    merchant_badge: 'Power Merchant Pro',
  },
  {
    id: 'prod-iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Garansi Resmi iBox)',
    price: 23999000,
    original_price: 25999000,
    discount_percent: 8,
    stock: 45,
    sold_count: 38,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    city: 'Jakarta Pusat',
    merchant_badge: 'Official Store',
  },
];

export default function FlashSaleSection({
  products = DEFAULT_FLASH_PRODUCTS,
  targetEndTime,
  onProductClick,
  onSeeAll,
}) {
  // If targetEndTime is not provided, default to 4 hours from now (rolling flash sale session)
  const [endTime] = useState(() => {
    if (targetEndTime) return targetEndTime;
    return new Date(Date.now() + 4 * 3600 * 1000 + 18 * 60 * 1000 + 42 * 1000).toISOString();
  });

  const [timeLeft, setTimeLeft] = useState(() => calculateRemainingTime(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemainingTime(endTime);
      setTimeLeft(remaining);
      if (remaining.isEnded) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const padZero = (n) => String(n).padStart(2, '0');

  return (
    <section className="mb-10 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 p-4 sm:p-6 shadow-md text-white">
      {/* Header with Title and Live Countdown Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase flex items-center gap-1.5">
                Kejar Diskon
                <span className="text-xs bg-yellow-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-md normal-case">
                  WIB
                </span>
              </h2>
            </div>
            <p className="text-xs text-rose-100 font-medium">
              Harga termurah hanya di sesi ini. Segera serbu sebelum kehabisan!
            </p>
          </div>
        </div>

        {/* Live Timer Countdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-rose-100 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Berakhir dalam:
          </span>
          <div className="flex items-center gap-1 font-mono font-extrabold text-sm sm:text-base">
            <div className="bg-slate-950/80 px-2 py-1 rounded-md min-w-[32px] text-center shadow-inner">
              {padZero(timeLeft.hours)}
            </div>
            <span>:</span>
            <div className="bg-slate-950/80 px-2 py-1 rounded-md min-w-[32px] text-center shadow-inner">
              {padZero(timeLeft.minutes)}
            </div>
            <span>:</span>
            <div className="bg-slate-950/80 px-2 py-1 rounded-md min-w-[32px] text-center shadow-inner text-yellow-400">
              {padZero(timeLeft.seconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Product Cards Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {products.map((item) => {
          const discount = item.discount_percent || 0;
          const original = item.original_price || item.price;
          const displayPrice = item.price || calculateDiscountPrice(original, discount);
          const totalStock = (item.stock || 0) + (item.sold_count || 0);
          const percentageClaimed = calculateStockPercentage(item.sold_count || 0, totalStock);

          const imageSrc =
            item.primary_image ||
            item.primaryImage ||
            item.imageUrl ||
            item.image_url ||
            item.images?.[0]?.image_url ||
            item.images?.[0]?.imageUrl ||
            (typeof item.images?.[0] === 'string' ? item.images[0] : '') ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

          return (
            <div
              key={item.id}
              onClick={() => onProductClick && onProductClick(item)}
              className="bg-white rounded-xl p-2.5 sm:p-3 text-slate-900 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Product Image & Discount Sticker */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                <img
                  src={imageSrc}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {discount > 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded shadow-sm">
                    {discount}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-slate-800 leading-snug group-hover:text-rose-600 transition-colors">
                  {item.name}
                </h3>

                <div className="mt-2">
                  <div className="text-sm sm:text-base font-extrabold text-rose-600">
                    {formatRupiah(displayPrice)}
                  </div>
                  {discount > 0 && (
                    <div className="text-[11px] text-slate-400 line-through">
                      {formatRupiah(original)}
                    </div>
                  )}
                </div>

                {/* Stock Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span className={percentageClaimed > 80 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                      {percentageClaimed >= 90
                        ? 'Segera Habis'
                        : `Terjual ${item.sold_count || 0}`}
                    </span>
                    <span>{percentageClaimed}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentageClaimed > 80
                          ? 'bg-gradient-to-r from-orange-500 to-rose-600'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                      style={{ width: `${percentageClaimed}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
