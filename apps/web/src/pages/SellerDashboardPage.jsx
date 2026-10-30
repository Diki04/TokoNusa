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
  Star,
  MapPin,
  Check,
  AlertCircle,
  Truck,
  Search,
  Filter,
  Trash2,
  Edit3,
  Sliders,
  Settings,
  Printer,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah, formatDate } from '../utils/formatters.js';
import apiClient from '../services/apiClient.js';

const OFFICIAL_CATEGORIES = [
  { id: 'cat-gadget', slug: 'gadget-smartphone', name: 'Gadget & Smartphone' },
  { id: 'cat-elektronik', slug: 'elektronik', name: 'Elektronik & Audio' },
  { id: 'cat-fashion-pria', slug: 'fashion-pria', name: 'Fashion Pria' },
  { id: 'cat-kuliner', slug: 'makanan-minuman', name: 'Makanan & Minuman Lokal' },
  { id: 'cat-otomotif', slug: 'otomotif', name: 'Otomotif & Helm' },
  { id: 'cat-rumah-tangga', slug: 'hobi-rumah-tangga', name: 'Hobi & Rumah Tangga' },
];

const PRESET_IMAGES = [
  {
    name: 'iPhone 16 Titanium',
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sony Headphone Silver',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Kemeja Batik Parang',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Kopi Arabika Gayo',
    url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sepatu Sneakers Ventela',
    url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Helm NJS Kairoz',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
];

export default function SellerDashboardPage({ onNavigate }) {
  const { user } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'settings'

  // Store information
  const [storeProfile, setStoreProfile] = useState({
    name: user?.name ? `${user.name} Official` : 'iBox Official Store',
    city: 'Jakarta Pusat',
    slogan: 'Pusat Produk Digital & Aksesoris Bergaransi Resmi Terlengkap',
    couriers: {
      jne: true,
      sicepat: true,
      gosend: true,
    },
  });

  // Product catalog state
  const [sellerProducts, setSellerProducts] = useState([
    {
      id: 'prod-iphone-16-pro-max',
      name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Garansi Resmi iBox)',
      category: 'gadget-smartphone',
      price: 23999000,
      stock: 45,
      sold: 1420,
      status: 'AKTIF',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-sony-wh1000xm5',
      name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone Silver',
      category: 'elektronik',
      price: 4999000,
      stock: 35,
      sold: 720,
      status: 'AKTIF',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-kopi-gayo-specialty',
      name: 'Kopi Arabika Gayo Aceh Specialty Grade 1 - 250gr Medium Dark Roast',
      category: 'makanan-minuman',
      price: 85000,
      stock: 250,
      sold: 4850,
      status: 'AKTIF',
      imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-batik-keris-parang',
      name: 'Batik Keris Kemeja Pria Lengan Panjang Motif Parang Rusak Barong',
      category: 'fashion-pria',
      price: 475000,
      stock: 65,
      sold: 890,
      status: 'AKTIF',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-ventela-public-low',
      name: 'Ventela Public Low Black Natural Sepatu Sneakers Pria Wanita Original',
      category: 'fashion-pria',
      price: 249000,
      stock: 320,
      sold: 3600,
      status: 'AKTIF',
      imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  // Incoming orders state
  const [sellerOrders, setSellerOrders] = useState([
    {
      id: 'ORD-SEL-8821',
      orderNumber: 'TKNS-ORD-20261030-8821',
      customerName: 'Budi Santoso',
      customerPhone: '0812-3456-7890',
      shippingAddress: 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan (12190)',
      courier: 'JNE Reguler',
      trackingNumber: '',
      status: 'PERLU_DIPROSES',
      createdAt: '30 Okt 2026, 08:45 WIB',
      totalAmount: 24014000,
      items: [
        {
          name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
          quantity: 1,
          price: 23999000,
          variant: 'Natural Titanium 256GB',
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
        },
      ],
    },
    {
      id: 'ORD-SEL-8820',
      orderNumber: 'TKNS-ORD-20261029-8820',
      customerName: 'Siti Rahmawati',
      customerPhone: '0813-9876-5432',
      shippingAddress: 'Jl. Pemuda No. 12, Rawamangun, Jakarta Timur (13220)',
      courier: 'SiCepat BEST',
      trackingNumber: 'TKNS-SCP-99214401',
      status: 'SEDANG_DIKIRIM',
      createdAt: '29 Okt 2026, 16:30 WIB',
      totalAmount: 5014000,
      items: [
        {
          name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone Silver',
          quantity: 1,
          price: 4999000,
          variant: 'Platinum Silver',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
        },
      ],
    },
    {
      id: 'ORD-SEL-8819',
      orderNumber: 'TKNS-ORD-20261028-8819',
      customerName: 'Ahmad Dahlan',
      customerPhone: '0811-2233-4455',
      shippingAddress: 'Jl. Dago Asri No. 88, Coblong, Kota Bandung (40135)',
      courier: 'JNE YES',
      trackingNumber: 'TKNS-JNE-77218809',
      status: 'SELESAI',
      createdAt: '28 Okt 2026, 11:15 WIB',
      totalAmount: 264000,
      items: [
        {
          name: 'Ventela Public Low Black Natural Sepatu Sneakers Pria Wanita Original',
          quantity: 1,
          price: 249000,
          variant: 'Size 41',
          imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=200&q=80',
        },
      ],
    },
  ]);

  // Product search & filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // New product form modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'gadget-smartphone',
    price: 150000,
    stock: 20,
    weight: 350,
    imageUrl: PRESET_IMAGES[0].url,
    description: '',
  });

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Stock quick adjustment
  const handleUpdateStock = (productId, delta) => {
    setSellerProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );
  };

  // Toggle status
  const handleToggleProductStatus = (productId) => {
    setSellerProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStatus = p.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
          triggerToast(`Status produk diubah menjadi ${nextStatus}`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // Delete product
  const handleDeleteProduct = (productId, name) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}" dari etalase?`)) {
      setSellerProducts((prev) => prev.filter((p) => p.id !== productId));
      triggerToast(`Produk "${name.slice(0, 25)}..." berhasil dihapus.`);
    }
  };

  // Publish new product
  const handlePublishProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newProd = {
      id: `prod-custom-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock) || 10,
      sold: 0,
      status: 'AKTIF',
      imageUrl: formData.imageUrl || PRESET_IMAGES[0].url,
      description: formData.description,
    };

    try {
      await apiClient.catalog.createProduct({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock) || 10,
        imageUrl: formData.imageUrl || PRESET_IMAGES[0].url,
        description: formData.description,
        merchantName: storeProfile.name,
        city: storeProfile.city,
      });
    } catch (err) {
      console.warn('API sync fallback to local state:', err.message);
    }

    setSellerProducts((prev) => [newProd, ...prev]);
    setIsAddModalOpen(false);
    triggerToast(`Produk "${formData.name.slice(0, 25)}..." berhasil ditambahkan ke etalase!`);
    setFormData({
      name: '',
      category: 'gadget-smartphone',
      price: 150000,
      stock: 20,
      weight: 350,
      imageUrl: PRESET_IMAGES[0].url,
      description: '',
    });
  };

  // Order fulfillment actions
  const handleProcessOrder = (orderId) => {
    setSellerOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          triggerToast(`Pesanan ${ord.orderNumber} sedang dikemas.`);
          return { ...ord, status: 'SEDANG_DIKEMAS' };
        }
        return ord;
      })
    );
  };

  const handleShipOrder = (orderId) => {
    const generatedResi = `TKNS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-8)}`;
    setSellerOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          triggerToast(`Pesanan ${ord.orderNumber} berhasil dikirim! No. Resi: ${generatedResi}`);
          return { ...ord, status: 'SEDANG_DIKIRIM', trackingNumber: generatedResi };
        }
        return ord;
      })
    );
  };

  // Filtered lists
  const filteredProducts = sellerProducts.filter((p) => {
    const matchSearch =
      !productSearch.trim() || p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory =
      productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredOrders = sellerOrders.filter((ord) => {
    if (orderStatusFilter === 'ALL') return true;
    return ord.status === orderStatusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#03AC0E]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner shrink-0">
              <Store className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{storeProfile.name}</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900">
                  <ShieldCheck className="w-3 h-3" />
                  Official Store Terverifikasi
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl line-clamp-1">
                {storeProfile.slogan}
              </p>
              <div className="flex items-center gap-3 text-xs text-emerald-200 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  {storeProfile.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-yellow-300">
                  <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                  4.9 (2.4rb ulasan)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Lihat Toko Publik</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Scorecard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Pendapatan (Bulan Ini)</span>
            <DollarSign className="w-4 h-4 text-[#03AC0E]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatRupiah(28998000)}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +24.5% dari bulan sebelumnya
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pesanan Masuk</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {sellerOrders.filter((o) => o.status === 'PERLU_DIPROSES').length} Pesanan
          </div>
          <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Perlu segera diproses hari ini
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Produk Siap Jual</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {sellerProducts.filter((p) => p.status === 'AKTIF').length} Item Aktif
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Dari total {sellerProducts.length} produk katalog
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Performa & Kecepatan</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            99.2%
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pesanan dikirim tepat waktu
          </span>
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#03AC0E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ringkasan Toko</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-[#03AC0E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Kelola Produk ({sellerProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#03AC0E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pesanan Masuk</span>
          {sellerOrders.filter((o) => o.status === 'PERLU_DIPROSES').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {sellerOrders.filter((o) => o.status === 'PERLU_DIPROSES').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#03AC0E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profil Toko & Kurir</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Performa Penjualan 7 Hari Terakhir</h3>
                <p className="text-xs text-slate-500">Aktivitas pesanan selesai dan total pendapatan kotor</p>
              </div>
              <span className="text-xs font-bold text-[#03AC0E] bg-emerald-50 px-2.5 py-1 rounded-md">
                Tren Positif (+18.4%)
              </span>
            </div>

            {/* Simulated chart bars */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {[
                { day: 'Sen', val: 45, rev: 'Rp 4.2jt' },
                { day: 'Sel', val: 65, rev: 'Rp 6.1jt' },
                { day: 'Rab', val: 40, rev: 'Rp 3.8jt' },
                { day: 'Kam', val: 80, rev: 'Rp 7.5jt' },
                { day: 'Jum', val: 95, rev: 'Rp 9.2jt' },
                { day: 'Sab', val: 75, rev: 'Rp 7.0jt' },
                { day: 'Min', val: 60, rev: 'Rp 5.5jt' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {bar.rev}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-[#03AC0E] group-hover:bg-[#00820A] rounded-t-xl transition-all duration-300"
                      style={{ height: `${bar.val}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{bar.day}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Rata-rata transaksi harian: <strong>Rp 6.180.000 / hari</strong></span>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-[#03AC0E] font-bold hover:underline"
              >
                Lihat rincian transaksi &rarr;
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Tugas Toko Mendesak</h3>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-900">1 Pesanan Perlu Diproses</div>
                    <div className="text-amber-700 mt-0.5">Pesanan masuk dari Budi Santoso (iPhone 16 Pro Max).</div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="mt-2 text-xs font-extrabold text-amber-900 underline"
                    >
                      Buka Rincian Pesanan
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/70 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#03AC0E] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-900">Katalog Tersinkronisasi</div>
                    <div className="text-emerald-700 mt-0.5">Semua 5 produk siap tampil di TokoNusa Storefront.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          {/* Controls: Search, Category Filter, and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari nama produk di etalase..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-[#03AC0E] cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                {OFFICIAL_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Harga</th>
                  <th className="py-3 px-3">Stok Unit</th>
                  <th className="py-3 px-3">Terjual</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-slate-900 line-clamp-2 leading-snug">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 capitalize text-slate-600 font-medium">
                      {p.category.replace('-', ' ')}
                    </td>

                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {formatRupiah(p.price)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(p.id, -1)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 font-bold flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="font-extrabold px-1 text-slate-800">{p.stock}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(p.id, 1)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 font-bold flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-500">
                      {p.sold} terjual
                    </td>

                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          p.status === 'AKTIF'
                            ? 'bg-emerald-50 text-[#03AC0E] border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.status === 'AKTIF' ? 'Aktif Tayang' : 'Nonaktif'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        aria-label="Hapus produk"
                        title="Hapus Produk"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INCOMING ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Manajemen Pengiriman Pesanan</h3>
              <p className="text-xs text-slate-500">
                Proses barang pesanan pembeli dan buat nomor resi kurir otomatis
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'PERLU_DIPROSES', 'SEDANG_DIKIRIM', 'SELESAI'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? 'Semua'
                    : st === 'PERLU_DIPROSES'
                    ? 'Perlu Diproses'
                    : st === 'SEDANG_DIKIRIM'
                    ? 'Sedang Dikirim'
                    : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="border border-slate-200/90 rounded-2xl p-5 hover:border-emerald-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-slate-800">{ord.orderNumber}</span>
                    <span className="text-[11px] text-slate-400">{ord.createdAt}</span>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      ord.status === 'PERLU_DIPROSES'
                        ? 'bg-amber-100 text-amber-800'
                        : ord.status === 'SEDANG_DIKIRIM'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ord.status === 'PERLU_DIPROSES'
                      ? 'Menunggu Diproses'
                      : ord.status === 'SEDANG_DIKIRIM'
                      ? 'Dalam Perjalanan'
                      : 'Pesanan Selesai'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Items */}
                  <div className="md:col-span-6 space-y-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-slate-500">
                            {item.quantity}x • {formatRupiah(item.price)}
                            {item.variant && <span className="ml-1 text-slate-400">({item.variant})</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer & Address */}
                  <div className="md:col-span-3 text-xs space-y-1">
                    <div className="font-bold text-slate-800">{ord.customerName}</div>
                    <div className="text-slate-400 text-[11px]">{ord.customerPhone}</div>
                    <div className="text-slate-600 line-clamp-2 text-[11px] mt-1">
                      {ord.shippingAddress}
                    </div>
                  </div>

                  {/* Actions & Resi */}
                  <div className="md:col-span-3 flex flex-col items-end gap-2 text-right">
                    <div className="text-xs font-bold text-slate-500">
                      Total: <span className="text-sm font-black text-[#03AC0E]">{formatRupiah(ord.totalAmount)}</span>
                    </div>

                    {ord.trackingNumber && (
                      <div className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Resi: <strong>{ord.trackingNumber}</strong>
                      </div>
                    )}

                    {ord.status === 'PERLU_DIPROSES' && (
                      <button
                        type="button"
                        onClick={() => handleProcessOrder(ord.id)}
                        className="px-4 py-2 bg-[#03AC0E] hover:bg-[#00820A] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Terima & Proses Pesanan
                      </button>
                    )}

                    {ord.status === 'SEDANG_DIKEMAS' && (
                      <button
                        type="button"
                        onClick={() => handleShipOrder(ord.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Kirim & Input Resi
                      </button>
                    )}

                    {ord.status === 'SEDANG_DIKIRIM' && (
                      <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Kurir sedang mengantar
                      </span>
                    )}

                    {ord.status === 'SELESAI' && (
                      <span className="text-[11px] text-[#03AC0E] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dana diteruskan ke saldo toko
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Pengaturan Identitas Toko</h3>
            <p className="text-xs text-slate-500">Ubah informasi toko dan pilihan kurir logistik yang didukung</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerToast('Pengaturan profil toko berhasil diperbarui!');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Toko Resmi</label>
              <input
                type="text"
                value={storeProfile.name}
                onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kota Asal Pengiriman</label>
              <input
                type="text"
                value={storeProfile.city}
                onChange={(e) => setStoreProfile({ ...storeProfile, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Slogan / Deskripsi Singkat</label>
              <textarea
                rows="3"
                value={storeProfile.slogan}
                onChange={(e) => setStoreProfile({ ...storeProfile, slogan: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
              />
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-2">Pilihan Kurir yang Diaktifkan</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={storeProfile.couriers.jne}
                    onChange={(e) =>
                      setStoreProfile({
                        ...storeProfile,
                        couriers: { ...storeProfile.couriers, jne: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-[#03AC0E]"
                  />
                  <span>JNE Express (Reguler & YES)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={storeProfile.couriers.sicepat}
                    onChange={(e) =>
                      setStoreProfile({
                        ...storeProfile,
                        couriers: { ...storeProfile.couriers, sicepat: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-[#03AC0E]"
                  />
                  <span>SiCepat Ekspres (BEST & Halus)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={storeProfile.couriers.gosend}
                    onChange={(e) =>
                      setStoreProfile({
                        ...storeProfile,
                        couriers: { ...storeProfile.couriers, gosend: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-[#03AC0E]"
                  />
                  <span>GoSend & GrabExpress Instant 2 Jam</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#03AC0E] hover:bg-[#00820A] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer mt-4"
            >
              Simpan Pengaturan Toko
            </button>
          </form>
        </div>
      )}

      {/* 5. Add Product Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-[#03AC0E] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Tambah Produk Baru ke Etalase</h3>
                <p className="text-xs text-emerald-100">Katalog TokoNusa Se-Nusantara</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishProduct} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kopi Arabika Gayo Aceh 250gr"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#03AC0E] cursor-pointer font-medium"
                  >
                    {OFFICIAL_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berat Produk (Gram)</label>
                  <input
                    type="number"
                    min="50"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                  />
                </div>
              </div>

              {/* Photo Preset Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Foto Produk (Pilih Cepat Preset Unsplash)
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                        formData.imageUrl === img.url
                          ? 'border-[#03AC0E] ring-2 ring-emerald-300'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
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
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Atau masukkan URL foto kustom..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Produk</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan keunggulan produk Anda..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#03AC0E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#03AC0E] hover:bg-[#00820A] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                Terbitkan ke Etalase Sekarang
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
