import React from 'react';
import type { Order } from '../../types';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentOrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders, onViewOrder }) => {
  return (
    <div>
      <div className="table-container" style={{ border: 'none' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Seat</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Time</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 6).map(order => (
              <tr key={order.id}>
                <td>
                  <span
                    onClick={() => onViewOrder(order)}
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
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{order.seat}</span>
                    <span style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
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
                </td>

                <td>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
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
                  <button
                    type="button"
                    onClick={() => onViewOrder(order)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Link
          to="/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none'
          }}
        >
          <span>View All Orders in System</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};
