import { z } from 'zod';

export const addItemSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required').optional(),
    product_id: z.string().min(1).optional(),
    merchantId: z.string().min(1, 'Merchant ID is required').optional(),
    merchant_id: z.string().min(1).optional(),
    merchantName: z.string().min(1, 'Merchant name is required').optional(),
    merchant_name: z.string().min(1).optional(),
    productName: z.string().min(1, 'Product name is required').optional(),
    product_name: z.string().min(1).optional(),
    productImage: z.string().optional().default(''),
    product_image: z.string().optional(),
    variantId: z.string().nullable().optional(),
    variant_id: z.string().nullable().optional(),
    variantName: z.string().nullable().optional(),
    variant_name: z.string().nullable().optional(),
    price: z.number().nonnegative('Price must be non-negative'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').optional().default(1),
    notes: z.string().nullable().optional(),
  })
  .refine((data) => data.productId || data.product_id, {
    message: 'Product ID is required',
    path: ['productId'],
  })
  .refine((data) => data.merchantId || data.merchant_id, {
    message: 'Merchant ID is required',
    path: ['merchantId'],
  })
  .refine((data) => data.merchantName || data.merchant_name, {
    message: 'Merchant name is required',
    path: ['merchantName'],
  })
  .refine((data) => data.productName || data.product_name, {
    message: 'Product name is required',
    path: ['productName'],
  });

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const toggleSelectSchema = z
  .object({
    isSelected: z.boolean().optional(),
    is_selected: z.boolean().optional(),
  })
  .refine((data) => data.isSelected !== undefined || data.is_selected !== undefined, {
    message: 'isSelected or is_selected is required',
    path: ['isSelected'],
  });

export const selectAllSchema = z
  .object({
    isSelected: z.boolean().optional(),
    is_selected: z.boolean().optional(),
  })
  .refine((data) => data.isSelected !== undefined || data.is_selected !== undefined, {
    message: 'isSelected or is_selected is required',
    path: ['isSelected'],
  });
