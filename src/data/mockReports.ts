export interface ReportPeriodData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueTrend: { label: string; revenue: number; orders: number }[];
  categorySales: { category: string; amount: number; percentage: number; color: string }[];
  topSellingFoods: { name: string; quantity: number; revenue: number; image: string; category: string }[];
}

export const reportDataMap: Record<'today' | '7days' | '30days' | 'month', ReportPeriodData> = {
  today: {
    totalRevenue: 48650,
    totalOrders: 126,
    avgOrderValue: 386,
    revenueTrend: [
      { label: '11 AM', revenue: 4200, orders: 12 },
      { label: '01 PM', revenue: 8650, orders: 24 },
      { label: '03 PM', revenue: 14200, orders: 36 },
      { label: '05 PM', revenue: 18900, orders: 48 },
      { label: '07 PM', revenue: 31400, orders: 78 },
      { label: '09 PM', revenue: 42100, orders: 108 },
      { label: '11 PM', revenue: 48650, orders: 126 }
    ],
    categorySales: [
      { category: 'Popcorn', amount: 18450, percentage: 38, color: '#E31B23' },
      { category: 'Combos', amount: 15200, percentage: 31, color: '#B5121B' },
      { category: 'Beverages', amount: 7600, percentage: 16, color: '#F59E0B' },
      { category: 'Food & Snacks', amount: 5200, percentage: 11, color: '#3B82F6' },
      { category: 'Coffee', amount: 2200, percentage: 4, color: '#8B5CF6' }
    ],
    topSellingFoods: [
      { name: 'Family Combo', quantity: 24, revenue: 45576, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=60', category: 'Combos' },
      { name: 'Large Salted Popcorn (350 gm)', quantity: 48, revenue: 16320, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Medium Cheese Burst Popcorn', quantity: 36, revenue: 11160, image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Couple Combo', quantity: 18, revenue: 16182, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Combos' },
      { name: 'Fountain Coca-Cola (500 ml)', quantity: 56, revenue: 10640, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=120&auto=format&fit=crop&q=60', category: 'Beverages' },
      { name: 'Artisan Cappuccino', quantity: 22, revenue: 5280, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=120&auto=format&fit=crop&q=60', category: 'Coffee' }
    ]
  },
  '7days': {
    totalRevenue: 342800,
    totalOrders: 890,
    avgOrderValue: 385,
    revenueTrend: [
      { label: 'Mon', revenue: 38400, orders: 98 },
      { label: 'Tue', revenue: 36200, orders: 94 },
      { label: 'Wed', revenue: 41000, orders: 106 },
      { label: 'Thu', revenue: 45800, orders: 118 },
      { label: 'Fri', revenue: 64200, orders: 168 },
      { label: 'Sat', revenue: 68550, orders: 180 },
      { label: 'Sun', revenue: 48650, orders: 126 }
    ],
    categorySales: [
      { category: 'Popcorn', amount: 130260, percentage: 38, color: '#E31B23' },
      { category: 'Combos', amount: 109690, percentage: 32, color: '#B5121B' },
      { category: 'Beverages', amount: 51420, percentage: 15, color: '#F59E0B' },
      { category: 'Food & Snacks', amount: 37700, percentage: 11, color: '#3B82F6' },
      { category: 'Coffee', amount: 13730, percentage: 4, color: '#8B5CF6' }
    ],
    topSellingFoods: [
      { name: 'Large Salted Popcorn (350 gm)', quantity: 380, revenue: 129200, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Family Combo', quantity: 154, revenue: 292446, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=60', category: 'Combos' },
      { name: 'Medium Cheese Burst Popcorn', quantity: 245, revenue: 75950, image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Fountain Coca-Cola (500 ml)', quantity: 420, revenue: 79800, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=120&auto=format&fit=crop&q=60', category: 'Beverages' },
      { name: 'Couple Combo', quantity: 130, revenue: 116870, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Combos' }
    ]
  },
  '30days': {
    totalRevenue: 1485600,
    totalOrders: 3850,
    avgOrderValue: 386,
    revenueTrend: [
      { label: 'Week 1', revenue: 320000, orders: 840 },
      { label: 'Week 2', revenue: 365000, orders: 940 },
      { label: 'Week 3', revenue: 412000, orders: 1080 },
      { label: 'Week 4', revenue: 388600, orders: 990 }
    ],
    categorySales: [
      { category: 'Popcorn', amount: 564500, percentage: 38, color: '#E31B23' },
      { category: 'Combos', amount: 475300, percentage: 32, color: '#B5121B' },
      { category: 'Beverages', amount: 222800, percentage: 15, color: '#F59E0B' },
      { category: 'Food & Snacks', amount: 163400, percentage: 11, color: '#3B82F6' },
      { category: 'Coffee', amount: 59600, percentage: 4, color: '#8B5CF6' }
    ],
    topSellingFoods: [
      { name: 'Large Salted Popcorn (350 gm)', quantity: 1620, revenue: 550800, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Family Combo', quantity: 640, revenue: 1215360, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=60', category: 'Combos' },
      { name: 'Medium Cheese Burst Popcorn', quantity: 980, revenue: 303800, image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Couple Combo', quantity: 510, revenue: 458490, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Combos' }
    ]
  },
  month: {
    totalRevenue: 1542000,
    totalOrders: 3980,
    avgOrderValue: 387,
    revenueTrend: [
      { label: 'Wk 1', revenue: 350000, orders: 900 },
      { label: 'Wk 2', revenue: 380000, orders: 980 },
      { label: 'Wk 3', revenue: 410000, orders: 1060 },
      { label: 'Wk 4', revenue: 402000, orders: 1040 }
    ],
    categorySales: [
      { category: 'Popcorn', amount: 585960, percentage: 38, color: '#E31B23' },
      { category: 'Combos', amount: 493440, percentage: 32, color: '#B5121B' },
      { category: 'Beverages', amount: 231300, percentage: 15, color: '#F59E0B' },
      { category: 'Food & Snacks', amount: 169620, percentage: 11, color: '#3B82F6' },
      { category: 'Coffee', amount: 61680, percentage: 4, color: '#8B5CF6' }
    ],
    topSellingFoods: [
      { name: 'Large Salted Popcorn (350 gm)', quantity: 1710, revenue: 581400, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=60', category: 'Popcorn' },
      { name: 'Family Combo', quantity: 680, revenue: 1291320, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=60', category: 'Combos' }
    ]
  }
};
