import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { Coupon } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const CouponsPage: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useAdmin();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrder, setMinOrder] = useState<number>(399);
  const [maxDiscount, setMaxDiscount] = useState<number>(150);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [expiry, setExpiry] = useState('2026-12-31');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setCouponToEdit(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(20);
    setMinOrder(399);
    setMaxDiscount(150);
    setUsageLimit(500);
    setExpiry('2026-12-31');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setCouponToEdit(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrder(c.minOrder);
    setMaxDiscount(c.maxDiscount);
    setUsageLimit(c.usageLimit);
    setExpiry(c.expiry);
    setDescription(c.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const formattedCode = code.trim().toUpperCase();

    if (couponToEdit) {
      updateCoupon(couponToEdit.id, {
        code: formattedCode,
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        maxDiscount: Number(maxDiscount),
        usageLimit: Number(usageLimit),
        expiry,
        description
      });
    } else {
      addCoupon({
        code: formattedCode,
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        maxDiscount: Number(maxDiscount),
        usageLimit: Number(usageLimit),
        expiry,
        status: 'Active',
        description
      });
    }

    setIsModalOpen(false);
  };

  const handleCopyCode = (c: Coupon) => {
    navigator.clipboard.writeText(c.code);
    showToast('Promo Code Copied', `Code ${c.code} copied to clipboard.`);
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const targetCouponToDelete = coupons.find(c => c.id === deleteTargetId);

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
            Promotions & Coupons
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Create discount codes, movie night offers, and introductory Scan-to-Food vouchers.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SearchInput
          value={search}
          onChange={val => setSearch(val)}
          placeholder="Search coupon code (e.g. WELCOME100)..."
          width={320}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8125rem' }}>
          <span><strong>{coupons.length}</strong> Configured</span>
          <span style={{ color: '#059669', fontWeight: 600 }}>
            ● {coupons.filter(c => c.status === 'Active').length} Active Live
          </span>
        </div>
      </div>

      {/* Coupons Grid Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20
        }}
      >
        {filteredCoupons.map(coupon => {
          const isExpired = coupon.status === 'Expired';
          const usagePercent = Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));

          return (
            <div
              key={coupon.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderLeft: `4px solid ${coupon.status === 'Active' ? 'var(--color-primary)' : '#9CA3AF'}`
              }}
            >
              <div>
                {/* Header Code & Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 10px',
                      backgroundColor: '#FEF2F2',
                      border: '1px dashed var(--color-primary-border)',
                      borderRadius: 8,
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <span>{coupon.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: 'var(--color-primary)' }}
                      title="Copy Code"
                    >
                      <Copy size={13} />
                    </button>
                  </div>

                  <Badge variant={coupon.status.toLowerCase()} label={coupon.status} />
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-brand)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    marginTop: 12
                  }}
                >
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `FLAT ₹${coupon.discountValue} OFF`}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                  {coupon.description || 'Special cinema concession discount offer'}
                </p>

                {/* Requirements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Min. Order Value:</span>
                    <strong>{formatCurrency(coupon.minOrder)}</strong>
                  </div>

                  {coupon.discountType === 'percentage' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Max Discount Cap:</span>
                      <strong>{formatCurrency(coupon.maxDiscount)}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Valid Until:</span>
                    <strong>{coupon.expiry}</strong>
                  </div>
                </div>

                {/* Usage meter */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    <span>Usage: {coupon.usedCount} of {coupon.usageLimit} claims</span>
                    <span>{usagePercent}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${usagePercent}%`,
                        backgroundColor: usagePercent > 85 ? '#EF4444' : 'var(--color-primary)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={coupon.status === 'Active'}
                      disabled={isExpired}
                      onChange={() => toggleCouponStatus(coupon.id)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {coupon.status === 'Active' ? 'Live' : 'Off'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon btn-sm"
                    title="Edit Coupon"
                    onClick={() => openEditModal(coupon)}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-icon btn-sm"
                    title="Delete Coupon"
                    onClick={() => setDeleteTargetId(coupon.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={couponToEdit ? 'Edit Coupon' : 'Create New Coupon'}
        subtitle="Manage patron discount promotions"
        maxWidth={500}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              {couponToEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Coupon Code (Uppercase) *</label>
            <input
              type="text"
              className="form-input"
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MOVIEFEAST"
              style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Type</label>
              <select
                className="form-select"
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                className="form-input"
                required
                min={1}
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Minimum Order (₹)</label>
              <input
                type="number"
                className="form-input"
                min={0}
                value={minOrder}
                onChange={e => setMinOrder(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Discount Cap (₹)</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={maxDiscount}
                onChange={e => setMaxDiscount(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Total Usage Limit</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={usageLimit}
                onChange={e => setUsageLimit(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description / Patron Benefit</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 20% off on all snacks for weekend movie goers"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteCoupon(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Coupon"
        message={`Are you sure you want to delete promo code "${targetCouponToDelete?.code}"?`}
        confirmLabel="Yes, Delete Code"
        isDestructive={true}
      />
    </div>
  );
};
