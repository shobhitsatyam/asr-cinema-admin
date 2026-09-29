import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { Customer } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Drawer } from '../../components/common/Drawer';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import {
  Eye,
  Phone,
  Mail,
  ShoppingBag,
  Sparkles,
  MapPin
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, orders } = useAdmin();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [customers, search, selectedStatus]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  // Retrieve customer's orders from admin context
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      o =>
        o.customer.name.toLowerCase() === selectedCustomer.name.toLowerCase() ||
        o.customer.phone === selectedCustomer.mobile
    );
  }, [selectedCustomer, orders]);

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
            Cinema Customers
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Patrons who order refreshments using in-theatre Scan-to-Food QR codes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              padding: '6px 14px',
              backgroundColor: '#FFF7ED',
              border: '1px solid #FFEDD5',
              borderRadius: 9999,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#C2410C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={14} />
            <span>{customers.filter(c => c.status === 'VIP').length} Loyalty VIP Guests</span>
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Filter bar */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <SearchInput
              value={search}
              onChange={val => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search customer by name, mobile, email..."
              width={300}
            />

            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Customer Tiers</option>
              <option value="VIP">VIP Patrons</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredCustomers.length}</strong> patrons
          </div>
        </div>

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Try searching with a different name or phone number."
          />
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile Number</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                  <th>Tier Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div>
                        <span
                          onClick={() => setSelectedCustomer(customer)}
                          style={{
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          {customer.name}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {customer.email}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem', fontFamily: 'monospace' }}>
                        {customer.mobile}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600 }}>{customer.ordersCount} orders</span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {customer.lastOrder}
                    </td>

                    <td>
                      <Badge variant={customer.status.toLowerCase()} label={customer.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm"
                        title="View Customer Profile & History"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredCustomers.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Customer Detail Drawer */}
      <Drawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Customer Details'}
        subtitle="Cinema Patron Profile & Dining History"
        width={480}
        footer={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelectedCustomer(null)}>
            Close Profile
          </button>
        }
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div
              style={{
                padding: '18px',
                borderRadius: 12,
                backgroundColor: '#FAFAFB',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {selectedCustomer.name.charAt(0)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.15rem', fontWeight: 700 }}>
                    {selectedCustomer.name}
                  </h4>
                  <Badge variant={selectedCustomer.status.toLowerCase()} label={selectedCustomer.status} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Member since {selectedCustomer.joinedDate}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--color-border-subtle)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Orders</span>
                <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700, marginTop: 2 }}>
                  {selectedCustomer.ordersCount}
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--color-border-subtle)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Spend</span>
                <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
                  {formatCurrency(selectedCustomer.totalSpent)}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--color-border-subtle)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={15} color="var(--color-text-muted)" />
                <span>{selectedCustomer.mobile}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={15} color="var(--color-text-muted)" />
                <span>{selectedCustomer.email}</span>
              </div>
              {selectedCustomer.favoriteAudi && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={15} color="var(--color-text-muted)" />
                  <span>Preferred Screen: <strong>{selectedCustomer.favoriteAudi}</strong></span>
                </div>
              )}
            </div>

            {/* Order History */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingBag size={16} color="var(--color-primary)" />
                Recent Orders by Patron
              </h4>

              {customerOrders.length === 0 ? (
                <div style={{ padding: '16px', backgroundColor: '#FAFAFB', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  Last recorded: {selectedCustomer.lastOrder}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {customerOrders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                          {order.id}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {order.auditorium} • {order.seat} • {order.time}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {formatCurrency(order.total)}
                        </div>
                        <Badge variant={order.status.toLowerCase()} label={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
