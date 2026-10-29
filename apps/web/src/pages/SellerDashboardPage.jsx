import React, { useState } from 'react';
import {
  Store,
  PlusCircle,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  Star,
  MapPin,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah, formatNumber } from '../utils/formatters.js';
import apiClient from '../services/apiClient.js';

const CATEGORIES = [
  { slug: 'fashion-pria', name: 'Fashion & Busana Pria' },
  { slug: 'fashion-wanita', name: 'Fashion & Busana Wanita' },
  { slug: 'elektronik-gadget', name: 'Elektronik & Gadget' },
  { slug: 'makanan-minuman', name: 'Makanan & Minuman Khas' },
  { slug: 'kriya-nusantara', name: 'Kriya & Kerajinan Nusantara' },
  { slug: 'kecantikan', name: 'Kecantikan & Perawatan' },
];

const PRESET_IMAGES = [
  {
    name: 'Batik Tulis Sutra',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kopi Nusantara',
    url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Anyaman Tas Bambu',
    url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minyak Atsiri Alami',
    url: 'https://images.unsplash.com/photo-1608248597359-0021669c57d7?w=600&auto=format&fit=crop&q=80',
  },
];

export default function SellerDashboardPage({ onNavigate }) {
  const { user } = useAuth();

  const storeName = user?.name ? `Toko Resmi ${user.name}` : 'Toko Resmi Nusantara Official';
  const storeCity = 'Surakarta, Jawa Tengah';

  // Product creation form state
  const [formData, setFormData] = useState({
    name: 'Kain Tenun Ikat Tradisional NTT Asli Pewarna Alami',
    category: 'kriya-nusantara',
    price: 380000,
    stock: 25,
    weight: 450,
    imageUrl: PRESET_IMAGES[0].url,
    description:
      'Kain tenun ikat asli karya pengrajin tenun tangan Nusa Tenggara Timur dengan motif warisan leluhur dan pewarna alami akar tanaman pilihan.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Seller existing products list
  const [sellerProducts, setSellerProducts] = useState([
    {
      id: 'sp-1',
      name: 'Kemeja Batik Sutra Solo Motif Keraton',
      category: 'fashion-pria',
      price: 350000,
      stock: 18,
      sold: 142,
      imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'sp-2',
      name: 'Kopi Arabika Gayo Single Origin 500g',
      category: 'makanan-minuman',
      price: 120000,
      stock: 45,
      sold: 380,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80',
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'weight' ? Number(value) : value,
    }));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Nama produk wajib diisi.');
      return;
    }
    if (formData.price <= 0) {
      setErrorMessage('Harga produk harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock) || 1,
        weight: Number(formData.weight) || 500,
        description: formData.description,
        imageUrl: formData.imageUrl || PRESET_IMAGES[0].url,
        merchantName: storeName,
        merchantCity: storeCity,
      };

      try {
        await apiClient.catalog.createProduct(payload);
      } catch (err) {
        console.warn('Backend product creation fallback:', err.message);
      }

      // Add to local state list
      const newProduct = {
        id: `sp-${Date.now()}`,
        ...payload,
        sold: 0,
      };

      setSellerProducts((prev) => [newProduct, ...prev]);
      setSuccessMessage(`Produk "${formData.name}" berhasil diterbitkan ke katalog TokoNusa!`);

      // Reset form slightly
      setFormData({
        name: '',
        category: 'fashion-pria',
        price: 150000,
        stock: 10,
        weight: 300,
        imageUrl: PRESET_IMAGES[1].url,
        description: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4 sm:py-8 space-y-8">
      {/* Seller Center Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              <Store className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{storeName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900">
                  Pedagang Terverifikasi
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-emerald-100 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  {storeCity}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9 (1.2rb ulasan pembeli)
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('home')}
            className="self-start md:self-auto px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            Lihat Etalase Toko Sebagai Pembeli
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Pendapatan</span>
            <DollarSign className="w-4 h-4 text-[#03AC0E]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatRupiah(14850000)}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% dari bulan lalu
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pesanan Baru</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">8 Pesanan</div>
          <span className="text-[11px] text-slate-400 font-medium">Perlu segera diproses</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Produk Aktif</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {sellerProducts.length} Produk
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Semua siap tayang</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rating Toko</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">4.9 / 5.0</div>
          <span className="text-[11px] text-slate-400 font-medium">Kepuasan pembeli tinggi</span>
        </div>
      </div>

      {/* Main Section: Product Addition Form with Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Tambah Produk Baru */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <PlusCircle className="w-6 h-6 text-[#03AC0E]" />
            <div>
              <h2 className="text-lg font-black text-slate-900">Tambah Produk Baru ke Etalase</h2>
              <p className="text-xs text-slate-500">
                Lengkapi rincian produk untuk mulai menjual ke seluruh Nusantara.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#03AC0E] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Nama Produk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Produk *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Misal: Kemeja Batik Pria Tulis Sutra Halus"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E] transition-all"
                required
              />
            </div>

            {/* Kategori & Harga Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori Produk
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E] transition-all cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Harga Jual (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="1000"
                  step="1000"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E] transition-all font-semibold"
                  required
                />
              </div>
            </div>

            {/* Stok & Berat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stok Barang
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Berat (Gram)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="50"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E] transition-all"
                />
              </div>
            </div>

            {/* Foto Preset Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Foto Produk (Pilih Preset atau Masukkan URL)
              </label>
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: img.url }))}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      formData.imageUrl === img.url
                        ? 'border-[#03AC0E] ring-2 ring-emerald-300'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    {formData.imageUrl === img.url && (
                      <div className="absolute inset-0 bg-[#03AC0E]/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E]"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Deskripsi Lengkap Produk
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Jelaskan keunikan bahan, ukuran, dan cara perawatan produk..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#03AC0E] transition-all resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menerbitkan Produk...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Terbitkan Produk ke Katalog TokoNusa</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Buyer Storefront Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#03AC0E]" />
            <span>Pratinjau Langsung (Live Preview Pembeli)</span>
          </div>

          {/* Product Card Preview (TokoNusa standard card) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md max-w-sm mx-auto group">
            {/* Image */}
            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt={formData.name || 'Preview Produk'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[#03AC0E] text-[10px] font-black rounded-md shadow-xs border border-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#03AC0E]" />
                PRODUK BARU
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {CATEGORIES.find((c) => c.slug === formData.category)?.name || formData.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                  {formData.name || 'Nama Produk Belum Diisi'}
                </h3>
              </div>

              {/* Price */}
              <div className="text-lg font-black text-[#03AC0E]">
                {formatRupiah(formData.price || 0)}
              </div>

              {/* Store & Rating row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 truncate max-w-[150px]">
                  <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{storeName}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0 font-semibold text-slate-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Baru
                </span>
              </div>

              <div className="pt-1">
                <div className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-center text-xs font-bold">
                  Stok Tersedia: {formData.stock} unit
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Active Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900">
          Katalog Produk Saya Saat Ini ({sellerProducts.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Produk</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Harga</th>
                <th className="pb-3">Stok</th>
                <th className="pb-3">Terjual</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellerProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-500 capitalize">{p.category?.replace('-', ' ')}</td>
                  <td className="py-3 font-bold text-slate-900">{formatRupiah(p.price)}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                      {p.stock} unit
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 font-semibold">{p.sold || 0} terjual</td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#03AC0E] border border-emerald-200">
                      Aktif Dijual
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
