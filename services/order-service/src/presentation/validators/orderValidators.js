import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productImage: z.string().nullable().optional(),
  variantName: z.string().nullable().optional(),
  price: z.number().nonnegative('Price must be greater than or equal to 0'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  subtotal: z.number().nonnegative().optional(),
});

export const createOrderSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  merchantName: z.string().min(1, 'Merchant name is required'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  shippingCourier: z.string().min(1, 'Shipping courier is required'),
  shippingService: z.string().min(1, 'Shipping service is required'),
  shippingCost: z.number().nonnegative('Shipping cost must be non-negative'),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  discountAmount: z.number().nonnegative().optional().default(0),
});

export const simulatePaymentSchema = z.object({
  paymentMethod: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['MENUNGGU_PEMBAYARAN', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'], {
    errorMap: () => ({ message: 'Status must be one of: MENUNGGU_PEMBAYARAN, DIPROSES, DIKIRIM, SELESAI, DIBATALKAN' }),
  }),
  note: z.string().optional(),
});
