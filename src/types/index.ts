export type FoodType = 'Veg' | 'Non-Veg';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  type: FoodType;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  isAvailable: boolean;
  prepTime: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  isActive: boolean;
  createdDate?: string;
  description?: string;
}

export interface Combo {
  id: string;
  name: string;
  items: string[];
  originalPrice: number;
  sellingPrice: number;
  image: string;
  isAvailable: boolean;
  description: string;
  badge?: string;
}

export type SeatStatus = 'Available' | 'Occupied' | 'Ordering' | 'Blocked';
export type SeatType = 'Premium Recliner' | 'Premium Platinum' | 'Premium Gold' | 'Premium Lounger';
export type AuditoriumName = 'Audi 1' | 'Audi 2' | 'Audi 3';

export interface SeatQR {
  token: string;
  url: string;
  qrImageUrl: string;
  status: 'Active' | 'Inactive';
  generatedAt?: string;
}

export interface CurrentSeatOrder {
  orderId: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  status: OrderStatus;
  time: string;
}

export interface Seat {
  id: string;
  seatNumber: string;
  auditorium: AuditoriumName;
  row: string;
  number: number;
  type: SeatType;
  price: number;
  status: SeatStatus;
  qrStatus: 'Active' | 'Inactive';
  token: string;
  qrUrl: string;
  lastOrder?: string;
  lastOrderTime?: string;
  isDemo?: boolean;
  currentOrder?: CurrentSeatOrder;
}

export interface AuditoriumSection {
  name: string;
  type: SeatType;
  price: number;
  rows: string[];
  seatsPerRow: number;
}

export interface Auditorium {
  id: string;
  name: AuditoriumName;
  screenType: string;
  soundSystem: string;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  blockedSeats: number;
  revenueSummary?: string;
  sections: AuditoriumSection[];
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Cash';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type?: FoodType;
}

export interface OrderTimeline {
  status: OrderStatus;
  time: string;
  note: string;
  completed: boolean;
}

export interface Order {
  id: string;
  auditorium: AuditoriumName;
  seat: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  time: string;
  timeline: OrderTimeline[];
  specialInstructions?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: PaymentMethod;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  gatewayRef: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder: string;
  status: 'Active' | 'Inactive' | 'VIP';
  joinedDate: string;
  favoriteAudi?: AuditoriumName;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  expiry: string;
  status: 'Active' | 'Inactive' | 'Expired';
  description?: string;
}

export interface GeneralSettings {
  cinemaName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
}

export interface OrderSettingsConfig {
  defaultPrepTime: string;
  autoAcceptOrders: boolean;
  allowCancellations: boolean;
  maxActiveOrdersPerSeat: number;
  orderAlertSound: boolean;
}

export interface PaymentSettingsConfig {
  enableUPI: boolean;
  enableCards: boolean;
  enableCash: boolean;
  currency: string;
  gstRate: number;
  serviceCharge: number;
}

export interface NotificationSettingsConfig {
  orderAlerts: boolean;
  paymentAlerts: boolean;
  stockLowAlerts: boolean;
  emailDigest: boolean;
}

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  lastLogin: string;
}

export interface SystemSettings {
  general: GeneralSettings;
  orders: OrderSettingsConfig;
  payment: PaymentSettingsConfig;
  notifications: NotificationSettingsConfig;
  profile: AdminProfile;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
