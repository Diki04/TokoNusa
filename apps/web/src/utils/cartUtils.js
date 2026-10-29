/**
 * TokoNusa Cart & Checkout Utility Functions
 */

/**
 * Checks if a cart item is currently marked as selected
 * @param {Object} item
 * @returns {boolean}
 */
export function isItemSelected(item) {
  if (!item) return false;
  if (item.is_selected !== undefined) {
    return Boolean(item.is_selected && item.is_selected !== 0 && item.is_selected !== '0');
  }
  if (item.isSelected !== undefined) {
    return Boolean(item.isSelected);
  }
  if (item.selected !== undefined) {
    return Boolean(item.selected);
  }
  return true;
}

/**
 * Calculates total price for selected items in the cart
 * @param {Array} items
 * @returns {number}
 */
export function calculateCartGrandTotal(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    if (!item) return total;
    if (isItemSelected(item)) {
      const price = Math.max(0, Number(item.price) || 0);
      const qty = Math.max(0, Number(item.quantity) || 0);
      return total + price * qty;
    }
    return total;
  }, 0);
}

/**
 * Groups cart items by merchant / store
 * @param {Array} items
 * @returns {Array<{ merchantId: string, merchantName: string, merchantCity?: string, items: Array }>}
 */
export function groupCartItemsByMerchant(items) {
  if (!Array.isArray(items)) return [];
  const map = new Map();

  for (const item of items) {
    if (!item) continue;
    const mId = String(item.merchantId || item.merchant_id || 'default-merchant');
    const mName = item.merchantName || item.merchant_name || 'Toko Nusantara Official';
    const mCity = item.merchantCity || item.merchant_city || item.city || 'Jakarta';

    if (!map.has(mId)) {
      map.set(mId, {
        merchantId: mId,
        merchantName: mName,
        merchantCity: mCity,
        items: [],
      });
    }
    map.get(mId).items.push(item);
  }

  return Array.from(map.values());
}

/**
 * Courier shipping options with rates and ETAs
 */
export const AVAILABLE_COURIERS = [
  {
    id: 'jne-reg',
    courier: 'JNE',
    service: 'Reguler',
    cost: 15000,
    etd: '2-3 Hari',
    badge: 'Paling Populer',
  },
  {
    id: 'jne-yes',
    courier: 'JNE',
    service: 'YES (Yakin Esok Sampai)',
    cost: 28000,
    etd: '1 Hari Besok Tiba',
    badge: 'Cepat',
  },
  {
    id: 'sicepat-reg',
    courier: 'SiCepat',
    service: 'Reguler',
    cost: 14000,
    etd: '2-3 Hari',
    badge: 'Hemat',
  },
  {
    id: 'sicepat-best',
    courier: 'SiCepat',
    service: 'BEST (Besok Sampai Tujuan)',
    cost: 26000,
    etd: '1 Hari',
    badge: 'Cepat',
  },
  {
    id: 'gosend-instant',
    courier: 'GoSend',
    service: 'Instant (Maks. 3 Jam)',
    cost: 35000,
    etd: '3 Jam Tiba',
    badge: 'Instant Kilat',
  },
  {
    id: 'gosend-sameday',
    courier: 'GoSend',
    service: 'SameDay (6-8 Jam)',
    cost: 22000,
    etd: 'Hari Ini',
    badge: 'Same Day',
  },
  {
    id: 'jnt-ez',
    courier: 'J&T',
    service: 'EZ (Reguler)',
    cost: 16000,
    etd: '2-3 Hari',
    badge: 'Andalan',
  },
];

/**
 * Standard promo voucher codes and their discounts
 */
export const PROMO_VOUCHERS = {
  DISKON10: {
    code: 'DISKON10',
    name: 'Diskon Belanja 10%',
    type: 'percent',
    value: 10,
    maxDiscount: 50000,
    minSpend: 50000,
    description: 'Potongan 10% s.d. Rp 50.000 dengan min. belanja Rp 50.000',
  },
  ONGKIRGRATIS: {
    code: 'ONGKIRGRATIS',
    name: 'Gratis Ongkir Se-Indonesia',
    type: 'shipping',
    value: 20000,
    minSpend: 30000,
    description: 'Potongan ongkos kirim hingga Rp 20.000',
  },
  NUSANTARA50: {
    code: 'NUSANTARA50',
    name: 'Kupon Nusantara Rp 50rb',
    type: 'fixed',
    value: 50000,
    minSpend: 200000,
    description: 'Potongan Rp 50.000 khusus produk UMKM Nusantara min. belanja Rp 200.000',
  },
  TOKOPROMO: {
    code: 'TOKOPROMO',
    name: 'Promo Pengguna Baru 15%',
    type: 'percent',
    value: 15,
    maxDiscount: 75000,
    minSpend: 50000,
    description: 'Diskon 15% hingga Rp 75.000 untuk semua kategori',
  },
};

/**
 * Validates promo coupon and returns discount amount
 * @param {string} code
 * @param {number} subtotal
 * @param {number} shippingCost
 * @returns {{ valid: boolean, discount: number, message: string, voucher?: Object }}
 */
export function applyVoucher(code, subtotal = 0, shippingCost = 0) {
  if (!code || typeof code !== 'string') {
    return { valid: false, discount: 0, message: 'Kode promo tidak valid' };
  }

  const normalized = code.trim().toUpperCase();
  const voucher = PROMO_VOUCHERS[normalized];

  if (!voucher) {
    return {
      valid: false,
      discount: 0,
      message: `Kode promo "${code}" tidak ditemukan atau telah kedaluwarsa`,
    };
  }

  if (subtotal < (voucher.minSpend || 0)) {
    return {
      valid: false,
      discount: 0,
      message: `Minimal belanja untuk promo ${voucher.code} adalah Rp ${(voucher.minSpend || 0).toLocaleString('id-ID')}`,
    };
  }

  let discount = 0;
  if (voucher.type === 'percent') {
    discount = Math.round((subtotal * voucher.value) / 100);
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else if (voucher.type === 'shipping') {
    discount = Math.min(shippingCost, voucher.value);
  } else if (voucher.type === 'fixed') {
    discount = voucher.value;
  }

  return {
    valid: true,
    discount,
    message: `Promo ${voucher.name} berhasil diterapkan! Hemat Rp ${discount.toLocaleString('id-ID')}`,
    voucher,
  };
}
