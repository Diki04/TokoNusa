import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Store,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  ChevronRight,
  CreditCard,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatRupiah, formatDate } from '../utils/formatters.js';
import apiClient from '../services/apiClient.js';
import PaymentModal from '../components/checkout/PaymentModal.jsx';
import TrackingModal from '../components/order/TrackingModal.jsx';

const STATUS_TABS = [
  { id: 'ALL', label: 'Semua' },
  { id: 'MENUNGGU_PEMBAYARAN', label: 'Menunggu Pembayaran' },
  { id: 'DIPROSES', label: 'Diproses' },
  { id: 'DIKIRIM', label: 'Dikirim' },
  { id: 'SELESAI', label: 'Selesai' },
  { id: 'DIBATALKAN', label: 'Dibatalkan' },
];

export default function OrderHistoryPage({ onNavigate, newOrderId }) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active modals state
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // Initial seed orders if user has none
  const seedOrders = useMemo(() => [
    {
      id: 'ORD-20261029-7801',
      orderNumber: 'TKNS-ORD-20261029-7801',
      merchantName: 'Batik Danar Hadi Solo',
      merchantCity: 'Surakarta',
      status: 'DIKIRIM',
      paymentStatus: 'SUDAH_DIBAYAR',
      paymentMethod: 'QRIS',
      shippingCourier: 'JNE',
      shippingService: 'Reguler',
      shippingCost: 15000,
      trackingNumber: 'TKNS-JNE-88129034',
      shippingAddress: 'Jl. Jenderal Sudirman Kav. 52-53 No. 45, Kebayoran Baru, Jakarta Selatan',
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      grandTotal: 365000,
      items: [
        {
          productId: 'prod-batik-1',
          productName: 'Kemeja Batik Tulis Sutra Motif Parang Barong Exclusive',
          price: 350000,
          quantity: 1,
          variantName: 'Size XL - Emas',
          imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'ORD-20261028-4420',
      orderNumber: 'TKNS-ORD-20261028-4420',
      merchantName: 'Kopi Nusantara Roastery',
      merchantCity: 'Aceh Tengah',
      status: 'SELESAI',
      paymentStatus: 'SUDAH_DIBAYAR',
      paymentMethod: 'BCA_VA',
      shippingCourier: 'SiCepat',
      shippingService: 'BEST',
      shippingCost: 26000,
      trackingNumber: 'TKNS-SCP-99210948',
      shippingAddress: 'Jl. Jenderal Sudirman Kav. 52-53 No. 45, Kebayoran Baru, Jakarta Selatan',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      grandTotal: 156000,
      items: [
        {
          productId: 'prod-kopi-1',
          productName: 'Kopi Arabika Gayo Aceh Specialty 250gr Beans',
          price: 65000,
          quantity: 2,
          variantName: 'Biji Sangrai (Whole Bean)',
          imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
        },
      ],
    },
  ], []);

  // Fetch orders from API or local storage
  const loadOrders = async () => {
    setIsLoading(true);
    let loadedOrders = [];

    // Check remote backend if logged in
    if (isAuthenticated) {
      try {
        const res = await apiClient.orders.getMyOrders();
        if (Array.isArray(res)) {
          loadedOrders = res;
        } else if (res?.orders && Array.isArray(res.orders)) {
          loadedOrders = res.orders;
        }
      } catch (err) {
        console.warn('Backend orders get error:', err.message);
      }
    }

    // Merge with local storage orders
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const local = JSON.parse(window.localStorage.getItem('tokonusa_orders') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          const map = new Map();
          local.forEach((o) => map.set(o.id, o));
          loadedOrders.forEach((o) => map.set(o.id, o));
          loadedOrders = Array.from(map.values());
        }
      } catch {
        // ignore storage parse error
      }
    }

    // If still empty, seed realistic orders for demonstration
    if (loadedOrders.length === 0) {
      loadedOrders = seedOrders;
    }

    // Sort by createdAt desc
    loadedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setOrders(loadedOrders);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated]);

  // If a new order was passed from checkout, auto open payment modal if pending
  useEffect(() => {
    if (newOrderId && orders.length > 0) {
      const match = orders.find((o) => o.id === newOrderId);
      if (match && match.status === 'MENUNGGU_PEMBAYARAN') {
        setSelectedOrderForPayment(match);
      }
    }
  }, [newOrderId, orders]);

  // Status badge formatter
  const getStatusBadge = (status) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return {
          label: 'Menunggu Pembayaran',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'DIPROSES':
        return {
          label: 'Sedang Diproses',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'DIKIRIM':
        return {
          label: 'Dalam Pengiriman',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'SELESAI':
        return {
          label: 'Selesai',
          bg: 'bg-emerald-50 text-[#03AC0E] border-emerald-200',
          dot: 'bg-[#03AC0E]',
        };
      case 'DIBATALKAN':
        return {
          label: 'Dibatalkan',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status || 'Diproses',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  // Filter orders by active tab and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'ALL' || order.status === activeTab;
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const orderNumMatch = (order.orderNumber || order.id || '').toLowerCase().includes(q);
      const merchantMatch = (order.merchantName || '').toLowerCase().includes(q);
      const itemMatch = (order.items || []).some((it) =>
        (it.productName || it.name || '').toLowerCase().includes(q)
      );

      return orderNumMatch || merchantMatch || itemMatch;
    });
  }, [orders, activeTab, searchQuery]);

  const handlePaymentSuccess = (paidOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === paidOrder.id ? { ...o, ...paidOrder, status: 'DIPROSES' } : o))
    );
    setSelectedOrderForPayment(null);
  };

  const handleBuyAgain = async (item) => {
    await addToCart(item, 1);
    if (onNavigate) {
      onNavigate('cart');
    }
  };

  return (
    <div className="py-4 sm:py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daftar Transaksi Saya</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau status pesanan, pembayaran, dan pelacakan pengiriman kurir.
          </p>
        </div>

        {/* Search inside orders */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi atau produk..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#03AC0E]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#03AC0E] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Belum ada transaksi</h3>
          <p className="text-xs text-slate-500 mb-6">
            {activeTab !== 'ALL'
              ? `Tidak ditemukan pesanan dengan status "${STATUS_TABS.find((t) => t.id === activeTab)?.label}".`
              : 'Mulai belanja sekarang dan temukan produk lokal terbaik Nusantara!'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('home')}
            className="px-6 py-2.5 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const firstItem = order.items?.[0] || {};
            const otherItemsCount = (order.items?.length || 1) - 1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Order Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Store className="w-4 h-4 text-[#03AC0E]" />
                      <span>{order.merchantName || 'Toko Nusantara'}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{formatDate(order.createdAt)}</span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="text-slate-400 font-mono hidden sm:inline">
                      {order.orderNumber || order.id}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Primary Item Preview */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {firstItem.imageUrl || firstItem.image_url || firstItem.primary_image ? (
                      <img
                        src={firstItem.imageUrl || firstItem.image_url || firstItem.primary_image}
                        alt={firstItem.productName}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                      {firstItem.productName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {firstItem.quantity} barang x {formatRupiah(firstItem.price)}
                    </p>
                    {firstItem.variantName && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {firstItem.variantName}
                      </span>
                    )}

                    {otherItemsCount > 0 && (
                      <p className="text-xs font-semibold text-slate-400 mt-2">
                        +{otherItemsCount} produk lainnya
                      </p>
                    )}
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-400">Total Belanja</span>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {formatRupiah(order.grandTotal || order.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Mobile Total Display */}
                <div className="sm:hidden flex items-baseline justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Total Belanja:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatRupiah(order.grandTotal || order.totalAmount)}
                  </span>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Kurir: <strong className="text-slate-700">{order.shippingCourier || 'JNE'}</strong>
                    {order.trackingNumber && (
                      <span className="ml-2 font-mono text-[11px] text-slate-400">
                        ({order.trackingNumber})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pay Now Button if waiting */}
                    {order.status === 'MENUNGGU_PEMBAYARAN' && (
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForPayment(order)}
                        className="px-4 py-2 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar Sekarang</span>
                      </button>
                    )}

                    {/* Tracking Button */}
                    {(order.status === 'DIPROSES' ||
                      order.status === 'DIKIRIM' ||
                      order.status === 'SELESAI') && (
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForTracking(order)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#03AC0E]" />
                        <span>Lacak Pengiriman</span>
                      </button>
                    )}

                    {/* Buy Again button if completed */}
                    {order.status === 'SELESAI' && firstItem && (
                      <button
                        type="button"
                        onClick={() => handleBuyAgain(firstItem)}
                        className="px-4 py-2 border border-[#03AC0E] text-[#03AC0E] hover:bg-emerald-50 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Beli Lagi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={Boolean(selectedOrderForPayment)}
        onClose={() => setSelectedOrderForPayment(null)}
        order={selectedOrderForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Tracking Modal */}
      <TrackingModal
        isOpen={Boolean(selectedOrderForTracking)}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
      />
    </div>
  );
}
