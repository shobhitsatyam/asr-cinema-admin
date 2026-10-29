import type { Order, OrderStatus, FoodItem, Category } from '../types';

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

export const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...extraHeaders,
  };
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
