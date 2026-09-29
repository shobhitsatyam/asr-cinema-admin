import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface RevenueChartProps {
  data: { label: string; revenue: number; orders: number }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const chartHeight = 180;
  const chartWidth = 520;

  // Compute SVG Points for smooth area & line chart
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E31B23" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E31B23" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight - pct * (chartHeight - 40) - 20;
            return (
              <g key={i}>
                <line
                  x1={20}
                  y1={y}
                  x2={chartWidth - 20}
                  y2={y}
                  stroke="#F0F0F2"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#E31B23"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & interactive hitboxes */}
          {points.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 7 : 4}
                fill={hoveredIdx === i ? '#FFFFFF' : '#E31B23'}
                stroke="#E31B23"
                strokeWidth={hoveredIdx === i ? 3 : 2}
                style={{ transition: 'all 150ms ease' }}
              />
              <circle cx={p.x} cy={p.y} r={18} fill="transparent" />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="animate-slide-down"
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0F1015',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.8125rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <span style={{ fontWeight: 600 }}>{data[hoveredIdx].label}</span>
            <span style={{ color: '#FCA5A5' }}>
              {formatCurrency(data[hoveredIdx].revenue)}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
              ({data[hoveredIdx].orders} orders)
            </span>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 12px 0 12px',
          borderTop: '1px solid var(--color-border-subtle)',
          marginTop: 6
        }}
      >
        {data.map((d, i) => (
          <span
            key={i}
            style={{
              fontSize: '0.75rem',
              fontWeight: hoveredIdx === i ? 700 : 500,
              color: hoveredIdx === i ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};
