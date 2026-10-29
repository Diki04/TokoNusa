import React, { useState, useEffect } from 'react';
import { Filter, Star, RotateCcw, Check, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters.js';

export default function ProductFilterSidebar({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  priceRange = { min: '', max: '' },
  onApplyPriceRange,
  selectedRating = 0,
  onSelectRating,
  selectedMerchantBadge = '',
  onSelectMerchantBadge,
  onResetFilters,
}) {
  const [minPrice, setMinPrice] = useState(priceRange.min || '');
  const [maxPrice, setMaxPrice] = useState(priceRange.max || '');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);
  const [isBadgeOpen, setIsBadgeOpen] = useState(true);

  useEffect(() => {
    setMinPrice(priceRange.min || '');
    setMaxPrice(priceRange.max || '');
  }, [priceRange]);

  const handleApplyPrice = (e) => {
    e?.preventDefault();
    if (onApplyPriceRange) {
      onApplyPriceRange({
        min: minPrice ? Number(minPrice) : '',
        max: maxPrice ? Number(maxPrice) : '',
      });
    }
  };

  const handleQuickPrice = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    if (onApplyPriceRange) {
      onApplyPriceRange({ min, max });
    }
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
    priceRange.min ||
    priceRange.max ||
    selectedRating > 0 ||
    selectedMerchantBadge
  );

  return (
    <aside className="w-full bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm sm:text-base">
          <Filter className="w-4 h-4 text-[#03AC0E]" />
          <span>Filter Produk</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="py-3 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-2"
        >
          <span>Kategori</span>
          {isCategoryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isCategoryOpen && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                !selectedCategory
                  ? 'bg-emerald-50 text-[#03AC0E] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Semua Kategori</span>
              {!selectedCategory && <Check className="w-3.5 h-3.5" />}
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#03AC0E] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Price Range Filter */}
      <div className="py-3 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-2"
        >
          <span>Harga (Rp)</span>
          {isPriceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isPriceOpen && (
          <form onSubmit={handleApplyPrice} className="space-y-2.5">
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">
                  Harga Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#03AC0E] focus:ring-1 focus:ring-[#03AC0E]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">
                  Harga Maksimum
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Tanpa batas"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#03AC0E] focus:ring-1 focus:ring-[#03AC0E]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              <button
                type="button"
                onClick={() => handleQuickPrice(0, 100000)}
                className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
              >
                &lt; 100rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(100000, 500000)}
                className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
              >
                100rb - 500rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(500000, 2000000)}
                className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
              >
                500rb - 2jt
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-[#03AC0E] hover:bg-[#02930c] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Terapkan Harga
            </button>
          </form>
        )}
      </div>

      {/* 3. Merchant Badge Filter */}
      <div className="py-3 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setIsBadgeOpen(!isBadgeOpen)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-2"
        >
          <span>Jenis Toko</span>
          {isBadgeOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isBadgeOpen && (
          <div className="space-y-1.5 text-xs">
            {[
              { id: '', label: 'Semua Penjual' },
              { id: 'Official Store', label: 'Official Store', icon: true },
              { id: 'Power Merchant', label: 'Power Merchant Pro', icon: true },
            ].map((badge) => {
              const isSelected = selectedMerchantBadge === badge.id;
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => onSelectMerchantBadge && onSelectMerchantBadge(badge.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#03AC0E] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {badge.icon && <ShieldCheck className="w-3.5 h-3.5 text-[#03AC0E]" />}
                    <span>{badge.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Rating Filter */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => setIsRatingOpen(!isRatingOpen)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-2"
        >
          <span>Rating Toko</span>
          {isRatingOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isRatingOpen && (
          <div className="space-y-1.5 text-xs">
            {[
              { rating: 0, label: 'Semua Rating' },
              { rating: 4.8, label: '4.8 ke atas' },
              { rating: 4.5, label: '4.5 ke atas' },
              { rating: 4.0, label: '4.0 ke atas' },
            ].map((item) => {
              const isSelected = selectedRating === item.rating;
              return (
                <button
                  key={item.rating}
                  type="button"
                  onClick={() => onSelectRating && onSelectRating(item.rating)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#03AC0E] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {item.rating > 0 && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
