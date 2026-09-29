import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface AdminContextType {
  // Foods
  foods: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'updatedAt'>) => void;
  updateFood: (id: string, food: Partial<FoodItem>) => void;
  deleteFood: (id: string) => void;
  toggleFoodAvailability: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'itemCount'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryStatus: (id: string) => void;

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
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

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
    const hasAccepted = loaded?.some(o => o.timeline?.some(t => t.status === 'Accepted'));
    if (!Array.isArray(loaded) || loaded.length < 7 || !hasAccepted) {
      return initialOrders;
    }
    return loaded;
  });
  const [payments] = useState<Payment[]>(() => loadFromStorage('payments', initialPayments));
  const [customers] = useState<Customer[]>(() => loadFromStorage('customers', initialCustomers));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage('coupons', initialCoupons));
  const [settings, setSettings] = useState<SystemSettings>(() => loadFromStorage('settings', initialSettings));

  // Sync to localStorage
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

  // Food handlers
  const addFood = (newFoodData: Omit<FoodItem, 'id' | 'updatedAt'>) => {
    const id = 'food-' + Date.now();
    const newFood: FoodItem = {
      ...newFoodData,
      id,
      updatedAt: 'Just now'
    };
    setFoods(prev => [newFood, ...prev]);

    // Update category itemCount
    setCategories(prev =>
      prev.map(cat =>
        cat.name.toLowerCase() === newFood.category.toLowerCase()
          ? { ...cat, itemCount: cat.itemCount + 1 }
          : cat
      )
    );

    showToast('Food Added Successfully', `${newFood.name} is now available on the menu.`);
  };

  const updateFood = (id: string, updatedFields: Partial<FoodItem>) => {
    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updatedFields, updatedAt: 'Just now' } : item
      )
    );
    showToast('Food Item Updated', 'Changes were saved successfully.');
  };

  const deleteFood = (id: string) => {
    const target = foods.find(f => f.id === id);
    if (!target) return;
    setFoods(prev => prev.filter(f => f.id !== id));
    showToast('Item Deleted', `${target.name} has been removed from menu.`, 'info');
  };

  const toggleFoodAvailability = (id: string) => {
    const target = foods.find(f => f.id === id);
    if (!target) return;
    const nextState = !target.isAvailable;
    setFoods(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isAvailable: nextState, updatedAt: 'Just now' } : item
      )
    );
    showToast(
      nextState ? 'Item is now Available' : 'Item marked Out of Stock',
      target.name,
      nextState ? 'success' : 'warning'
    );
  };

  // Category handlers
  const addCategory = (catData: Omit<Category, 'id' | 'itemCount'>) => {
    const id = 'cat-' + Date.now();
    const newCat: Category = {
      ...catData,
      id,
      itemCount: 0,
      createdDate: catData.createdDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setCategories(prev => [...prev, newCat]);
    showToast('Category Created', `${newCat.name} category has been added.`);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updated } : cat))
    );
    showToast('Category Updated', 'Category details updated successfully.');
  };

  const deleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category Deleted', `${target.name} was removed.`, 'info');
  };

  const toggleCategoryStatus = (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    const next = !target.isActive;
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, isActive: next } : cat))
    );
    showToast(
      next ? 'Category Enabled' : 'Category Disabled',
      target.name,
      next ? 'success' : 'warning'
    );
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
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedTimeline = ord.timeline.map(step => {
            if (step.status === newStatus) {
              return { ...step, completed: true, time: timeNow };
            }
            return step;
          });

          // Also check if new status needs adding to timeline if not existing
          const statusExists = updatedTimeline.some(t => t.status === newStatus);
          if (!statusExists) {
            updatedTimeline.push({
              status: newStatus,
              time: timeNow,
              note: `Status updated to ${newStatus}`,
              completed: true
            });
          }

          return {
            ...ord,
            status: newStatus,
            timeline: updatedTimeline
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

    if (order) {
      showToast(
        `Order ${order.id} Updated`,
        `Status moved to ${newStatus} (${order.auditorium} • ${order.seat})`
      );
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
