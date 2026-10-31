import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { FoodItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { FoodModal } from '../../components/menu/FoodModal';
import { FoodViewDrawer } from '../../components/menu/FoodViewDrawer';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Utensils,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export const FoodItemsPage: React.FC = () => {
  const { foods, deleteFood, toggleFoodAvailability, updateStock, categories } = useAdmin();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [selectedStock, setSelectedStock] = useState<string>('All');

  // Modals & Drawers state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);
  const [foodToView, setFoodToView] = useState<FoodItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Loading states for actions
  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState<string | null>(null);
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Stats calculation
  const totalItems = foods.length;
  const availableCount = foods.filter(f => f.isAvailable).length;
  const unavailableCount = foods.filter(f => !f.isAvailable).length;
  const lowStockCount = foods.filter(f => (f.stock ?? 100) > 0 && (f.stock ?? 100) <= 10).length;
  const outOfStockCount = foods.filter(f => (f.stock ?? 100) === 0).length;

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const matchSearch =
        food.name.toLowerCase().includes(search.toLowerCase()) ||
        food.category.toLowerCase().includes(search.toLowerCase()) ||
        food.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === 'All' || food.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchType = selectedType === 'All' || food.type === selectedType;

      const matchAvailability =
        selectedAvailability === 'All' ||
        (selectedAvailability === 'Available' && food.isAvailable) ||
        (selectedAvailability === 'Unavailable' && !food.isAvailable);

      const stockVal = food.stock !== undefined ? food.stock : 100;
      const matchStock =
        selectedStock === 'All' ||
        (selectedStock === 'InStock' && stockVal > 10) ||
        (selectedStock === 'LowStock' && stockVal > 0 && stockVal <= 10) ||
        (selectedStock === 'OutOfStock' && stockVal === 0);

      return matchSearch && matchCategory && matchType && matchAvailability && matchStock;
    });
  }, [foods, search, selectedCategory, selectedType, selectedAvailability, selectedStock]);

  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFoods.slice(start, start + pageSize);
  }, [filteredFoods, currentPage]);

  const targetFoodToDelete = foods.find(f => f.id === deleteTargetId);

  const handleToggleAvailability = async (id: string) => {
    if (updatingAvailabilityId === id) return;
    setUpdatingAvailabilityId(id);
    try {
      await toggleFoodAvailability(id);
    } finally {
      setUpdatingAvailabilityId(null);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    if (updatingStockId === id || newStock < 0) return;
    setUpdatingStockId(id);
    try {
      await updateStock(id, newStock);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleCustomStockPrompt = (food: FoodItem) => {
    const current = food.stock !== undefined ? food.stock : 100;
    const input = window.prompt(`Enter new inventory stock for "${food.name}":`, String(current));
    if (input !== null) {
      const num = parseInt(input.trim(), 10);
      if (!isNaN(num) && num >= 0) {
        handleUpdateStock(food.id, num);
      }
    }
  };

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
            Food Menu Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Manage cinema food catalog, patron QR menu availability, and real-time inventory stock levels.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFoodToEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Add Food Item</span>
        </button>
      </div>

      {/* 5 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16
        }}
      >
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <Utensils size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total Products</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700 }}>
              {totalItems}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}
          >
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Available</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700, color: '#059669' }}>
              {availableCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280'
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Unavailable</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700, color: '#6B7280' }}>
              {unavailableCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#FFFBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Low Stock (≤10)</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700, color: '#D97706' }}>
              {lowStockCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626'
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Out of Stock</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700, color: '#DC2626' }}>
              {outOfStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Filters Header Bar */}
        <div
          style={{
            padding: '16px 20px',
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
              placeholder="Search food by name, category..."
              width={240}
            />

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedAvailability}
              onChange={e => {
                setSelectedAvailability(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Availability</option>
              <option value="Available">Available for Order</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            {/* Inventory / Stock Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedStock}
              onChange={e => {
                setSelectedStock(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Stock Levels</option>
              <option value="InStock">In Stock (&gt; 10)</option>
              <option value="LowStock">Low Stock (1–10)</option>
              <option value="OutOfStock">Out of Stock (0)</option>
            </select>

            {/* Diet Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Diets</option>
              <option value="Veg">Veg Only</option>
              <option value="Non-Veg">Non-Veg Only</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Found <strong style={{ color: 'var(--color-text-main)' }}>{filteredFoods.length}</strong> items
          </div>
        </div>

        {/* Food Table */}
        {filteredFoods.length === 0 ? (
          <EmptyState
            title="No food items match your criteria"
            description="Clear your search filters or add a new food item to the catalog."
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedType('All');
              setSelectedAvailability('All');
              setSelectedStock('All');
            }}
          />
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Product</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock Inventory</th>
                  <th>Stock Status</th>
                  <th>Patron Availability</th>
                  <th>Prep Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFoods.map(food => {
                  const stockCount = food.stock !== undefined ? food.stock : 100;
                  const isLow = stockCount > 0 && stockCount <= 10;
                  const isOut = stockCount === 0;
                  const isUpdatingThisStock = updatingStockId === food.id;
                  const isUpdatingThisAvail = updatingAvailabilityId === food.id;

                  return (
                    <tr key={food.id} style={{ opacity: isUpdatingThisStock || isUpdatingThisAvail ? 0.75 : 1 }}>
                      {/* Food Column (Image + Name + Subtitle) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={food.image}
                            alt={food.name}
                            onClick={() => setFoodToView(food)}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: '1px solid var(--color-border)',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <span
                              onClick={() => setFoodToView(food)}
                              style={{
                                fontWeight: 600,
                                color: 'var(--color-text-main)',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              {food.name}
                            </span>
                            {food.description && (
                              <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)', marginTop: 2, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {food.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            backgroundColor: '#F3F4F6',
                            color: 'var(--color-text-secondary)',
                            padding: '3px 8px',
                            borderRadius: 6
                          }}
                        >
                          {food.category}
                        </span>
                      </td>

                      <td>
                        <Badge variant={food.type === 'Veg' ? 'veg' : 'non-veg'} label={food.type} />
                      </td>

                      <td>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatCurrency(food.price)}
                          </span>
                          {food.originalPrice && food.originalPrice > food.price && (
                            <div style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                              {formatCurrency(food.originalPrice)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock & Quick Restock */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 6px', fontSize: '0.7rem', height: 24, lineHeight: '1' }}
                            title="Decrease by 10"
                            disabled={isUpdatingThisStock || stockCount <= 0}
                            onClick={() => handleUpdateStock(food.id, Math.max(0, stockCount - 10))}
                          >
                            -10
                          </button>
                          <span
                            onClick={() => handleCustomStockPrompt(food)}
                            title="Click to set exact stock"
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              minWidth: 44,
                              textAlign: 'center',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              color: isOut ? '#DC2626' : isLow ? '#D97706' : '#059669',
                            }}
                          >
                            {stockCount}
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 6px', fontSize: '0.7rem', height: 24, lineHeight: '1' }}
                            title="Restock by 10"
                            disabled={isUpdatingThisStock}
                            onClick={() => handleUpdateStock(food.id, stockCount + 10)}
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td>
                        {isOut ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              padding: '3px 8px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#FEF3C7',
                              color: '#D97706',
                              padding: '3px 8px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            Low Stock
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#D1FAE5',
                              color: '#059669',
                              padding: '3px 8px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Availability Toggle */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={food.isAvailable}
                              disabled={isUpdatingThisAvail}
                              onChange={() => handleToggleAvailability(food.id)}
                            />
                            <span className="toggle-slider" />
                          </label>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: food.isAvailable ? '#059669' : '#9CA3AF'
                            }}
                          >
                            {food.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          <Clock size={14} color="var(--color-text-muted)" />
                          <span>{food.prepTime}</span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="View Details"
                          onClick={() => setFoodToView(food)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Edit Item"
                          onClick={() => {
                            setFoodToEdit(food);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-icon btn-sm"
                          title="Delete Food"
                          onClick={() => setDeleteTargetId(food.id)}
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
        )}

        {/* Pagination */}
        {filteredFoods.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredFoods.length}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Add / Edit Food Modal */}
      <FoodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFoodToEdit(null);
        }}
        foodToEdit={foodToEdit}
      />

      {/* View Food Drawer */}
      <FoodViewDrawer
        food={foodToView}
        onClose={() => setFoodToView(null)}
        onEdit={food => {
          setFoodToEdit(food);
          setIsModalOpen(true);
        }}
        onDelete={id => setDeleteTargetId(id)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteFood(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Food Item"
        message={`Are you sure you want to delete "${targetFoodToDelete?.name}"? This item will no longer appear on patron QR menu screens.`}
        confirmLabel="Yes, Delete Item"
        isDestructive={true}
      />
    </div>
  );
};
