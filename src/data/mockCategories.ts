import type { Category } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat-popcorn',
    name: 'Popcorn',
    slug: 'popcorn',
    iconName: 'Popcorn',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop&q=60',
    itemCount: 8,
    isActive: true,
    createdDate: '10 Jan 2026',
    description: 'Freshly popped buttery, caramel, and cheese popcorn buckets'
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    slug: 'beverages',
    iconName: 'CupSoda',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60',
    itemCount: 14,
    isActive: true,
    createdDate: '12 Jan 2026',
    description: 'Chilled soft drinks, iced sodas, and refreshing cinema fountain beverages'
  },
  {
    id: 'cat-food',
    name: 'Food',
    slug: 'food',
    iconName: 'Utensils',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60',
    itemCount: 22,
    isActive: true,
    createdDate: '15 Jan 2026',
    description: 'Gourmet burgers, loaded nachos, hot dogs, and artisan paninis'
  },
  {
    id: 'cat-coffee',
    name: 'Coffee',
    slug: 'coffee',
    iconName: 'Coffee',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=60',
    itemCount: 10,
    isActive: true,
    createdDate: '18 Jan 2026',
    description: 'Freshly brewed espresso, hot cappuccino, and decadent cold frappes'
  },
  {
    id: 'cat-snacks',
    name: 'Snacks',
    slug: 'snacks',
    iconName: 'Cookie',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&auto=format&fit=crop&q=60',
    itemCount: 18,
    isActive: true,
    createdDate: '20 Jan 2026',
    description: 'Crispy crinkle french fries, nuggets, finger foods, and dips'
  },
  {
    id: 'cat-combos',
    name: 'Combos',
    slug: 'combos',
    iconName: 'Layers',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60',
    itemCount: 12,
    isActive: true,
    createdDate: '22 Jan 2026',
    description: 'Value movie meal combos for pairs, groups, and families'
  }
];
