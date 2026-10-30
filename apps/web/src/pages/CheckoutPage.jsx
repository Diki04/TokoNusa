import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Truck,
  CreditCard,
  Tag,
  ShieldCheck,
  ChevronDown,
  Check,
  ArrowRight,
  ArrowLeft,
  Store,
  QrCode,
  Building2,
  Smartphone,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah } from '../utils/formatters.js';
import {
  groupCartItemsByMerchant,
  isItemSelected,
  AVAILABLE_COURIERS,
  PROMO_VOUCHERS,
  applyVoucher,
} from '../utils/cartUtils.js';
import PaymentModal from '../components/checkout/PaymentModal.jsx';
import apiClient from '../services/apiClient.js';

export default function CheckoutPage({ items: initialItems, onNavigate }) {
  const { items: cartItems, clearCart, removeItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Determine items being checked out
  const checkoutItems = useMemo(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    const selected = cartItems.filter((it) => isItemSelected(it));
    return selected.length > 0 ? selected : cartItems;
  }, [initialItems, cartItems]);

  // Group items by merchant
  const merchantGroups = useMemo(() => {
    return groupCartItemsByMerchant(checkoutItems);
  }, [checkoutItems]);

  // Address state
  const defaultAddresses = [
    {
      id: 'addr-1',
      isPrimary: true,
      label: 'Rumah (Utama)',
      recipient: user?.name || 'Budi Santoso',
      phone: '+62 812-3456-7890',
      addressLine: 'Jl. Jenderal Sudirman Kav. 52-53 No. 45, RT.05/RW.01',
      subdistrict: 'Kebayoran Baru, Jakarta Selatan',
      city: 'DKI Jakarta',
      postalCode: '12190',
    },
    {
      id: 'addr-2',
      isPrimary: false,
      label: 'Kantor',
      recipient: user?.name || 'Budi Santoso',
      phone: '+62 812-3456-7890',
      addressLine: 'Menara TokoNusa Lt. 18, Jl. Gatot Subroto Kav. 12',
      subdistrict: 'Tebet Barat, Jakarta Selatan',
      city: 'DKI Jakarta',
      postalCode: '12870',
    },
  ];

  const [addresses, setAddresses] = useState(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  // Selected address object
  const activeAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  // Courier state (defaults to JNE Reguler)
  const [selectedCourierId, setSelectedCourierId] = useState('jne-reg');
  const activeCourier = useMemo(() => {
    return AVAILABLE_COURIERS.find((c) => c.id === selectedCourierId) || AVAILABLE_COURIERS[0];
  }, [selectedCourierId]);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Payment method state
  const paymentMethods = [
    {
      id: 'QRIS',
      name: 'QRIS (Gopay, OVO, BCA Mobile, Livin, All m-Banking)',
      category: 'Instant QR',
      icon: QrCode,
      badge: 'Instan & Tanpa Biaya',
    },
    {
      id: 'BCA_VA',
      name: 'BCA Virtual Account',
      category: 'Virtual Account',
      icon: Building2,
    },
    {
      id: 'MANDIRI_VA',
      name: 'Mandiri Virtual Account',
      category: 'Virtual Account',
      icon: Building2,
    },
    {
      id: 'BRI_VA',
      name: 'BRI Virtual Account',
      category: 'Virtual Account',
      icon: Building2,
    },
    {
      id: 'GOPAY',
      name: 'GoPay / GoPay Later',
      category: 'E-Wallet',
      icon: Smartphone,
    },
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QRIS');

  // Calculations
  const subtotalProducts = useMemo(() => {
    return checkoutItems.reduce((sum, it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [checkoutItems]);

  const shippingCost = activeCourier.cost;
  const platformFee = 1000;

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    return appliedVoucher.discount || 0;
  }, [appliedVoucher]);

  const grandTotal = Math.max(0, subtotalProducts + shippingCost + platformFee - voucherDiscount);

  // Payment modal state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Handle voucher application
  const handleApplyVoucher = (codeToApply) => {
    const code = (codeToApply || voucherCode).trim();
    if (!code) {
      setVoucherError('Silakan masukkan kode voucher');
      return;
    }

    const result = applyVoucher(code, subtotalProducts, shippingCost);
    if (result.valid) {
      setAppliedVoucher(result);
      setVoucherError('');
      setVoucherCode(code.toUpperCase());
    } else {
      setAppliedVoucher(null);
      setVoucherError(result.message);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  // Handle Create Order
  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const formattedAddress = `${activeAddress.recipient} (${activeAddress.phone}) - ${activeAddress.addressLine}, ${activeAddress.subdistrict}, ${activeAddress.city} ${activeAddress.postalCode}`;

      const payload = {
        merchantId: merchantGroups[0]?.merchantId || 'm-1',
        merchantName: merchantGroups[0]?.merchantName || 'Toko Nusantara Official',
        items: checkoutItems.map((item) => ({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1),
          imageUrl: item.imageUrl,
          variantName: item.variantName,
        })),
        shippingCourier: activeCourier.courier,
        shippingService: activeCourier.service,
        shippingCost: activeCourier.cost,
        shippingAddress: formattedAddress,
        paymentMethod: selectedPaymentMethod,
        totalAmount: subtotalProducts,
        discountAmount: voucherDiscount,
        grandTotal,
      };

      let newOrder = null;

      try {
        if (isAuthenticated) {
          const res = await apiClient.orders.create(payload);
          if (res) newOrder = res;
        }
      } catch (err) {
        console.warn('Backend order creation fallback to simulated order:', err.message);
      }

      if (!newOrder) {
        // Fallback local simulated order
        newOrder = {
          id: `ORD-${Date.now().toString().slice(-8)}`,
          orderNumber: `TKNS-ORD-${Date.now().toString().slice(-8)}`,
          status: 'MENUNGGU_PEMBAYARAN',
          paymentStatus: 'BELUM_DIBAYAR',
          ...payload,
          createdAt: new Date().toISOString(),
        };
      }

      // Save to local orders cache for seamless tracking
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const existing = JSON.parse(window.localStorage.getItem('tokonusa_orders') || '[]');
          window.localStorage.setItem(
            'tokonusa_orders',
            JSON.stringify([newOrder, ...existing.filter((o) => o.id !== newOrder.id)])
          );
        } catch {
          // ignore storage error
        }
      }

      setCreatedOrder(newOrder);
      setIsPaymentModalOpen(true);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (paidOrder) => {
    // Update local storage orders
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const existing = JSON.parse(window.localStorage.getItem('tokonusa_orders') || '[]');
        const updated = existing.map((o) => (o.id === paidOrder.id ? { ...o, ...paidOrder } : o));
        window.localStorage.setItem('tokonusa_orders', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }

    // Remove bought items from cart
    checkoutItems.forEach((it) => removeItem(it.id));

    // Close modal and navigate to orders
    setIsPaymentModalOpen(false);
    if (onNavigate) {
      onNavigate('orders', { newOrderId: paidOrder.id });
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Tidak ada barang untuk checkout</h2>
        <p className="text-sm text-slate-500 mb-6">
          Pilih barang di keranjang belanja Anda terlebih dahulu sebelum melanjutkan checkout.
        </p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('cart')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#03AC0E] text-white rounded-xl font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Keranjang</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 space-y-6">
      {/* Checkout Breadcrumb / Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('cart')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengiriman &amp; Checkout</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Periksa alamat pengiriman dan pilih metode pembayaran favorit Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Alamat Pengiriman */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#03AC0E] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Alamat Pengiriman</h3>
                  <span className="text-[11px] text-slate-400">Pastikan alamat penerima sudah sesuai</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingAddress(!isChangingAddress)}
                className="text-xs font-bold text-[#03AC0E] hover:underline cursor-pointer"
              >
                {isChangingAddress ? 'Selesai' : 'Pilih Alamat Lain'}
              </button>
            </div>

            {/* Address Card */}
            {isChangingAddress ? (
              <div className="space-y-3 pt-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setIsChangingAddress(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedAddressId === addr.id
                        ? 'border-[#03AC0E] bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{addr.label}</span>
                      {addr.isPrimary && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#03AC0E]">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {addr.recipient} • {addr.phone}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {addr.addressLine}, {addr.subdistrict}, {addr.city} {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{activeAddress.recipient}</span>
                  <span className="text-slate-400">({activeAddress.phone})</span>
                  {activeAddress.isPrimary && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-[#03AC0E]">
                      Utama
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {activeAddress.addressLine}, {activeAddress.subdistrict}, {activeAddress.city}{' '}
                  {activeAddress.postalCode}
                </p>
              </div>
            )}
          </div>

          {/* 2. Daftar Pesanan dari Pedagang */}
          <div className="space-y-4">
            {merchantGroups.map((group) => (
              <div
                key={group.merchantId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#03AC0E]" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Pesanan dari {group.merchantName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#03AC0E]">
                      Dikirim dari {group.merchantCity}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 p-4 space-y-3">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between pt-2 first:pt-0">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {item.imageUrl || item.image_url || item.primary_image ? (
                            <img
                              src={item.imageUrl || item.image_url || item.primary_image}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              Foto
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                            {item.productName || item.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {item.quantity} x {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {formatRupiah((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 3. Pilihan Jasa Pengiriman (Kurir) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#03AC0E] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Opsi Kurir Pengiriman
                </h3>
                <span className="text-[11px] text-slate-400">Pilih kecepatan dan tarif pengiriman</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_COURIERS.map((courier) => {
                const isSelected = selectedCourierId === courier.id;
                return (
                  <div
                    key={courier.id}
                    onClick={() => setSelectedCourierId(courier.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#03AC0E] bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                          {courier.courier}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({courier.service})
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#03AC0E]">
                        {formatRupiah(courier.cost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Estimasi {courier.etd}
                      </span>
                      {courier.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {courier.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Pilihan Metode Pembayaran */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#03AC0E] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Metode Pembayaran
                </h3>
                <span className="text-[11px] text-slate-400">
                  Pilih cara bayar yang paling mudah untuk Anda
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {paymentMethods.map((pm) => {
                const isSelected = selectedPaymentMethod === pm.id;
                const Icon = pm.icon;

                return (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPaymentMethod(pm.id)}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#03AC0E] bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#03AC0E] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">{pm.name}</h4>
                          {pm.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#03AC0E]">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{pm.category}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#03AC0E] bg-[#03AC0E]' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Promo Vouchers & Sticky Order Summary */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {/* Kupon Voucher Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#03AC0E]" />
              <h3 className="text-sm font-bold text-slate-900">Voucher &amp; Promo Diskon</h3>
            </div>

            {appliedVoucher ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800">{appliedVoucher.voucher?.code}</span>
                  <p className="text-emerald-600">{appliedVoucher.message}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase());
                      setVoucherError('');
                    }}
                    placeholder="Contoh: DISKON10"
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#03AC0E]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>

                {voucherError && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {voucherError}
                  </p>
                )}

                {/* Voucher suggestions chips */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Kupon Rekomendasi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(PROMO_VOUCHERS).map((v) => (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => handleApplyVoucher(v.code)}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-[#03AC0E] border border-slate-200 transition-colors"
                      >
                        {v.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Pembayaran
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Total Belanja ({checkoutItems.length} produk)</span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(subtotalProducts)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Total Ongkos Kirim ({activeCourier.courier})</span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(shippingCost)}
                </span>
              </div>

              {voucherDiscount > 0 && (
                <div className="flex justify-between text-[#03AC0E]">
                  <span>Diskon Kupon ({appliedVoucher?.voucher?.code})</span>
                  <span className="font-bold">-{formatRupiah(voucherDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan TokoNusa</span>
                <span className="font-semibold text-slate-800">{formatRupiah(platformFee)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
                  <p className="text-[10px] text-slate-400">Pajak PPN 11% sudah termasuk</p>
                </div>
                <div className="text-xl font-black text-[#03AC0E]">
                  {formatRupiah(grandTotal)}
                </div>
              </div>
            </div>

            {/* Bayar CTA */}
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={isCreatingOrder}
              className="w-full py-3.5 bg-gradient-to-r from-[#03AC0E] to-emerald-600 hover:from-[#02930c] hover:to-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCreatingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyiapkan Tagihan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#03AC0E]" />
              <span>Proteksi Belanja Terverifikasi TokoNusa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Interactive Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={createdOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
