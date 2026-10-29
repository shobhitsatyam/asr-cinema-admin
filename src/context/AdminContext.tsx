import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type {
  FoodItem,
  Category,
  Combo,
  Seat,
  Order,
  Payment,
  Customer,
  Coupon,
  SystemSettings,
  OrderStatus,
  SeatStatus,
  AuditoriumName
} from '../types';

import { initialFoods } from '../data/mockFoods';
import { initialCategories } from '../data/mockCategories';
import { initialCombos } from '../data/mockCombos';
import { initialSeats } from '../data/mockSeats';
import { initialOrders } from '../data/mockOrders';
import { initialPayments } from '../data/mockPayments';
import { initialCustomers } from '../data/mockCustomers';
import { initialCoupons } from '../data/mockCoupons';
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
  getCategories as fetchCategoriesApi,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  toggleCategoryStatus as toggleCategoryStatusApi,
  deleteCategory as deleteCategoryApi,
} from '../services/api';

interface AdminContextType {
  // Foods
  foods: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'updatedAt'>) => Promise<void> | void;
  updateFood: (id: string, food: Partial<FoodItem>) => Promise<void> | void;
  deleteFood: (id: string) => Promise<void> | void;
  toggleFoodAvailability: (id: string) => Promise<void> | void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'itemCount'>) => Promise<void> | void;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;
  toggleCategoryStatus: (id: string) => Promise<void> | void;

  // Combos
  combos: Combo[];
  addCombo: (combo: Omit<Combo, 'id'>) => void;
  updateCombo: (id: string, combo: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  toggleComboAvailability: (id: string) => void;

  // Seats
  seats: Seat[];
  updateSeatStatus: (id: string, status: SeatStatus) => void;
  toggleSeatQR: (id: string) => void;
  blockSeat: (id: string, reason?: string) => void;
  unblockSeat: (id: string) => void;
  regenerateSeatQR: (id: string) => void;
  batchGenerateQR: (audi: AuditoriumName) => void;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void> | void;
  newOrderAlerts: Order[];
  dismissNewOrderAlert: (orderId: string) => void;

  // Payments
  payments: Payment[];

  // Customers
  customers: Customer[];

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponStatus: (id: string) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
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
  const [seats, setSeats] = useState<Seat[]>(() => {
    const loaded = loadFromStorage<Seat[]>('seats', initialSeats);
    if (!Array.isArray(loaded) || loaded.length < 50 || !loaded[0]?.type) {
      return initialSeats;
    }
    return loaded;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const loaded = loadFromStorage<Order[]>('orders', initialOrders);
    const paidInitial = initialOrders.filter(o => o.paymentStatus === 'Paid');
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return paidInitial;
    }
    return loaded.filter(o => o.paymentStatus === 'Paid');
  });
  const [payments] = useState<Payment[]>(() => loadFromStorage('payments', initialPayments));
  const [customers] = useState<Customer[]>(() => loadFromStorage('customers', initialCustomers));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage('coupons', initialCoupons));
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
            console.warn('Backend orders polling rejected: HTTP 401 Unauthorized (x-admin-key missing or invalid).');
            if (lastPollingAlertRef.current !== '401') {
              lastPollingAlertRef.current = '401';
              showToast(
                'Authentication Required',
                'Backend returned HTTP 401. Please configure your Admin Authorization Key in Settings > Admin Profile.',
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

    // Immediately fetch fresh orders when tab becomes active again
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

  // Reconcile catalog from MongoDB backend on mount (Server is authoritative source of truth)
  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const [backendProducts, backendCategories] = await Promise.all([
          fetchProductsApi().catch(err => {
            console.warn('Backend products not loaded:', err.message);
            return null;
          }),
          fetchCategoriesApi().catch(err => {
            console.warn('Backend categories not loaded:', err.message);
            return null;
          }),
        ]);

        if (isMounted) {
          if (Array.isArray(backendProducts)) {
            setFoods(backendProducts);
          }
          if (Array.isArray(backendCategories)) {
            const currentProds = Array.isArray(backendProducts) ? backendProducts : foods;
            const reconciledCategories = backendCategories.map(cat => ({
              ...cat,
              itemCount: currentProds.filter(
                p => (p.category || '').toLowerCase() === cat.name.toLowerCase()
              ).length,
            }));
            setCategories(reconciledCategories);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Catalog sync error:', msg);
      }
    };

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'foods', JSON.stringify(foods));
    } catch (e) { console.error(e); }
  }, [foods]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'combos', JSON.stringify(combos));
    } catch (e) { console.error(e); }
  }, [combos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'seats', JSON.stringify(seats));
    } catch (e) { console.error(e); }
  }, [seats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
    } catch (e) { console.error(e); }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'coupons', JSON.stringify(coupons));
    } catch (e) { console.error(e); }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
    } catch (e) { console.error(e); }
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

  const updateFood = async (id: string, updatedFields: Partial<FoodItem>) => {
    const prevFoods = foods;
    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updatedFields, updatedAt: 'Just now' } : item
      )
    );
    try {
      const updated = await updateProductApi(id, updatedFields);
      setFoods(prev => prev.map(item => (item.id === id ? updated : item)));
      showToast('Food Item Updated', 'Changes persisted to database.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update item on server.';
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
          prev.map(item => (item.id === id ? { ...item, isAvailable: false } : item))
        );
        showToast('Item Deactivated', result.message, 'warning');
      } else {
        setFoods(prev => prev.filter(f => f.id !== id));
        showToast('Item Deleted', `${target.name} removed from catalog.`, 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete item.';
      console.error(`Failed to delete food ${id}:`, err);
      setFoods(prevFoods);
      showToast('Delete Failed', msg, 'error');
    }
  };

  const toggleFoodAvailability = async (id: string) => {
    const target = foods.find(f => f.id === id);
    if (!target) return;
    const nextState = !target.isAvailable;
    const prevFoods = foods;

    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isAvailable: nextState, updatedAt: 'Just now' } : item
      )
    );

    try {
      const updated = await toggleProductAvailabilityApi(id, nextState);
      setFoods(prev => prev.map(item => (item.id === id ? updated : item)));
      showToast(
        nextState ? 'Item is now Available' : 'Item marked Out of Stock',
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

  // Combo handlers
  const addCombo = (comboData: Omit<Combo, 'id'>) => {
    const id = 'combo-' + Date.now();
    const newCombo: Combo = { ...comboData, id };
    setCombos(prev => [newCombo, ...prev]);
    showToast('Combo Created', `${newCombo.name} added to menu.`);
  };

  const updateCombo = (id: string, updated: Partial<Combo>) => {
    setCombos(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
    showToast('Combo Updated', 'Combo details saved.');
  };

  const deleteCombo = (id: string) => {
    const target = combos.find(c => c.id === id);
    if (!target) return;
    setCombos(prev => prev.filter(c => c.id !== id));
    showToast('Combo Deleted', `${target.name} removed.`, 'info');
  };

  const toggleComboAvailability = (id: string) => {
    const target = combos.find(c => c.id === id);
    if (!target) return;
    const next = !target.isAvailable;
    setCombos(prev =>
      prev.map(c => (c.id === id ? { ...c, isAvailable: next } : c))
    );
    showToast(
      next ? 'Combo Activated' : 'Combo Marked Unavailable',
      target.name,
      next ? 'success' : 'warning'
    );
  };

  // Seats handlers
  const updateSeatStatus = (id: string, status: SeatStatus) => {
    const seat = seats.find(s => s.id === id);
    if (!seat) return;
    const qrStatus = status === 'Blocked' ? 'Inactive' : seat.qrStatus;
    setSeats(prev =>
      prev.map(s => (s.id === id ? { ...s, status, qrStatus } : s))
    );
    showToast(`Seat ${seat.seatNumber} Updated`, `Status changed to ${status}`);
  };

  const toggleSeatQR = (id: string) => {
    const seat = seats.find(s => s.id === id);
    if (!seat) return;
    const next = seat.qrStatus === 'Active' ? 'Inactive' : 'Active';
    setSeats(prev =>
      prev.map(s => (s.id === id ? { ...s, qrStatus: next } : s))
    );
    showToast(
      `Seat ${seat.seatNumber} QR ${next}`,
      `Digital ordering is now ${next.toLowerCase()} for this seat.`
    );
  };

  const blockSeat = (id: string, reason?: string) => {
    const seat = seats.find(s => s.id === id);
    if (!seat) return;
    setSeats(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'Blocked', qrStatus: 'Inactive' } : s))
    );
    showToast(
      `Seat ${seat.seatNumber} Blocked`,
      reason ? `Reason: ${reason}` : `Seat blocked and digital ordering disabled.`,
      'warning'
    );
  };

  const unblockSeat = (id: string) => {
    const seat = seats.find(s => s.id === id);
    if (!seat) return;
    setSeats(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'Available', qrStatus: 'Active' } : s))
    );
    showToast(
      `Seat ${seat.seatNumber} Unblocked`,
      `Seat restored to Available and QR ordering enabled.`,
      'success'
    );
  };

  const regenerateSeatQR = (id: string) => {
    const seat = seats.find(s => s.id === id);
    if (!seat) return;
    // PRESERVE DEMO SEAT B16 token and URL!
    const token = seat.isDemo || seat.seatNumber === 'B16' ? 'audi2-b16' : seat.token;
    const qrUrl = seat.isDemo || seat.seatNumber === 'B16'
      ? 'https://asr-cinema-scan-to-food.vercel.app/order/audi2-b16'
      : seat.qrUrl;

    setSeats(prev =>
      prev.map(s => (s.id === id ? { ...s, token, qrUrl, qrStatus: 'Active' } : s))
    );
    showToast(
      `QR Generated for ${seat.seatNumber}`,
      `Token "${token}" verified and synchronized.`,
      'success'
    );
  };

  const batchGenerateQR = (audi: AuditoriumName) => {
    setSeats(prev =>
      prev.map(s => {
        if (s.auditorium !== audi) return s;
        return {
          ...s,
          qrStatus: s.status === 'Blocked' ? 'Inactive' : 'Active'
        };
      })
    );
    showToast(
      `QR Batch Synced`,
      `All active QR codes for ${audi} synchronized and verified.`,
      'success'
    );
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
    const prevSeats = seats;

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

    // Sync seat status if applicable
    setSeats(prev =>
      prev.map(seat => {
        if (seat.currentOrder && seat.currentOrder.orderId === orderId) {
          return {
            ...seat,
            currentOrder: {
              ...seat.currentOrder,
              status: newStatus
            },
            status: newStatus === 'Completed' || newStatus === 'Cancelled' ? 'Available' : seat.status
          };
        }
        return seat;
      })
    );

    try {
      isUpdatingOrderRef.current = true;
      const updatedBackendOrder = await updateOrderStatusApi(orderId, newStatus);
      // Synchronize with returned backend order
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
      // Restore previous state so we do not falsely show the status as saved
      setOrders(prevOrders);
      setSeats(prevSeats);
      showToast(
        'Status Update Failed',
        msg,
        'error'
      );
    } finally {
      isUpdatingOrderRef.current = false;
    }
  };

  // Coupon handlers
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    const id = 'coupon-' + Date.now();
    const newCoupon: Coupon = {
      ...couponData,
      id,
      usedCount: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);
    showToast('Coupon Created', `Code ${newCoupon.code} is now active.`);
  };

  const updateCoupon = (id: string, updated: Partial<Coupon>) => {
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
    showToast('Coupon Updated', 'Discount coupon settings saved.');
  };

  const deleteCoupon = (id: string) => {
    const target = coupons.find(c => c.id === id);
    if (!target) return;
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast('Coupon Removed', `Code ${target.code} was deleted.`, 'info');
  };

  const toggleCouponStatus = (id: string) => {
    const target = coupons.find(c => c.id === id);
    if (!target) return;
    const next = target.status === 'Active' ? 'Inactive' : 'Active';
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, status: next } : c))
    );
    showToast(`Coupon ${target.code}`, `Coupon marked as ${next}.`);
  };

  // Settings handlers
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Settings Saved', 'System configurations updated successfully.');
  };

  return (
    <AdminContext.Provider
      value={{
        foods,
        addFood,
        updateFood,
        deleteFood,
        toggleFoodAvailability,

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

        seats,
        updateSeatStatus,
        toggleSeatQR,
        blockSeat,
        unblockSeat,
        regenerateSeatQR,
        batchGenerateQR,

        orders,
        updateOrderStatus,
        newOrderAlerts,
        dismissNewOrderAlert,

        payments,
        customers,

        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,

        settings,
        updateSettings
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
