import React, { useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatRupiah } from '../utils/formatters.js';
import { groupCartItemsByMerchant, calculateCartGrandTotal, isItemSelected } from '../utils/cartUtils.js';

export default function CartPage({ onNavigate }) {
  const {
    items,
    itemCount,
    updateQuantity,
    removeItem,
    toggleSelectItem,
    toggleSelectAll,
  } = useCart();

  // Group items by merchant
  const merchantGroups = useMemo(() => {
    return groupCartItemsByMerchant(items);
  }, [items]);

  // Selected items calculation
  const selectedItems = useMemo(() => {
    return items.filter((item) => isItemSelected(item));
  }, [items]);

  const selectedCount = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
  }, [selectedItems]);

  const grandTotal = useMemo(() => {
    return calculateCartGrandTotal(items);
  }, [items]);

  const isAllSelected = items.length > 0 && items.every((it) => isItemSelected(it));

  const handleToggleSelectAll = () => {
    toggleSelectAll(!isAllSelected);
  };

  const handleToggleMerchantGroup = (group) => {
    const isGroupFullySelected = group.items.every((it) => isItemSelected(it));
    const targetState = !isGroupFullySelected;
    group.items.forEach((it) => {
      toggleSelectItem(it.id, targetState);
    });
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    if (onNavigate) {
      onNavigate('checkout', { items: selectedItems });
    }
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-20 max-w-lg mx-auto text-center px-4">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#03AC0E] shadow-inner">
          <ShoppingBag className="w-12 h-12 stroke-[1.7]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Wah, keranjang belanjamu kosong!
        </h2>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Yuk, jelajahi ribuan produk lokal Nusantara berkualitas tinggi dan isi keranjang belanja impianmu.
        </p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home')}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
        >
          <span>Mulai Belanja Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Keranjang Belanja</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola barang belanjaan pilihan Anda dari pedagang terpercaya TokoNusa.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-[#03AC0E] rounded-full border border-emerald-100">
          {itemCount} Barang
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart items grouped by store */}
        <div className="lg:col-span-8 space-y-4">
          {/* Global Selection Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 text-[#03AC0E] rounded border-slate-300 focus:ring-[#03AC0E] accent-[#03AC0E] cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Pilih Semua ({items.length} produk)
              </span>
            </label>
            {selectedCount > 0 && (
              <span className="text-xs font-semibold text-slate-500">
                {selectedCount} item terpilih
              </span>
            )}
          </div>

          {/* Merchant Groups */}
          {merchantGroups.map((group) => {
            const isGroupFullySelected = group.items.every((it) => isItemSelected(it));

            return (
              <div
                key={group.merchantId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Store Header */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isGroupFullySelected}
                      onChange={() => handleToggleMerchantGroup(group)}
                      className="w-4 h-4 text-[#03AC0E] rounded border-slate-300 focus:ring-[#03AC0E] accent-[#03AC0E] cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#03AC0E]/10 text-[#03AC0E] flex items-center justify-center">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {group.merchantName}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {group.merchantCity}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#03AC0E]">
                        Official
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items in Store */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((item) => {
                    const selected = isItemSelected(item);
                    const itemQty = Number(item.quantity) || 1;
                    const itemPrice = Number(item.price) || 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                          selected ? 'bg-white' : 'bg-slate-50/40 opacity-80'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 w-full sm:w-auto flex-1">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelectItem(item.id, !selected)}
                            className="mt-2 w-4 h-4 text-[#03AC0E] rounded border-slate-300 focus:ring-[#03AC0E] accent-[#03AC0E] cursor-pointer"
                          />

                          {/* Product Image */}
                          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName || item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                              {item.productName || item.name}
                            </h3>
                            {item.variantName && (
                              <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Varian: {item.variantName}
                              </span>
                            )}
                            <div className="mt-2 text-sm sm:text-base font-extrabold text-[#03AC0E]">
                              {formatRupiah(itemPrice)}
                            </div>
                          </div>
                        </div>

                        {/* Controls (Qty & Delete) */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, itemQty - 1)}
                              disabled={itemQty <= 1}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              title="Kurangi"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-xs font-bold text-slate-800">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, itemQty + 1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Tambah"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Summary Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Belanja
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Total Harga ({selectedCount} barang)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(grandTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#03AC0E]" />
                  <span>Kupon Promo</span>
                </span>
                <span className="text-[#03AC0E] font-medium">Bisa dipakai di checkout</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
                  <p className="text-[11px] text-slate-400">Belum termasuk ongkos kirim</p>
                </div>
                <div className="text-xl font-black text-[#03AC0E]">
                  {formatRupiah(grandTotal)}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={selectedCount === 0}
              className="w-full py-3.5 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-98"
            >
              <span>Beli ({selectedCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#03AC0E]" />
              <span>Jaminan 100% Produk Asli &amp; Uang Kembali</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
