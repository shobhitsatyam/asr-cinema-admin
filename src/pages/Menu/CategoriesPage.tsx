import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { Category } from '../../types';
import { CategoryModal } from '../../components/menu/CategoryModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  CheckCircle,
  LayoutGrid,
  List,
  Calendar
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, deleteCategory, toggleCategoryStatus, foods } = useAdmin();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Compute live item counts from foods
  const categoriesWithLiveCount = categories.map(cat => {
    const liveCount = foods.filter(f => f.category.toLowerCase() === cat.name.toLowerCase()).length;
    return {
      ...cat,
      itemCount: liveCount || cat.itemCount
    };
  });

  const filteredCategories = categoriesWithLiveCount.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  const targetCategoryToDelete = categories.find(c => c.id === deleteTargetId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
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
            Menu Categories
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Organize cinema food and beverage catalog into patron categories.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View mode toggle */}
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
              title="Cards Grid View"
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

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setCategoryToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SearchInput
          value={search}
          onChange={val => setSearch(val)}
          placeholder="Search categories..."
          width={280}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FolderTree size={16} color="var(--color-primary)" />
            <span><strong>{categories.length}</strong> Total Categories</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} color="#10B981" />
            <span><strong>{categories.filter(c => c.isActive).length}</strong> Active</span>
          </div>
        </div>
      </div>

      {/* Categories Display */}
      {viewMode === 'cards' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}
        >
          {filteredCategories.map(cat => (
            <div key={cat.id} className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 140, position: 'relative' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10
                  }}
                >
                  <Badge variant={cat.isActive ? 'active' : 'inactive'} label={cat.isActive ? 'Active' : 'Hidden'} />
                </div>
              </div>

              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-brand)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--color-text-main)'
                      }}
                    >
                      {cat.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#F3F4F6',
                        padding: '3px 8px',
                        borderRadius: 6
                      }}
                    >
                      {cat.itemCount} Items
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-muted)',
                      marginTop: 6,
                      lineHeight: 1.45,
                      minHeight: 38
                    }}
                  >
                    {cat.description || 'Cinema dining category'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
                    <Calendar size={13} />
                    <span>Created: {cat.createdDate || '15 Jan 2026'}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid var(--color-border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={cat.isActive}
                        onChange={() => toggleCategoryStatus(cat.id)}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {cat.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Edit Category"
                      onClick={() => {
                        setCategoryToEdit(cat);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-icon btn-sm"
                      title="Delete Category"
                      onClick={() => setDeleteTargetId(cat.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Category Name</th>
                  <th>Food Item Count</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ width: 60 }}>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                        {cat.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {cat.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cat.itemCount} items</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={cat.isActive}
                            onChange={() => toggleCategoryStatus(cat.id)}
                          />
                          <span className="toggle-slider" />
                        </label>
                        <Badge variant={cat.isActive ? 'active' : 'inactive'} label={cat.isActive ? 'Active' : 'Hidden'} />
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} color="var(--color-text-muted)" />
                        <span>{cat.createdDate || '15 Jan 2026'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-icon btn-sm"
                          onClick={() => setDeleteTargetId(cat.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteCategory(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${targetCategoryToDelete?.name}"?`}
        confirmLabel="Yes, Delete Category"
        isDestructive={true}
      />
    </div>
  );
};
