import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Bell,
  Search,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  onToggleMobile: () => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile, collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders, settings } = useAdmin();
  const { showToast } = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Page Title and Breadcrumbs from current pathname
  const pathParts = location.pathname.split('/').filter(Boolean);

  let pageTitle = 'Dashboard';
  const breadcrumbs: { label: string; path: string }[] = [{ label: 'Admin', path: '/dashboard' }];

  if (pathParts[0] === 'dashboard') {
    pageTitle = 'Dashboard Overview';
    breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
  } else if (pathParts[0] === 'menu') {
    if (pathParts[1] === 'foods') {
      pageTitle = 'Food Items Management';
      breadcrumbs.push({ label: 'Menu', path: '/menu/foods' });
      breadcrumbs.push({ label: 'Food Items', path: '/menu/foods' });
    } else if (pathParts[1] === 'categories') {
      pageTitle = 'Category Management';
      breadcrumbs.push({ label: 'Menu', path: '/menu/categories' });
      breadcrumbs.push({ label: 'Categories', path: '/menu/categories' });
    } else if (pathParts[1] === 'combos') {
      pageTitle = 'Combo Meals Management';
      breadcrumbs.push({ label: 'Menu', path: '/menu/combos' });
      breadcrumbs.push({ label: 'Combos', path: '/menu/combos' });
    }
  } else if (pathParts[0] === 'seats') {
    pageTitle = 'Auditorium Seats & QR Codes';
    breadcrumbs.push({ label: 'Seats & QR', path: '/seats' });
  } else if (pathParts[0] === 'orders') {
    pageTitle = 'Live Order Management';
    breadcrumbs.push({ label: 'Orders', path: '/orders' });
  } else if (pathParts[0] === 'payments') {
    pageTitle = 'Payments & Transactions';
    breadcrumbs.push({ label: 'Payments', path: '/payments' });
  } else if (pathParts[0] === 'customers') {
    pageTitle = 'Cinema Customers';
    breadcrumbs.push({ label: 'Customers', path: '/customers' });
  } else if (pathParts[0] === 'coupons') {
    pageTitle = 'Promotions & Coupons';
    breadcrumbs.push({ label: 'Coupons', path: '/coupons' });
  } else if (pathParts[0] === 'reports') {
    pageTitle = 'Analytics & Reports';
    breadcrumbs.push({ label: 'Reports', path: '/reports' });
  } else if (pathParts[0] === 'settings') {
    pageTitle = 'System & Cinema Settings';
    breadcrumbs.push({ label: 'Settings', path: '/settings' });
  }

  // Live pending & preparing orders
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    const term = quickSearch.trim();
    if (term.startsWith('#') || term.toUpperCase().startsWith('ASR')) {
      navigate('/orders');
      showToast('Searching Orders', `Locating order ${term}...`);
    } else {
      navigate('/menu/foods');
      showToast('Searching Menu', `Searching items for "${term}"...`);
    }
  };

  return (
    <header
      style={{
        height: 70,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
        transition: 'margin-left 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        marginLeft: collapsed ? 80 : 260
      }}
      className="header-container"
    >
      {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          onClick={onToggleMobile}
          className="mobile-only"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-main)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon size={22} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.label}>
                {idx > 0 && <ChevronRight size={12} color="#A1A1AA" />}
                <Link
                  to={b.path}
                  style={{
                    color: idx === breadcrumbs.length - 1 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
                  }}
                >
                  {b.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.01em',
              marginTop: 2,
              lineHeight: 1.2
            }}
          >
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Global Quick Search Form */}
        <form onSubmit={handleQuickSearchSubmit} className="desktop-search" style={{ position: 'relative' }}>
          <Search
            size={16}
            color="var(--color-text-muted)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={quickSearch}
            onChange={e => setQuickSearch(e.target.value)}
            placeholder="Search orders, seats, foods..."
            style={{
              height: 38,
              width: 240,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#FAFAFB',
              fontSize: '0.8125rem',
              color: 'var(--color-text-main)',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          />
        </form>

        {/* Notifications Popover */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#FAFAFB',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: 'var(--color-text-main)'
            }}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {pendingOrders.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 0 2px #FFFFFF'
                }}
              >
                {pendingOrders.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className="animate-slide-down"
              style={{
                position: 'absolute',
                top: 50,
                right: 0,
                width: 340,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                boxShadow: 'var(--shadow-dropdown)',
                border: '1px solid var(--color-border)',
                zIndex: 1060,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                  Live Orders ({pendingOrders.length})
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/orders');
                  }}
                >
                  View All Orders
                </span>
              </div>

              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {pendingOrders.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    No pending orders right now.
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/orders');
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9F9FA')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                            {order.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {order.auditorium} • {order.seat}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>₹{order.total}</div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 4,
                            backgroundColor: order.status === 'Pending' ? '#FEF3C7' : '#EFF6FF',
                            color: order.status === 'Pending' ? '#B45309' : '#1D4ED8'
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px',
              borderRadius: 10,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={settings.profile.avatarUrl}
                alt={settings.profile.name}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
              {/* Online Green Indicator Dot */}
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2px solid #FFFFFF'
                }}
              />
            </div>

            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.2 }}>
                {settings.profile.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                General Manager
              </span>
            </div>
          </div>

          {/* Profile Menu Dropdown */}
          {profileOpen && (
            <div
              className="animate-slide-down"
              style={{
                position: 'absolute',
                top: 50,
                right: 0,
                width: 240,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                boxShadow: 'var(--shadow-dropdown)',
                border: '1px solid var(--color-border)',
                zIndex: 1060,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-main)' }}>
                  {settings.profile.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {settings.profile.email}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#10B981'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669' }}>
                    Online • Super Admin
                  </span>
                </div>
              </div>

              <div style={{ padding: '6px' }}>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-main)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F4F5')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span>Cinema Settings</span>
                  <ExternalLink size={14} color="#71717A" />
                </Link>

                <div
                  onClick={() => {
                    setProfileOpen(false);
                    showToast('System Status', 'All 3 Auditoriums & QR endpoints are operational.', 'info');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-main)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F4F5')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span>Diagnostic Health</span>
                  <CheckCircle size={14} color="#10B981" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
