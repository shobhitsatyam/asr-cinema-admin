import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { getAdminApiKey, setAdminSessionKey } from '../../services/api';
import {
  Building2,
  User,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAdmin();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'profile'>('general');

  // Local state initialized from admin context settings (only Cinema Info and Profile)
  const [general, setGeneral] = useState({ ...settings.general });
  const [profile, setProfile] = useState({ ...settings.profile });
  const [adminSessionKey, setAdminSessionKeyState] = useState(() => getAdminApiKey());

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      general,
      profile
    });
    showToast('Settings Saved', 'Cinema info and administrator profile updated successfully.');
  };

  const tabs = [
    { id: 'general', label: 'Cinema Info', icon: Building2 },
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
            Configure cinema details and manager authentication.
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
                  onClick={() => setActiveTab(tab.id as 'general' | 'profile')}
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Admin Authorization Key
                    <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                      (Ephemeral session-only credential for catalog & order status writes)
                    </span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter x-admin-key for current session"
                    value={adminSessionKey}
                    onChange={e => {
                      setAdminSessionKeyState(e.target.value);
                      setAdminSessionKey(e.target.value);
                    }}
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

export default SettingsPage;
