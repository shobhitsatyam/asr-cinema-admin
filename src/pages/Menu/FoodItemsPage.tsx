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
  FolderTree,
  Clock
} from 'lucide-react';

export const FoodItemsPage: React.FC = () => {
  const { foods, deleteFood, toggleFoodAvailability, categories } = useAdmin();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStock, setSelectedStock] = useState<string>('All');

  // Modals & Drawers state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);
  const [foodToView, setFoodToView] = useState<FoodItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Stats calculation
  const totalItems = foods.length;
  const availableCount = foods.filter(f => f.isAvailable).length;
  const outOfStockCount = foods.filter(f => !f.isAvailable).length;
  const categoriesCount = categories.length;

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

      const matchStock =
        selectedStock === 'All' ||
        (selectedStock === 'Available' && food.isAvailable) ||
        (selectedStock === 'OutOfStock' && !food.isAvailable);

      return matchSearch && matchCategory && matchType && matchStock;
    });
  }, [foods, search, selectedCategory, selectedType, selectedStock]);

  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFoods.slice(start, start + pageSize);
  }, [filteredFoods, currentPage]);

  const targetFoodToDelete = foods.find(f => f.id === deleteTargetId);

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
            Food Items
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Manage cinema food and beverage inventory
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
          <span>Add Food</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total Food Items</div>
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

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#F5F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7C3AED'
            }}
          >
            <FolderTree size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Categories</div>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 700 }}>
              {categoriesCount}
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
              width={260}
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

            {/* Availability Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', height: 38, fontSize: '0.8125rem' }}
              value={selectedStock}
              onChange={e => {
                setSelectedStock(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Availability</option>
              <option value="Available">Available (In Stock)</option>
              <option value="OutOfStock">Out of Stock</option>
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
              setSelectedStock('All');
            }}
          />
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Preparation Time</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFoods.map(food => (
                  <tr key={food.id}>
                    {/* Food Column (Image + Name + Subtitle) */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={food.image}
                          alt={food.name}
                          onClick={() => setFoodToView(food)}
                          style={{
                            width: 46,
                            height: 46,
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

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={food.isAvailable}
                            onChange={() => toggleFoodAvailability(food.id)}
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
                          {food.isAvailable ? 'In Stock' : 'Out'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        <Clock size={14} color="var(--color-text-muted)" />
                        <span>{food.prepTime}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {food.updatedAt}
                      </span>
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
                ))}
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
