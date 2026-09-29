import type { Coupon } from '../types';

export const initialCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'WELCOME100',
    discountType: 'fixed',
    discountValue: 100,
    minOrder: 499,
    maxDiscount: 100,
    usageLimit: 500,
    usedCount: 238,
    expiry: '2026-12-31',
    status: 'Active',
    description: 'Flat ₹100 instant discount on your first cinema scan-to-order meal'
  },
  {
    id: 'coupon-2',
    code: 'ASR20',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 399,
    maxDiscount: 150,
    usageLimit: 1000,
    usedCount: 684,
    expiry: '2026-11-30',
    status: 'Active',
    description: '20% off up to ₹150 on all food items and combo meals'
  },
  {
    id: 'coupon-3',
    code: 'MOVIETIME',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 599,
    maxDiscount: 200,
    usageLimit: 250,
    usedCount: 194,
    expiry: '2026-10-31',
    status: 'Active',
    description: '15% off weekend special coupon code for blockbuster screenings'
  },
  {
    id: 'coupon-4',
    code: 'POPCORN50',
    discountType: 'fixed',
    discountValue: 50,
    minOrder: 299,
    maxDiscount: 50,
    usageLimit: 300,
    usedCount: 300,
    expiry: '2026-09-15',
    status: 'Expired',
    description: 'Flat ₹50 discount on large popcorn buckets'
  }
];
