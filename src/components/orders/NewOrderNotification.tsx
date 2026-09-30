import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { Order } from '../../types';

interface NewOrderToastItemProps {
  order: Order;
  onDismiss: (orderId: string) => void;
  onViewOrder: (order: Order) => void;
}

const NewOrderToastItem: React.FC<NewOrderToastItemProps> = ({
  order,
  onDismiss,
  onViewOrder
}) => {
  // Automatically dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(order.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [order.id, onDismiss]);

  return (
    <div
      role="alert"
      className="animate-slide-up"
      style={{
        pointerEvents: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #FECACA',
        borderLeft: '4px solid var(--color-primary)',
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(227, 27, 35, 0.08)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'var(--font-brand)',
        position: 'relative'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Bell size={14} color="var(--color-primary)" />
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            New Order Received
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(order.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4
          }}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Order Info Row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
          {order.id}
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {order.auditorium} • {order.seat}
        </span>
      </div>

      {/* Footer / Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-main)' }}>
            {formatCurrency(order.total)}
          </span>
          <Badge
            variant={order.paymentStatus ? order.paymentStatus.toLowerCase() : 'paid'}
            label={order.paymentStatus || 'Paid'}
            size="sm"
          />
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{
            padding: '3px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
          onClick={() => onViewOrder(order)}
        >
          <span>View Order</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export const NewOrderNotification: React.FC = () => {
  const { newOrderAlerts, dismissNewOrderAlert } = useAdmin();
  const navigate = useNavigate();

  const handleViewOrder = (order: Order) => {
    dismissNewOrderAlert(order.id);
    navigate(`/orders?orderId=${encodeURIComponent(order.id)}`);
  };

  if (!newOrderAlerts || newOrderAlerts.length === 0) {
    return null;
  }

  // Display at most the 3 most recent new order alerts to prevent screen clutter
  const visibleAlerts = newOrderAlerts.slice(-3);

  return (
    <div
      className="new-order-toast-container"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 10,
        maxWidth: 340,
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}
    >
      {visibleAlerts.map(order => (
        <NewOrderToastItem
          key={order.id}
          order={order}
          onDismiss={dismissNewOrderAlert}
          onViewOrder={handleViewOrder}
        />
      ))}
    </div>
  );
};
