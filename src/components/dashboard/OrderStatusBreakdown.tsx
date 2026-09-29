import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Clock, ChefHat, CheckCircle2, Truck, Check } from 'lucide-react';

export const OrderStatusBreakdown: React.FC = () => {
  const { orders } = useAdmin();

  const counts = {
    Pending: orders.filter(o => o.status === 'Pending').length,
    Accepted: orders.filter(o => o.status === 'Accepted').length,
    Preparing: orders.filter(o => o.status === 'Preparing').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    Served: orders.filter(o => o.status === 'Served').length,
    Completed: orders.filter(o => o.status === 'Completed').length
  };

  const total = orders.length || 1;

  const items = [
    { label: 'Pending', count: counts.Pending, color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
    { label: 'Accepted', count: counts.Accepted, color: '#0284C7', bg: '#E0F2FE', icon: CheckCircle2 },
    { label: 'Preparing', count: counts.Preparing, color: '#3B82F6', bg: '#EFF6FF', icon: ChefHat },
    { label: 'Ready', count: counts.Ready, color: '#8B5CF6', bg: '#F5F3FF', icon: CheckCircle2 },
    { label: 'Served', count: counts.Served, color: '#10B981', bg: '#ECFDF5', icon: Truck },
    { label: 'Completed', count: counts.Completed, color: '#059669', bg: '#D1FAE5', icon: Check }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Progress segmented bar */}
      <div
        style={{
          display: 'flex',
          height: 10,
          borderRadius: 9999,
          overflow: 'hidden',
          backgroundColor: '#F3F4F6'
        }}
      >
        {items.map(item => {
          const widthPct = (item.count / total) * 100;
          if (widthPct === 0) return null;
          return (
            <div
              key={item.label}
              style={{
                width: `${widthPct}%`,
                backgroundColor: item.color,
                transition: 'width 300ms ease'
              }}
              title={`${item.label}: ${item.count}`}
            />
          );
        })}
      </div>

      {/* List items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: '#FAFAFB',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={15} color={item.color} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--color-text-main)'
                  }}
                >
                  {item.count}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  ({Math.round((item.count / total) * 100)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
