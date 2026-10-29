import React from 'react';
import { Home, Compass, ShoppingCart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MobileBottomNav({ activeTab = 'home', onSelectTab }) {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'categories', label: 'Eksplor', icon: Compass },
    { id: 'cart', label: 'Keranjang', icon: ShoppingCart, badge: itemCount },
    { id: 'orders', label: 'Transaksi', icon: ShoppingBag },
    { id: 'account', label: isAuthenticated ? 'Akun' : 'Masuk', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg safe-area-pb">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab && onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-[#03AC0E]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8px]'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-[#E11D48] rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-tight font-medium ${
                  isActive ? 'font-bold text-[#03AC0E]' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
