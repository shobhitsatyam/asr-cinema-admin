import type { Order, OrderStatus } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

/**
 * Fetch all orders from backend.
 * GET /api/orders
 * Returns array of Order objects.
 */
export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: HTTP ${response.status} ${response.statusText}`);
  }

  const data: OrdersApiResponse = await response.json();
  if (!data.success || !Array.isArray(data.orders)) {
    throw new Error(data.message || 'Invalid orders payload returned from backend');
  }

  return data.orders;
}

/**
 * Update an order's status on the backend.
 * PATCH /api/orders/:id/status
 * Note: orderId contains '#', so it must be URL encoded via encodeURIComponent without stripping '#'.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const encodedId = encodeURIComponent(orderId);
  const response = await fetch(`${API_BASE_URL}/orders/${encodedId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
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
