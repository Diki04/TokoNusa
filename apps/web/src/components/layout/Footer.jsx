import React from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pb-20 lg:pb-8 text-slate-600">
      {/* 1. Value Proposition Highlights (Tokopedia-Grade Trust Signals) */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#03AC0E] flex items-center justify-center shrink-0 border border-emerald-100">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bebas Ongkir Se-Nusantara</h4>
                <p className="text-xs text-slate-500 mt-0.5">Pengiriman cepat ke seluruh pelosok Indonesia tanpa batas</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#03AC0E] flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Jaminan 100% Asli</h4>
                <p className="text-xs text-slate-500 mt-0.5">Garansi uang kembali bila produk tidak sesuai pesanan</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#03AC0E] flex items-center justify-center shrink-0 border border-emerald-100">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Retur Mudah & Fleksibel</h4>
                <p className="text-xs text-slate-500 mt-0.5">Layanan pengembalian barang mudah dalam 7 hari kerja</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#03AC0E] flex items-center justify-center shrink-0 border border-emerald-100">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bantuan 24/7 Ramah</h4>
                <p className="text-xs text-slate-500 mt-0.5">Customer service sigap membantu setiap kebutuhan belanja</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Sitemap Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <img
              src="/brand/toko-nusa-horizontal.svg"
              alt="TokoNusa Logo"
              className="h-10 w-auto object-contain"
            />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              TokoNusa adalah platform e-commerce terpercaya nusantara yang menghubungkan jutaan pembeli
              dengan produsen lokal, UMKM unggulan, serta merek terkemuka di seluruh kepulauan Indonesia.
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-800 mb-2">Ikuti Media Sosial TokoNusa:</p>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-[#03AC0E] hover:text-white transition-colors cursor-pointer">
                  IG
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-[#03AC0E] hover:text-white transition-colors cursor-pointer">
                  FB
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-[#03AC0E] hover:text-white transition-colors cursor-pointer">
                  X
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-[#03AC0E] hover:text-white transition-colors cursor-pointer">
                  YT
                </span>
              </div>
            </div>
          </div>

          {/* Links: TokoNusa */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">TokoNusa</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#about" className="hover:text-[#03AC0E] transition-colors">Tentang Kami</a></li>
              <li><a href="#careers" className="hover:text-[#03AC0E] transition-colors">Karir</a></li>
              <li><a href="#blog" className="hover:text-[#03AC0E] transition-colors">Blog TokoNusa</a></li>
              <li><a href="#affiliate" className="hover:text-[#03AC0E] transition-colors">Program Afiliasi</a></li>
              <li><a href="#b2b" className="hover:text-[#03AC0E] transition-colors">TokoNusa B2B</a></li>
            </ul>
          </div>

          {/* Links: Beli */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Beli & Belanja</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#bills" className="hover:text-[#03AC0E] transition-colors">Tagihan & Pulsa</a></li>
              <li><a href="#cod" className="hover:text-[#03AC0E] transition-colors">TokoNusa COD</a></li>
              <li><a href="#free-shipping" className="hover:text-[#03AC0E] transition-colors">Bebas Ongkir Ekstra</a></li>
              <li><a href="#promos" className="hover:text-[#03AC0E] transition-colors">Promo Hari Ini</a></li>
              <li><a href="#flash-sale" className="hover:text-[#03AC0E] transition-colors">Kejar Diskon</a></li>
            </ul>
          </div>

          {/* Links: Seller & Bantuan */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bantuan & Seller</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#seller-center" className="hover:text-[#03AC0E] font-medium transition-colors">Pusat Edukasi Seller</a></li>
              <li><a href="#official-store" className="hover:text-[#03AC0E] transition-colors">Daftar Official Store</a></li>
              <li><a href="#terms" className="hover:text-[#03AC0E] transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#privacy" className="hover:text-[#03AC0E] transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#help" className="hover:text-[#03AC0E] transition-colors">Pusat Bantuan Care</a></li>
            </ul>
          </div>
        </div>

        {/* Payment & Logistics Badges */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700 mr-3">Metode Pembayaran:</span>
            <div className="inline-flex flex-wrap items-center gap-2 mt-2 md:mt-0 font-bold text-[11px] text-slate-600">
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">QRIS</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">BCA VA</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">Mandiri VA</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">GoPay</span>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-700 mr-3">Mitra Pengiriman:</span>
            <div className="inline-flex flex-wrap items-center gap-2 mt-2 md:mt-0 font-bold text-[11px] text-slate-600">
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">JNE</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">SiCepat</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">GoSend</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">J&T</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="bg-slate-50 border-t border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 TokoNusa Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-3">
            <span>Karya Anak Bangsa</span>
            <span>•</span>
            <span className="text-[#03AC0E] font-semibold">TokoNusa Versi 1.0</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
