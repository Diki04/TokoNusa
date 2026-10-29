import React from 'react';
import {
  Smartphone,
  Tv,
  Shirt,
  Coffee,
  Car,
  Home,
  LayoutGrid,
  Package,
} from 'lucide-react';

const ICON_MAP = {
  Smartphone,
  Tv,
  Shirt,
  Coffee,
  Car,
  Home,
  LayoutGrid,
  Package,
};

export const DEFAULT_CATEGORIES = [
  {
    id: 'all',
    name: 'Semua Kategori',
    slug: 'all',
    icon: 'LayoutGrid',
    color: 'bg-emerald-50 text-[#03AC0E]',
    image_url: null,
  },
  {
    id: 'cat-gadget',
    name: 'Gadget & HP',
    slug: 'gadget-smartphone',
    icon: 'Smartphone',
    color: 'bg-blue-50 text-blue-600',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-elektronik',
    name: 'Elektronik & Audio',
    slug: 'elektronik',
    icon: 'Tv',
    color: 'bg-indigo-50 text-indigo-600',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-fashion-pria',
    name: 'Fashion Pria',
    slug: 'fashion-pria',
    icon: 'Shirt',
    color: 'bg-amber-50 text-amber-700',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-kuliner',
    name: 'Kuliner Nusantara',
    slug: 'makanan-minuman',
    icon: 'Coffee',
    color: 'bg-orange-50 text-orange-600',
    image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-otomotif',
    name: 'Otomotif & Helm',
    slug: 'otomotif',
    icon: 'Car',
    color: 'bg-rose-50 text-rose-600',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-rumah-tangga',
    name: 'Hobi & Rumah',
    slug: 'hobi-rumah-tangga',
    icon: 'Home',
    color: 'bg-teal-50 text-teal-700',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80',
  },
];

export default function CategoryGrid({
  categories = DEFAULT_CATEGORIES,
  selectedCategory = 'all',
  onSelectCategory,
}) {
  // Merge or ensure "Semua Kategori" is available
  const displayList = categories.some((c) => c.id === 'all')
    ? categories
    : [
        {
          id: 'all',
          name: 'Semua Kategori',
          slug: 'all',
          icon: 'LayoutGrid',
          color: 'bg-emerald-50 text-[#03AC0E]',
          image_url: null,
        },
        ...categories,
      ];

  return (
    <section className="mb-10" aria-label="Kategori Pilihan">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            Kategori Pilihan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Temukan produk incaran dari seluruh kategori terlengkap sesuai katalog
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
        {displayList.map((cat) => {
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
          const IconComponent = ICON_MAP[cat.icon] || Package;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id === 'all' ? '' : cat.id)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 text-center group cursor-pointer ${
                isSelected
                  ? 'border-[#03AC0E] bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:scale-105 group-hover:border-emerald-200 transition-all duration-200 relative shrink-0">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      cat.color || 'bg-emerald-50 text-[#03AC0E]'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-semibold line-clamp-1 ${
                  isSelected ? 'text-[#03AC0E]' : 'text-slate-700 group-hover:text-[#03AC0E]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
