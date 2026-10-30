import React from 'react';
import { Star, MapPin, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';
import { formatRupiah, formatCompactCount } from '../../utils/formatters.js';

const PRODUCT_EXACT_FALLBACKS = {
  'prod-iphone-16-pro-max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
  'prod-samsung-s24-ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
  'prod-kopi-gayo-specialty': 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
  'prod-batik-keris-parang': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  'prod-sony-wh1000xm5': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'prod-ventela-public-low': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
  'prod-indomie-goreng-karton': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
  'prod-helm-njs-kairoz': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  'prod-minyak-kayu-putih-cap-lang': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
};

const CATEGORY_FALLBACK_IMAGES = {
  'cat-gadget': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
  'cat-elektronik': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'cat-fashion-pria': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  'cat-kuliner': 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
  'cat-otomotif': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  'cat-rumah-tangga': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
};

export default function ProductCard({ product, onClick, onAddToCart }) {
  if (!product) return null;

  const {
    id,
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
    category_id,
  } = product;

  const resolvedFallback =
    PRODUCT_EXACT_FALLBACKS[id] ||
    CATEGORY_FALLBACK_IMAGES[category_id] ||
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80';

  const displayImage =
    product.primary_image ||
    product.primaryImage ||
    product.imageUrl ||
    product.image_url ||
    imageUrl ||
    images?.[0]?.image_url ||
    images?.[0]?.imageUrl ||
    (typeof images?.[0] === 'string' ? images[0] : '') ||
    resolvedFallback;

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
            onError={(e) => {
              if (e.currentTarget.src !== resolvedFallback) {
                e.currentTarget.src = resolvedFallback;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Quick Add To Cart Floating Button on Hover (desktop) */}
          {onAddToCart && (
            <button
              type="button"
              onClick={handleAddToCartClick}
              aria-label="Tambah ke Keranjang"
              title="Tambah ke Keranjang"
              className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-white/95 hover:bg-[#03AC0E] text-slate-700 hover:text-white shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 active:scale-95 cursor-pointer"
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
