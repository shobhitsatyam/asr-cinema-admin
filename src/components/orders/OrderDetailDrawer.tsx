import React from 'react';
import type { Order, OrderStatus } from '../../types';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order, onClose }) => {
  const { updateOrderStatus } = useAdmin();
  const { showToast } = useToast();

  if (!order) return null;

  const statuses: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'];

  const handlePrint = () => {
    showToast('Kitchen Token Printed', `Order slip printed for ${order.id} (${order.auditorium} • ${order.seat})`);
  };

  return (
    <Drawer
      isOpen={!!order}
      onClose={onClose}
      title={`Order ${order.id}`}
      subtitle={`${order.auditorium} • Seat ${order.seat} • Placed at ${order.time}`}
      width={540}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print KOT Slip</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Status bar & quick status changer */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#FAFAFB',
            borderRadius: 12,
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Current Status:
            </span>
            <Badge variant={order.status.toLowerCase()} label={order.status} size="md" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Change Order Stage:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {statuses.map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateOrderStatus(order.id, st)}
                  className={`btn btn-sm ${order.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 6
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer & Seat Information */}
        <div
          style={{
            padding: '16px',
            borderRadius: 12,
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={16} color="var(--color-primary)" />
            Customer & Delivery Seat
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
              <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginTop: 2 }}>
                {order.customer.name}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Seat / Screen</span>
              <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} />
                {order.auditorium} • {order.seat}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Mobile</span>
              <div style={{ fontWeight: 500, color: 'var(--color-text-main)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={13} />
                {order.customer.phone}
              </div>
            </div>

            {order.customer.email && (
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
                <div style={{ fontWeight: 500, color: 'var(--color-text-main)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={13} />
                  {order.customer.email}
                </div>
              </div>
            )}
          </div>

          {order.specialInstructions && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 8,
                fontSize: '0.78rem',
                color: '#92400E'
              }}
            >
              <strong>Note:</strong> {order.specialInstructions}
            </div>
          )}
        </div>

        {/* Ordered Food Items */}
        <div
          style={{
            padding: '16px',
            borderRadius: 12,
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>
            Ordered Items ({order.items.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 8,
                  borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {item.quantity}x
                  </span>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {item.name}
                    </div>
                    {item.type && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          color: item.type === 'Veg' ? '#047857' : '#B91C1C'
                        }}
                      >
                        ● {item.type}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Bill Calculation */}
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px dashed var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Item Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Discount Applied</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Taxes & GST (5%)</span>
              <span>{formatCurrency(order.taxes)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--color-text-main)',
                paddingTop: 8,
                borderTop: '1px solid var(--color-border)',
                marginTop: 4
              }}
            >
              <span>Total Bill</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(order.total)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#10B981" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Method: {order.paymentMethod}
                </span>
              </div>
              <Badge variant={order.paymentStatus.toLowerCase()} label={order.paymentStatus} />
            </div>
          </div>
        </div>

        {/* Order Timeline Tracker */}
        <div
          style={{
            padding: '16px',
            borderRadius: 12,
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} color="var(--color-primary)" />
            Order Fulfillment Timeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
            {order.timeline.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: step.completed ? '#ECFDF5' : '#F3F4F6',
                    color: step.completed ? '#059669' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}
                >
                  {step.completed ? <CheckCircle2 size={15} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#D1D5DB' }} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: step.completed ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                      {step.status}
                    </span>
                    {step.time && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {step.time}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {step.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
