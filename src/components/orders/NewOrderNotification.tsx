import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { Order } from '../../types';

// Web Audio API Synthesizer for Kitchen Chime
function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio context not available or blocked by autoplay
  }
}

// Web Speech API Voice Announcement
function speakAnnouncement(text: string) {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Speech synthesis unavailable
  }
}

interface NewOrderToastItemProps {
  order: Order;
  onDismiss: (orderId: string) => void;
  onViewOrder: (order: Order) => void;
  onAcceptOrder?: (order: Order) => void;
}

const NewOrderToastItem: React.FC<NewOrderToastItemProps> = ({
  order,
  onDismiss,
  onViewOrder,
  onAcceptOrder,
}) => {
  // Automatically dismiss the visual toast after 5 seconds
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
        position: 'relative',
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
              flexShrink: 0,
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
              textTransform: 'uppercase',
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
            borderRadius: 4,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onAcceptOrder && order.status === 'Pending' && (
            <button
              type="button"
              className="btn btn-sm"
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => onAcceptOrder(order)}
            >
              Accept
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() => onViewOrder(order)}
          >
            <span>View</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NewOrderNotification: React.FC = () => {
  const { newOrderAlerts, dismissNewOrderAlert, orders, updateOrderStatus, settings } = useAdmin();
  const navigate = useNavigate();

  // Repeating audio queue: holds order IDs until staff accepts or dismisses
  const [audioAlertQueue, setAudioAlertQueue] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const audioUnlockedRef = useRef<boolean>(false);

  // Listen to newOrderAlerts arriving from AdminContext
  useEffect(() => {
    const paidNewOrders = (newOrderAlerts || []).filter(o => o.paymentStatus === 'Paid');
    if (paidNewOrders.length > 0) {
      setAudioAlertQueue(prev => {
        const nextSet = new Set(prev);
        paidNewOrders.forEach(o => nextSet.add(o.id));
        return Array.from(nextSet);
      });

      // Play initial immediate alert if sound is enabled
      const soundEnabled = settings.orders?.orderAlertSound !== false && !soundMuted;
      if (soundEnabled) {
        playKitchenChime();
        const latest = paidNewOrders[paidNewOrders.length - 1];
        speakAnnouncement(`New order received. Seat ${latest.seat || ''}`);
      }
    }
  }, [newOrderAlerts, settings.orders?.orderAlertSound, soundMuted]);

  // Clean up audio queue when an order is no longer 'Pending' (i.e. staff accepted or cancelled)
  useEffect(() => {
    setAudioAlertQueue(prev => {
      const activePending = prev.filter(orderId => {
        const matching = orders.find(o => o.id === orderId);
        return matching ? matching.status === 'Pending' : false;
      });
      return activePending;
    });
  }, [orders]);

  // 10-Second Repeating Audio Alert Loop
  useEffect(() => {
    if (audioAlertQueue.length === 0 || soundMuted || settings.orders?.orderAlertSound === false) {
      return;
    }

    const interval = setInterval(() => {
      // Recheck orders status to ensure still pending
      const stillPending = audioAlertQueue.some(id => {
        const o = orders.find(ord => ord.id === id);
        return o ? o.status === 'Pending' : false;
      });

      if (stillPending) {
        playKitchenChime();
        speakAnnouncement('New order received');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [audioAlertQueue, soundMuted, settings.orders?.orderAlertSound, orders]);

  // Unlock audio context on any user interaction in document
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioUnlockedRef.current) {
        audioUnlockedRef.current = true;
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            ctx.resume().catch(() => {});
          }
        } catch {}
      }
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const handleDismiss = useCallback((orderId: string) => {
    dismissNewOrderAlert(orderId);
    setAudioAlertQueue(prev => prev.filter(id => id !== orderId));
  }, [dismissNewOrderAlert]);

  const handleViewOrder = (order: Order) => {
    handleDismiss(order.id);
    navigate(`/orders?orderId=${encodeURIComponent(order.id)}`);
  };

  const handleAcceptOrder = (order: Order) => {
    handleDismiss(order.id);
    updateOrderStatus(order.id, 'Accepted');
  };

  // Operational constraint: Only verified Paid orders generate operational notification popups
  const paidAlerts = (newOrderAlerts || []).filter(o => o.paymentStatus === 'Paid');

  if (paidAlerts.length === 0 && audioAlertQueue.length === 0) {
    return null;
  }

  // Display at most the 3 most recent new order alerts to prevent screen clutter
  const visibleAlerts = paidAlerts.slice(-3);

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
        pointerEvents: 'none',
      }}
    >
      {/* Audio Indicator Pill if orders are waiting in alert queue */}
      {audioAlertQueue.length > 0 && (
        <div
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            marginBottom: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#E31B23',
                animation: 'pulse 1.2s infinite',
              }}
            />
            <span>{audioAlertQueue.length} Order{audioAlertQueue.length > 1 ? 's' : ''} Awaiting Kitchen</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            style={{
              background: 'none',
              border: 'none',
              color: soundMuted ? '#EF4444' : '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              padding: 2,
            }}
            title={soundMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
          >
            {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      )}

      {visibleAlerts.map(order => (
        <NewOrderToastItem
          key={order.id}
          order={order}
          onDismiss={handleDismiss}
          onViewOrder={handleViewOrder}
          onAcceptOrder={handleAcceptOrder}
        />
      ))}
    </div>
  );
};
