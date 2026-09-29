import React, { useState } from 'react';
import { reportDataMap } from '../../data/mockReports';
import type { ReportPeriodData } from '../../data/mockReports';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  TrendingUp
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'month'>('7days');

  const currentData: ReportPeriodData = reportDataMap[period];

  const handleExport = () => {
    showToast('Exporting Report', `Generated PDF sales summary report for ${period}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Period Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              lineHeight: 1.2
            }}
          >
            Analytics & Reports
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            In-depth sales metrics, beverage vs popcorn breakdown, and top performing concessions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Period Filter Buttons */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              gap: 2
            }}
          >
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: 'month', label: 'This Month' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: period === item.id ? 700 : 500,
                  backgroundColor: period === item.id ? 'var(--color-primary)' : 'transparent',
                  color: period === item.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            <Download size={15} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Period Revenue</span>
          <div
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              marginTop: 4
            }}
          >
            {formatCurrency(currentData.totalRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', color: '#059669' }}>
            <TrendingUp size={14} />
            <span>+14.2% higher vs preceding timeframe</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Total Orders Fulfillments</span>
          <div
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              marginTop: 4
            }}
          >
            {currentData.totalOrders.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
            Across Screen 1, 2, and 3
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Average Ticket Value (ATV)</span>
          <div
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              marginTop: 4
            }}
          >
            {formatCurrency(currentData.avgOrderValue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
            Spend per customer transaction
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 20
        }}
      >
        {/* Revenue Trend Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Revenue Sales Timeline</h3>
              <p className="card-subtitle">Concession sales performance curve</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              INR (₹) Trend
            </span>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <RevenueChart data={currentData.revenueTrend} />
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Revenue Contribution</h3>
              <p className="card-subtitle">Share of food orders by product department</p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentData.categorySales.map(cat => (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: cat.color
                      }}
                    />
                    <strong style={{ color: 'var(--color-text-main)' }}>{cat.category}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{formatCurrency(cat.amount)}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-main)', width: 36, textAlign: 'right' }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div style={{ height: 8, borderRadius: 9999, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Concessions Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Top Selling Concession Items</h3>
            <p className="card-subtitle">Highest grossing food items in selected timeframe</p>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#FEF2F2',
              color: 'var(--color-primary)',
              padding: '3px 9px',
              borderRadius: 6
            }}
          >
            Cinema Bestsellers
          </span>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Food Item</th>
                <th>Department</th>
                <th>Units Sold</th>
                <th>Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {currentData.topSellingFoods.map((food, idx) => (
                <tr key={food.name}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)'
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={food.image}
                        alt={food.name}
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{food.name}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        padding: '2px 8px',
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {food.category}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>{food.quantity.toLocaleString()} units</span>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
                      {formatCurrency(food.revenue)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
