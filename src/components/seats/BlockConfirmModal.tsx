import React, { useState } from 'react';
import type { Seat } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BlockConfirmModalProps {
  seat: Seat | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export const BlockConfirmModal: React.FC<BlockConfirmModalProps> = ({
  seat,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('Hardware / Recliner Maintenance');

  if (!seat) return null;

  const isBlocked = seat.status === 'Blocked';

  const reasons = [
    'Hardware / Recliner Maintenance',
    'Audio / Headphone jack issue',
    'Seat upholstery cleaning',
    'Reserved for VIP / Cinema Staff',
    'Other Operational Issue'
  ];

  const handleConfirm = () => {
    onConfirm(isBlocked ? undefined : reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBlocked ? `Unblock Seat ${seat.seatNumber}?` : `Block Seat ${seat.seatNumber}?`}
      subtitle={`${seat.auditorium} • ${seat.type}`}
      maxWidth={460}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isBlocked ? 'btn-primary' : 'btn-danger'}`}
            onClick={handleConfirm}
          >
            {isBlocked ? 'Confirm Unblock' : 'Confirm Block Seat'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '14px',
            borderRadius: 10,
            backgroundColor: isBlocked ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isBlocked ? '#BBF7D0' : '#FECACA'}`
          }}
        >
          {isBlocked ? (
            <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
          ) : (
            <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          )}

          <div style={{ fontSize: '0.85rem' }}>
            {isBlocked ? (
              <div>
                <strong>Restoring Seat {seat.seatNumber}</strong> will mark it as <strong>Available</strong>{' '}
                and immediately re-enable customer digital QR ordering.
              </div>
            ) : (
              <div>
                <strong>Blocking Seat {seat.seatNumber}</strong> will prevent customers from ordering food
                or reserving this seat until maintenance is completed.
              </div>
            )}
          </div>
        </div>

        {!isBlocked && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Reason for Blocking
            </label>
            <select
              className="form-select"
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ fontSize: '0.8125rem' }}
            >
              {reasons.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
};
