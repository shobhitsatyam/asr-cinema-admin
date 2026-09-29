import React from 'react';
import type { FoodItem } from '../../types';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Clock, Tag, Edit3, Trash2 } from 'lucide-react';

interface FoodViewDrawerProps {
  food: FoodItem | null;
  onClose: () => void;
  onEdit: (food: FoodItem) => void;
  onDelete: (id: string) => void;
}

export const FoodViewDrawer: React.FC<FoodViewDrawerProps> = ({
  food,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!food) return null;

  return (
    <Drawer
      isOpen={!!food}
      onClose={onClose}
      title={food.name}
      subtitle={`${food.category} • Concession Food`}
      width={460}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              onDelete(food.id);
              onClose();
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onEdit(food);
              onClose();
            }}
          >
            <Edit3 size={14} />
            <span>Edit Item</span>
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Food Hero Image */}
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 220 }}>
          <img
            src={food.image}
            alt={food.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 6
            }}
          >
            <Badge variant={food.type === 'Veg' ? 'veg' : 'non-veg'} label={food.type} />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 9999,
                backgroundColor: food.isAvailable ? '#10B981' : '#EF4444',
                color: '#FFFFFF'
              }}
            >
              {food.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Pricing & Prep */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            padding: 16,
            backgroundColor: '#FAFAFB',
            borderRadius: 12,
            border: '1px solid var(--color-border)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Selling Price</span>
            <div
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginTop: 2
              }}
            >
              {formatCurrency(food.price)}
            </div>
            {food.originalPrice && food.originalPrice > food.price && (
              <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                MRP {formatCurrency(food.originalPrice)}
              </span>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Preparation Time</span>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Clock size={16} color="var(--color-primary)" />
              {food.prepTime}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            Description
          </h5>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
            {food.description || 'No specific description added.'}
          </p>
        </div>

        {/* Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={14} />
            <span>Category: <strong style={{ color: 'var(--color-text-main)' }}>{food.category}</strong></span>
          </div>
          <div>
            Last updated: <span style={{ color: 'var(--color-text-main)' }}>{food.updatedAt}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
