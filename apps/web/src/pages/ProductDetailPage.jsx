import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  ChevronRight,
  Store,
  Clock,
  ThumbsUp,
  MessageCircle,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import ImageGallery from '../components/product/ImageGallery.jsx';
import VariantSelector, { computeVariantPrice } from '../components/product/VariantSelector.jsx';
import ReviewList from '../components/product/ReviewList.jsx';
import { formatRupiah, formatCompactCount } from '../utils/formatters.js';
import apiClient from '../services/apiClient.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductDetailPage({
  productId,
  initialProduct = null,
  onNavigate,
  onAddToCartSuccess,
}) {
  const { addToCart, showToast } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('deskripsi'); // 'deskripsi' | 'spesifikasi' | 'ulasan'
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    if (showToast) {
      showToast('Tautan produk berhasil disalin!', 'success');
    } else {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  // Fetch product detail if productId given or refresh
  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!productId && initialProduct) {
        setProduct(initialProduct);
        if (initialProduct.variants?.length > 0) {
          setSelectedVariant(initialProduct.variants[0]);
        }
        setReviews(initialProduct.reviews || []);
        return;
      }

      const idToFetch = productId || initialProduct?.id;
      if (!idToFetch) return;

      try {
        setLoading(true);
        const data = await apiClient.catalog.getProductDetail(idToFetch);
        if (isMounted && data) {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.warn('Could not fetch remote product detail, using fallback:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [productId, initialProduct]);

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-[#03AC0E] animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Memuat detail produk TokoNusa...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm mb-6">
          Produk yang Anda cari mungkin telah dinonaktifkan atau telah dihapus.
        </p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#03AC0E] text-white rounded-xl font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    );
  }

  const {
    id,
    name,
    description,
    price: basePrice = 0,
    original_price,
    discount_percent = 0,
    stock = 0,
    merchant_name = 'TokoNusa Official',
    merchant_badge = 'Official Store',
    city = 'Jakarta Barat',
    rating = 5.0,
    sold_count = 0,
    images = [],
    variants = [],
    category_id,
    category_name,
  } = product;

  // Recalculate price factoring in selected variant
  const currentPrice = computeVariantPrice(basePrice, selectedVariant);
  const maxStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : stock;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (maxStock > 0 && next > maxStock) return maxStock;
      return next;
    });
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setAddSuccessMessage('');
    try {
      await addToCart(
        {
          ...product,
          price: currentPrice,
        },
        quantity,
        selectedVariant
      );
      setAddSuccessMessage('Berhasil ditambahkan ke keranjang!');
      if (onAddToCartSuccess) {
        onAddToCartSuccess({ product, quantity, selectedVariant });
      }
      setTimeout(() => setAddSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const directItem = {
      id: `direct-${id}-${selectedVariant?.id || 'default'}`,
      productId: id,
      name,
      price: currentPrice,
      original_price,
      quantity,
      selectedVariant,
      variantName: selectedVariant?.name || '',
      merchantName: merchant_name,
      merchantCity: city,
      imageUrl: product.primary_image || product.imageUrl || images?.[0]?.image_url || '',
    };
    if (onNavigate) {
      onNavigate('checkout', { items: [directItem] });
    }
  };

  const handleSubmitReview = async ({ rating: reviewRating, comment }) => {
    setIsSubmittingReview(true);
    try {
      const newRev = {
        id: `rev-${Date.now()}`,
        product_id: id,
        user_name: 'Anda',
        rating: reviewRating,
        comment,
        created_at: new Date().toISOString(),
        variant_name: selectedVariant?.name || null,
      };

      try {
        await apiClient.catalog.addReview(id, { rating: reviewRating, comment });
      } catch (e) {
        console.warn('Review API fallback to local state:', e.message);
      }

      setReviews((prev) => [newRev, ...prev]);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home')}
          className="hover:text-[#03AC0E] font-medium transition-colors cursor-pointer"
        >
          Beranda
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home', { category: category_id })}
          className="hover:text-[#03AC0E] font-medium transition-colors cursor-pointer"
        >
          {category_name || 'Kategori'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
          {name}
        </span>
      </nav>

      {/* Main 3-Column Product Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <ImageGallery images={images} title={name} />
        </div>

        {/* Center Column: Product Details & Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#03AC0E] text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {merchant_badge}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-xs">
                <Truck className="w-3 h-3" />
                Bebas Ongkir Extra
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {name}
            </h1>

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 mt-2.5">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{Number(rating).toFixed(1)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('ulasan')}
                className="hover:text-[#03AC0E] hover:underline"
              >
                {reviews.length || sold_count} Ulasan
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">
                {formatCompactCount(sold_count)} Terjual
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatRupiah(currentPrice)}
            </div>
            {discount_percent > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                  {discount_percent}%
                </span>
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  {formatRupiah(original_price || basePrice * 1.2)}
                </span>
              </div>
            )}
          </div>

          {/* Variants Selector */}
          {variants && variants.length > 0 && (
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              basePrice={basePrice}
            />
          )}

          {/* Merchant Profile Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#03AC0E] flex items-center justify-center font-bold text-lg">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <span>{merchant_name}</span>
                  <ShieldCheck className="w-4 h-4 text-[#03AC0E]" />
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="text-[#03AC0E] font-medium">• Online</span>
                  <span>|</span>
                  <span>{city}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>Rating Toko: 4.9 (99% ulasan positif)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-1.5 rounded-lg border border-[#03AC0E] text-[#03AC0E] hover:bg-emerald-50 text-xs font-bold transition-colors"
            >
              Kunjungi Toko
            </button>
          </div>

          {/* Information Tabs */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-6 border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('deskripsi')}
                className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === 'deskripsi'
                    ? 'text-[#03AC0E]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Deskripsi
                {activeTab === 'deskripsi' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03AC0E]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spesifikasi')}
                className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === 'spesifikasi'
                    ? 'text-[#03AC0E]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Spesifikasi
                {activeTab === 'spesifikasi' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03AC0E]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ulasan')}
                className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === 'ulasan'
                    ? 'text-[#03AC0E]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ulasan Pembeli ({reviews.length})
                {activeTab === 'ulasan' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03AC0E]" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'deskripsi' && (
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                <p className="whitespace-pre-line">{description}</p>
                <div className="bg-emerald-50/60 p-3.5 rounded-xl text-xs text-emerald-900 border border-emerald-100">
                  <strong className="block font-bold mb-1">Catatan Garansi & Pengiriman:</strong>
                  Semua produk di TokoNusa dijamin 100% Original, lolos kurasi mutu ketat, dan dilindungi asuransi pengiriman ke seluruh Nusantara.
                </div>
              </div>
            )}

            {activeTab === 'spesifikasi' && (
              <div className="text-xs sm:text-sm divide-y divide-slate-100">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Kondisi</span>
                  <span className="font-semibold text-slate-800">Baru (100% Segel Asli)</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Kategori</span>
                  <span className="font-semibold text-[#03AC0E]">{category_name || 'Katalog Utama'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Min. Pemesanan</span>
                  <span className="font-semibold text-slate-800">1 Buah</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Etalase</span>
                  <span className="font-semibold text-slate-800">Semua Produk Unggulan</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Garansi</span>
                  <span className="font-semibold text-slate-800">Garansi Resmi Toko & Distributor</span>
                </div>
              </div>
            )}

            {activeTab === 'ulasan' && (
              <ReviewList
                reviews={reviews}
                averageRating={rating}
                totalReviews={reviews.length}
                onSubmitReview={handleSubmitReview}
                isSubmitting={isSubmittingReview}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>

        {/* Right Column: Sticky Purchasing Action Card on Desktop (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Atur Jumlah dan Catatan
            </h3>

            {/* Quantity Selector */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Jumlah:</span>
                <span className="font-semibold text-slate-700">
                  Total Stok: {maxStock}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxStock}
                    className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Note for Merchant */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">
                Catatan untuk Toko (Opsional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Warna cadangan, packing kayu..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#03AC0E] focus:ring-1 focus:ring-[#03AC0E]"
              />
            </div>

            {/* Subtotal Display */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Subtotal</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatRupiah(currentPrice * quantity)}
              </span>
            </div>

            {/* Success message feedback */}
            {addSuccessMessage && (
              <div className="p-2 bg-emerald-50 text-[#03AC0E] rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{addSuccessMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || maxStock <= 0}
                className="w-full py-2.5 rounded-xl bg-[#03AC0E] hover:bg-[#02930c] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                {isAddingToCart ? 'Menambahkan...' : '+ Keranjang'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isAddingToCart || maxStock <= 0}
                className="w-full py-2.5 rounded-xl border-2 border-[#03AC0E] text-[#03AC0E] hover:bg-emerald-50 disabled:border-slate-300 disabled:text-slate-400 font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer"
              >
                Beli Langsung
              </button>
            </div>

            {/* Auxiliary actions: Wishlist & Share */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`inline-flex items-center gap-1.5 hover:text-slate-800 cursor-pointer ${
                  isWishlisted ? 'text-rose-600 font-bold' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                <span>Wishlist</span>
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 hover:text-slate-800 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Harga Total</div>
          <div className="text-sm font-black text-slate-900">
            {formatRupiah(currentPrice * quantity)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingToCart || maxStock <= 0}
            className="px-4 py-2 rounded-xl border border-[#03AC0E] text-[#03AC0E] font-bold text-xs active:bg-emerald-50"
          >
            + Keranjang
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isAddingToCart || maxStock <= 0}
            className="px-5 py-2 rounded-xl bg-[#03AC0E] text-white font-bold text-xs shadow-sm active:bg-emerald-700"
          >
            Beli
          </button>
        </div>
      </div>

      {/* Share Toast Notification */}
      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-white text-sm bg-slate-900 border border-slate-700 animate-slide-up"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <p className="font-medium">Tautan produk berhasil disalin!</p>
        </div>
      )}
    </div>
  );
}
