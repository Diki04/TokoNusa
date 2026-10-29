import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters.js';

/**
 * Computes the final product price factoring in variant price delta
 * @param {number} basePrice
 * @param {object|null} selectedVariant
 * @returns {number}
 */
export function computeVariantPrice(basePrice, selectedVariant) {
  const base = Math.max(0, Number(basePrice) || 0);
  if (!selectedVariant) return base;
  const delta = Number(selectedVariant.price_delta) || 0;
  return Math.max(0, base + delta);
}

export default function VariantSelector({
  variants = [],
  selectedVariant = null,
  onSelectVariant,
  basePrice = 0,
}) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="py-4 border-t border-b border-slate-100 my-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs sm:text-sm font-bold text-slate-800">
          Pilih Varian:
          {selectedVariant && (
            <span className="ml-1.5 font-semibold text-[#03AC0E]">
              {selectedVariant.name}
            </span>
          )}
        </span>
        {selectedVariant?.stock !== undefined && (
          <span
            className={`text-xs font-medium ${
              selectedVariant.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            {selectedVariant.stock <= 0
              ? 'Stok Habis'
              : selectedVariant.stock <= 5
              ? `Sisa ${selectedVariant.stock} buah!`
              : `Stok: ${selectedVariant.stock}`}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const isOutOfStock = v.stock !== undefined && v.stock <= 0;
          const delta = Number(v.price_delta) || 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant && onSelectVariant(v)}
              className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isOutOfStock
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                  : isSelected
                  ? 'border-[#03AC0E] bg-emerald-50 text-[#03AC0E] ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-[#03AC0E] flex-shrink-0" />}
              <span>{v.name}</span>
              {delta !== 0 && (
                <span
                  className={`text-[11px] font-normal ${
                    delta > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  ({delta > 0 ? `+${formatRupiah(delta)}` : formatRupiah(delta)})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
