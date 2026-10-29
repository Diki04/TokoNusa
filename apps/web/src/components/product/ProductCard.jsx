import React from 'react';
import { Star, MapPin, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';
import { formatRupiah, formatCompactCount } from '../../utils/formatters.js';

export default function ProductCard({ product, onClick, onAddToCart }) {
  if (!product) return null;

  const {
    name,
    price = 0,
    original_price,
    discount_percent = 0,
    city = 'Indonesia',
    merchant_badge = 'Official Store',
    merchant_name,
    rating = 5.0,
    sold_count = 0,
    images = [],
    imageUrl,
  } = product;

  const displayImage =
    imageUrl ||
    images?.[0]?.image_url ||
    images?.[0]?.imageUrl ||
    (typeof images?.[0] === 'string' ? images[0] : '') ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const hasDiscount = discount_percent > 0 && original_price && original_price > price;

  const isOfficial =
    merchant_badge?.toLowerCase().includes('official') ||
    merchant_badge?.toLowerCase().includes('pro');

  const handleCardClick = () => {
    if (onClick) onClick(product);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative"
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          <img
            src={displayImage}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Quick Add To Cart Floating Button on Hover (desktop) */}
          {onAddToCart && (
            <button
              type="button"
              onClick={handleAddToCartClick}
              aria-label="Tambah ke Keranjang"
              title="Tambah ke Keranjang"
              className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-white/95 hover:bg-[#03AC0E] text-slate-700 hover:text-white shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}

          {/* Bebas Ongkir Ribbon Badge */}
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
            <Truck className="w-3 h-3" />
            <span>Bebas Ongkir</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#03AC0E] transition-colors mb-2 min-h-[2.5rem]">
            {name}
          </h3>

          {/* Price & Discount */}
          <div className="mb-1.5">
            <div className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatRupiah(price)}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                  {discount_percent}%
                </span>
                <span className="text-[11px] text-slate-400 line-through">
                  {formatRupiah(original_price)}
                </span>
              </div>
            )}
          </div>

          {/* Merchant Badge & City */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 truncate">
            {isOfficial ? (
              <span className="inline-flex items-center gap-0.5 font-bold text-[#03AC0E] flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 fill-[#03AC0E] text-white" />
                <span className="truncate max-w-[90px]">{merchant_badge}</span>
              </span>
            ) : null}
            <span className="truncate flex items-center gap-0.5 text-slate-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{city}</span>
            </span>
          </div>

          {/* Rating and Sold Count */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-0.5 font-bold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(rating).toFixed(1)}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">
              {formatCompactCount(sold_count)} terjual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
