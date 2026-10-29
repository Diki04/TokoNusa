import { describe, it, expect } from 'vitest';
import {
  calculateCartGrandTotal,
  groupCartItemsByMerchant,
  isItemSelected,
  applyVoucher,
  AVAILABLE_COURIERS,
  PROMO_VOUCHERS,
} from '../apps/web/src/utils/cartUtils.js';

describe('Cart & Checkout Utils', () => {
  it('calculates total only for selected items', () => {
    const items = [
      { price: 100000, quantity: 2, is_selected: 1 },
      { price: 50000, quantity: 1, is_selected: 0 },
    ];
    expect(calculateCartGrandTotal(items)).toBe(200000);
  });

  it('groups cart items by merchant accurately', () => {
    const items = [
      { merchant_id: 'm1', merchant_name: 'iBox', price: 20000, quantity: 1 },
      { merchant_id: 'm2', merchant_name: 'Batik Solo', price: 15000, quantity: 2 },
      { merchant_id: 'm1', merchant_name: 'iBox', price: 10000, quantity: 1 },
    ];
    const groups = groupCartItemsByMerchant(items);
    expect(groups.length).toBe(2);
    expect(groups.find(g => g.merchantId === 'm1').items.length).toBe(2);
  });

  it('correctly identifies selected and unselected items across different schema conventions', () => {
    expect(isItemSelected({ is_selected: 1 })).toBe(true);
    expect(isItemSelected({ is_selected: 0 })).toBe(false);
    expect(isItemSelected({ isSelected: true })).toBe(true);
    expect(isItemSelected({ isSelected: false })).toBe(false);
    expect(isItemSelected({ selected: false })).toBe(false);
    expect(isItemSelected({})).toBe(true);
  });

  it('handles edge cases in grand total calculation', () => {
    expect(calculateCartGrandTotal([])).toBe(0);
    expect(calculateCartGrandTotal(null)).toBe(0);
    expect(calculateCartGrandTotal(undefined)).toBe(0);

    const items = [
      { price: '150000', quantity: '2', is_selected: 1 },
      { price: null, quantity: 1, is_selected: 1 },
      { price: 20000, quantity: 0, is_selected: 1 },
    ];
    expect(calculateCartGrandTotal(items)).toBe(300000);
  });

  it('validates promo vouchers and applies correct discounts', () => {
    // 10% discount test
    const resPercent = applyVoucher('DISKON10', 100000, 15000);
    expect(resPercent.valid).toBe(true);
    expect(resPercent.discount).toBe(10000);

    // Free shipping test
    const resShipping = applyVoucher('ONGKIRGRATIS', 100000, 15000);
    expect(resShipping.valid).toBe(true);
    expect(resShipping.discount).toBe(15000);

    // Min spend violation test
    const resUnderSpend = applyVoucher('NUSANTARA50', 50000, 15000);
    expect(resUnderSpend.valid).toBe(false);
    expect(resUnderSpend.discount).toBe(0);

    // Invalid code test
    const resInvalid = applyVoucher('KODETIDAKADA', 100000, 15000);
    expect(resInvalid.valid).toBe(false);
    expect(resInvalid.discount).toBe(0);
  });

  it('provides all mandatory Indonesian couriers with valid shipping rates', () => {
    const courierNames = AVAILABLE_COURIERS.map((c) => c.courier);
    expect(courierNames).toContain('JNE');
    expect(courierNames).toContain('SiCepat');
    expect(courierNames).toContain('GoSend');
    expect(courierNames).toContain('J&T');

    AVAILABLE_COURIERS.forEach((c) => {
      expect(c.cost).toBeGreaterThan(0);
      expect(c.service).toBeDefined();
      expect(c.etd).toBeDefined();
    });
  });
});
