import React, { useState, useEffect, useMemo } from 'react';
import HeroCarousel from '../components/home/HeroCarousel.jsx';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import FlashSaleSection from '../components/home/FlashSaleSection.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductFilterSidebar from '../components/product/ProductFilterSidebar.jsx';
import apiClient from '../services/apiClient.js';
import { useCart } from '../context/CartContext.jsx';
import {
  Sparkles,
  ArrowUpDown,
  Search,
  X,
  SlidersHorizontal,
  PackageSearch,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';

const FALLBACK_CATEGORIES = [
  {
    id: 'cat-gadget',
    name: 'Gadget & HP',
    slug: 'gadget-smartphone',
    icon: 'Smartphone',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-elektronik',
    name: 'Elektronik & Audio',
    slug: 'elektronik',
    icon: 'Tv',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-fashion-pria',
    name: 'Fashion Pria',
    slug: 'fashion-pria',
    icon: 'Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-kuliner',
    name: 'Kuliner Nusantara',
    slug: 'makanan-minuman',
    icon: 'Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=300&q=80',
    image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-otomotif',
    name: 'Otomotif & Helm',
    slug: 'otomotif',
    icon: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=80',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-rumah-tangga',
    name: 'Hobi & Rumah',
    slug: 'hobi-rumah-tangga',
    icon: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80',
  },
];

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Garansi Resmi iBox)',
    slug: 'apple-iphone-16-pro-max-256gb-natural-titanium-garansi-resmi-ibox',
    description:
      'iPhone 16 Pro Max. Didesain dengan kekuatan titanium tingkat kedirgantaraan yang ringan dan tangguh. Dilengkapi kontrol kamera intuitif, perekaman video 4K 120 fps Dolby Vision, dan chip A18 Pro terobosan baru dengan efisiensi daya luar biasa.',
    price: 23999000,
    original_price: 25999000,
    discount_percent: 8,
    stock: 45,
    category_id: 'cat-gadget',
    category_name: 'Gadget & HP',
    merchant_id: 'merchant-ibox-central',
    merchant_name: 'iBox Official Store',
    merchant_badge: 'Official Store',
    city: 'Jakarta Pusat',
    rating: 4.9,
    sold_count: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-ip16-1', image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 'img-ip16-2', image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80', is_primary: 0 },
    ],
    variants: [
      { id: 'var-ip16-nat-256', name: 'Natural Titanium 256GB', type: 'WARNA_KAPASITAS', price_delta: 0, stock: 20 },
      { id: 'var-ip16-blk-256', name: 'Black Titanium 256GB', type: 'WARNA_KAPASITAS', price_delta: 0, stock: 15 },
      { id: 'var-ip16-nat-512', name: 'Natural Titanium 512GB', type: 'WARNA_KAPASITAS', price_delta: 4000000, stock: 10 },
    ],
    reviews: [
      { id: 'rev-ip16-1', user_name: 'Reza Pratama', rating: 5, comment: 'Barang original segel resmi iBox greenpeel. Packaging rapi berlapis bubble wrap tebal. Mantap TokoNusa!', created_at: '2026-10-20 10:14:00' },
      { id: 'rev-ip16-2', user_name: 'Dinda Maharani', rating: 5, comment: 'Warna Natural Titanium sangat elegan. Kamera 5x optical zoom tajam sekali. Pengiriman instant sampai 2 jam.', created_at: '2026-10-22 14:30:00' },
    ],
  },
  {
    id: 'prod-kopi-gayo-specialty',
    name: 'Kopi Arabika Gayo Aceh Specialty Grade 1 - 250gr Medium Dark Roast',
    slug: 'kopi-arabika-gayo-aceh-specialty-grade-1-250gr-medium-dark-roast',
    description:
      'Biji kopi Arabika asli dari dataran tinggi Takengon, Aceh Tengah pada ketinggian 1.500 mdpl. Proses semi-washed menghasilkan aroma rempah eksotis, body tebal, tingkat keasaman seimbang, dengan sentuhan dark chocolate dan brown sugar.',
    price: 85000,
    original_price: 100000,
    discount_percent: 15,
    stock: 250,
    category_id: 'cat-kuliner',
    category_name: 'Kuliner Nusantara',
    merchant_id: 'merchant-kopi-nusantara',
    merchant_name: 'Kopi Nusantara Official',
    merchant_badge: 'Official Store',
    city: 'Aceh Tengah',
    rating: 4.9,
    sold_count: 4850,
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-gayo-1', image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 'img-gayo-2', image_url: 'https://images.unsplash.com/photo-1559525839-8f8ec3ed6acb?auto=format&fit=crop&w=800&q=80', is_primary: 0 },
    ],
    variants: [
      { id: 'var-gayo-biji', name: 'Biji Kopi (Whole Beans)', type: 'BENTUK', price_delta: 0, stock: 100 },
      { id: 'var-gayo-halus', name: 'Giling Halus (Espresso)', type: 'BENTUK', price_delta: 0, stock: 80 },
      { id: 'var-gayo-sedang', name: 'Giling Sedang (V60/Manual)', type: 'BENTUK', price_delta: 0, stock: 70 },
    ],
    reviews: [
      { id: 'rev-gayo-1', user_name: 'Bayu Wicaksono', rating: 5, comment: 'Roasting fresh banget, aroma waktu kemasan dibuka langsung semerbak satu ruangan. Rasa fruity dan chocolate pas.', created_at: '2026-10-18 09:12:00' },
      { id: 'rev-gayo-2', user_name: 'Faisal Akbar', rating: 5, comment: 'Langganan kopi Gayo terbaik di TokoNusa. Konsisten mutunya.', created_at: '2026-10-25 11:45:00' },
    ],
  },
  {
    id: 'prod-batik-keris-parang',
    name: 'Batik Keris Kemeja Pria Lengan Panjang Motif Parang Rusak Barong',
    slug: 'batik-keris-kemeja-pria-lengan-panjang-motif-parang-rusak-barong',
    description:
      'Kemeja batik lengan panjang premium karya Batik Keris Solo. Terbuat dari katun primisima 100% dengan lapisan furing katun hero yang adem, halus, dan tidak transparan. Jahitan rapi berpola simetris cocok untuk acara kenegaraan, pesta pernikahan, dan busana formal.',
    price: 475000,
    original_price: 550000,
    discount_percent: 14,
    stock: 65,
    category_id: 'cat-fashion-pria',
    category_name: 'Fashion Pria',
    merchant_id: 'merchant-batik-keris',
    merchant_name: 'Batik Keris Official',
    merchant_badge: 'Official Store',
    city: 'Solo',
    rating: 4.8,
    sold_count: 890,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-batik-1', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-batik-m', name: 'Size M', type: 'UKURAN', price_delta: 0, stock: 20 },
      { id: 'var-batik-l', name: 'Size L', type: 'UKURAN', price_delta: 0, stock: 25 },
      { id: 'var-batik-xl', name: 'Size XL', type: 'UKURAN', price_delta: 0, stock: 20 },
    ],
    reviews: [
      { id: 'rev-batik-1', user_name: 'Hendro Kusumo', rating: 5, comment: 'Motif batik nyambung dan simetris antar saku dan kancing. Kualitas kain halus dan tidak panas.', created_at: '2026-10-15 16:20:00' },
    ],
  },
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone Silver',
    slug: 'sony-wh-1000xm5-wireless-noise-cancelling-headphone-silver',
    description:
      'Headphone wireless noise cancelling terbaik di kelasnya dengan dua prosesor kontrol 8 mikrofon. Driver 30 mm rekayasa presisi menghasilkan kualitas audio beresolusi tinggi (Hi-Res Audio). Baterai tahan hingga 30 jam pemakaian.',
    price: 4999000,
    original_price: 5999000,
    discount_percent: 17,
    stock: 35,
    category_id: 'cat-elektronik',
    category_name: 'Elektronik & Audio',
    merchant_id: 'merchant-sony-center',
    merchant_name: 'Sony Authorized Store',
    merchant_badge: 'Official Store',
    city: 'Jakarta Barat',
    rating: 5.0,
    sold_count: 720,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-sony-1', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-sony-silver', name: 'Platinum Silver', type: 'WARNA', price_delta: 0, stock: 20 },
      { id: 'var-sony-black', name: 'Black Velvet', type: 'WARNA', price_delta: 0, stock: 15 },
    ],
    reviews: [
      { id: 'rev-sony-1', user_name: 'Andre Gunawan', rating: 5, comment: 'Peredam suaranya gila bener-bener senyap pas di pesawat dan kafe. Suara bass empuk dan detail vokal jernih.', created_at: '2026-10-12 11:00:00' },
    ],
  },
  {
    id: 'prod-ventela-public-low',
    name: 'Ventela Public Low Black Natural Sepatu Sneakers Pria Wanita Original',
    slug: 'ventela-public-low-black-natural-sepatu-sneakers-pria-wanita-original',
    description:
      'Sepatu sneakers karya anak bangsa Bandung berbahan Canvas 12oz premium. Dilengkapi insole Ultralite Foam yang sangat empuk dan outsole vulcanized rubber berdaya cengkeram tinggi. Gaya klasik serbaguna untuk kuliah dan hangout.',
    price: 249000,
    original_price: 299000,
    discount_percent: 17,
    stock: 320,
    category_id: 'cat-fashion-pria',
    category_name: 'Fashion Pria',
    merchant_id: 'merchant-ventela-id',
    merchant_name: 'Ventela Indonesia',
    merchant_badge: 'Power Merchant Pro',
    city: 'Bandung',
    rating: 4.8,
    sold_count: 3600,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-ventela-1', image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-ventela-40', name: 'Size 40', type: 'UKURAN', price_delta: 0, stock: 100 },
      { id: 'var-ventela-41', name: 'Size 41', type: 'UKURAN', price_delta: 0, stock: 120 },
      { id: 'var-ventela-42', name: 'Size 42', type: 'UKURAN', price_delta: 0, stock: 100 },
    ],
    reviews: [
      { id: 'rev-ventela-1', user_name: 'Dimas Satria', rating: 5, comment: 'Bangga produk lokal! Insole empuk banget gak bikin pegel dipakai jalan seharian. Jahitan rapi.', created_at: '2026-10-21 08:30:00' },
    ],
  },
  {
    id: 'prod-samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 5G 12GB/512GB Titanium Gray AI Smartphone',
    slug: 'samsung-galaxy-s24-ultra-5g-12gb-512gb-titanium-gray-ai-smartphone',
    description:
      'Era baru Galaxy AI telah hadir. Bodi titanium premium dengan perlindungan Corning Gorilla Armor. Layar Dynamic AMOLED 2X 6.8 inch 120Hz dan kamera 200MP Quad Tele System dengan 100x Space Zoom.',
    price: 21999000,
    original_price: 23999000,
    discount_percent: 9,
    stock: 40,
    category_id: 'cat-gadget',
    category_name: 'Gadget & HP',
    merchant_id: 'merchant-samsung-official',
    merchant_name: 'Samsung Official Store',
    merchant_badge: 'Official Store',
    city: 'Jakarta Pusat',
    rating: 4.9,
    sold_count: 980,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-s24-1', image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-s24-gray-512', name: 'Titanium Gray 512GB', type: 'WARNA_KAPASITAS', price_delta: 0, stock: 20 },
      { id: 'var-s24-blk-512', name: 'Titanium Black 512GB', type: 'WARNA_KAPASITAS', price_delta: 0, stock: 20 },
    ],
    reviews: [
      { id: 'rev-s24-1', user_name: 'Irwan Setiawan', rating: 5, comment: 'Fitur Circle to Search dan live translation sangat membantu pekerjaan. Layar anti pantul mantap sekali di bawah sinar matahari.', created_at: '2026-10-19 13:40:00' },
    ],
  },
  {
    id: 'prod-helm-njs-kairoz',
    name: 'Helm NJS Kairoz GT Solid Half Face Double Visor Glossy Black',
    slug: 'helm-njs-kairoz-gt-solid-half-face-double-visor-glossy-black',
    description:
      'Helm half face modern bersertifikasi SNI dan DOT. Dilengkapi visor smoke tahan gores, fitur slot intercom, ventilasi aerodinamis, dan pengunci microlock berkualitas tinggi.',
    price: 680000,
    original_price: 750000,
    discount_percent: 9,
    stock: 80,
    category_id: 'cat-otomotif',
    category_name: 'Otomotif & Helm',
    merchant_id: 'merchant-njs-official',
    merchant_name: 'NJS Helmet Store',
    merchant_badge: 'Official Store',
    city: 'Tangerang',
    rating: 4.8,
    sold_count: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-helm-1', image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-njs-m', name: 'Ukuran M (57-58 cm)', type: 'UKURAN', price_delta: 0, stock: 30 },
      { id: 'var-njs-l', name: 'Ukuran L (59-60 cm)', type: 'UKURAN', price_delta: 0, stock: 30 },
    ],
    reviews: [
      { id: 'rev-njs-1', user_name: 'Rian Kurniawan', rating: 5, comment: 'Visor jernih banget, fitting pas di kepala tanpa menekan pipi.', created_at: '2026-10-14 08:30:00' },
    ],
  },
  {
    id: 'prod-indomie-goreng-karton',
    name: 'Indomie Mi Goreng Spesial 1 Karton (40 Pcs) Hemat Jumbo',
    slug: 'indomie-mi-goreng-spesial-1-karton-40-pcs-hemat-jumbo',
    description:
      'Mi instan legendaris Indonesia dengan cita rasa bumbu gurih khas, minyak bawang wangi, kecap manis, dan bawang goreng renyah. Paket praktis 1 karton isi 40 bungkus untuk stok keluarga.',
    price: 118000,
    original_price: 130000,
    discount_percent: 9,
    stock: 500,
    category_id: 'cat-kuliner',
    category_name: 'Makanan & Minuman Lokal',
    merchant_id: 'merchant-sembako-jaya',
    merchant_name: 'Sembako Jaya Nusantara',
    merchant_badge: 'Power Merchant Pro',
    city: 'Surabaya',
    rating: 4.9,
    sold_count: 24800,
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-indomie-1', image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-indomie-karton', name: '1 Karton (40 Bungkus)', type: 'KEMASAN', price_delta: 0, stock: 500 },
    ],
    reviews: [
      { id: 'rev-indomie-1', user_name: 'Hendrik Pratama', rating: 5, comment: 'Penyelamat anak kos dan keluarga! Expire date masih lama 1 tahun ke depan. Packing aman pake kardus bawaan.', created_at: '2026-10-24 16:20:00' },
    ],
  },
  {
    id: 'prod-minyak-kayu-putih-cap-lang',
    name: 'Minyak Kayu Putih Cap Lang 210 ml Hangat Alami Original',
    slug: 'minyak-kayu-putih-cap-lang-210-ml-hangat-alami-original',
    description:
      'Minyak Kayu Putih Cap Lang menggunakan minyak kayu putih murni dari daun Melaleuca cajuputi di Maluku. Menghangatkan tubuh keluarga.',
    price: 52500,
    original_price: 60000,
    discount_percent: 13,
    stock: 400,
    category_id: 'cat-rumah-tangga',
    category_name: 'Hobi & Rumah',
    merchant_id: 'merchant-apotek-sehat',
    merchant_name: 'Apotek Sehat Nusantara',
    merchant_badge: 'Official Store',
    city: 'Semarang',
    rating: 4.9,
    sold_count: 18900,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    primary_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    images: [
      { id: 'img-caplang-1', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
    ],
    variants: [
      { id: 'var-caplang-210', name: 'Kemasan 210 ml', type: 'VOLUME', price_delta: 0, stock: 250 },
    ],
    reviews: [
      { id: 'rev-caplang-1', user_name: 'Tri Wahyuni', rating: 5, comment: 'Produk asli dari apotek, botol aman bubble wrap tebal tanpa tumpah.', created_at: '2026-10-23 18:05:00' },
    ],
  },
];

export default function HomePage({
  searchQuery = '',
  initialCategory = '',
  onNavigate,
}) {
  const { addToCart } = useCart();

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedMerchantBadge, setSelectedMerchantBadge] = useState('');
  const [sortBy, setSortBy] = useState('relevant'); // 'relevant' | 'price_asc' | 'price_desc' | 'rating' | 'sold'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Synchronize category if prop changes
  useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch categories and products on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.allSettled([
          apiClient.catalog.getCategories(),
          apiClient.catalog.getProducts(),
        ]);

        if (isMounted) {
          if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) && catsRes.value.length > 0) {
            const normalizedCats = catsRes.value.map((c) => ({
              ...c,
              imageUrl: c.imageUrl || c.image_url,
              image_url: c.image_url || c.imageUrl,
            }));
            setCategories(normalizedCats);
          }
          if (prodsRes.status === 'fulfilled' && prodsRes.value) {
            const rawList = Array.isArray(prodsRes.value)
              ? prodsRes.value
              : prodsRes.value.products || [];
            if (rawList.length > 0) {
              const normalizedProds = rawList.map((p) => {
                const img =
                  p.primary_image ||
                  p.primaryImage ||
                  p.imageUrl ||
                  p.image_url ||
                  p.images?.[0]?.image_url ||
                  p.images?.[0]?.imageUrl ||
                  '';
                return {
                  ...p,
                  imageUrl: img,
                  image_url: img,
                  primary_image: img,
                  primaryImage: img,
                };
              });
              setProducts(normalizedProds);
            }
          }
        }
      } catch (err) {
        console.warn('API fetch warning, using fallback seed catalog:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      setToastMessage(`"${product.name.slice(0, 30)}..." berhasil masuk keranjang!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductClick = (product) => {
    if (onNavigate) {
      onNavigate('product-detail', { productId: product.id, product });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSelectedRating(0);
    setSelectedMerchantBadge('');
  };

  // Filtered & Sorted Product List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(query);
        const matchDesc = p.description?.toLowerCase().includes(query);
        const matchMerchant = p.merchant_name?.toLowerCase().includes(query);
        const matchCity = p.city?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchMerchant && !matchCity) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory && selectedCategory !== 'all') {
        const matchesCat =
          p.category_id === selectedCategory ||
          p.category_slug === selectedCategory ||
          p.category_name?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCat) return false;
      }

      // 3. Price range
      if (priceRange.min !== '' && p.price < Number(priceRange.min)) {
        return false;
      }
      if (priceRange.max !== '' && p.price > Number(priceRange.max)) {
        return false;
      }

      // 4. Rating
      if (selectedRating > 0 && (Number(p.rating) || 0) < selectedRating) {
        return false;
      }

      // 5. Merchant badge
      if (selectedMerchantBadge) {
        if (!p.merchant_badge?.toLowerCase().includes(selectedMerchantBadge.toLowerCase())) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'sold') return (b.sold_count || 0) - (a.sold_count || 0);
      return 0; // 'relevant'
    });
  }, [products, searchQuery, selectedCategory, priceRange, selectedRating, selectedMerchantBadge, sortBy]);

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#03AC0E]" />
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

      {/* 1. Hero Promo Carousel */}
      <HeroCarousel
        onSelectBanner={(banner) => {
          if (banner.category && banner.category !== 'all') {
            setSelectedCategory(banner.category);
          }
        }}
      />

      {/* TokoNusa Value Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 -mt-3 mb-2">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 group hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#03AC0E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">Bebas Ongkir</h4>
            <p className="text-[11px] text-slate-400">Ke seluruh pelosok Nusantara</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 group hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">100% Original</h4>
            <p className="text-[11px] text-slate-400">Jaminan uang kembali jika palsu</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 group hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">Kirim 2 Jam Tiba</h4>
            <p className="text-[11px] text-slate-400">Pengiriman instant & sameday</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 group hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">Pembayaran Aman</h4>
            <p className="text-[11px] text-slate-400">QRIS, VA & proteksi transaksi</p>
          </div>
        </div>
      </div>

      {/* 2. Category Quick Filter Grid */}
      <CategoryGrid
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

      {/* 3. "Kejar Diskon" (Flash Sale) Section */}
      <FlashSaleSection
        products={products.filter((p) => (p.discount_percent || 0) >= 10)}
        onProductClick={handleProductClick}
      />

      {/* 4. Curated Official Store Highlights Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-700 to-[#03AC0E] p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>TokoNusa Official Store & Jaminan 100% Asli</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Belanja Tenang, Pasti Menang
          </h3>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Semua produk berlabel Official Store dilindungi garansi 7 hari pengembalian, proteksi kerusakan pengiriman, dan respon toko super cepat.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedMerchantBadge('Official Store')}
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer shadow-md"
        >
          Lihat Semua Official Store
        </button>
      </div>

      {/* 5. Main Catalog Section with Faceted Sidebar & Product Grid */}
      <section className="pt-4" id="katalog-produk">
        {/* Section Heading & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Katalog Produk TokoNusa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Menampilkan {filteredProducts.length} produk pilihan terbaik dari ribuan merchant terpercaya
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#03AC0E]" />
              <span>Filter</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 hidden sm:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="relevant">Paling Sesuai</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="sold">Penjualan Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(selectedCategory || priceRange.min || priceRange.max || selectedRating > 0 || selectedMerchantBadge || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-slate-400 font-medium">Filter Aktif:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#03AC0E] text-xs font-semibold border border-emerald-200">
                Pencarian: "{searchQuery}"
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#03AC0E] text-xs font-semibold border border-emerald-200">
                Kategori: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                <button type="button" onClick={() => setSelectedCategory('')}>
                  <X className="w-3 h-3 hover:text-emerald-800" />
                </button>
              </span>
            )}

            {(priceRange.min || priceRange.max) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#03AC0E] text-xs font-semibold border border-emerald-200">
                Harga: {priceRange.min ? `Min ${priceRange.min}` : ''} {priceRange.max ? `Max ${priceRange.max}` : ''}
                <button type="button" onClick={() => setPriceRange({ min: '', max: '' })}>
                  <X className="w-3 h-3 hover:text-emerald-800" />
                </button>
              </span>
            )}

            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#03AC0E] text-xs font-semibold border border-emerald-200">
                Rating &gt;= {selectedRating}
                <button type="button" onClick={() => setSelectedRating(0)}>
                  <X className="w-3 h-3 hover:text-emerald-800" />
                </button>
              </span>
            )}

            {selectedMerchantBadge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#03AC0E] text-xs font-semibold border border-emerald-200">
                {selectedMerchantBadge}
                <button type="button" onClick={() => setSelectedMerchantBadge('')}>
                  <X className="w-3 h-3 hover:text-emerald-800" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-600 font-bold hover:underline ml-1 cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>
        )}

        {/* 2-Column Layout: Sidebar Filter + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <ProductFilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
              priceRange={priceRange}
              onApplyPriceRange={(range) => setPriceRange(range)}
              selectedRating={selectedRating}
              onSelectRating={(r) => setSelectedRating(r)}
              selectedMerchantBadge={selectedMerchantBadge}
              onSelectMerchantBadge={(b) => setSelectedMerchantBadge(b)}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Drawer / Collapsible */}
          {isMobileFilterOpen && (
            <div className="lg:hidden col-span-12 mb-4">
              <ProductFilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                  setIsMobileFilterOpen(false);
                }}
                priceRange={priceRange}
                onApplyPriceRange={(range) => {
                  setPriceRange(range);
                  setIsMobileFilterOpen(false);
                }}
                selectedRating={selectedRating}
                onSelectRating={(r) => {
                  setSelectedRating(r);
                  setIsMobileFilterOpen(false);
                }}
                selectedMerchantBadge={selectedMerchantBadge}
                onSelectMerchantBadge={(b) => {
                  setSelectedMerchantBadge(b);
                  setIsMobileFilterOpen(false);
                }}
                onResetFilters={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
              />
            </div>
          )}

          {/* Products Grid (9 cols) */}
          <div className="col-span-12 lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <PackageSearch className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Tidak Ada Produk yang Sesuai
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
                  Coba kurangi filter pencarian atau gunakan kata kunci yang lebih umum untuk menemukan produk yang Anda butuhkan.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#03AC0E] text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-[#02930c] transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
