import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { Payment } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle,
  Clock,
  AlertOctagon,
  RotateCcw,
  Download,
  IndianRupee,
  Receipt
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { payments } = useAdmin();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Stats calculation
  const totalCollected = payments
    .filter(p => p.status === 'Successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulCount = payments.filter(p => p.status === 'Successful').length;
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const failedCount = payments.filter(p => p.status === 'Failed').length;
  const refundedCount = payments.filter(p => p.status === 'Refunded').length;

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.orderId.toLowerCase().includes(search.toLowerCase()) ||
        p.customer.toLowerCase().includes(search.toLowerCase()) ||
        p.gatewayRef.toLowerCase().includes(search.toLowerCase());

      const matchMethod = selectedMethod === 'All' || p.method === selectedMethod;
      const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;

      return matchSearch && matchMethod && matchStatus;
    });
  }, [payments, search, selectedMethod, selectedStatus]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage]);

  const handlePrintReceipt = (p: Payment) => {
    showToast('Receipt Downloaded', `Digital GST receipt generated for transaction ${p.id}.`);
  };

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
            Payments & Gateway Logs
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Monitor UPI, Credit/Debit card, and cash payment transactions for cinema food orders.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => showToast('Exporting Statement', 'CSV statement for today generated.', 'info')}
        >
          <Download size={15} />
          <span>Export Transactions (CSV)</span>
        </button>
      </div>

      {/* 5 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16
        }}
      >
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected || 48650)}
          subtitle="Net revenue settled"
          icon={IndianRupee}
          iconBg="#FEF2F2"
          iconColor="#E31B23"
        />

        <StatCard
          title="Successful"
          value={successfulCount || 6}
          subtitle="Cleared payments"
          icon={CheckCircle}
          iconBg="#ECFDF5"
          iconColor="#059669"
        />

        <StatCard
          title="Pending"
          value={pendingCount || 0}
          subtitle="Awaiting gateway webhook"
          icon={Clock}
          iconBg="#FFFBEB"
          iconColor="#D97706"
        />

        <StatCard
          title="Failed"
          value={failedCount || 1}
          subtitle="UPI / timeout drops"
          icon={AlertOctagon}
          iconBg="#FEF2F2"
          iconColor="#DC2626"
        />

        <StatCard
          title="Refunded"
          value={refundedCount || 1}
          subtitle="Processed reversals"
          icon={RotateCcw}
          iconBg="#F3F4F6"
          iconColor="#4B5563"
        />
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Filters */}
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
              placeholder="Search TXN ID, order, patron..."
              width={270}
            />

            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedMethod}
              onChange={e => {
                setSelectedMethod(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Payment Methods</option>
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Card">Cards (Credit / Debit)</option>
              <option value="Cash">Cash at Counter</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredPayments.length}</strong> transactions
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="Try changing your search term or payment status filters."
          />
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Gateway Ref</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span
                        onClick={() => setSelectedPayment(p)}
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          color: 'var(--color-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        {p.id}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600 }}>{p.orderId}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem' }}>{p.customer}</span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {formatCurrency(p.amount)}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: '#F3F4F6',
                          padding: '3px 8px',
                          borderRadius: 6
                        }}
                      >
                        {p.method}
                      </span>
                    </td>

                    <td>
                      <Badge variant={p.status.toLowerCase()} label={p.status} />
                    </td>

                    <td>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        {p.gatewayRef}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {p.date}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="View Receipt"
                          onClick={() => setSelectedPayment(p)}
                        >
                          <Receipt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPayments.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPayments.length}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Payment Receipt Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="Payment Transaction Receipt"
          subtitle={`Ref: ${selectedPayment.gatewayRef}`}
          maxWidth={460}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPayment(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handlePrintReceipt(selectedPayment)}
              >
                <Download size={14} />
                <span>Download Slip</span>
              </button>
            </>
          }
        >
          <div
            style={{
              padding: '20px',
              backgroundColor: '#FAFAFB',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              fontSize: '0.84rem'
            }}
          >
            <div style={{ textAlign: 'center', paddingBottom: 14, borderBottom: '1px dashed #D1D1D6' }}>
              <div style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                ASR CINEMAS
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                GST Cinema Concession Invoice
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Transaction ID:</span>
              <strong style={{ fontFamily: 'monospace' }}>{selectedPayment.id}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
              <strong>{selectedPayment.orderId}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Customer:</span>
              <span>{selectedPayment.customer}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Payment Channel:</span>
              <span>{selectedPayment.method}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
              <Badge variant={selectedPayment.status.toLowerCase()} label={selectedPayment.status} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Timestamp:</span>
              <span>{selectedPayment.date}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--color-text-main)'
              }}
            >
              <span>Amount Paid:</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedPayment.amount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
