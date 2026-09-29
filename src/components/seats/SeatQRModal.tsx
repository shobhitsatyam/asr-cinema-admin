import React from 'react';
import type { Seat } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { Download, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface SeatQRModalProps {
  seat: Seat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SeatQRModal: React.FC<SeatQRModalProps> = ({ seat, isOpen, onClose }) => {
  const { showToast } = useToast();

  if (!seat) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    seat.qrUrl
  )}&color=0B0B0D`;

  const isB16 = seat.auditorium === 'Audi 2' && seat.seatNumber === 'B16';

  const handleCopy = () => {
    navigator.clipboard.writeText(seat.qrUrl);
    showToast('Link Copied', `Order link for Seat ${seat.seatNumber} copied to clipboard.`);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `ASR-Cinema-${seat.auditorium.replace(/\s+/g, '')}-Seat-${seat.seatNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR Plaque Downloaded', `Saved QR code for ${seat.auditorium} • ${seat.seatNumber}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seat QR Plaque & In-Seat Ordering"
      subtitle={`Live Digital Scan-to-Food endpoint for ${seat.auditorium} Seat ${seat.seatNumber}`}
      maxWidth={480}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownload}>
            <Download size={15} />
            <span>Download QR (.PNG)</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={seat.qrUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              title="Test in Customer Web App"
            >
              <ExternalLink size={14} />
              <span>Test Link</span>
            </a>
            <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        {/* Printable Physical Plaque Preview Card */}
        <div
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '24px 20px',
            borderRadius: 18,
            backgroundColor: '#FFFFFF',
            border: isB16 ? '2.5px solid var(--color-primary)' : '2px solid #0B0B0D',
            boxShadow: isB16 ? '0 10px 25px rgba(227, 27, 35, 0.18)' : '0 8px 24px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {isB16 && (
            <div
              style={{
                position: 'absolute',
                top: -10,
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: 9999,
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 8px rgba(227, 27, 35, 0.4)'
              }}
            >
              <Sparkles size={11} />
              <span>ACTIVE DEMO SEAT • PRESERVED FLOW</span>
            </div>
          )}

          {/* Cinema Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: isB16 ? 4 : 0 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.7rem'
              }}
            >
              ASR
            </div>
            <span
              style={{
                fontFamily: 'var(--font-brand)',
                fontWeight: 800,
                fontSize: '1.15rem',
                letterSpacing: '0.04em',
                color: '#0B0B0D'
              }}
            >
              ASR CINEMAS
            </span>
          </div>

          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginTop: 4,
              letterSpacing: '0.05em'
            }}
          >
            SCAN TO ORDER FOOD
          </div>

          {/* QR Code Container */}
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E7',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              margin: '16px 0 14px 0'
            }}
          >
            <img
              src={qrImageUrl}
              alt={`QR Code for ${seat.auditorium} Seat ${seat.seatNumber}`}
              style={{ width: 210, height: 210, display: 'block' }}
            />
          </div>

          {/* Seat Tag */}
          <div
            style={{
              backgroundColor: '#0B0B0D',
              color: '#FFFFFF',
              padding: '6px 22px',
              borderRadius: 9999,
              fontFamily: 'var(--font-brand)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ color: 'var(--color-primary)' }}>{seat.auditorium.toUpperCase()}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span>SEAT {seat.seatNumber}</span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
            Food delivered directly to your cinema seat
          </div>
        </div>

        {/* URL and Token Metadata */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#F6F6F7',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Seat Token:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {seat.token || `audi2-${seat.seatNumber.toLowerCase()}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Ordering Status:</span>
            <span
              style={{
                fontWeight: 700,
                color: seat.qrStatus === 'Active' ? '#059669' : '#DC2626'
              }}
            >
              {seat.qrStatus === 'Active' ? '● Active & Accepting Orders' : '○ Inactive / Blocked'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              paddingTop: 8,
              borderTop: '1px dashed #E5E5E7'
            }}
          >
            <span
              style={{
                fontSize: '0.73rem',
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 320
              }}
            >
              {seat.qrUrl}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-sm"
              onClick={handleCopy}
              title="Copy Customer Order URL"
              style={{ flexShrink: 0, width: 28, height: 28 }}
            >
              <Copy size={13} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
