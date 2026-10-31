import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type {
  FoodItem,
  Category,
  Combo,
  Order,
  Payment,
  Customer,
  SystemSettings,
  OrderStatus
} from '../types';

import { initialFoods } from '../data/mockFoods';
import { initialCategories } from '../data/mockCategories';
import { initialCombos } from '../data/mockCombos';
import { initialOrders } from '../data/mockOrders';
import { initialPayments } from '../data/mockPayments';
import { initialCustomers } from '../data/mockCustomers';
import { initialSettings } from '../data/mockSettings';
import { useToast } from './ToastContext';
import {
  getOrders as fetchOrdersApi,
  updateOrderStatus as updateOrderStatusApi,
  getProducts as fetchProductsApi,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  toggleProductAvailability as toggleProductAvailabilityApi,
  deleteProduct as deleteProductApi,
  updateProductStock as updateProductStockApi,
  getCategories as fetchCategoriesApi,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  toggleCategoryStatus as toggleCategoryStatusApi,
  deleteCategory as deleteCategoryApi,
  getCombos as fetchCombosApi,
  createCombo as createComboApi,
  updateCombo as updateComboApi,
  toggleComboAvailability as toggleComboAvailabilityApi,
  deleteCombo as deleteComboApi,
  getPayments as fetchPaymentsApi,
  getCustomers as fetchCustomersApi,
  getSettings as fetchSettingsApi,
  updateSettings as updateSettingsApi,
} from '../services/api';

interface AdminContextType {
  // Foods
  foods: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'updatedAt'>) => Promise<void> | void;
  updateFood: (id: string, food: Partial<FoodItem>) => Promise<void> | void;
  deleteFood: (id: string) => Promise<void> | void;
  toggleFoodAvailability: (id: string) => Promise<void> | void;
  updateStock: (id: string, stock: number, inStock?: boolean) => Promise<void> | void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'itemCount'>) => Promise<void> | void;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;
  toggleCategoryStatus: (id: string) => Promise<void> | void;

  // Combos
  combos: Combo[];
  addCombo: (combo: Omit<Combo, 'id'>) => Promise<void> | void;
  updateCombo: (id: string, combo: Partial<Combo>) => Promise<void> | void;
  deleteCombo: (id: string) => Promise<void> | void;
  toggleComboAvailability: (id: string) => Promise<void> | void;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void> | void;
  newOrderAlerts: Order[];
  dismissNewOrderAlert: (orderId: string) => void;

  // Payments
  payments: Payment[];
  refreshPayments: () => Promise<void>;

  // Customers
  customers: Customer[];
  refreshCustomers: () => Promise<void>;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void> | void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'asr_cinema_admin_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [foods, setFoods] = useState<FoodItem[]>(() => loadFromStorage('foods', initialFoods));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', initialCategories));
  const [combos, setCombos] = useState<Combo[]>(() => loadFromStorage('combos', initialCombos));
  const [orders, setOrders] = useState<Order[]>(() => {
    const loaded = loadFromStorage<Order[]>('orders', initialOrders);
    const paidInitial = initialOrders.filter(o => o.paymentStatus === 'Paid');
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return paidInitial;
    }
    return loaded.filter(o => o.paymentStatus === 'Paid');
  });
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', initialPayments));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', initialCustomers));
  const [settings, setSettings] = useState<SystemSettings>(() => loadFromStorage('settings', initialSettings));

  const [newOrderAlerts, setNewOrderAlerts] = useState<Order[]>([]);
  const isFetchingOrdersRef = useRef(false);
  const isUpdatingOrderRef = useRef(false);
  const backoffUntilRef = useRef<number>(0);
  const isInitialOrdersLoadedRef = useRef(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const lastPollingAlertRef = useRef<'401' | '503' | null>(null);

  const dismissNewOrderAlert = useCallback((orderId: string) => {
    setNewOrderAlerts(prev => prev.filter(o => o.id !== orderId));
  }, []);

  // Load real backend orders on mount & poll every 4 seconds
  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      // Honor backoff if previously rate-limited (HTTP 429)
      if (Date.now() < backoffUntilRef.current) return;

      // Guard against overlapping fetches or updating in flight
      if (isFetchingOrdersRef.current || isUpdatingOrderRef.current) return;
      isFetchingOrdersRef.current = true;
      try {
        const backendOrders = await fetchOrdersApi();
        if (isMounted && Array.isArray(backendOrders)) {
          lastPollingAlertRef.current = null;

          // Strictly enforce: only verified Paid orders enter operational state
          const verifiedPaidOrders = backendOrders.filter(o => o.paymentStatus === 'Paid');

          if (!isInitialOrdersLoadedRef.current) {
            // First successful fetch: record all existing order IDs, DO NOT notify
            isInitialOrdersLoadedRef.current = true;
            verifiedPaidOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
            setOrders(verifiedPaidOrders);
          } else {
            // Subsequent polls: detect genuinely NEW verified paid orders
            const newlyDetectedOrders = verifiedPaidOrders.filter(
              o => !knownOrderIdsRef.current.has(o.id)
            );

            if (newlyDetectedOrders.length > 0) {
              newlyDetectedOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
              setNewOrderAlerts(prev => [...prev, ...newlyDetectedOrders]);
            }

            setOrders(verifiedPaidOrders);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const is401 = errMsg.includes('401');
          const is503 = errMsg.includes('503');
          const is429 = errMsg.includes('429');

          if (is429) {
            backoffUntilRef.current = Date.now() + 15000;
            console.warn('Backend rate limit reached (HTTP 429), pausing polling for 15s.');
          } else if (is401) {
            console.warn('Backend orders polling rejected: HTTP 401 Unauthorized.');
            if (lastPollingAlertRef.current !== '401') {
              lastPollingAlertRef.current = '401';
              showToast(
                'Authentication Required',
                'Backend session required. Please sign in to terminal.',
                'warning'
              );
            }
          } else if (is503) {
            console.warn('Backend orders unavailable: HTTP 503 Service Unavailable.');
            if (lastPollingAlertRef.current !== '503') {
              lastPollingAlertRef.current = '503';
              showToast(
                'Orders Service Unavailable',
                'Backend returned HTTP 503 Service Unavailable. Preserving existing orders.',
                'warning'
              );
            }
          } else {
            console.warn('Backend orders temporarily unavailable; preserving existing orders:', err);
          }

          // Strictly preserve existing orders state; never silently populate mock orders on failure
          setOrders(prev => prev);
        }
      } finally {
        isFetchingOrdersRef.current = false;
      }
    };

    loadOrders();
    const intervalId = setInterval(loadOrders, 4000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Reconcile catalog, combos, payments, customers, settings from backend
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [
          backendProducts,
          backendCategories,
          backendCombos,
          backendPayments,
          backendCustomers,
          backendSettings,
        ] = await Promise.all([
          fetchProductsApi().catch(err => {
            console.warn('Backend products not loaded:', err.message);
            return null;
          }),
          fetchCategoriesApi().catch(err => {
            console.warn('Backend categories not loaded:', err.message);
            return null;
          }),
          fetchCombosApi().catch(err => {
            console.warn('Backend combos not loaded:', err.message);
            return null;
          }),
          fetchPaymentsApi().catch(err => {
            console.warn('Backend payments not loaded:', err.message);
            return null;
          }),
          fetchCustomersApi().catch(err => {
            console.warn('Backend customers not loaded:', err.message);
            return null;
          }),
          fetchSettingsApi().catch(err => {
            console.warn('Backend settings not loaded:', err.message);
            return null;
          }),
        ]);

        if (isMounted) {
          if (Array.isArray(backendProducts) && backendProducts.length > 0) {
            setFoods(backendProducts);
          }
          if (Array.isArray(backendCategories) && backendCategories.length > 0) {
            const currentProds = Array.isArray(backendProducts) && backendProducts.length > 0 ? backendProducts : foods;
            const reconciledCategories = backendCategories.map(cat => ({
              ...cat,
              itemCount: currentProds.filter(
                p => (p.category || '').toLowerCase() === cat.name.toLowerCase()
              ).length,
            }));
            setCategories(reconciledCategories);
          }
          if (Array.isArray(backendCombos) && backendCombos.length > 0) {
            setCombos(backendCombos);
          }
          if (Array.isArray(backendPayments) && backendPayments.length > 0) {
            setPayments(backendPayments);
          }
          if (Array.isArray(backendCustomers) && backendCustomers.length > 0) {
            setCustomers(backendCustomers);
          }
          if (backendSettings) {
            setSettings(backendSettings);
          }
        }
      } catch (err: unknown) {
        console.warn('Initial data sync error:', err);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshPayments = async () => {
    try {
      const realPayments = await fetchPaymentsApi();
      if (Array.isArray(realPayments)) {
        setPayments(realPayments);
      }
    } catch (err) {
      console.warn('Error refreshing payments:', err);
    }
  };

  const refreshCustomers = async () => {
    try {
      const realCustomers = await fetchCustomersApi();
      if (Array.isArray(realCustomers)) {
        setCustomers(realCustomers);
      }
    } catch (err) {
      console.warn('Error refreshing customers:', err);
    }
  };

  // Local storage synchronization
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'foods', JSON.stringify(foods)); } catch (e) { console.error(e); }
  }, [foods]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories)); } catch (e) { console.error(e); }
  }, [categories]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'combos', JSON.stringify(combos)); } catch (e) { console.error(e); }
  }, [combos]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders)); } catch (e) { console.error(e); }
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'payments', JSON.stringify(payments)); } catch (e) { console.error(e); }
  }, [payments]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers)); } catch (e) { console.error(e); }
  }, [customers]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings)); } catch (e) { console.error(e); }
  }, [settings]);

  // Food handlers connected to backend MongoDB API
  const addFood = async (newFoodData: Omit<FoodItem, 'id' | 'updatedAt'>) => {
    try {
      const created = await createProductApi(newFoodData);
      setFoods(prev => [created, ...prev.filter(f => f.id !== created.id)]);
      setCategories(prev =>
        prev.map(cat =>
          cat.name.toLowerCase() === created.category.toLowerCase()
            ? { ...cat, itemCount: cat.itemCount + 1 }
            : cat
        )
      );
      showToast('Food Added Successfully', `${created.name} is now persisted in MongoDB.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Server error';
      console.error('Failed to create food:', err);
      showToast('Failed to Add Food', msg, 'error');
    }
  };

  const updateFood = async (id: string, updated: Partial<FoodItem>) => {
    const prevFoods = foods;
    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updated, updatedAt: 'Just now' } : item
      )
    );
    try {
      const saved = await updateProductApi(id, updated);
      setFoods(prev => prev.map(item => (item.id === id ? saved : item)));
      showToast('Food Updated', 'Changes saved to database.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update food item.';
      console.error(`Failed to update food ${id}:`, err);
      setFoods(prevFoods);
      showToast('Update Failed', msg, 'error');
    }
  };

  const deleteFood = async (id: string) => {
    const target = foods.find(f => f.id === id);
    if (!target) return;
    const prevFoods = foods;

    try {
      const result = await deleteProductApi(id);
      if (result.deactivated) {
        setFoods(prev =>
          prev.map(f => (f.id === id ? { ...f, isAvailable: false, inStock: false } : f))
        );
        showToast('Item Deactivated', result.message, 'warning');
      } else {
        setFoods(prev => prev.filter(f => f.id !== id));
        setCategories(prev =>
          prev.map(cat =>
            cat.name.toLowerCase() === target.category.toLowerCase()
              ? { ...cat, itemCount: Math.max(0, cat.itemCount - 1) }
              : cat
          )
        );
        showToast('Food Deleted', `${target.name} removed from catalog.`, 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete food item.';
      console.error(`Failed to delete food ${id}:`, err);
      setFoods(prevFoods);
      showToast('Delete Failed', msg, 'error');
    }
  };

  const toggleFoodAvailability = async (id: string) => {
    const target = foods.find(f => f.id === id);
    if (!target) return;
    const nextState = !target.isAvailable;
    const currentStock = target.stock !== undefined ? target.stock : 100;

    if (nextState && currentStock <= 0) {
      showToast(
        'Inventory Required',
        `Cannot make "${target.name}" available because actual stock is 0. Please add inventory first.`,
        'warning'
      );
      return;
    }

    const prevFoods = foods;

    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isAvailable: nextState, inStock: nextState && currentStock > 0, updatedAt: 'Just now' } : item
      )
    );

    try {
      const updated = await toggleProductAvailabilityApi(id, nextState);
      setFoods(prev => prev.map(item => (item.id === id ? updated : item)));
      showToast(
        nextState ? 'Item is now Available' : 'Item marked Unavailable',
        target.name,
        nextState ? 'success' : 'warning'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not toggle availability.';
      console.error(`Failed to toggle availability for ${id}:`, err);
      setFoods(prevFoods);
      showToast('Action Failed', msg, 'error');
    }
  };

  const updateStock = async (id: string, newStock: number, inStock?: boolean) => {
    const prevFoods = foods;
    const calculatedInStock = inStock !== undefined ? inStock : newStock > 0;
    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, stock: newStock, inStock: calculatedInStock, isAvailable: calculatedInStock } : item
      )
    );

    try {
      const updated = await updateProductStockApi(id, newStock, calculatedInStock);
      setFoods(prev => prev.map(item => (item.id === id ? updated : item)));
      showToast('Stock Updated', `${updated.name}: ${newStock} units remaining.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update stock level.';
      console.error(`Failed to update stock for ${id}:`, err);
      setFoods(prevFoods);
      showToast('Stock Update Failed', msg, 'error');
    }
  };

  // Category handlers connected to backend MongoDB API
  const addCategory = async (catData: Omit<Category, 'id' | 'itemCount'>) => {
    try {
      const created = await createCategoryApi(catData);
      setCategories(prev => [...prev.filter(c => c.slug !== created.slug), created]);
      showToast('Category Created', `${created.name} category has been persisted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Server error';
      console.error('Failed to create category:', err);
      showToast('Category Creation Failed', msg, 'error');
    }
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    const prevCategories = categories;
    setCategories(prev =>
      prev.map(cat => (cat.id === id || cat.slug === id ? { ...cat, ...updated } : cat))
    );
    try {
      const saved = await updateCategoryApi(id, updated);
      setCategories(prev =>
        prev.map(cat => (cat.id === id || cat.slug === id ? { ...cat, ...saved } : cat))
      );
      showToast('Category Updated', 'Changes saved to database.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update category.';
      console.error(`Failed to update category ${id}:`, err);
      setCategories(prevCategories);
      showToast('Update Failed', msg, 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    const target = categories.find(c => c.id === id || c.slug === id);
    if (!target) return;
    const prevCategories = categories;

    try {
      const result = await deleteCategoryApi(id);
      if (result.deactivated) {
        setCategories(prev =>
          prev.map(c => (c.id === id || c.slug === id ? { ...c, isActive: false } : c))
        );
        showToast('Category Deactivated', result.message, 'warning');
      } else {
        setCategories(prev => prev.filter(c => c.id !== id && c.slug !== id));
        showToast('Category Deleted', `${target.name} removed from catalog.`, 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete category.';
      console.error(`Failed to delete category ${id}:`, err);
      setCategories(prevCategories);
      showToast('Delete Failed', msg, 'error');
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    const target = categories.find(c => c.id === id || c.slug === id);
    if (!target) return;
    const next = !target.isActive;
    const prevCategories = categories;

    setCategories(prev =>
      prev.map(c => (c.id === id || c.slug === id ? { ...c, isActive: next } : c))
    );

    try {
      const updated = await toggleCategoryStatusApi(id);
      setCategories(prev =>
        prev.map(c => (c.id === id || c.slug === id ? { ...c, isActive: updated.isActive } : c))
      );
      showToast(`Category ${target.name}`, `Category marked as ${updated.isActive ? 'Active' : 'Inactive'}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not toggle category status.';
      console.error(`Failed to toggle category ${id}:`, err);
      setCategories(prevCategories);
      showToast('Action Failed', msg, 'error');
    }
  };

  // Combo handlers connected to backend API
  const addCombo = async (comboData: Omit<Combo, 'id'>) => {
    try {
      const created = await createComboApi(comboData);
      setCombos(prev => [created, ...prev]);
      showToast('Combo Created', `${created.name} added to menu.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create combo';
      showToast('Creation Failed', msg, 'error');
    }
  };

  const updateCombo = async (id: string, updated: Partial<Combo>) => {
    const prevCombos = combos;
    setCombos(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
    try {
      const saved = await updateComboApi(id, updated);
      setCombos(prev => prev.map(c => (c.id === id ? saved : c)));
      showToast('Combo Updated', 'Combo details saved.');
    } catch (err: unknown) {
      setCombos(prevCombos);
      const msg = err instanceof Error ? err.message : 'Failed to update combo';
      showToast('Update Failed', msg, 'error');
    }
  };

  const deleteCombo = async (id: string) => {
    const target = combos.find(c => c.id === id);
    if (!target) return;
    const prevCombos = combos;
    setCombos(prev => prev.filter(c => c.id !== id));
    try {
      await deleteComboApi(id);
      showToast('Combo Deleted', `${target.name} removed.`, 'info');
    } catch (err: unknown) {
      setCombos(prevCombos);
      const msg = err instanceof Error ? err.message : 'Failed to delete combo';
      showToast('Delete Failed', msg, 'error');
    }
  };

  const toggleComboAvailability = async (id: string) => {
    const target = combos.find(c => c.id === id);
    if (!target) return;
    const next = !target.isAvailable;
    const prevCombos = combos;
    setCombos(prev =>
      prev.map(c => (c.id === id ? { ...c, isAvailable: next } : c))
    );
    try {
      const updated = await toggleComboAvailabilityApi(id);
      setCombos(prev => prev.map(c => (c.id === id ? updated : c)));
      showToast(
        next ? 'Combo Activated' : 'Combo Marked Unavailable',
        target.name,
        next ? 'success' : 'warning'
      );
    } catch (err: unknown) {
      setCombos(prevCombos);
      const msg = err instanceof Error ? err.message : 'Failed to toggle combo';
      showToast('Action Failed', msg, 'error');
    }
  };

  // Order status handler
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);

    // Safety guard: Unpaid or unverified orders cannot advance through kitchen stages
    if (order && order.paymentStatus !== 'Paid' && newStatus !== 'Cancelled') {
      showToast('Action Blocked', 'Unpaid orders cannot advance through kitchen stages.', 'warning');
      return;
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Store previous states for rollback if API fails
    const prevOrders = orders;

    // Helper to compute updated timeline
    const getUpdatedTimeline = (ord: Order) => {
      const updatedTimeline = ord.timeline.map(step => {
        if (step.status === newStatus) {
          return { ...step, completed: true, time: timeNow };
        }
        return step;
      });

      const statusExists = updatedTimeline.some(t => t.status === newStatus);
      if (!statusExists) {
        updatedTimeline.push({
          status: newStatus,
          time: timeNow,
          note: `Status updated to ${newStatus}`,
          completed: true
        });
      }

      return updatedTimeline;
    };

    // Optimistically update local state to keep UI responsive
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: newStatus,
            timeline: getUpdatedTimeline(ord)
          };
        }
        return ord;
      })
    );

    try {
      isUpdatingOrderRef.current = true;
      const updatedBackendOrder = await updateOrderStatusApi(orderId, newStatus);
      if (updatedBackendOrder) {
        setOrders(prev =>
          prev.map(ord => (ord.id === orderId ? { ...ord, ...updatedBackendOrder } : ord))
        );
      }
      if (order) {
        showToast(
          `Order ${order.id} Updated`,
          `Status moved to ${newStatus} (${order.auditorium} • ${order.seat})`
        );
      }
    } catch (err: unknown) {
      console.error(`Failed to update status for order ${orderId}:`, err);
      const msg = err instanceof Error ? err.message : 'Could not update order status on server. Please try again.';
      setOrders(prevOrders);
      showToast('Status Update Failed', msg, 'error');
    } finally {
      isUpdatingOrderRef.current = false;
    }
  };

  // Settings handlers connected to backend
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const merged = { ...settings, ...newSettings } as SystemSettings;
    setSettings(merged);
    try {
      await updateSettingsApi(merged);
      showToast('Settings Saved', 'System configurations updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings';
      showToast('Save Failed', msg, 'error');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        foods,
        addFood,
        updateFood,
        deleteFood,
        toggleFoodAvailability,
        updateStock,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,

        combos,
        addCombo,
        updateCombo,
        deleteCombo,
        toggleComboAvailability,

        orders,
        updateOrderStatus,
        newOrderAlerts,
        dismissNewOrderAlert,

        payments,
        refreshPayments,

        customers,
        refreshCustomers,

        settings,
        updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
