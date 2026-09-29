import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { Modal } from '../common/Modal';
import { useAdmin } from '../../context/AdminContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

const sampleCategoryImages = [
  { label: 'Popcorn', url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop&q=60' },
  { label: 'Beverages', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60' },
  { label: 'Food Meals', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60' },
  { label: 'Coffee', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=60' },
  { label: 'Combos', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60' },
  { label: 'Snacks', url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&auto=format&fit=crop&q=60' }
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit
}) => {
  const { addCategory, updateCategory } = useAdmin();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(sampleCategoryImages[0].url);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || '');
      setImage(categoryToEdit.image);
      setIsActive(categoryToEdit.isActive);
    } else {
      setName('');
      setDescription('');
      setImage(sampleCategoryImages[0].url);
      setIsActive(true);
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name,
        slug,
        description,
        image,
        isActive
      });
    } else {
      addCategory({
        name,
        slug,
        iconName: 'Utensils',
        image,
        isActive,
        description
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Category' : 'Add New Category'}
      subtitle={categoryToEdit ? `Updating ${categoryToEdit.name}` : 'Organize cinema concession menus'}
      maxWidth={500}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Category Name *</label>
          <input
            type="text"
            className="form-input"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Gourmet Popcorn"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Freshly popped popcorn buckets..."
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Category Icon / Image (Upload or Enter URL) *</label>
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#FAFAFB',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt="Category preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>No icon</span>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          if (ev.target?.result) {
                            setImage(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span>Upload Image</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>or paste link</span>
              </div>

              <input
                type="text"
                className="form-input"
                style={{ height: 34, fontSize: '0.8125rem' }}
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Quick Presets:</span>
            {sampleCategoryImages.map(preset => (
              <button
                key={preset.label}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setImage(preset.url)}
                style={{ padding: '2px 8px', fontSize: '0.7rem' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Status</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? '#059669' : '#6B6B73' }}>
              {isActive ? 'Active (Visible on QR)' : 'Hidden / Inactive'}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
