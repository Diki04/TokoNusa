import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  Store,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  Tv,
  Shirt,
  Coffee,
  Car,
  Home,
  LogOut,
  ShoppingBag,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar({
  searchTerm = '',
  onSearchChange,
  onSearchSubmit,
  onOpenAuthModal,
  onNavigate,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);

  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Synchronize internal search input with prop
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmitInternal = (e) => {
    e?.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    } else if (onNavigate) {
      onNavigate('home', { search: searchInput });
    }
  };

  const handleChipClick = (keyword) => {
    setSearchInput(keyword);
    if (onSearchSubmit) {
      onSearchSubmit(keyword);
    } else if (onNavigate) {
      onNavigate('home', { search: keyword });
    }
  };

  const navigateTo = (page, params = {}) => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsCategoryOpen(false);
    if (onNavigate) {
      onNavigate(page, params);
    }
  };

  const trendingKeywords = [
    'Batik Tulis Solo',
    'Kopi Gayo Aceh',
    'iPhone 16 Pro',
    'Sepatu Sneakers Lokal',
    'Earphone Wireless',
  ];

  const categories = [
    {
      id: 'cat-gadget',
      name: 'Gadget & Smartphone',
      slug: 'gadget-smartphone',
      icon: Smartphone,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=120&q=80',
      sample: 'Apple iPhone 16 Pro, Samsung S24',
    },
    {
      id: 'cat-elektronik',
      name: 'Elektronik & Audio',
      slug: 'elektronik',
      icon: Tv,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
      sample: 'Sony WH-1000XM5 Hi-Res Audio',
    },
    {
      id: 'cat-fashion-pria',
      name: 'Fashion Pria & Batik',
      slug: 'fashion-pria',
      icon: Shirt,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=120&q=80',
      sample: 'Batik Keris Solo, Sneakers Ventela',
    },
    {
      id: 'cat-kuliner',
      name: 'Kuliner Nusantara',
      slug: 'makanan-minuman',
      icon: Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=120&q=80',
      sample: 'Kopi Arabika Gayo, Indomie Spesial',
    },
    {
      id: 'cat-otomotif',
      name: 'Otomotif & Helm',
      slug: 'otomotif',
      icon: Car,
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=120&q=80',
      sample: 'Helm NJS Kairoz Solid Half Face',
    },
    {
      id: 'cat-rumah-tangga',
      name: 'Hobi & Rumah Tangga',
      slug: 'hobi-rumah-tangga',
      icon: Home,
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=120&q=80',
      sample: 'Minyak Kayu Putih Cap Lang 210ml',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Top Utility Header (Desktop Only) */}
      <div className="hidden lg:block bg-slate-50 border-b border-slate-100 text-[12px] text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 hover:text-[#03AC0E] cursor-pointer transition-colors">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              Download TokoNusa App
            </span>
            <span className="text-slate-300">|</span>
            {user?.role === 'ADMIN' ? (
              <span
                onClick={() => navigateTo('admin-dashboard')}
                className="flex items-center gap-1.5 text-purple-700 hover:text-purple-800 cursor-pointer font-bold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Admin Console
              </span>
            ) : (
              <span
                onClick={() => navigateTo('seller-center')}
                className="flex items-center gap-1.5 hover:text-[#03AC0E] cursor-pointer font-medium transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-[#03AC0E]" />
                Mulai Berjualan di TokoNusa
              </span>
            )}
            <span className="text-slate-300">|</span>
            <span className="hover:text-[#03AC0E] cursor-pointer transition-colors">
              Mitra TokoNusa
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1 hover:text-[#03AC0E] cursor-pointer transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              Pusat Bantuan
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-3.5 h-2.5 inline-flex flex-col rounded-[1px] border border-slate-300 overflow-hidden shrink-0">
                <span className="w-full h-1/2 bg-red-600"></span>
                <span className="w-full h-1/2 bg-white"></span>
              </span>
              Indonesia
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 md:gap-6">
          {/* Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            {/* Desktop Brand Logo */}
            <img
              src="/brand/toko-nusa-horizontal.svg"
              alt="TokoNusa"
              className="hidden sm:block h-10 w-auto object-contain hover:opacity-95 transition-opacity"
            />
            {/* Mobile Mark Only */}
            <img
              src="/brand/symbol.svg"
              alt="TokoNusa"
              className="sm:hidden h-9 w-9 object-contain"
            />
          </div>

          {/* Categories Dropdown (Desktop) */}
          <div className="hidden lg:block relative" ref={categoryMenuRef}>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#03AC0E] rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>Kategori</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  isCategoryOpen ? 'rotate-180 text-[#03AC0E]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isCategoryOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-slide-up">
                <div className="px-3.5 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Kategori Pilihan</span>
                  <span className="text-[10px] text-[#03AC0E] font-medium">Sesuai Produk</span>
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => {
                      setIsCategoryOpen(false);
                      navigateTo('home', { category: cat.id });
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#F0FDF4] group flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 bg-slate-50 group-hover:border-[#03AC0E]/50 flex items-center justify-center transition-colors">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : null}
                      <div style={{ display: cat.imageUrl ? 'none' : 'flex' }} className="w-full h-full bg-emerald-50 text-[#03AC0E] items-center justify-center">
                        {cat.icon && <cat.icon className="w-5 h-5" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-[#03AC0E] truncate transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {cat.sample}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Box */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmitInternal} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Cari produk lokal, batik, kopi, gadget..."
                className="w-full pl-10 pr-24 py-2 sm:py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-300 focus:border-[#03AC0E] rounded-lg outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-[#03AC0E] hover:bg-[#00820A] rounded-md transition-colors"
              >
                Cari
              </button>
            </form>

            {/* Trending Chips (Desktop Only) */}
            <div className="hidden xl:flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-semibold text-slate-400">Populer:</span>
              {trendingKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleChipClick(kw)}
                  className="hover:text-[#03AC0E] transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Right Actions: Cart, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Button */}
            <button
              onClick={() => navigateTo('cart')}
              className="relative p-2.5 text-slate-700 hover:text-[#03AC0E] hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-[#E11D48] rounded-full flex items-center justify-center shadow-xs">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Notification Bell (Desktop) */}
            <button
              className="hidden md:flex p-2.5 text-slate-700 hover:text-[#03AC0E] hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

            {/* User Profile / Auth Action */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#03AC0E]/15 text-[#03AC0E] flex items-center justify-center font-bold text-sm border border-[#03AC0E]/20">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.name || 'Pengguna'}
                  </span>
                  <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          user?.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user?.role === 'SELLER'
                            ? 'bg-emerald-50 text-[#03AC0E]'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {user?.role === 'ADMIN'
                          ? 'Administrator TokoNusa'
                          : user?.role === 'SELLER'
                          ? 'Pedagang Official'
                          : 'Pembeli Nusantara'}
                      </span>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => navigateTo('admin-dashboard')}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Console
                      </button>
                    )}

                    <button
                      onClick={() => navigateTo('orders')}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      Pesanan Saya
                    </button>

                    {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => navigateTo('seller-center')}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Store className="w-4 h-4 text-[#03AC0E]" />
                        Seller & Catalog Center
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : navigateTo('login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#03AC0E] border border-[#03AC0E] hover:bg-[#F0FDF4] rounded-lg transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('register') : navigateTo('register')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#03AC0E] hover:bg-[#00820A] rounded-lg shadow-xs transition-colors"
                >
                  Daftar
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <img src="/brand/toko-nusa-horizontal.svg" alt="TokoNusa" className="h-8 w-auto" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User status in drawer */}
            <div className="py-4 border-b border-slate-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#03AC0E]/20 text-[#03AC0E] font-bold flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{user?.name}</h4>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500">Nikmati belanja nyaman dengan akun Anda</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuthModal ? onOpenAuthModal('login') : navigateTo('login');
                      }}
                      className="py-2 text-xs font-bold text-[#03AC0E] border border-[#03AC0E] rounded-lg text-center"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuthModal ? onOpenAuthModal('register') : navigateTo('register');
                      }}
                      className="py-2 text-xs font-bold text-white bg-[#03AC0E] rounded-lg text-center shadow-xs"
                    >
                      Daftar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick links list */}
            <div className="py-4 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kategori Populer
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => navigateTo('home', { category: cat.slug })}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-[#F0FDF4] hover:text-[#03AC0E] rounded-lg transition-colors"
                >
                  <span>{cat.icon && <cat.icon className="w-4 h-4 text-[#03AC0E]" />}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => navigateTo('seller-center')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#03AC0E] bg-emerald-50 rounded-lg"
              >
                <Store className="w-4 h-4" />
                Mulai Berjualan di TokoNusa
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari Akun
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
