/**
 * Formats a number as Indonesian Rupiah (e.g. Rp 1.499.000)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  const num = Math.round(Number(amount) || 0);
  const isNegative = num < 0;
  const absVal = Math.abs(num);
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Calculates discounted price given original price and percentage discount
 * @param {number} originalPrice
 * @param {number} discountPercent
 * @returns {number}
 */
export function calculateDiscountPrice(originalPrice, discountPercent) {
  const orig = Math.max(0, Number(originalPrice) || 0);
  const disc = Number(discountPercent) || 0;
  if (disc <= 0) return orig;
  const discountAmount = Math.round((orig * Math.min(100, disc)) / 100);
  return Math.max(0, orig - discountAmount);
}

/**
 * Formats standard number with Indonesian thousand separators (e.g. 1.250)
 * @param {number|string} num
 * @returns {string}
 */
export function formatNumber(num) {
  const n = Math.round(Number(num) || 0);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formats compact numbers for review counts / sold counts (e.g. 1.2rb, 10rb+)
 * @param {number} count
 * @returns {string}
 */
export function formatCompactCount(count) {
  const n = Number(count) || 0;
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}jt`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}rb`;
  }
  return n.toString();
}

/**
 * Formats date into Indonesian locale standard
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}
