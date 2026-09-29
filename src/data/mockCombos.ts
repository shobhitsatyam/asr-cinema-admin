import type { Combo } from '../types';

export const initialCombos: Combo[] = [
  {
    id: 'combo-family',
    name: 'Family Combo',
    items: [
      '2 Medium Popcorn (300 gm)',
      '2 Cold Drinks (350 ml)',
      '2 Cappuccino Coffee'
    ],
    originalPrice: 2290,
    sellingPrice: 1899,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'The ultimate family cinema feast featuring freshly popped buttery popcorn, chilled sodas, and barista cappuccino.',
    badge: 'Bestseller'
  },
  {
    id: 'combo-couple',
    name: 'Couple Combo',
    items: [
      '1 Large Popcorn (350 gm)',
      '2 Cold Drinks'
    ],
    originalPrice: 1199,
    sellingPrice: 999,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Perfect companion for two movie lovers! Jumbo popcorn bucket and two refreshing cold fountain beverages.',
    badge: 'Popular'
  },
  {
    id: 'combo-blockbuster',
    name: 'Blockbuster Gourmet Combo',
    items: [
      '1x Caramel Crunch Popcorn Tub',
      '1x Crispy Chicken Zinger Burger',
      '2x Large Fountain Coca-Cola'
    ],
    originalPrice: 1150,
    sellingPrice: 949,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Hearty meal combo featuring sweet gourmet caramel popcorn, a sizzling zinger burger, and twin colas.',
    badge: 'Chef Special'
  },
  {
    id: 'combo-snack-mania',
    name: 'Snack Mania Trio',
    items: [
      '1x Peri Peri Crinkle French Fries',
      '1x Crispy Chicken Popcorn Basket',
      '2x Chilled Fountain Sprite'
    ],
    originalPrice: 980,
    sellingPrice: 799,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Crispy finger foods paired with chilled sodas, perfect for continuous movie snacking.',
    badge: 'Value Saver'
  }
];
