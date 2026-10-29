import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters.js';
import apiClient from '../../services/apiClient.js';

export default function PaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes timer
  const [activeTab, setActiveTab] = useState('m-banking');

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || isPaid) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPaid]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsPaid(false);
      setTimeLeft(15 * 60);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const paymentMethod = order.paymentMethod || 'QRIS';
  const orderId = order.id || order.orderNumber || 'ORD-20261029-001';
  const grandTotal = Number(order.grandTotal || order.totalAmount || 0);

  // Generate virtual account number based on order id
  const vaNumber = `8801${(orderId.replace(/\D/g, '') + '928471029471').slice(0, 12)}`;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      let paidOrder = { ...order, status: 'DIPROSES', paymentStatus: 'SUDAH_DIBAYAR' };
      try {
        if (order.id && !order.id.startsWith('local-')) {
          const res = await apiClient.orders.pay(order.id, { paymentMethod });
          if (res) paidOrder = res;
        }
      } catch (err) {
        console.warn('Backend payment call mock fallback:', err.message);
      }

      // Small delay for satisfying UI transition
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsPaid(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(paidOrder);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#03AC0E] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#03AC0E]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Pembayaran TokoNusa</h3>
              <p className="text-xs text-slate-500">Transaksi aman & terenkripsi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Success state */}
          {isPaid ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-[#03AC0E] rounded-full flex items-center justify-center mx-auto animate-bounce-short">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Pembayaran Berhasil!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tagihan sebesar <span className="font-semibold text-slate-700">{formatRupiah(grandTotal)}</span> telah diterima.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">ID Pesanan</span>
                  <span className="font-bold text-slate-800">{orderId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-[#03AC0E] bg-emerald-50 px-2 py-0.5 rounded">
                    DIPROSES PENJUAL
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-[#03AC0E] hover:bg-[#02930c] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Lihat Detail Pesanan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Bill Info Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl p-4 border border-emerald-100/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                      Total Tagihan
                    </span>
                    <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      {formatRupiah(grandTotal)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold text-amber-700 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>{formattedTime}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/50 flex items-center justify-between text-xs text-slate-600">
                  <span>No. Pesanan: <strong className="text-slate-800">{orderId}</strong></span>
                  <button
                    onClick={() => handleCopy(orderId)}
                    className="text-[#03AC0E] font-semibold hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* QRIS Mode */}
              {paymentMethod.toUpperCase().includes('QRIS') && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md mb-3 border border-red-200">
                      <span>QRIS</span>
                      <span className="text-[10px] text-red-500 font-normal">
                        Standar Pembayaran Nasional
                      </span>
                    </div>

                    {/* Realistic SVG QR Matrix */}
                    <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl shadow-inner border border-slate-200 flex items-center justify-center relative">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Background */}
                        <rect width="100" height="100" fill="white" />
                        {/* Corners Position Markers */}
                        {/* Top-Left */}
                        <rect x="5" y="5" width="26" height="26" fill="#1E293B" rx="3" />
                        <rect x="9" y="9" width="18" height="18" fill="white" />
                        <rect x="13" y="13" width="10" height="10" fill="#03AC0E" rx="1" />

                        {/* Top-Right */}
                        <rect x="69" y="5" width="26" height="26" fill="#1E293B" rx="3" />
                        <rect x="73" y="9" width="18" height="18" fill="white" />
                        <rect x="77" y="13" width="10" height="10" fill="#03AC0E" rx="1" />

                        {/* Bottom-Left */}
                        <rect x="5" y="69" width="26" height="26" fill="#1E293B" rx="3" />
                        <rect x="9" y="73" width="18" height="18" fill="white" />
                        <rect x="13" y="77" width="10" height="10" fill="#03AC0E" rx="1" />

                        {/* Center Logo Area */}
                        <circle cx="50" cy="50" r="11" fill="white" stroke="#E2E8F0" strokeWidth="1" />
                        <text
                          x="50"
                          y="53.5"
                          textAnchor="middle"
                          fill="#03AC0E"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          TN
                        </text>

                        {/* QR Matrix Grid Dots */}
                        <rect x="36" y="8" width="5" height="5" fill="#334155" />
                        <rect x="45" y="10" width="5" height="5" fill="#334155" />
                        <rect x="55" y="7" width="6" height="5" fill="#334155" />
                        <rect x="36" y="18" width="5" height="5" fill="#334155" />
                        <rect x="46" y="24" width="6" height="5" fill="#334155" />
                        <rect x="56" y="18" width="6" height="5" fill="#334155" />

                        <rect x="8" y="37" width="5" height="5" fill="#334155" />
                        <rect x="18" y="45" width="5" height="5" fill="#334155" />
                        <rect x="25" y="37" width="5" height="5" fill="#334155" />
                        <rect x="8" y="53" width="6" height="5" fill="#334155" />
                        <rect x="24" y="55" width="5" height="6" fill="#334155" />

                        <rect x="72" y="37" width="6" height="5" fill="#334155" />
                        <rect x="85" y="44" width="5" height="6" fill="#334155" />
                        <rect x="68" y="52" width="6" height="5" fill="#334155" />
                        <rect x="80" y="56" width="6" height="6" fill="#334155" />

                        <rect x="36" y="68" width="5" height="6" fill="#334155" />
                        <rect x="47" y="75" width="6" height="5" fill="#334155" />
                        <rect x="58" y="68" width="5" height="5" fill="#334155" />
                        <rect x="38" y="85" width="6" height="5" fill="#334155" />
                        <rect x="52" y="86" width="6" height="5" fill="#334155" />
                        <rect x="70" y="72" width="5" height="5" fill="#334155" />
                        <rect x="82" y="76" width="6" height="6" fill="#334155" />
                        <rect x="75" y="86" width="5" height="5" fill="#334155" />
                      </svg>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Scan menggunakan GoPay, OVO, ShopeePay, BCA, Mandiri, atau m-Banking Anda.
                    </p>
                  </div>

                  {/* QRIS Instructions */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                    <div className="font-bold text-slate-800">Cara Pembayaran QRIS:</div>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Buka aplikasi mobile banking atau e-wallet pilihan Anda</li>
                      <li>Pilih menu <strong>Scan / Bayar QRIS</strong></li>
                      <li>Arahkan kamera ke QR Code di atas</li>
                      <li>Pastikan nominal tagihan sesuai lalu masukkan PIN transaksi</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Virtual Account Mode */}
              {paymentMethod.toUpperCase().includes('VA') && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Nomor Virtual Account</span>
                      <span className="font-bold text-slate-700">{paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-300">
                      <span className="text-base sm:text-lg font-mono font-bold text-slate-900 tracking-wider">
                        {vaNumber.replace(/(\d{4})/g, '$1 ').trim()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(vaNumber)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  {/* VA Instructions tabs */}
                  <div className="space-y-2">
                    <div className="flex border-b border-slate-200 text-xs font-semibold">
                      <button
                        onClick={() => setActiveTab('m-banking')}
                        className={`pb-2 px-3 border-b-2 transition-colors ${
                          activeTab === 'm-banking'
                            ? 'border-[#03AC0E] text-[#03AC0E]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        m-Banking
                      </button>
                      <button
                        onClick={() => setActiveTab('atm')}
                        className={`pb-2 px-3 border-b-2 transition-colors ${
                          activeTab === 'atm'
                            ? 'border-[#03AC0E] text-[#03AC0E]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ATM
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
                      {activeTab === 'm-banking' ? (
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Buka aplikasi m-Banking dan lakukan Login</li>
                          <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong></li>
                          <li>Masukkan nomor Virtual Account: <strong className="font-mono">{vaNumber}</strong></li>
                          <li>Periksa detail tagihan lalu konfirmasi dengan PIN Anda</li>
                        </ol>
                      ) : (
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Masukkan kartu ATM dan PIN Anda</li>
                          <li>Pilih menu <strong>Transaksi Lainnya &gt; Transfer &gt; ke Rekening VA</strong></li>
                          <li>Masukkan kode VA dan tekan Benar</li>
                          <li>Simpan struk transaksi sebagai bukti pembayaran</li>
                        </ol>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* E-Wallet Mode (GoPay / OVO) */}
              {(paymentMethod.toUpperCase().includes('GOPAY') || paymentMethod.toUpperCase().includes('OVO')) && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full shadow-xs flex items-center justify-center mx-auto text-[#03AC0E]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Pembayaran via {paymentMethod}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik tombol simulasi di bawah untuk otorisasi pembayaran instan.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* Instant Simulator Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-[#03AC0E] to-emerald-600 hover:from-[#02930c] hover:to-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Simulasikan Pembayaran Sukses (Instant Testing)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  TokoNusa Sandbox Simulator • Transaksi langsung terverifikasi otomatis
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
