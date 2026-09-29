import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Armchair,
  ShoppingBag,
  CreditCard,
  Users,
  TicketPercent,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clapperboard,
  Pizza,
  Layers,
  FolderTree
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const location = useLocation();
  const { orders } = useAdmin();
  const isMenuPathActive = location.pathname.startsWith('/menu');
  const [menuExpanded, setMenuExpanded] = useState<boolean>(true);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  const mainNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Seats & QR',
      path: '/seats',
      icon: Armchair,
      badge: 'Live'
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: ShoppingBag,
      badge: `${pendingOrdersCount} Pending`
    },
    {
      label: 'Payments',
      path: '/payments',
      icon: CreditCard
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: Users
    },
    {
      label: 'Coupons',
      path: '/coupons',
      icon: TicketPercent
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: BarChart3
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  const menuSubItems = [
    { label: 'Food Items', path: '/menu/foods', icon: Pizza },
    { label: 'Categories', path: '/menu/categories', icon: FolderTree },
    { label: 'Combos', path: '/menu/combos', icon: Layers }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1040,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        style={{
          width: collapsed ? 80 : 260,
          backgroundColor: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1045,
          transition: 'width 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: mobileOpen ? 'translateX(0)' : undefined
        }}
        className={mobileOpen ? 'mobile-sidebar-open' : 'sidebar-desktop'}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 70,
            padding: collapsed ? '0 16px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--color-sidebar-border)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
              overflow: 'hidden'
            }}
          >
            {/* ASR Red Badge Logo */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(227, 27, 35, 0.35)',
                flexShrink: 0
              }}
            >
              <Clapperboard size={20} color="#FFFFFF" />
            </div>

            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-brand)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    color: '#FFFFFF',
                    lineHeight: 1.1
                  }}
                >
                  ASR <span style={{ color: 'var(--color-primary)' }}>CINEMAS</span>
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: 'var(--color-sidebar-text)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: 2
                  }}
                >
                  Admin Portal
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="desktop-only"
              title="Collapse Sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-sidebar-text)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="desktop-only"
              title="Expand Sidebar"
              style={{
                background: 'var(--color-sidebar-card)',
                border: '1px solid var(--color-sidebar-border)',
                color: 'var(--color-sidebar-text)',
                cursor: 'pointer',
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: collapsed ? '12px 8px' : '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            title={collapsed ? 'Dashboard' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px' : '11px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
              color: isActive ? '#FFFFFF' : 'var(--color-sidebar-text)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(227, 27, 35, 0.3)' : 'none'
            })}
          >
            <LayoutDashboard size={19} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Menu Parent with Sub-items */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={() => setMenuExpanded(!menuExpanded)}
              title={collapsed ? 'Menu' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'space-between',
                borderRadius: 10,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                color: isMenuPathActive ? '#FFFFFF' : 'var(--color-sidebar-text)',
                backgroundColor: isMenuPathActive && !menuExpanded ? 'var(--color-sidebar-card)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UtensilsCrossed size={19} color={isMenuPathActive ? 'var(--color-primary)' : undefined} />
                {!collapsed && <span>Menu</span>}
              </div>
              {!collapsed && (
                <div style={{ color: 'var(--color-sidebar-text)' }}>
                  {menuExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </div>
              )}
            </button>

            {/* Sub-menu items */}
            {menuExpanded && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  marginTop: 2,
                  paddingLeft: collapsed ? 0 : 16,
                  borderLeft: collapsed ? 'none' : '1px solid var(--color-sidebar-border)',
                  marginLeft: collapsed ? 0 : 20
                }}
              >
                {menuSubItems.map(item => {
                  const SubIcon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: collapsed ? '10px' : '8px 12px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)',
                        color: isActive ? '#FFFFFF' : 'var(--color-sidebar-text)',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent'
                      })}
                    >
                      <SubIcon size={16} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining Nav Items */}
          {mainNavItems.slice(1).map(item => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '12px' : '11px 14px',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  borderRadius: 10,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  color: isActive ? '#FFFFFF' : 'var(--color-sidebar-text)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(227, 27, 35, 0.3)' : 'none'
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ItemIcon size={19} />
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Auditoriums Live Indicator Footer */}
        {!collapsed && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--color-sidebar-border)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 8px #10B981'
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#E5E7EB', fontWeight: 600 }}>
                  Live System Active
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-sidebar-text)' }}>
                3 Screens
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
