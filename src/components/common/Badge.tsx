import React from 'react';

export type BadgeVariant =
  | 'veg'
  | 'non-veg'
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'active'
  | 'inactive'
  | 'expired'
  | 'vip'
  | 'available'
  | 'occupied'
  | 'ordering'
  | 'blocked';

interface BadgeProps {
  variant: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, { bg: string; color: string; border?: string; dot?: string }> = {
  veg: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#10B981' },
  'non-veg': { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#EF4444' },

  // Orders
  pending: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  accepted: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', dot: '#0284C7' },
  preparing: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  ready: { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', dot: '#8B5CF6' },
  served: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' },
  completed: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', dot: '#22C55E' },
  cancelled: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', dot: '#EF4444' },

  // Payments
  paid: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' },
  successful: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' },
  failed: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', dot: '#EF4444' },
  refunded: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB', dot: '#9CA3AF' },

  // General & Seats
  active: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' },
  inactive: { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF' },
  expired: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#EF4444' },
  vip: { bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5', dot: '#EA580C' },

  available: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#10B981' },
  occupied: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  ordering: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  blocked: { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF' }
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, size = 'sm' }) => {
  const key = variant.toLowerCase();
  const config = variantStyles[key] || { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB', dot: '#9CA3AF' };
  const displayLabel = label || variant;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border || 'transparent'}`,
        borderRadius: 9999,
        fontWeight: 600,
        fontSize: size === 'sm' ? '0.73rem' : '0.8125rem',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        lineHeight: 1.3,
        whiteSpace: 'nowrap'
      }}
    >
      {config.dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: config.dot
          }}
        />
      )}
      {displayLabel}
    </span>
  );
};
