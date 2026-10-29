import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import MobileBottomNav from './components/layout/MobileBottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import SellerDashboardPage from './pages/SellerDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import { ArrowLeft } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [orderTrackingId, setOrderTrackingId] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  const handleNavigate = (page, params = {}) => {
    // Handle mobile nav redirects
    if (page === 'account') {
      page = 'orders';
    } else if (page === 'categories') {
      page = 'home';
    }

    setCurrentPage(page);

    if (params.search !== undefined) {
      setSearchQuery(params.search);
    }
    if (params.category !== undefined) {
      setCategoryFilter(params.category);
    }
    if (params.productId !== undefined) {
      setSelectedProductId(params.productId);
    }
    if (params.product !== undefined) {
      setSelectedProduct(params.product);
    }
    if (params.items !== undefined) {
      setCheckoutItems(params.items);
    }
    if (params.newOrderId !== undefined) {
      setOrderTrackingId(params.newOrderId);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(term) => {
          setSearchQuery(term);
          handleNavigate('home', { search: term });
        }}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
        {currentPage === 'home' && (
          <HomePage
            searchQuery={searchQuery}
            initialCategory={categoryFilter}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            initialProduct={selectedProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            items={checkoutItems}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'orders' && (
          <OrderHistoryPage
            newOrderId={orderTrackingId}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'seller-center' && (
          <SellerDashboardPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboardPage onNavigate={handleNavigate} />
        )}

        {currentPage !== 'home' &&
          currentPage !== 'product-detail' &&
          currentPage !== 'cart' &&
          currentPage !== 'checkout' &&
          currentPage !== 'orders' &&
          currentPage !== 'seller-center' &&
          currentPage !== 'admin-dashboard' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 mb-2 capitalize">
                Halaman {currentPage}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Halaman yang Anda tuju sedang dalam pengembangan.
              </p>
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#03AC0E] text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>
          )}
      </main>

      <Footer />

      <MobileBottomNav
        activeTab={currentPage}
        onSelectTab={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
