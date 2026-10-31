import type {
  Order,
  OrderStatus,
  FoodItem,
  Category,
  Combo,
  Seat,
  Payment,
  Customer,
  Coupon,
  SystemSettings,
  AdminUser,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Retrieve administrator authorization key.
 *
 * Security Notice:
 * Privileged keys must not be baked into public Vite bundles.
 * Strictly reads ephemeral operator session storage ('asr_admin_session_key').
 */
export function getAdminApiKey(): string {
  try {
    const sessionKey = sessionStorage.getItem('asr_admin_session_key');
    if (sessionKey && sessionKey.trim()) return sessionKey.trim();
  } catch {
    // sessionStorage unavailable
  }
  return '';
}

export function setAdminSessionKey(key: string): void {
  try {
    if (key && key.trim()) {
      sessionStorage.setItem('asr_admin_session_key', key.trim());
    } else {
      sessionStorage.removeItem('asr_admin_session_key');
    }
  } catch {
    // sessionStorage unavailable
  }
}

export function getAdminAuthToken(): string {
  try {
    const token = sessionStorage.getItem('asr_admin_auth_token');
    if (token && token.trim()) return token.trim();
  } catch {
    // sessionStorage unavailable
  }
  return '';
}

export function setAdminAuthToken(token: string): void {
  try {
    if (token && token.trim()) {
      sessionStorage.setItem('asr_admin_auth_token', token.trim());
    } else {
      sessionStorage.removeItem('asr_admin_auth_token');
    }
  } catch {
    // sessionStorage unavailable
  }
}

export const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...extraHeaders,
  };
  const token = getAdminAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const key = getAdminApiKey();
  if (key) {
    headers['x-admin-key'] = key;
  }
  return headers;
};

export interface OrdersApiResponse {
  success: boolean;
  orders: Order[];
  message?: string;
}

export interface OrderStatusApiResponse {
  success: boolean;
  order?: Order;
  message?: string;
}

export interface ProductsApiResponse {
  success: boolean;
  products: Record<string, unknown>[];
  message?: string;
}

export interface ProductApiResponse {
  success: boolean;
  product?: Record<string, unknown>;
  message?: string;
}

export interface CategoriesApiResponse {
  success: boolean;
  categories: Record<string, unknown>[];
  message?: string;
}

export interface CategoryApiResponse {
  success: boolean;
  category?: Record<string, unknown>;
  message?: string;
}

function normalizeFoodItem(raw: Record<string, unknown>): FoodItem {
  return {
    id: String(raw.id || raw._id || ''),
    name: String(raw.name || ''),
    category: String(raw.category || 'General'),
    type: (raw.type as 'Veg' | 'Non-Veg') || (raw.isVeg ? 'Veg' : 'Non-Veg'),
    price: Number(raw.price ?? raw.basePrice ?? 0),
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined,
    description: String(raw.description || ''),
    image: String(raw.image || ''),
    isAvailable: raw.isAvailable !== false && raw.inStock !== false,
    prepTime: String(raw.prepTime || '10 mins'),
    updatedAt: raw.updatedAt ? new Date(String(raw.updatedAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    stock: raw.stock !== undefined ? Number(raw.stock) : 100,
    inStock: raw.inStock !== false,
  };
}

function normalizeCategory(raw: Record<string, unknown>, productCount = 0): Category {
  return {
    id: String(raw.slug || raw.id || raw._id || ''),
    name: String(raw.name || ''),
    slug: String(raw.slug || (raw.name || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    iconName: String(raw.iconName || 'Utensils'),
    image: String(raw.image || ''),
    itemCount: productCount,
    isActive: raw.isActive !== false,
    description: raw.description ? String(raw.description) : undefined,
    createdDate: raw.createdAt ? new Date(String(raw.createdAt)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
  };
}

/**
 * Fetch all orders from backend.
 * GET /api/orders?paymentStatus=Paid
 * Operational constraint: Only verified Paid orders are processed.
 */
export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders?paymentStatus=Paid`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders({
      'Cache-Control': 'no-cache',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: HTTP ${response.status} ${response.statusText}`);
  }

  const data: OrdersApiResponse = await response.json();
  if (!data.success || !Array.isArray(data.orders)) {
    throw new Error(data.message || 'Invalid orders payload returned from backend');
  }

  // Safety filter: Ensure only verified Paid orders reach operational management
  return data.orders.filter(order => order.paymentStatus === 'Paid');
}


/**
 * Update an order's status on the backend.
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const encodedId = encodeURIComponent(orderId);
  const response = await fetch(`${API_BASE_URL}/orders/${encodedId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(`Failed to update status for ${orderId}: ${errorDetail}`);
  }

  const data: OrderStatusApiResponse = await response.json();
  if (!data.success || !data.order) {
    throw new Error(data.message || 'No updated order returned from backend');
  }

  return data.order;
}

/**
 * Fetch all products from MongoDB backend.
 * GET /api/products
 */
export async function getProducts(): Promise<FoodItem[]> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`);
  }

  const data: ProductsApiResponse = await response.json();
  if (!data.success || !Array.isArray(data.products)) {
    throw new Error(data.message || 'Invalid products payload returned from backend');
  }

  return data.products.map(normalizeFoodItem);
}

/**
 * Create a new product in MongoDB backend.
 * POST /api/products
 */
export async function createProduct(productData: Omit<FoodItem, 'id' | 'updatedAt'>): Promise<FoodItem> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to create product: HTTP ${response.status}`);
  }

  const data: ProductApiResponse = await response.json();
  if (!data.success || !data.product) {
    throw new Error(data.message || 'No product returned from backend');
  }

  return normalizeFoodItem(data.product);
}

/**
 * Update an existing product in MongoDB backend.
 * PATCH /api/products/:id
 */
export async function updateProduct(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/products/${encodedId}`, {
    method: 'PATCH',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update product ${id}: HTTP ${response.status}`);
  }

  const data: ProductApiResponse = await response.json();
  if (!data.success || !data.product) {
    throw new Error(data.message || 'No updated product returned from backend');
  }

  return normalizeFoodItem(data.product);
}

/**
 * Toggle product availability in MongoDB backend.
 * PATCH /api/products/:id/availability
 */
export async function toggleProductAvailability(id: string, isAvailable?: boolean): Promise<FoodItem> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/products/${encodedId}/availability`, {
    method: 'PATCH',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(isAvailable !== undefined ? { isAvailable } : {}),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to toggle availability for ${id}: HTTP ${response.status}`);
  }

  const data: ProductApiResponse = await response.json();
  if (!data.success || !data.product) {
    throw new Error(data.message || 'No product returned after availability toggle');
  }

  return normalizeFoodItem(data.product);
}

/**
 * Delete or safely deactivate a product in MongoDB backend.
 * DELETE /api/products/:id
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; message: string; deactivated?: boolean }> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/products/${encodedId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to delete product ${id}: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch all categories from MongoDB backend.
 * GET /api/categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: HTTP ${response.status}`);
  }

  const data: CategoriesApiResponse = await response.json();
  if (!data.success || !Array.isArray(data.categories)) {
    throw new Error(data.message || 'Invalid categories payload returned from backend');
  }

  return data.categories.map((c) => normalizeCategory(c));
}

/**
 * Create a new category in MongoDB backend.
 * POST /api/categories
 */
export async function createCategory(catData: Omit<Category, 'id' | 'itemCount'>): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(catData),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to create category: HTTP ${response.status}`);
  }

  const data: CategoryApiResponse = await response.json();
  if (!data.success || !data.category) {
    throw new Error(data.message || 'No category returned from backend');
  }

  return normalizeCategory(data.category);
}

/**
 * Update an existing category in MongoDB backend.
 * PATCH /api/categories/:id
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/categories/${encodedId}`, {
    method: 'PATCH',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update category ${id}: HTTP ${response.status}`);
  }

  const data: CategoryApiResponse = await response.json();
  if (!data.success || !data.category) {
    throw new Error(data.message || 'No updated category returned from backend');
  }

  return normalizeCategory(data.category);
}

/**
 * Toggle category active status in MongoDB backend.
 * PATCH /api/categories/:id/status
 */
export async function toggleCategoryStatus(id: string): Promise<Category> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/categories/${encodedId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to toggle category ${id}: HTTP ${response.status}`);
  }

  const data: CategoryApiResponse = await response.json();
  if (!data.success || !data.category) {
    throw new Error(data.message || 'No category returned from backend');
  }

  return normalizeCategory(data.category);
}

/**
 * Delete or safely deactivate category in MongoDB backend.
 * DELETE /api/categories/:id
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; message: string; deactivated?: boolean }> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/categories/${encodedId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to delete category ${id}: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Update stock quantity for a product in backend.
 * PATCH /api/products/:id/stock
 */
export async function updateProductStock(id: string, stock: number, inStock?: boolean): Promise<FoodItem> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/products/${encodedId}/stock`, {
    method: 'PATCH',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ stock, inStock }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update stock for ${id}: HTTP ${response.status}`);
  }

  const data: ProductApiResponse = await response.json();
  if (!data.success || !data.product) {
    throw new Error(data.message || 'No product returned after stock update');
  }

  return normalizeFoodItem(data.product);
}

// ----------------------------------------------------
// AUTHENTICATION APIS
// ----------------------------------------------------

export async function loginApi(username: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Login failed: HTTP ${response.status}`);
  }

  if (data.token) {
    setAdminAuthToken(data.token);
  }

  return data;
}

export async function getMeApi(): Promise<{ success: boolean; user: AdminUser }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
    headers: getAdminHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Session verification failed: HTTP ${response.status}`);
  }

  return data;
}

export async function logoutApi(): Promise<{ success: boolean }> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: getAdminHeaders(),
    });
  } catch {
    // ignore network error on logout
  } finally {
    setAdminAuthToken('');
    setAdminSessionKey('');
  }
  return { success: true };
}

// ----------------------------------------------------
// COMBOS APIS
// ----------------------------------------------------

export async function getCombos(): Promise<Combo[]> {
  const response = await fetch(`${API_BASE_URL}/combos`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch combos: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !Array.isArray(data.combos)) {
    throw new Error(data.message || 'Invalid combos payload');
  }

  return data.combos.map((c: Record<string, unknown>) => ({
    id: String(c.id || c._id || ''),
    name: String(c.name || ''),
    items: Array.isArray(c.items) ? (c.items as string[]) : [],
    originalPrice: Number(c.originalPrice || c.sellingPrice || 0),
    sellingPrice: Number(c.sellingPrice || 0),
    image: String(c.image || ''),
    isAvailable: c.isAvailable !== false,
    description: String(c.description || ''),
    badge: c.badge ? String(c.badge) : undefined,
  }));
}

export async function createCombo(combo: Omit<Combo, 'id'>): Promise<Combo> {
  const response = await fetch(`${API_BASE_URL}/combos`, {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(combo),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to create combo: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.combo;
}

export async function updateCombo(id: string, updates: Partial<Combo>): Promise<Combo> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/combos/${encodedId}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update combo: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.combo;
}

export async function toggleComboAvailability(id: string): Promise<Combo> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/combos/${encodedId}/availability`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to toggle combo availability: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.combo;
}

export async function deleteCombo(id: string): Promise<{ success: boolean; message: string }> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/combos/${encodedId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to delete combo: HTTP ${response.status}`);
  }

  return await response.json();
}

// ----------------------------------------------------
// SEATS APIS
// ----------------------------------------------------

export async function getSeats(auditorium?: string): Promise<Seat[]> {
  const url = auditorium
    ? `${API_BASE_URL}/seats/admin?auditorium=${encodeURIComponent(auditorium)}`
    : `${API_BASE_URL}/seats/admin`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch seats: HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawSeats = data.seats || [];

  return rawSeats.map((s: Record<string, unknown>) => {
    const status = s.status === 'inactive' ? 'Blocked' : 'Available';
    const row = String(s.row || '');
    const number = Number(s.number || 1);
    const audi = (s.auditoriumName || s.auditorium || 'Audi 1') as Seat['auditorium'];
    const section = String(s.section || 'Platinum');
    const type: Seat['type'] = section.toLowerCase().includes('recliner')
      ? 'Premium Recliner'
      : section.toLowerCase().includes('gold')
      ? 'Premium Gold'
      : section.toLowerCase().includes('lounger')
      ? 'Premium Lounger'
      : 'Premium Platinum';

    return {
      id: String(s._id || s.id || s.token || ''),
      seatNumber: String(s.seatNumber || `${row}${number}`),
      auditorium: audi,
      row,
      number,
      type,
      price: Number(s.price || 350),
      status,
      qrStatus: (s.status === 'inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
      token: String(s.token || ''),
      qrUrl: `https://asr-cinema-scan-to-food.vercel.app/order/${s.token}`,
      isDemo: Boolean(s.isDemo),
    };
  });
}

export async function updateSeatStatus(seatId: string, status: 'Available' | 'Blocked'): Promise<void> {
  const backendStatus = status === 'Blocked' ? 'inactive' : 'active';
  const encodedId = encodeURIComponent(seatId);
  const response = await fetch(`${API_BASE_URL}/seats/${encodedId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: backendStatus }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update seat status: HTTP ${response.status}`);
  }
}

// ----------------------------------------------------
// PAYMENTS APIS
// ----------------------------------------------------

export async function getPayments(): Promise<Payment[]> {
  const response = await fetch(`${API_BASE_URL}/payments/admin`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payments: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.payments || [];
}

// ----------------------------------------------------
// CUSTOMERS APIS
// ----------------------------------------------------

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_BASE_URL}/orders/customers/admin`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch customers: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.customers || [];
}

// ----------------------------------------------------
// COUPONS APIS
// ----------------------------------------------------

export async function getCoupons(): Promise<Coupon[]> {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch coupons: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.coupons || [];
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(coupon),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to create coupon: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.coupon;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/coupons/${encodedId}`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update coupon: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.coupon;
}

export async function toggleCouponStatus(id: string): Promise<Coupon> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/coupons/${encodedId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to toggle coupon status: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.coupon;
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${API_BASE_URL}/coupons/${encodedId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to delete coupon: HTTP ${response.status}`);
  }

  return await response.json();
}

// ----------------------------------------------------
// SETTINGS APIS
// ----------------------------------------------------

export async function getSettings(): Promise<SystemSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: HTTP ${response.status}`);
  }

  const data = await response.json();
  const raw = data.settings || {};

  return {
    general: {
      cinemaName: raw.general?.cinemaName || 'ASR Cinemas',
      tagline: raw.general?.tagline || 'Premium Silver Screen Dining Experience',
      logoUrl: '',
      phone: raw.general?.phone || '+91 98765 43210',
      email: raw.general?.supportEmail || 'concierge@asrcinemas.com',
      address: raw.general?.address || 'Connaught Place, Central Delhi',
      licenseNumber: raw.payment?.gstNumber || '07AAAAA0000A1Z5',
    },
    orders: {
      defaultPrepTime: `${raw.orders?.prepTimeBufferMinutes || 10} mins`,
      autoAcceptOrders: Boolean(raw.orders?.autoAcceptOrders),
      allowCancellations: Boolean(raw.orders?.allowCancellation ?? true),
      maxActiveOrdersPerSeat: Number(raw.orders?.maxOrderItems || 15),
      orderAlertSound: Boolean(raw.notifications?.soundEnabled ?? true),
    },
    payment: {
      enableUPI: Boolean(raw.payment?.enableUPI ?? true),
      enableCards: Boolean(raw.payment?.enableCards ?? true),
      enableCash: Boolean(raw.payment?.enableCash),
      currency: 'INR (₹)',
      gstRate: Number(raw.payment?.gstRate || 5),
      serviceCharge: Number(raw.payment?.serviceChargeRate || 0),
    },
    notifications: {
      orderAlerts: Boolean(raw.notifications?.soundEnabled ?? true),
      paymentAlerts: true,
      stockLowAlerts: true,
      emailDigest: false,
    },
    profile: {
      name: raw.profile?.adminName || 'ASR Cinema Operations',
      email: raw.profile?.adminEmail || 'ops@asrcinemas.com',
      role: raw.profile?.roleTitle || 'Theatre General Manager',
      avatarUrl: '',
      lastLogin: 'Active Session',
    },
  };
}

export async function updateSettings(settings: SystemSettings): Promise<SystemSettings> {
  const backendPayload = {
    general: {
      cinemaName: settings.general.cinemaName,
      tagline: settings.general.tagline,
      address: settings.general.address,
      phone: settings.general.phone,
      supportEmail: settings.general.email,
    },
    orders: {
      autoAcceptOrders: settings.orders.autoAcceptOrders,
      allowCancellation: settings.orders.allowCancellations,
      maxOrderItems: settings.orders.maxActiveOrdersPerSeat,
    },
    payment: {
      enableUPI: settings.payment.enableUPI,
      enableCards: settings.payment.enableCards,
      enableCash: settings.payment.enableCash,
      gstRate: settings.payment.gstRate,
      serviceChargeRate: settings.payment.serviceCharge,
      gstNumber: settings.general.licenseNumber,
    },
    notifications: {
      soundEnabled: settings.notifications.orderAlerts,
    },
    profile: {
      adminName: settings.profile.name,
      adminEmail: settings.profile.email,
      roleTitle: settings.profile.role,
    },
  };

  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(backendPayload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update settings: HTTP ${response.status}`);
  }

  return settings;
}

// ----------------------------------------------------
// DASHBOARD & ANALYTICS APIS
// ----------------------------------------------------

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
  activeFoods: number;
  activeSeats: number;
  totalSeats: number;
  revenueTrend: { label: string; revenue: number; orders: number }[];
  popularItems: { name: string; quantity: number; revenue: number; image?: string; category?: string }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.stats;
}

export interface AnalyticsReport {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueTrend: { label: string; revenue: number; orders: number }[];
  categorySales: { category: string; amount: number; percentage: number; color: string }[];
  topSellingFoods: { name: string; quantity: number; revenue: number; image: string; category: string }[];
}

export async function getAnalyticsReports(period: 'today' | '7days' | '30days' | 'month' = '7days'): Promise<AnalyticsReport> {
  const response = await fetch(`${API_BASE_URL}/dashboard/reports/analytics?period=${period}`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics report: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.report;
}
