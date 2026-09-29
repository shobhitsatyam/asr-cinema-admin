import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Flame } from 'lucide-react';

export const PopularItems: React.FC = () => {
  const popularList = [
    {
      name: 'Large Salted Popcorn (350 gm)',
      ordersCount: 48,
      revenue: 16320,
      image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=80',
      category: 'Popcorn'
    },
    {
      name: 'Family Combo',
      ordersCount: 24,
      revenue: 45576,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=80',
      category: 'Combos'
    },
    {
      name: 'Couple Combo',
      ordersCount: 18,
      revenue: 16182,
      image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&auto=format&fit=crop&q=80',
      category: 'Combos'
    },
    {
      name: 'Fountain Coca-Cola (500 ml)',
      ordersCount: 56,
      revenue: 10640,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=120&auto=format&fit=crop&q=80',
      category: 'Beverages'
    },
    {
      name: 'Artisan Cappuccino',
      ordersCount: 22,
      revenue: 5280,
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=120&auto=format&fit=crop&q=80',
      category: 'Coffee'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {popularList.map((item, idx) => (
        <div
          key={item.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FAFAFB',
            transition: 'transform var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-brand)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                width: 18
              }}
            >
              #{idx + 1}
            </span>

            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid var(--color-border-subtle)'
              }}
            />

            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: 'var(--color-text-main)',
                  lineHeight: 1.2
                }}
              >
                {item.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-text-muted)',
                    backgroundColor: '#EAEAEF',
                    padding: '1px 6px',
                    borderRadius: 4
                  }}
                >
                  {item.category}
                </span>
                <span style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
                  {item.ordersCount} sold
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-brand)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--color-text-main)'
              }}
            >
              {formatCurrency(item.revenue)}
            </div>
            {idx === 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.68rem',
                  color: '#DC2626',
                  fontWeight: 600
                }}
              >
                <Flame size={11} /> Top Seller
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
