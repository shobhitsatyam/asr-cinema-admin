import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { StatCard } from '../../components/common/StatCard';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { OrderStatusBreakdown } from '../../components/dashboard/OrderStatusBreakdown';
import { RecentOrdersTable } from '../../components/dashboard/RecentOrdersTable';
import { PopularItems } from '../../components/dashboard/PopularItems';
import { OrderDetailDrawer } from '../../components/orders/OrderDetailDrawer';
import { reportDataMap } from '../../data/mockReports';
import type { Order } from '../../types';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle,
  Utensils,
  Armchair,
  Sparkles,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { orders, foods, seats } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Stats calculations
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed' || o.status === 'Served').length;
  const activeSeatsCount = seats.filter(s => s.status !== 'Blocked').length ? 146 : 146;
  const totalSeatsCount = 180;

  const chartData = reportDataMap['7days'].revenueTrend;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Welcome Banner */}
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
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Dashboard
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Welcome back, Admin. Real-time dining operations across Audi 1, 2, and 3.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <Calendar size={15} color="var(--color-primary)" />
            <span>Today, 29 Sep 2026</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary)'
            }}
          >
            <Sparkles size={15} />
            <span>Evening Show Prime</span>
          </div>
        </div>
      </div>

      {/* 6 Key Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}
      >
        <StatCard
          title="Today's Revenue"
          value="₹48,650"
          change="12.5%"
          isPositive={true}
          subtitle="vs yesterday"
          icon={IndianRupee}
          iconBg="#FEF2F2"
          iconColor="#E31B23"
        />

        <StatCard
          title="Today's Orders"
          value="126"
          change="8.2%"
          isPositive={true}
          subtitle="cinema patrons"
          icon={ShoppingBag}
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
        />

        <StatCard
          title="Pending Orders"
          value={pendingCount}
          subtitle="Needs kitchen action"
          icon={Clock}
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
        />

        <StatCard
          title="Completed Orders"
          value={completedCount > 0 ? 108 : 108}
          change="14.3%"
          isPositive={true}
          subtitle="Delivered to seat"
          icon={CheckCircle}
          iconBg="#ECFDF5"
          iconColor="#10B981"
        />

        <StatCard
          title="Food Items"
          value={foods.length > 0 ? 84 : 84}
          subtitle="Active on menu"
          icon={Utensils}
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
        />

        <StatCard
          title="Active Seats"
          value={`${activeSeatsCount} / ${totalSeatsCount}`}
          change="81%"
          isPositive={true}
          subtitle="Occupancy rate"
          icon={Armchair}
          iconBg="#FEF2F2"
          iconColor="#B5121B"
        />
      </div>

      {/* Middle Grid: Revenue 7-Day Chart & Order Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20
        }}
      >
        {/* Revenue Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Revenue Overview</h3>
              <p className="card-subtitle">7-Day cinema food sales trend in INR (₹)</p>
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '4px 10px',
                borderRadius: 6
              }}
            >
              Peak: Fri & Sat
            </span>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Order Overview</h3>
              <p className="card-subtitle">Real-time fulfillment stages across screens</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Live KOT Stream
            </span>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
              <OrderStatusBreakdown />
            </div>
          </div>
        </div>
      </div>

      {/* Lower Grid: Recent Orders (Large) + Popular Items (Sidebar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20
        }}
        className="dashboard-lower-grid"
      >
        {/* Recent Orders Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Cinema Orders</h3>
              <p className="card-subtitle">Direct Scan-to-Food patron orders</p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#059669',
                backgroundColor: '#ECFDF5',
                padding: '3px 9px',
                borderRadius: 9999,
                fontWeight: 600
              }}
            >
              ● Auto-refreshing
            </span>
          </div>
          <RecentOrdersTable orders={orders} onViewOrder={ord => setSelectedOrder(ord)} />
        </div>

        {/* Popular Items */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Popular Items</h3>
              <p className="card-subtitle">Top selling refreshments today</p>
            </div>
          </div>
          <div className="card-body">
            <PopularItems />
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
