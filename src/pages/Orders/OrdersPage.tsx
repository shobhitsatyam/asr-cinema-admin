import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { OrderStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { OrderDetailDrawer } from '../../components/orders/OrderDetailDrawer';
import { formatCurrency } from '../../utils/formatters';
import {
  Eye,
  ChevronRight
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useAdmin();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedAudi, setSelectedAudi] = useState<string>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const tabs = [
    'All',
    'Pending',
    'Accepted',
    'Preparing',
    'Ready',
    'Served',
    'Completed',
    'Cancelled'
  ];

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: orders.length };
    tabs.slice(1).forEach(tab => {
      counts[tab] = orders.filter(o => o.status === tab).length;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchTab = activeTab === 'All' || order.status === activeTab;
      const matchAudi = selectedAudi === 'All' || order.auditorium === selectedAudi;
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.seat.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.phone.includes(search) ||
        order.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));

      return matchTab && matchAudi && matchSearch;
    });
  }, [orders, activeTab, selectedAudi, search]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'Pending': return 'Accepted';
      case 'Accepted': return 'Preparing';
      case 'Preparing': return 'Ready';
      case 'Ready': return 'Served';
      case 'Served': return 'Completed';
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
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
            Live Order Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Monitor, prepare, dispatch, and fulfill in-seat food orders across cinema halls.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 9999,
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid #BFDBFE'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563EB' }} />
            KDS Preview
          </span>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: 2
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-brand)',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '0.875rem',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: `3px solid ${activeTab === tab ? 'var(--color-primary)' : 'transparent'}`,
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>{tab}</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 9999,
                backgroundColor: activeTab === tab ? 'var(--color-primary)' : '#F3F4F6',
                color: activeTab === tab ? '#FFFFFF' : 'var(--color-text-muted)'
              }}
            >
              {tabCounts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="card">
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SearchInput
              value={search}
              onChange={val => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by order ID, seat, patron..."
              width={280}
            />

            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedAudi}
              onChange={e => {
                setSelectedAudi(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Auditoriums</option>
              <option value="Audi 1">Audi 1</option>
              <option value="Audi 2">Audi 2</option>
              <option value="Audi 3">Audi 3</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredOrders.length}</strong> orders
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="There are no orders matching your current status tab or search filter."
            actionText="Clear Filters"
            onAction={() => {
              setActiveTab('All');
              setSelectedAudi('All');
              setSearch('');
            }}
          />
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Seat</th>
                  <th>Items</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => {
                  const nextStage = getNextStatus(order.status);

                  return (
                    <tr key={order.id}>
                      <td>
                        <span
                          onClick={() => setSelectedOrderId(order.id)}
                          style={{
                            fontFamily: 'var(--font-brand)',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          {order.id}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{order.seat}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {order.auditorium}
                          </span>
                        </div>
                      </td>

                      <td style={{ maxWidth: 220 }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--color-text-secondary)'
                          }}
                          title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        >
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>{order.customer.name}</span>
                          <span style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
                            {order.customer.phone}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {formatCurrency(order.total)}
                        </span>
                      </td>

                      <td>
                        <Badge variant={order.paymentStatus.toLowerCase()} label={order.paymentStatus} />
                      </td>

                      <td>
                        <Badge variant={order.status.toLowerCase()} label={order.status} />
                      </td>

                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {order.time}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {nextStage && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => updateOrderStatus(order.id, nextStage)}
                              title={`Advance to ${nextStage}`}
                            >
                              <span>{nextStage}</span>
                              <ChevronRight size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="View Full Order Details"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrderId(null)} />
    </div>
  );
};
