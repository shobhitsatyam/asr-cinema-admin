import React from 'react';
import type { Seat, SeatStatus } from '../../types';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  Copy,
  ExternalLink,
  ShoppingBag,
  Power,
  Eye,
  RefreshCw,
  Ban,
  CheckCircle,
  Armchair,
  Clock,
  Sparkles
} from 'lucide-react';

interface SeatDetailDrawerProps {
  seat: Seat | null;
  onClose: () => void;
  onViewQR: (seat: Seat) => void;
  onOpenBlockModal: (seat: Seat) => void;
}

export const SeatDetailDrawer: React.FC<SeatDetailDrawerProps> = ({
  seat,
  onClose,
  onViewQR,
  onOpenBlockModal
}) => {
  const { updateSeatStatus, toggleSeatQR, regenerateSeatQR } = useAdmin();
  const { showToast } = useToast();

  if (!seat) return null;

  const statuses: SeatStatus[] = ['Available', 'Occupied', 'Ordering', 'Blocked'];
  const isB16 = seat.auditorium === 'Audi 2' && seat.seatNumber === 'B16';
  const isBlocked = seat.status === 'Blocked';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    seat.qrUrl
  )}&color=0B0B0D`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(seat.qrUrl);
    showToast('Link Copied', `Seat ${seat.seatNumber} order link copied to clipboard.`);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `ASR-Cinema-${seat.auditorium.replace(/\s+/g, '')}-Seat-${seat.seatNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR Downloaded', `High-res QR code saved for Seat ${seat.seatNumber}.`);
  };

  const handleRegenerate = () => {
    regenerateSeatQR(seat.id);
  };

  return (
    <Drawer
      isOpen={!!seat}
      onClose={onClose}
      title={`${seat.auditorium} • Seat ${seat.seatNumber}`}
      subtitle={`${seat.type} • ₹${seat.price}`}
      width={520}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onViewQR(seat)}>
            <Eye size={15} />
            <span>Open QR Plaque</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadQR}>
              <Download size={14} />
              <span>Download</span>
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Preserved Demo Banner if B16 */}
        {isB16 && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10
            }}
          >
            <Sparkles size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Active Preserved Demo Seat (Audi 2 • B16)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7F1D1D', marginTop: 2 }}>
                This seat retains the live demonstration token <code>audi2-b16</code>. Any mobile scan
                or web order at this endpoint directly simulates live in-seat ordering.
              </div>
            </div>
          </div>
        )}

        {/* Seat Specification Grid */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FAFAFB',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Armchair size={17} color="var(--color-primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Seat Information</span>
            </div>
            <Badge
              variant={
                seat.status === 'Available'
                  ? 'available'
                  : seat.status === 'Occupied'
                  ? 'occupied'
                  : seat.status === 'Ordering'
                  ? 'pending'
                  : 'blocked'
              }
              label={seat.status}
              size="md"
            />
          </div>

          <div
            style={{
              padding: '14px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              fontSize: '0.8125rem'
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Auditorium
              </span>
              <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{seat.auditorium}</span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Row & Seat Number
              </span>
              <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
                Row {seat.row} • Seat {seat.seatNumber}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Seat Tier / Type
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{seat.type}</span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Base Ticket / In-Seat Price
              </span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{seat.price}</span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                QR Ordering Status
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: seat.qrStatus === 'Active' ? '#059669' : '#DC2626'
                }}
              >
                {seat.qrStatus === 'Active' ? '● Active' : '○ Inactive'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                QR Token
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {seat.token || `audi2-${seat.seatNumber.toLowerCase()}`}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Last Order Placed
              </span>
              <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {seat.lastOrder || 'None today'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Last Order Time
              </span>
              <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {seat.lastOrderTime || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Seat Status Quick Bar */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#FAFAFB',
            borderRadius: 12,
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Update Current Status
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {statuses.map(st => {
              const active = seat.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateSeatStatus(seat.id, st)}
                  className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '6px 8px',
                    fontSize: '0.75rem',
                    borderRadius: 6,
                    fontWeight: active ? 700 : 500
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Actions: QR Plaque & Block/Unblock */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onViewQR(seat)}
            style={{ justifyContent: 'center', height: 42 }}
          >
            <Eye size={16} />
            <span>View QR Plaque</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadQR}
            style={{ justifyContent: 'center', height: 42 }}
          >
            <Download size={16} />
            <span>Download QR</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRegenerate}
            style={{ justifyContent: 'center', height: 42 }}
          >
            <RefreshCw size={15} />
            <span>Sync / Refresh QR</span>
          </button>

          <button
            type="button"
            className={`btn ${isBlocked ? 'btn-secondary' : 'btn-secondary'}`}
            onClick={() => onOpenBlockModal(seat)}
            style={{
              justifyContent: 'center',
              height: 42,
              color: isBlocked ? '#16A34A' : '#DC2626',
              borderColor: isBlocked ? '#BBF7D0' : '#FECACA',
              backgroundColor: isBlocked ? '#F0FDF4' : '#FEF2F2'
            }}
          >
            {isBlocked ? <CheckCircle size={15} /> : <Ban size={15} />}
            <span>{isBlocked ? 'Unblock Seat' : 'Block Seat'}</span>
          </button>
        </div>

        {/* Toggle QR Ordering Switch */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Digital Ordering Access</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Enable or temporarily disable mobile order placement for this seat
            </div>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${seat.qrStatus === 'Active' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => toggleSeatQR(seat.id)}
          >
            <Power size={14} />
            <span>{seat.qrStatus === 'Active' ? 'Disable QR' : 'Enable QR'}</span>
          </button>
        </div>

        {/* Customer Scan-to-Food Direct URL Box */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#F6F6F7',
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              CUSTOMER SCAN URL
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                color: 'var(--color-text-main)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {seat.qrUrl}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-sm"
              onClick={handleCopyLink}
              title="Copy Customer Order URL"
            >
              <Copy size={13} />
            </button>
            <a
              href={seat.qrUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-icon btn-sm"
              title="Test in Customer Web App"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Active Order Details if Occupied or Ordering */}
        {seat.currentOrder && (
          <div
            style={{
              padding: '16px',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingBag size={16} color="var(--color-primary)" />
                <span>Current Active Order</span>
              </h4>
              <Badge variant={seat.currentOrder.status.toLowerCase()} label={seat.currentOrder.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{seat.currentOrder.orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Customer Name:</span>
                <span style={{ fontWeight: 600 }}>{seat.currentOrder.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Ordered Items:</span>
                <span style={{ fontWeight: 500 }}>{seat.currentOrder.itemsSummary}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Order Time:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                  <Clock size={13} />
                  {seat.currentOrder.time}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px dashed #E5E5E7'
                }}
              >
                <span style={{ fontWeight: 700 }}>Total Order Value:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                  ₹{seat.currentOrder.total}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
