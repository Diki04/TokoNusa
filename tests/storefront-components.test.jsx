import { describe, it, expect } from 'vitest';
import { calculateDiscountPrice, formatRupiah } from '../apps/web/src/utils/formatters.js';
import {
  calculateRemainingTime,
  calculateStockPercentage,
} from '../apps/web/src/components/home/FlashSaleSection.jsx';
import { computeVariantPrice } from '../apps/web/src/components/product/VariantSelector.jsx';

describe('Storefront Calculations', () => {
  it('calculates discounted price correctly', () => {
    const discounted = calculateDiscountPrice(100000, 20);
    expect(discounted).toBe(80000);
  });

  it('formats Indonesian marketplace product card details correctly', () => {
    expect(formatRupiah(23999000)).toBe('Rp 23.999.000');
  });

  it('calculates flash sale countdown time remaining accurately', () => {
    const now = Date.now();
    const targetEndTime = new Date(now + (2 * 3600 + 45 * 60 + 15) * 1000).toISOString();
    const remaining = calculateRemainingTime(targetEndTime);

    expect(remaining.hours).toBe(2);
    expect(remaining.minutes).toBe(45);
    expect(remaining.seconds).toBe(15);
    expect(remaining.isEnded).toBe(false);
  });

  it('handles expired flash sale end times gracefully', () => {
    const pastTime = new Date(Date.now() - 5000).toISOString();
    const remaining = calculateRemainingTime(pastTime);

    expect(remaining.hours).toBe(0);
    expect(remaining.minutes).toBe(0);
    expect(remaining.seconds).toBe(0);
    expect(remaining.isEnded).toBe(true);
  });

  it('calculates flash sale stock claimed percentage correctly', () => {
    expect(calculateStockPercentage(30, 100)).toBe(30);
    expect(calculateStockPercentage(95, 100)).toBe(95);
    expect(calculateStockPercentage(150, 100)).toBe(100);
    expect(calculateStockPercentage(0, 50)).toBe(0);
    expect(calculateStockPercentage(10, 0)).toBe(100);
  });

  it('adjusts product price dynamically based on selected variant', () => {
    const basePrice = 23999000;
    const variantNoDelta = { id: 'var-1', name: '256GB', price_delta: 0 };
    const variantWithDelta = { id: 'var-2', name: '512GB', price_delta: 4000000 };

    expect(computeVariantPrice(basePrice, variantNoDelta)).toBe(23999000);
    expect(computeVariantPrice(basePrice, variantWithDelta)).toBe(27999000);
    expect(computeVariantPrice(basePrice, null)).toBe(23999000);
  });
});
