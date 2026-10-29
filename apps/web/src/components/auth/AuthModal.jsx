import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Store,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onNavigate,
}) {
  const { login, register, isLoading, authError, setAuthError } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('BUYER');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setLocalError('');
      setSuccessNotice('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!loginEmail || !loginPassword) {
      setLocalError('Mohon isi email dan kata sandi.');
      return;
    }

    try {
      const res = await login(loginEmail, loginPassword);
      setSuccessNotice(`Selamat datang, ${res.user?.name || 'Pengguna'}!`);
      setTimeout(() => {
        onClose();
        if (res.user?.role === 'ADMIN' && onNavigate) {
          onNavigate('admin-dashboard');
        }
      }, 700);
    } catch (err) {
      setLocalError(err.message || 'Login gagal. Periksa kembali email dan kata sandi.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!regName || !regEmail || !regPassword) {
      setLocalError('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole,
      });
      setSuccessNotice('Pendaftaran berhasil! Akun Anda siap digunakan.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setLocalError(err.message || 'Pendaftaran gagal. Pastikan email belum terdaftar.');
    }
  };

  const handleQuickDemoLogin = async (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setLocalError('');

    try {
      const res = await login(email, password);
      setSuccessNotice(`Berhasil masuk sebagai ${res.user?.name || email}!`);
      setTimeout(() => {
        onClose();
        if (res.user?.role === 'ADMIN' && onNavigate) {
          onNavigate('admin-dashboard');
        }
      }, 600);
    } catch (err) {
      setLocalError(err.message || 'Login demo gagal.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative animate-scale-in">
        {/* Modal Top Header with Brand */}
        <div className="bg-gradient-to-r from-emerald-600 to-[#03AC0E] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#03AC0E] font-black text-base shadow-xs">
              N
            </div>
            <span className="text-xl font-extrabold tracking-tight">TokoNusa</span>
          </div>
          <h2 className="text-lg font-bold">
            {mode === 'login' ? 'Masuk ke Akun TokoNusa' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            {mode === 'login'
              ? 'Nikmati kemudahan belanja nusantara dengan diskon spesial.'
              : 'Gabung sekarang dan nikmati promo bebas ongkir se-Indonesia.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError('');
            }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-[#03AC0E] text-[#03AC0E] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError('');
            }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'register'
                ? 'border-[#03AC0E] text-[#03AC0E] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        <div className="p-6">
          {/* Notifications */}
          {localError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#03AC0E] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Form Content */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#03AC0E] focus:bg-white focus:ring-2 focus:ring-[#03AC0E]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#03AC0E] focus:bg-white focus:ring-2 focus:ring-[#03AC0E]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan kata sandi"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#03AC0E] hover:bg-[#00820A] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Masuk</span>
                )}
              </button>

              {/* 1-Click Demo Logins Section */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Akses Cepat 1-Klik (Akun Demo)</span>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin@tokonusa.com', 'Password123!')}
                    className="w-full py-2 px-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <div className="text-left">
                        <div className="font-bold">Administrator TokoNusa</div>
                        <div className="text-[10px] text-purple-600 font-normal">admin@tokonusa.com</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-purple-200/80 group-hover:bg-purple-300 px-2 py-0.5 rounded font-bold">
                      Akses Admin &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('seller@ibox.co.id', 'Password123!')}
                    className="w-full py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-600" />
                      <div className="text-left">
                        <div className="font-bold">Official Store (iBox)</div>
                        <div className="text-[10px] text-blue-600 font-normal">seller@ibox.co.id</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-200/80 group-hover:bg-blue-300 px-2 py-0.5 rounded font-bold">
                      Masuk Penjual &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('budi.santoso@gmail.com', 'Password123!')}
                    className="w-full py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#03AC0E]" />
                      <div className="text-left">
                        <div className="font-bold">Pembeli (Budi Santoso)</div>
                        <div className="text-[10px] text-emerald-700 font-normal">budi.santoso@gmail.com</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-200/80 group-hover:bg-emerald-300 px-2 py-0.5 rounded font-bold">
                      Masuk Pembeli &rarr;
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#03AC0E] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="siti@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#03AC0E] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#03AC0E] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#03AC0E] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan kata sandi"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('BUYER')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'BUYER'
                        ? 'border-[#03AC0E] bg-emerald-50 text-[#03AC0E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Pembeli</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('SELLER')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'SELLER'
                        ? 'border-[#03AC0E] bg-emerald-50 text-[#03AC0E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Penjual</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#03AC0E] hover:bg-[#00820A] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
