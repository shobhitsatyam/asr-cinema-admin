import React, { useState, useEffect } from 'react';
import type { FoodItem, FoodType } from '../../types';
import { Modal } from '../common/Modal';
import { useAdmin } from '../../context/AdminContext';
import { Sparkles } from 'lucide-react';

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodToEdit?: FoodItem | null;
}

const sampleImages = [
  { label: 'Popcorn Tub', url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80' },
  { label: 'Nachos', url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Cold Drink', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80' },
  { label: 'Coffee', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80' },
  { label: 'Fries', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80' }
];

export const FoodModal: React.FC<FoodModalProps> = ({ isOpen, onClose, foodToEdit }) => {
  const { addFood, updateFood, categories } = useAdmin();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Popcorn');
  const [type, setType] = useState<FoodType>('Veg');
  const [price, setPrice] = useState<number>(250);
  const [originalPrice, setOriginalPrice] = useState<number>(290);
  const [prepTime, setPrepTime] = useState('5-8 mins');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(sampleImages[0].url);
  const [isAvailable, setIsAvailable] = useState(true);

  // Populate data when editing
  useEffect(() => {
    if (foodToEdit) {
      setName(foodToEdit.name);
      setCategory(foodToEdit.category);
      setType(foodToEdit.type);
      setPrice(foodToEdit.price);
      setOriginalPrice(foodToEdit.originalPrice || foodToEdit.price + 40);
      setPrepTime(foodToEdit.prepTime);
      setDescription(foodToEdit.description);
      setImage(foodToEdit.image);
      setIsAvailable(foodToEdit.isAvailable);
    } else {
      setName('');
      setCategory(categories[0]?.name || 'Popcorn');
      setType('Veg');
      setPrice(280);
      setOriginalPrice(320);
      setPrepTime('5-7 mins');
      setDescription('');
      setImage(sampleImages[0].url);
      setIsAvailable(true);
    }
  }, [foodToEdit, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (foodToEdit) {
      updateFood(foodToEdit.id, {
        name,
        category,
        type,
        price: Number(price),
        originalPrice: Number(originalPrice),
        prepTime,
        description,
        image,
        isAvailable
      });
    } else {
      addFood({
        name,
        category,
        type,
        price: Number(price),
        originalPrice: Number(originalPrice),
        prepTime,
        description,
        image,
        isAvailable
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={foodToEdit ? 'Edit Food Item' : 'Add New Food Item'}
      subtitle={foodToEdit ? `Updating ${foodToEdit.name}` : 'Create a cinema concession item'}
      maxWidth={580}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {foodToEdit ? 'Save Changes' : 'Save Food'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Food Item Name *</label>
          <input
            type="text"
            className="form-input"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Large Caramel Crunch Popcorn"
          />
        </div>

        {/* Category & Veg/Non-Veg */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dietary Type</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: type === 'Veg' ? '#ECFDF5' : '#F4F4F5',
                  border: `1px solid ${type === 'Veg' ? '#10B981' : '#E5E7EB'}`
                }}
              >
                <input
                  type="radio"
                  name="dietType"
                  value="Veg"
                  checked={type === 'Veg'}
                  onChange={() => setType('Veg')}
                />
                <span style={{ fontWeight: 600, color: '#065F46' }}>Veg</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: type === 'Non-Veg' ? '#FEF2F2' : '#F4F4F5',
                  border: `1px solid ${type === 'Non-Veg' ? '#EF4444' : '#E5E7EB'}`
                }}
              >
                <input
                  type="radio"
                  name="dietType"
                  value="Non-Veg"
                  checked={type === 'Non-Veg'}
                  onChange={() => setType('Non-Veg')}
                />
                <span style={{ fontWeight: 600, color: '#991B1B' }}>Non-Veg</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Selling Price (₹) *</label>
            <input
              type="number"
              className="form-input"
              required
              min={1}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Original Price / MRP (₹)</label>
            <input
              type="number"
              className="form-input"
              min={1}
              value={originalPrice}
              onChange={e => setOriginalPrice(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Prep Time & Availability */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Preparation Time</label>
            <input
              type="text"
              className="form-input"
              value={prepTime}
              onChange={e => setPrepTime(e.target.value)}
              placeholder="e.g. 5-7 mins"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Initial Availability</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={e => setIsAvailable(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isAvailable ? '#059669' : '#6B6B73' }}>
                {isAvailable ? 'In Stock / Ready' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Image Upload & Preview UI */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Food Image (Upload File or Enter URL) *</label>
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
            {/* Image Preview Thumbnail */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt="Food preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>No image</span>
              )}
            </div>

            {/* Upload Controls */}
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
                  <span>Upload Image File</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>or paste URL below</span>
              </div>

              <input
                type="text"
                className="form-input"
                style={{ height: 34, fontSize: '0.8125rem' }}
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Quick Cinema Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Sparkles size={11} /> Quick Cinema Presets:
            </span>
            {sampleImages.map(preset => (
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

        {/* Description */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Crisp golden popcorn seasoned with warm cinema butter..."
          />
        </div>
      </form>
    </Modal>
  );
};
