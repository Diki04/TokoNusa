import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Database,
  Users,
  Package,
  Activity,
  CheckCircle2,
  ExternalLink,
  Store,
  ShoppingBag,
  RefreshCw,
  Cpu,
  Lock,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Clock,
  Key,
  Globe,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah, formatDate } from '../utils/formatters.js';

export default function AdminDashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'users' | 'catalog' | 'audit'

  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const services = [
    {
      name: 'API Gateway',
      port: 4000,
      protocol: 'HTTP / Express Reverse-Proxy',
      db: 'In-Memory Proxy & Rate Limiter',
      status: 'OPERATIONAL',
      latency: '0.12 ms',
      security: 'Helmet, CORS, Rate Limiter (100 req/min)',
      uptime: '99.98%',
    },
    {
      name: 'Auth Service',
      port: 4001,
      protocol: 'REST / Clean Arch & SOLID',
      db: 'auth.db (SQLite WAL Mode)',
      status: 'OPERATIONAL',
      latency: '0.18 ms',
      security: 'Bcrypt Hashing (8 rounds), JWT HMAC-256',
      uptime: '99.99%',
    },
    {
      name: 'Catalog Service',
      port: 4002,
      protocol: 'REST / Clean Arch & SOLID',
      db: 'catalog.db (SQLite WAL Mode)',
      status: 'OPERATIONAL',
      latency: '0.24 ms',
      security: 'Zod Input Validator, Parameterized Prepared Stmts',
      uptime: '99.99%',
    },
    {
      name: 'Cart Service',
      port: 4003,
      protocol: 'REST / Clean Arch & SOLID',
      db: 'cart.db (SQLite WAL Mode)',
      status: 'OPERATIONAL',
      latency: '0.21 ms',
      security: 'Atomic SQLite Transactions, Header Identity Auth',
      uptime: '99.97%',
    },
    {
      name: 'Order Service',
      port: 4004,
      protocol: 'REST / Clean Arch & SOLID',
      db: 'orders.db (SQLite WAL Mode)',
      status: 'OPERATIONAL',
      latency: '0.26 ms',
      security: 'Finite State Machine, Ownership Assertion',
      uptime: '99.99%',
    },
  ];

  // User management state
  const [registeredUsers, setRegisteredUsers] = useState([
    {
      id: 'user-admin-tokonusa',
      name: 'Administrator TokoNusa',
      email: 'admin@tokonusa.com',
      role: 'ADMIN',
      status: 'Aktif',
      registeredAt: '2026-10-20',
      detail: 'Super Administrator Platform',
    },
    {
      id: 'merchant-ibox-central',
      name: 'iBox Official Store',
      email: 'seller@ibox.co.id',
      role: 'SELLER',
      status: 'Aktif',
      registeredAt: '2026-10-22',
      detail: 'Pedagang Resmi (Official Store)',
    },
    {
      id: 'user-buyer-budi',
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      role: 'BUYER',
      status: 'Aktif',
      registeredAt: '2026-10-25',
      detail: 'Pembeli Terverifikasi (Jakarta Selatan)',
    },
  ]);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Catalog moderation state
  const [catalogItems, setCatalogItems] = useState([
    {
      id: 'prod-iphone-16-pro-max',
      name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Garansi Resmi iBox)',
      category: 'Gadget & Smartphone',
      price: 23999000,
      stock: 45,
      merchant: 'iBox Official Store',
      status: 'TAYANG',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-kopi-gayo-specialty',
      name: 'Kopi Arabika Gayo Aceh Specialty Grade 1 - 250gr Medium Dark Roast',
      category: 'Makanan & Minuman Lokal',
      price: 85000,
      stock: 250,
      merchant: 'Kopi Nusantara Official',
      status: 'TAYANG',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-sony-wh1000xm5',
      name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone Silver',
      category: 'Elektronik & Audio',
      price: 4999000,
      stock: 35,
      merchant: 'Sony Authorized Store',
      status: 'TAYANG',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-batik-keris-parang',
      name: 'Batik Keris Kemeja Pria Lengan Panjang Motif Parang Rusak Barong',
      category: 'Fashion Pria',
      price: 475000,
      stock: 65,
      merchant: 'Batik Keris Official',
      status: 'TAYANG',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-ventela-public-low',
      name: 'Ventela Public Low Black Natural Sepatu Sneakers Pria Wanita Original',
      category: 'Fashion Pria',
      price: 249000,
      stock: 320,
      merchant: 'Ventela Indonesia',
      status: 'TAYANG',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-helm-njs-kairoz',
      name: 'Helm NJS Kairoz GT Solid Half Face Double Visor Glossy Black',
      category: 'Otomotif & Helm',
      price: 680000,
      stock: 80,
      merchant: 'NJS Helmet Store',
      status: 'TAYANG',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-minyak-kayu-putih-cap-lang',
      name: 'Minyak Kayu Putih Cap Lang 210 ml Hangat Alami Original',
      category: 'Hobi & Rumah Tangga',
      price: 52500,
      stock: 400,
      merchant: 'Apotek Sehat Nusantara',
      status: 'TAYANG',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=200&q=80',
    },
  ]);

  // Audit logs state
  const [auditLogs] = useState([
    {
      id: 'LOG-9921',
      event: 'JWT_SIGN_SUCCESS',
      service: 'auth-service:4001',
      details: 'User admin@tokonusa.com issued valid token (role: ADMIN)',
      timestamp: 'Baru saja',
      type: 'INFO',
    },
    {
      id: 'LOG-9920',
      event: 'GATEWAY_PROXY_DISPATCH',
      service: 'api-gateway:4000',
      details: 'GET /api/catalog/products routed to http://localhost:4002 (HTTP 200)',
      timestamp: '1 menit lalu',
      type: 'SUCCESS',
    },
    {
      id: 'LOG-9919',
      event: 'SQLITE_WAL_CHECKPOINT',
      service: 'order-service:4004',
      details: 'WAL checkpoint committed on orders.db, latency: 0.19ms',
      timestamp: '3 menit lalu',
      type: 'SUCCESS',
    },
    {
      id: 'LOG-9918',
      event: 'SECURITY_RATE_LIMITER_PASS',
      service: 'api-gateway:4000',
      details: 'IP 127.0.0.1 within safe limits (14/100 requests per minute)',
      timestamp: '5 menit lalu',
      type: 'INFO',
    },
  ]);

  // User actions
  const handleToggleUserStatus = (userId) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Aktif' ? 'Ditangguhkan' : 'Aktif';
          triggerToast(`Status akun ${u.name} diubah menjadi ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleChangeUserRole = (userId, newRole) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          triggerToast(`Role ${u.name} berhasil diubah menjadi ${newRole}.`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // Catalog actions
  const handleToggleFeatured = (productId) => {
    setCatalogItems((prev) =>
      prev.map((it) => {
        if (it.id === productId) {
          const nextVal = !it.isFeatured;
          triggerToast(
            nextVal
              ? `"${it.name.slice(0, 20)}..." dijadikan Produk Unggulan di Beranda.`
              : `Status unggulan produk dilepas.`
          );
          return { ...it, isFeatured: nextVal };
        }
        return it;
      })
    );
  };

  const handleToggleCatalogStatus = (productId) => {
    setCatalogItems((prev) =>
      prev.map((it) => {
        if (it.id === productId) {
          const nextStatus = it.status === 'TAYANG' ? 'DITANGGUHKAN' : 'TAYANG';
          triggerToast(`Status produk diubah menjadi ${nextStatus}.`);
          return { ...it, status: nextStatus };
        }
        return it;
      })
    );
  };

  const filteredUsers = registeredUsers.filter((u) => {
    const matchSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
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
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>TokoNusa Enterprise Platform Command Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Kendali Administrator
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Selamat datang, <strong className="text-white font-bold">{user?.name || 'Administrator TokoNusa'}</strong>. Arsitektur 5 microservices, 4 database SQLite WAL, dan gateway proxy berjalan optimal.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('seller-center')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Seller Center</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>Storefront Publik</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:border-indigo-300 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#03AC0E] flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Layanan Otonom
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              5 / 5 Online
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Gateway & 4 Microservices
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:border-indigo-300 transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Database SQLite WAL
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              4 Databases
            </div>
            <div className="text-[11px] text-indigo-600 font-bold mt-0.5">
              Database-per-Service Terisolasi
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:border-indigo-300 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              SLA Rata-rata Latensi
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              &lt; 0.25 ms
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              Zero Network Round-trip (WAL)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:border-indigo-300 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Pengguna Terdaftar
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {registeredUsers.length} Akun
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Admin, Seller, & Buyer
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Status Layanan Microservices</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pengguna ({registeredUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Moderasi Katalog ({catalogItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Audit Log & Keamanan</span>
        </button>
      </div>

      {/* 4. Tab Content */}

      {/* TAB 1: MICROSERVICES TELEMETRY */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Peta Infrastruktur Layanan (Service Registry)
              </h2>
              <p className="text-xs text-slate-500">
                Monitoring komunikasi reverse-proxy dari API Gateway (Port 4000) ke 4 microservice otonom
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#03AC0E] text-xs font-bold border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Semua Service Sehat & Berjalan
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Layanan</th>
                  <th className="py-3 px-3">Port</th>
                  <th className="py-3 px-3">Arsitektur & Protokol</th>
                  <th className="py-3 px-3">Penyimpanan Database</th>
                  <th className="py-3 px-3">Latensi SLA</th>
                  <th className="py-3 px-3">Uptime</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((svc) => (
                  <tr key={svc.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        <span>{svc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      :{svc.port}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {svc.protocol}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {svc.db}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600">
                      {svc.latency}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      {svc.uptime}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-[#03AC0E] border border-emerald-200">
                        {svc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama atau email pengguna..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua Role</option>
                <option value="ADMIN">Administrator</option>
                <option value="SELLER">Penjual (Seller)</option>
                <option value="BUYER">Pembeli (Buyer)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Hak Akses Role</th>
                  <th className="py-3 px-3">Tanggal Bergabung</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.detail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'SELLER'
                            ? 'bg-emerald-50 text-[#03AC0E] border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SELLER">SELLER</option>
                        <option value="BUYER">BUYER</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">{u.registeredAt}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-50 text-[#03AC0E]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          u.status === 'Aktif'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-[#03AC0E] hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.status === 'Aktif' ? 'Tangguhkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATALOG MODERATION */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Moderasi Katalog Produk Platform
              </h2>
              <p className="text-xs text-slate-500">
                Atur produk unggulan di halaman utama atau nonaktifkan produk yang melanggar aturan
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total {catalogItems.length} Produk Terdata
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Toko Penjual</th>
                  <th className="py-3 px-3">Harga</th>
                  <th className="py-3 px-3">Unggulan Beranda</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalogItems.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900 max-w-xs line-clamp-1">
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{prod.category}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{prod.merchant}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{formatRupiah(prod.price)}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(prod.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-colors ${
                          prod.isFeatured
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{prod.isFeatured ? 'Unggulan' : 'Standar'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.status === 'TAYANG'
                            ? 'bg-emerald-50 text-[#03AC0E]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleCatalogStatus(prod.id)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        {prod.status === 'TAYANG' ? 'Tangguhkan' : 'Tayangkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Log Transaksi & Jejak Keamanan Sistem
              </h2>
              <p className="text-xs text-slate-500">
                Catatan real-time verifikasi autentikasi JWT, transaksi SQLite, dan firewall gateway
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              Live Stream
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{log.event}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-700">
                        {log.service}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium shrink-0 self-end sm:self-auto">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
