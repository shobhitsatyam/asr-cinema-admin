import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { Combo } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Layers,
  Minus
} from 'lucide-react';

interface ComboItemEntry {
  name: string;
  quantity: number;
}

const sampleComboImages = [
  { label: 'Family Popcorn & Drink', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80' },
  { label: 'Couple Popcorn Bucket', url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80' },
  { label: 'Burger & Drink Feast', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80' },
  { label: 'Snack Fries Trio', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80' }
];

const quickSuggestions = [
  'Medium Popcorn (300 gm)',
  'Large Popcorn (350 gm)',
  'Cold Drinks (350 ml)',
  'Cappuccino Coffee',
  'Mexican Nachos with Cheese Dip',
  'Peri Peri French Fries'
];

export const CombosPage: React.FC = () => {
  const { combos, addCombo, updateCombo, deleteCombo, toggleComboAvailability } = useAdmin();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboToEdit, setComboToEdit] = useState<Combo | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(999);
  const [originalPrice, setOriginalPrice] = useState<number>(1199);
  const [image, setImage] = useState(sampleComboImages[0].url);
  const [badge, setBadge] = useState('Popular');
  const [itemsList, setItemsList] = useState<ComboItemEntry[]>([
    { name: 'Large Popcorn (350 gm)', quantity: 1 },
    { name: 'Cold Drinks', quantity: 2 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState(true);

  // Helper to parse strings like "2 Medium Popcorn (300 gm)" into ComboItemEntry
  const parseItemString = (str: string): ComboItemEntry => {
    const match = str.match(/^(\d+)x?\s+(.+)$/i);
    if (match) {
      return { quantity: parseInt(match[1], 10), name: match[2].trim() };
    }
    return { quantity: 1, name: str.trim() };
  };

  const openAddModal = () => {
    setComboToEdit(null);
    setName('');
    setDescription('');
    setSellingPrice(999);
    setOriginalPrice(1199);
    setImage(sampleComboImages[0].url);
    setBadge('Popular');
    setItemsList([
      { name: 'Large Popcorn (350 gm)', quantity: 1 },
      { name: 'Cold Drinks', quantity: 2 }
    ]);
    setNewItemName('');
    setNewItemQty(1);
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Combo) => {
    setComboToEdit(c);
    setName(c.name);
    setDescription(c.description);
    setSellingPrice(c.sellingPrice);
    setOriginalPrice(c.originalPrice);
    setImage(c.image);
    setBadge(c.badge || '');
    setItemsList(c.items.map(parseItemString));
    setNewItemName('');
    setNewItemQty(1);
    setIsAvailable(c.isAvailable);
    setIsModalOpen(true);
  };

  const handleAddItem = (nameToAdd?: string) => {
    const targetName = (nameToAdd || newItemName).trim();
    if (!targetName) return;

    setItemsList(prev => {
      const existingIdx = prev.findIndex(i => i.name.toLowerCase() === targetName.toLowerCase());
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItemQty;
        return copy;
      }
      return [...prev, { name: targetName, quantity: newItemQty }];
    });

    setNewItemName('');
    setNewItemQty(1);
  };

  const handleUpdateItemQty = (index: number, delta: number) => {
    setItemsList(prev => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItemsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Convert itemsList to display strings e.g. "2 Medium Popcorn (300 gm)"
    const formattedItems = itemsList.map(item =>
      item.quantity > 1 ? `${item.quantity} ${item.name}` : item.name
    );

    if (comboToEdit) {
      updateCombo(comboToEdit.id, {
        name,
        description,
        sellingPrice: Number(sellingPrice),
        originalPrice: Number(originalPrice),
        image,
        badge,
        items: formattedItems.length > 0 ? formattedItems : ['1 Popcorn Tub', '2 Cold Drinks'],
        isAvailable
      });
    } else {
      addCombo({
        name,
        description,
        sellingPrice: Number(sellingPrice),
        originalPrice: Number(originalPrice),
        image,
        badge,
        items: formattedItems.length > 0 ? formattedItems : ['1 Popcorn Tub', '2 Cold Drinks'],
        isAvailable
      });
    }

    setIsModalOpen(false);
  };

  const filteredCombos = combos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.items.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  const targetComboToDelete = combos.find(c => c.id === deleteTargetId);

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
            Combo Meals Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Create bundled high-margin cinema refreshment combos for pairs, groups, and families.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                border: 'none',
                padding: '8px 12px',
                background: viewMode === 'cards' ? 'var(--color-primary-light)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Cards View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                padding: '8px 12px',
                background: viewMode === 'table' ? 'var(--color-primary-light)' : 'transparent',
                color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add Combo</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SearchInput
          value={search}
          onChange={val => setSearch(val)}
          placeholder="Search combo meals or included items..."
          width={300}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={16} color="var(--color-primary)" />
            <span><strong>{combos.length}</strong> Combos Total</span>
          </div>
          <div>
            <span style={{ color: '#059669', fontWeight: 600 }}>
              ● {combos.filter(c => c.isAvailable).length} Available Live
            </span>
          </div>
        </div>
      </div>

      {/* Combos Content Display */}
      {viewMode === 'cards' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
        >
          {filteredCombos.map(combo => {
            const savings = Math.max(0, combo.originalPrice - combo.sellingPrice);
            const discountPct = combo.originalPrice > 0 ? Math.round((savings / combo.originalPrice) * 100) : 0;

            return (
              <div
                key={combo.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* Image banner */}
                <div style={{ height: 160, position: 'relative' }}>
                  <img
                    src={combo.image}
                    alt={combo.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      gap: 6
                    }}
                  >
                    {combo.badge && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF'
                        }}
                      >
                        {combo.badge}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: '#10B981',
                          color: '#FFFFFF'
                        }}
                      >
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Combo Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-brand)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--color-text-main)'
                      }}
                    >
                      {combo.name}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        marginTop: 6,
                        lineHeight: 1.45
                      }}
                    >
                      {combo.description}
                    </p>

                    {/* Included Items list */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em', marginBottom: 6 }}>
                        Included in this Combo:
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {combo.items.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--color-text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <CheckCircle size={14} color="#10B981" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing & Footer Actions */}
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-brand)',
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            color: 'var(--color-primary)'
                          }}
                        >
                          {formatCurrency(combo.sellingPrice)}
                        </span>
                        {combo.originalPrice > combo.sellingPrice && (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-muted)',
                              textDecoration: 'line-through'
                            }}
                          >
                            {formatCurrency(combo.originalPrice)}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                          Save {formatCurrency(savings)} ({discountPct}% OFF)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label className="toggle-switch" title="Toggle live availability">
                        <input
                          type="checkbox"
                          checked={combo.isAvailable}
                          onChange={() => toggleComboAvailability(combo.id)}
                        />
                        <span className="toggle-slider" />
                      </label>

                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Edit Combo"
                        onClick={() => openEditModal(combo)}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-icon btn-sm"
                        title="Delete Combo"
                        onClick={() => setDeleteTargetId(combo.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Combo</th>
                  <th>Included Items</th>
                  <th>Original Price</th>
                  <th>Selling Price</th>
                  <th>Discount</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCombos.map(combo => {
                  const savings = Math.max(0, combo.originalPrice - combo.sellingPrice);
                  const discountPct = combo.originalPrice > 0 ? Math.round((savings / combo.originalPrice) * 100) : 0;

                  return (
                    <tr key={combo.id}>
                      {/* Combo Image + Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={combo.image}
                            alt={combo.name}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: '1px solid var(--color-border)',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                              {combo.name}
                            </span>
                            {combo.badge && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: '#FEF2F2',
                                  color: 'var(--color-primary)',
                                  padding: '1px 6px',
                                  borderRadius: 4
                                }}
                              >
                                {combo.badge}
                              </span>
                            )}
                            <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {combo.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Included Items */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>
                          {combo.items.map((item, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: '#F3F4F6',
                                color: 'var(--color-text-secondary)',
                                padding: '2px 7px',
                                borderRadius: 6,
                                fontWeight: 500
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Original Price */}
                      <td>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          {formatCurrency(combo.originalPrice)}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                          {formatCurrency(combo.sellingPrice)}
                        </span>
                      </td>

                      {/* Discount */}
                      <td>
                        {savings > 0 ? (
                          <div>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#ECFDF5',
                                color: '#059669',
                                padding: '2px 7px',
                                borderRadius: 6
                              }}
                            >
                              Save {formatCurrency(savings)}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                              {discountPct}% OFF
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>None</span>
                        )}
                      </td>

                      {/* Availability */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={combo.isAvailable}
                              onChange={() => toggleComboAvailability(combo.id)}
                            />
                            <span className="toggle-slider" />
                          </label>
                          <Badge
                            variant={combo.isAvailable ? 'available' : 'blocked'}
                            label={combo.isAvailable ? 'Live' : 'Unavailable'}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Edit Combo"
                            onClick={() => openEditModal(combo)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-icon btn-sm"
                            title="Delete Combo"
                            onClick={() => setDeleteTargetId(combo.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Combo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={comboToEdit ? 'Edit Combo Meal' : 'Create New Combo'}
        subtitle={comboToEdit ? `Updating ${comboToEdit.name}` : 'Assemble cinema meal bundles'}
        maxWidth={620}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              {comboToEdit ? 'Save Combo' : 'Create Combo'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Combo Title *</label>
            <input
              type="text"
              className="form-input"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Family Combo, Couple Combo"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                className="form-input"
                required
                min={1}
                value={sellingPrice}
                onChange={e => setSellingPrice(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Original Price / MRP (₹) *</label>
              <input
                type="number"
                className="form-input"
                required
                min={1}
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Real-time Discount Display */}
          {originalPrice > sellingPrice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                fontSize: '0.8125rem'
              }}
            >
              <span style={{ color: '#065F46', fontWeight: 600 }}>
                Calculated Patron Savings:
              </span>
              <span style={{ color: '#047857', fontWeight: 700 }}>
                Save {formatCurrency(originalPrice - sellingPrice)} ({Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)}% OFF)
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Promotional Tag / Badge</label>
              <input
                type="text"
                className="form-input"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="e.g. Bestseller, Special Offer"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Live Availability</label>
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
                  {isAvailable ? 'In Stock / Live' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Included Items Builder & Quantity Management */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Included Items in Bundle (with Quantities) *</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {/* Quantity Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-md)', padding: '2px 4px' }}>
                <button
                  type="button"
                  onClick={() => setNewItemQty(Math.max(1, newItemQty - 1))}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                  {newItemQty}
                </span>
                <button
                  type="button"
                  onClick={() => setNewItemQty(newItemQty + 1)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <input
                type="text"
                className="form-input"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Item name (e.g. Cold Drinks 350 ml)"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
              />

              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAddItem()}>
                <Plus size={15} />
                <span>Add Item</span>
              </button>
            </div>

            {/* Quick Suggestions from menu */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Quick add:</span>
              {quickSuggestions.map(sug => (
                <button
                  key={sug}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => handleAddItem(sug)}
                >
                  + {sug}
                </button>
              ))}
            </div>

            {/* Configured Included Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {itemsList.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: '#FAFAFB',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, -1)}
                        style={{ border: 'none', background: '#E5E7EB', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, 1)}
                        style={{ border: 'none', background: '#E5E7EB', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {item.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#EF4444',
                      padding: 4
                    }}
                    title="Remove item"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Combo Image Upload & Presets */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Combo Image (Upload or Enter URL)</label>
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: '#FAFAFB',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (ev.target?.result) setImage(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span>Upload Image</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>or paste URL</span>
                </div>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: 32, fontSize: '0.8125rem' }}
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Sparkles size={11} /> Quick Presets:
              </span>
              {sampleComboImages.map(preset => (
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
              placeholder="Freshly prepared combo package..."
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
            deleteCombo(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Combo Meal"
        message={`Are you sure you want to delete "${targetComboToDelete?.name}"?`}
        confirmLabel="Yes, Delete Combo"
        isDestructive={true}
      />
    </div>
  );
};
