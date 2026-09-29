import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Clock,
  CreditCard,
  Bell,
  User,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAdmin();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'orders' | 'payment' | 'notifications' | 'profile'>('general');

  // Local state initialized from admin context settings
  const [general, setGeneral] = useState({ ...settings.general });
  const [orders, setOrders] = useState({ ...settings.orders });
  const [payment, setPayment] = useState({ ...settings.payment });
  const [notifications, setNotifications] = useState({ ...settings.notifications });
  const [profile, setProfile] = useState({ ...settings.profile });

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      general,
      orders,
      payment,
      notifications,
      profile
    });
    showToast('Settings Saved', 'All cinema configurations have been updated successfully.');
  };

  const tabs = [
    { id: 'general', label: 'Cinema Info', icon: Building2 },
    { id: 'orders', label: 'Order Rules', icon: Clock },
    { id: 'payment', label: 'Payments & GST', icon: CreditCard },
    { id: 'notifications', label: 'Alerts & KDS', icon: Bell },
    { id: 'profile', label: 'Admin Profile', icon: User }
  ];

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
            System & Cinema Settings
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Configure cinema details, in-theatre ordering rules, payment gateways, and admin access.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleSaveAll}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Settings Layout with Left Tabs & Right Form Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 24
        }}
        className="settings-grid"
      >
        {/* Navigation Tabs */}
        <div className="card" style={{ padding: '10px', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Form Card */}
        <div className="card">
          <form onSubmit={handleSaveAll} style={{ padding: '24px' }}>
            {/* General Cinema Settings */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 700 }}>
                    Cinema General Information
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Shown on patron digital ordering receipts and customer screens.
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cinema Brand Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={general.cinemaName}
                    onChange={e => setGeneral({ ...general, cinemaName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Brand Tagline / Concession Header</label>
                  <input
                    type="text"
                    className="form-input"
                    value={general.tagline}
                    onChange={e => setGeneral({ ...general, tagline: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Operations Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={general.phone}
                      onChange={e => setGeneral({ ...general, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Support Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={general.email}
                      onChange={e => setGeneral({ ...general, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Multiplex Physical Address</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={general.address}
                    onChange={e => setGeneral({ ...general, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">FSSAI / Cinema License Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={general.licenseNumber}
                    onChange={e => setGeneral({ ...general, licenseNumber: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Order Settings */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 700 }}>
                    Order & Kitchen Rules
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Concession preparation SLA and automatic acceptance protocols.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Default Target Preparation SLA</label>
                    <input
                      type="text"
                      className="form-input"
                      value={orders.defaultPrepTime}
                      onChange={e => setOrders({ ...orders, defaultPrepTime: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Max Active Orders Allowed per Seat</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={5}
                      value={orders.maxActiveOrdersPerSeat}
                      onChange={e => setOrders({ ...orders, maxActiveOrdersPerSeat: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 10, backgroundColor: '#FAFAFB', border: '1px solid var(--color-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Auto-Accept In-Seat Orders</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Immediately dispatch incoming seat orders directly to kitchen queue
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={orders.autoAcceptOrders}
                        onChange={e => setOrders({ ...orders, autoAcceptOrders: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 10, backgroundColor: '#FAFAFB', border: '1px solid var(--color-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Audio Alerts for Incoming Orders</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Play acoustic chime when a patron places a food order
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={orders.orderAlertSound}
                        onChange={e => setOrders({ ...orders, orderAlertSound: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 700 }}>
                    Payment Methods & Cinema Taxation
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Enable payment collection modes and configure applicable GST rates.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Currency Symbol</label>
                    <input
                      type="text"
                      className="form-input"
                      value={payment.currency}
                      onChange={e => setPayment({ ...payment, currency: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">GST Tax Rate (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={payment.gstRate}
                      onChange={e => setPayment({ ...payment, gstRate: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
                  <label className="form-label">Active Patron Payment Gateways</label>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
                    <span>UPI (Google Pay, PhonePe, Paytm QR)</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={payment.enableUPI}
                        onChange={e => setPayment({ ...payment, enableUPI: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
                    <span>Credit & Debit Cards (Visa / Mastercard / RuPay)</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={payment.enableCards}
                        onChange={e => setPayment({ ...payment, enableCards: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
                    <span>Cash on Delivery / Counter Pickup</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={payment.enableCash}
                        onChange={e => setPayment({ ...payment, enableCash: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 700 }}>
                    Operations & Staff Notifications
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Trigger real-time notifications for kitchen supervisors and runners.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Instant Order Alerts</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Push notification in header bar when seat scan order arrives
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.orderAlerts}
                        onChange={e => setNotifications({ ...notifications, orderAlerts: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Payment Confirmation Alerts</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Notify staff when transaction payment completes successfully
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.paymentAlerts}
                        onChange={e => setNotifications({ ...notifications, paymentAlerts: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Low Stock Concession Alerts</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Flag items when popcorn kernel or beverage supply dips below threshold
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.stockLowAlerts}
                        onChange={e => setNotifications({ ...notifications, stockLowAlerts: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Profile */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 700 }}>
                    Admin Profile & Authentication
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Manage authorized manager profile credentials.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{profile.role}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Admin Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Avatar Photo URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.avatarUrl}
                    onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Submit Action button inside card */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setGeneral({ ...settings.general });
                  setOrders({ ...settings.orders });
                  setPayment({ ...settings.payment });
                  setNotifications({ ...settings.notifications });
                  setProfile({ ...settings.profile });
                  showToast('Reverted', 'Settings restored to saved values.', 'info');
                }}
              >
                Reset
              </button>

              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
