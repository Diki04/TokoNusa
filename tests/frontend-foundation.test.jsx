import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatRupiah,
  calculateDiscountPrice,
  formatNumber,
  formatCompactCount,
  formatDate,
} from '../apps/web/src/utils/formatters.js';
import { apiClient, ApiError } from '../apps/web/src/services/apiClient.js';

describe('Frontend Foundation Utils', () => {
  it('formats Indonesian Rupiah currency accurately', () => {
    expect(formatRupiah(1499000)).toBe('Rp 1.499.000');
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(-25000)).toBe('-Rp 25.000');
  });

  it('calculates discounted price correctly', () => {
    expect(calculateDiscountPrice(100000, 20)).toBe(80000);
    expect(calculateDiscountPrice(50000, 0)).toBe(50000);
    expect(calculateDiscountPrice(200000, 50)).toBe(100000);
  });

  it('formats numbers and compact counts cleanly', () => {
    expect(formatNumber(1500)).toBe('1.500');
    expect(formatNumber(1000000)).toBe('1.000.000');
    expect(formatCompactCount(850)).toBe('850');
    expect(formatCompactCount(1200)).toBe('1.2rb');
    expect(formatCompactCount(2500000)).toBe('2.5jt');
  });

  it('formats Indonesian date strings correctly', () => {
    const fixedDate = new Date('2026-10-29T14:30:00Z');
    const formatted = formatDate(fixedDate);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('WIB');
    expect(formatDate(null)).toBe('-');
  });
});

describe('API Client Foundation', () => {
  beforeEach(() => {
    apiClient.clearToken();
  });

  it('manages authorization token lifecycle', () => {
    expect(apiClient.getToken()).toBeNull();
    apiClient.setToken('test-jwt-token');
    expect(apiClient.getToken()).toBe('test-jwt-token');
    apiClient.clearToken();
    expect(apiClient.getToken()).toBeNull();
  });

  it('constructs ApiError with proper status and error code', () => {
    const err = new ApiError('Product not found', 404, 'NOT_FOUND', { id: 'p-1' });
    expect(err.message).toBe('Product not found');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.details).toEqual({ id: 'p-1' });
    expect(err.name).toBe('ApiError');
  });
});
