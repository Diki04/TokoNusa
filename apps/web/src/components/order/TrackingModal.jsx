import React, { useState } from 'react';
import {
  X,
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function TrackingModal({
  isOpen,
  onClose,
  order,
}) {
  const [copiedResi, setCopiedResi] = useState(false);

  if (!isOpen || !order) return null;

  const courierName = order.shippingCourier || 'JNE';
  const courierService = order.shippingService || 'Reguler';
  const trackingNumber =
    order.trackingNumber ||
    order.resi ||
    `TKNS-${courierName.toUpperCase()}-${String(order.id || '98271034').replace(/\D/g, '').padEnd(10, '8').slice(0, 10)}`;
  const status = order.status || 'DIPROSES';
  const destination = order.shippingAddress || 'Jakarta Selatan, DKI Jakarta';

  const handleCopyResi = () => {
    navigator.clipboard?.writeText(trackingNumber);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  // Generate realistic milestones
  const getMilestones = () => {
    const baseTime = order.createdAt ? new Date(order.createdAt).getTime() : Date.now() - 3600000 * 24;

    const milestones = [
      {
        title: 'Pesanan Selesai Diterima',
        location: 'Alamat Tujuan - Diterima oleh Yang Bersangkutan',
        time: new Date(baseTime + 3600000 * 48),
        completed: status === 'SELESAI',
        current: status === 'SELESAI',
        step: 4,
      },
      {
        title: 'Paket Sedang Diantar ke Alamat Tujuan',
        location: `Hub Pengiriman ${destination.slice(0, 25)}... - Kurir bertugas mengantar`,
        time: new Date(baseTime + 3600000 * 36),
        completed: status === 'SELESAI' || status === 'DIKIRIM',
        current: status === 'DIKIRIM',
        step: 3,
      },
      {
        title: 'Paket Diserahkan ke Kurir & Masuk Sortir Hub',
        location: `Pusat Sortir Logistik ${courierName} Jakarta Pusat`,
        time: new Date(baseTime + 3600000 * 18),
        completed: status === 'SELESAI' || status === 'DIKIRIM',
        current: false,
        step: 2,
      },
      {
        title: 'Penjual Mengemas Pesanan',
        location: order.merchantName || 'Toko Nusantara Partner Hub',
        time: new Date(baseTime + 3600000 * 3),
        completed: status === 'SELESAI' || status === 'DIKIRIM' || status === 'DIPROSES',
        current: status === 'DIPROSES',
        step: 1,
      },
      {
        title: 'Pembayaran Dikonfirmasi',
        location: 'Sistem TokoNusa Payment Gateway',
        time: new Date(baseTime),
        completed: true,
        current: status === 'MENUNGGU_PEMBAYARAN',
        step: 0,
      },
    ];

    return milestones;
  };

  const milestones = getMilestones();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#03AC0E] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Lacak Pengiriman Pesanan
              </h3>
              <p className="text-xs text-slate-500">
                {courierName} • {courierService}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tracking Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nomor Resi / AWB
                </span>
                <div className="text-base font-mono font-bold text-slate-800 tracking-wide mt-0.5">
                  {trackingNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyResi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-colors"
              >
                {copiedResi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResi ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Pengirim:</span>
                <p className="font-semibold text-slate-700 truncate">{order.merchantName || 'TokoNusa Official'}</p>
              </div>
              <div>
                <span className="text-slate-400">Tujuan:</span>
                <p className="font-semibold text-slate-700 truncate">{destination}</p>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Riwayat Perjalanan Paket
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {milestones.map((item, idx) => {
                const isFirst = idx === 0;
                return (
                  <div key={idx} className="relative flex items-start group">
                    {/* Status Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                        item.completed
                          ? 'border-[#03AC0E] text-[#03AC0E] ring-4 ring-emerald-50'
                          : 'border-slate-300 text-slate-300'
                      } ${item.current ? 'bg-[#03AC0E] text-white !border-[#03AC0E]' : ''}`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>

                    {/* Milestone details */}
                    <div className="pl-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            item.current
                              ? 'text-[#03AC0E]'
                              : item.completed
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.current && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-[#03AC0E] rounded-full animate-pulse">
                            Posisi Terkini
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.location}</span>
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(item.time)}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Support Footer */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>Butuh bantuan kurir {courierName}?</span>
            </div>
            <a
              href="tel:1500125"
              className="font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              <span>1500-125</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
