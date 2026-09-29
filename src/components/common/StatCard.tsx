import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon: Icon,
  iconBg = 'rgba(227, 27, 35, 0.08)',
  iconColor = '#E31B23'
}) => {
  return (
    <div
      className="card card-hover"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        minHeight: 120
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            {title}
          </span>
          <div
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.65rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              marginTop: 4,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={22} color={iconColor} />
        </div>
      </div>

      {(change || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          {change && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isPositive ? '#059669' : '#DC2626',
                backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2',
                padding: '2px 7px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              {isPositive ? '↑' : '↓'} {change}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
