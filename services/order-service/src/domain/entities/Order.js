import crypto from 'node:crypto';
import { ValidationError, DomainError } from '@tokonusa/common';
import { OrderItem } from './OrderItem.js';
import { OrderTimeline } from './OrderTimeline.js';

export const ORDER_STATUS = {
  MENUNGGU_PEMBAYARAN: 'MENUNGGU_PEMBAYARAN',
  DIPROSES: 'DIPROSES',
  DIKIRIM: 'DIKIRIM',
  SELESAI: 'SELESAI',
  DIBATALKAN: 'DIBATALKAN',
};

export const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.MENUNGGU_PEMBAYARAN]: [ORDER_STATUS.DIPROSES, ORDER_STATUS.DIBATALKAN],
  [ORDER_STATUS.DIPROSES]: [ORDER_STATUS.DIKIRIM, ORDER_STATUS.DIBATALKAN],
  [ORDER_STATUS.DIKIRIM]: [ORDER_STATUS.SELESAI],
  [ORDER_STATUS.SELESAI]: [],
  [ORDER_STATUS.DIBATALKAN]: [],
};

export const PAYMENT_STATUS = {
  MENUNGGU_PEMBAYARAN: 'MENUNGGU_PEMBAYARAN',
  SUDAH_DIBAYAR: 'SUDAH_DIBAYAR',
  DIBATALKAN: 'DIBATALKAN',
};

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${dateStr}-${randomHex}`;
}

export class Order {
  constructor({
    id,
    orderNumber,
    order_number,
    userId,
    user_id,
    merchantId,
    merchant_id,
    merchantName,
    merchant_name,
    totalAmount,
    total_amount,
    shippingCost,
    shipping_cost,
    discountAmount = 0,
    discount_amount = 0,
    grandTotal,
    grand_total,
    shippingCourier,
    shipping_courier,
    shippingService,
    shipping_service,
    shippingAddress,
    shipping_address,
    paymentMethod,
    payment_method,
    paymentStatus = PAYMENT_STATUS.MENUNGGU_PEMBAYARAN,
    payment_status = PAYMENT_STATUS.MENUNGGU_PEMBAYARAN,
    status = ORDER_STATUS.MENUNGGU_PEMBAYARAN,
    items = [],
    timeline = [],
    createdAt = new Date().toISOString(),
    created_at,
    updatedAt = new Date().toISOString(),
    updated_at,
  }) {
    const finalUserId = userId || user_id;
    const finalMerchantId = merchantId || merchant_id;
    const finalMerchantName = merchantName || merchant_name;
    const finalOrderNumber = orderNumber || order_number || generateOrderNumber();
    const finalShippingCourier = shippingCourier || shipping_courier;
    const finalShippingService = shippingService || shipping_service;
    const finalShippingAddress = shippingAddress || shipping_address;
    const finalPaymentMethod = paymentMethod || payment_method;
    const finalPaymentStatus = paymentStatus || payment_status;
    const finalDiscount = Number(discountAmount !== undefined ? discountAmount : discount_amount) || 0;
    const finalShippingCost = Number(shippingCost !== undefined ? shippingCost : shipping_cost) || 0;
    const finalTotalAmount = Number(totalAmount !== undefined ? totalAmount : total_amount);
    const finalGrandTotal = Number(grandTotal !== undefined ? grandTotal : grand_total);
    const finalCreatedAt = createdAt || created_at || new Date().toISOString();
    const finalUpdatedAt = updatedAt || updated_at || finalCreatedAt;

    if (!finalUserId || typeof finalUserId !== 'string' || finalUserId.trim().length === 0) {
      throw new ValidationError('User ID is required');
    }
    if (!finalMerchantId || typeof finalMerchantId !== 'string' || finalMerchantId.trim().length === 0) {
      throw new ValidationError('Merchant ID is required');
    }
    if (!finalMerchantName || typeof finalMerchantName !== 'string' || finalMerchantName.trim().length === 0) {
      throw new ValidationError('Merchant name is required');
    }
    if (!finalShippingCourier || typeof finalShippingCourier !== 'string' || finalShippingCourier.trim().length === 0) {
      throw new ValidationError('Shipping courier is required');
    }
    if (!finalShippingService || typeof finalShippingService !== 'string' || finalShippingService.trim().length === 0) {
      throw new ValidationError('Shipping service is required');
    }
    if (!finalShippingAddress || typeof finalShippingAddress !== 'string' || finalShippingAddress.trim().length === 0) {
      throw new ValidationError('Shipping address is required');
    }
    if (!finalPaymentMethod || typeof finalPaymentMethod !== 'string' || finalPaymentMethod.trim().length === 0) {
      throw new ValidationError('Payment method is required');
    }

    this.id = id || crypto.randomUUID();
    this.orderNumber = finalOrderNumber;
    this.userId = finalUserId.trim();
    this.merchantId = finalMerchantId.trim();
    this.merchantName = finalMerchantName.trim();
    this.shippingCourier = finalShippingCourier.trim();
    this.shippingService = finalShippingService.trim();
    this.shippingAddress = finalShippingAddress.trim();
    this.paymentMethod = finalPaymentMethod.trim();
    this.paymentStatus = finalPaymentStatus;
    this.status = status;
    this.shippingCost = Math.round(finalShippingCost);
    this.discountAmount = Math.round(finalDiscount);
    this.createdAt = finalCreatedAt;
    this.updatedAt = finalUpdatedAt;

    // Convert items if raw objects
    this.items = (items || []).map(item => {
      if (item instanceof OrderItem) {
        if (!item.orderId) item.orderId = this.id;
        return item;
      }
      return new OrderItem({ ...item, orderId: this.id });
    });

    // Compute totalAmount and grandTotal if not provided
    if (!isNaN(finalTotalAmount) && finalTotalAmount > 0) {
      this.totalAmount = Math.round(finalTotalAmount);
    } else {
      this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    if (!isNaN(finalGrandTotal) && finalGrandTotal > 0) {
      this.grandTotal = Math.round(finalGrandTotal);
    } else {
      this.grandTotal = Math.max(0, this.totalAmount + this.shippingCost - this.discountAmount);
    }

    // Convert timeline if raw objects
    this.timeline = (timeline || []).map(t => {
      if (t instanceof OrderTimeline) {
        if (!t.orderId) t.orderId = this.id;
        return t;
      }
      return new OrderTimeline({ ...t, orderId: this.id });
    });

    // If newly created order without timeline, add initial entry
    if (this.timeline.length === 0) {
      this.timeline.push(
        new OrderTimeline({
          orderId: this.id,
          status: this.status,
          title: 'Pesanan Dibuat',
          description: `Pesanan telah berhasil dibuat dengan metode pembayaran ${this.paymentMethod}. Menunggu pembayaran.`,
          timestamp: this.createdAt,
        })
      );
    }
  }

  markPaid(paymentMethod = null) {
    if (this.status !== ORDER_STATUS.MENUNGGU_PEMBAYARAN) {
      if (this.status === ORDER_STATUS.DIPROSES) {
        return; // Idempotent
      }
      throw new DomainError(`Cannot pay for order with status ${this.status}`, 'INVALID_STATE_TRANSITION');
    }

    if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod.trim().length > 0) {
      this.paymentMethod = paymentMethod.trim();
    }

    this.paymentStatus = PAYMENT_STATUS.SUDAH_DIBAYAR;
    this.status = ORDER_STATUS.DIPROSES;
    this.updatedAt = new Date().toISOString();

    const timelineEntry = new OrderTimeline({
      orderId: this.id,
      status: ORDER_STATUS.DIPROSES,
      title: 'Pembayaran Diterima',
      description: `Pembayaran via ${this.paymentMethod} telah berhasil diverifikasi. Penjual sedang memproses pesanan.`,
      timestamp: this.updatedAt,
    });
    this.timeline.push(timelineEntry);
    return timelineEntry;
  }

  updateStatus(newStatus, note = null) {
    const validStatuses = Object.values(ORDER_STATUS);
    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError(`Invalid order status: ${newStatus}`);
    }

    if (this.status === newStatus) {
      return null;
    }

    const allowed = ALLOWED_TRANSITIONS[this.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new DomainError(
        `Transisi status tidak valid dari ${this.status} ke ${newStatus}`,
        'INVALID_STATE_TRANSITION'
      );
    }

    this.status = newStatus;
    this.updatedAt = new Date().toISOString();

    let title = `Status Diperbarui: ${newStatus}`;
    let description = note || `Status pesanan diubah menjadi ${newStatus}`;

    if (newStatus === ORDER_STATUS.DIPROSES) {
      title = 'Pesanan Diproses';
      description = note || 'Penjual sedang menyiapkan pesanan Anda.';
    } else if (newStatus === ORDER_STATUS.DIKIRIM) {
      title = 'Pesanan Dikirim';
      description = note || `Pesanan telah diserahkan kepada kurir ${this.shippingCourier} (${this.shippingService}).`;
    } else if (newStatus === ORDER_STATUS.SELESAI) {
      title = 'Pesanan Selesai';
      description = note || 'Pesanan telah diterima oleh pembeli. Transaksi selesai.';
    } else if (newStatus === ORDER_STATUS.DIBATALKAN) {
      title = 'Pesanan Dibatalkan';
      description = note || 'Pesanan telah dibatalkan.';
      this.paymentStatus = PAYMENT_STATUS.DIBATALKAN;
    }

    const timelineEntry = new OrderTimeline({
      orderId: this.id,
      status: newStatus,
      title,
      description,
      timestamp: this.updatedAt,
    });

    this.timeline.push(timelineEntry);
    return timelineEntry;
  }

  toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      userId: this.userId,
      merchantId: this.merchantId,
      merchantName: this.merchantName,
      totalAmount: this.totalAmount,
      shippingCost: this.shippingCost,
      discountAmount: this.discountAmount,
      grandTotal: this.grandTotal,
      shippingCourier: this.shippingCourier,
      shippingService: this.shippingService,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      status: this.status,
      items: this.items.map(item => item.toJSON()),
      timeline: this.timeline.map(t => t.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
