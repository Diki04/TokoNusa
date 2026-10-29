import { z } from 'zod';

export const queryProductsSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0, 'minPrice must be non-negative').optional(),
  maxPrice: z.coerce.number().min(0, 'maxPrice must be non-negative').optional(),
  rating: z.coerce.number().min(0).max(5, 'rating must be between 0 and 5').optional(),
  sort: z.enum([
    'price_asc',
    'price_desc',
    'rating_desc',
    'rating',
    'popular',
    'sold',
    'latest',
    'newest',
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().int().min(0, 'Price must be non-negative'),
  originalPrice: z.number().int().min(0).optional(),
  original_price: z.number().int().min(0).optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  discount_percent: z.number().int().min(0).max(100).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  category_id: z.string().min(1).optional(),
  merchantId: z.string().optional(),
  merchant_id: z.string().optional(),
  merchantName: z.string().optional(),
  merchant_name: z.string().optional(),
  merchantBadge: z.string().optional(),
  merchant_badge: z.string().optional(),
  city: z.string().optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().optional(),
        image_url: z.string().optional(),
        isPrimary: z.boolean().optional(),
        is_primary: z.boolean().or(z.number()).optional(),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
        type: z.string().optional(),
        priceDelta: z.number().int().optional(),
        price_delta: z.number().int().optional(),
        stock: z.number().int().min(0).optional(),
      })
    )
    .optional(),
}).refine(
  (data) => data.categoryId || data.category_id,
  { message: 'Category ID is required', path: ['categoryId'] }
);

export const addReviewSchema = z.object({
  userName: z.string().min(1, 'User name is required').optional(),
  user_name: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(1, 'Review comment is required'),
}).refine(
  (data) => data.userName || data.user_name,
  { message: 'Reviewer name is required', path: ['userName'] }
);
