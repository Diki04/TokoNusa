import React from 'react';
import {
  Smartphone,
  Tv,
  Shirt,
  Coffee,
  Car,
  Home,
  LayoutGrid,
  Laptop,
  Watch,
  Heart,
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
  Laptop,
  Watch,
  Heart,
  Package,
};

const DEFAULT_CATEGORIES = [
  {
    id: 'all',
    name: 'Semua Kategori',
    slug: 'all',
    icon: 'LayoutGrid',
    color: 'bg-emerald-50 text-[#03AC0E]',
  },
  {
    id: 'cat-gadget',
    name: 'Gadget & HP',
    slug: 'gadget-smartphone',
    icon: 'Smartphone',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'cat-elektronik',
    name: 'Elektronik & Audio',
    slug: 'elektronik',
    icon: 'Tv',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'cat-fashion-pria',
    name: 'Fashion Pria',
    slug: 'fashion-pria',
    icon: 'Shirt',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'cat-kuliner',
    name: 'Kuliner Nusantara',
    slug: 'makanan-minuman',
    icon: 'Coffee',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'cat-otomotif',
    name: 'Otomotif',
    slug: 'otomotif',
    icon: 'Car',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'cat-rumah-tangga',
    name: 'Hobi & Rumah',
    slug: 'hobi-rumah-tangga',
    icon: 'Home',
    color: 'bg-teal-50 text-teal-700',
  },
];

export default function CategoryGrid({
  categories = DEFAULT_CATEGORIES,
  selectedCategory = 'all',
  onSelectCategory,
}) {
  // Ensure "Semua" is available if not in list
  const displayList = categories.some((c) => c.id === 'all')
    ? categories
    : [
        {
          id: 'all',
          name: 'Semua Kategori',
          slug: 'all',
          icon: 'LayoutGrid',
          color: 'bg-emerald-50 text-[#03AC0E]',
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
            Temukan produk incaran dari seluruh kategori terlengkap
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
              className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl border transition-all duration-200 text-center group cursor-pointer ${
                isSelected
                  ? 'border-[#03AC0E] bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110 ${
                  cat.color || 'bg-slate-100 text-slate-600'
                }`}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
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
