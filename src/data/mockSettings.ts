import type { SystemSettings } from '../types';

export const initialSettings: SystemSettings = {
  general: {
    cinemaName: 'ASR CINEMAS',
    tagline: 'Premium Dine-In Movie Experience',
    logoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=80',
    phone: '+91 (80) 4123 7890',
    email: 'operations@asrcinemas.com',
    address: 'ASR Prime Multiplex, 4th Floor, Nexus Grand Mall, Koramangala, Bengaluru, Karnataka 560095',
    licenseNumber: 'CIN-FSSAI-2024-8849102'
  },
  orders: {
    defaultPrepTime: '10-15 mins',
    autoAcceptOrders: true,
    allowCancellations: false,
    maxActiveOrdersPerSeat: 2,
    orderAlertSound: true
  },
  payment: {
    enableUPI: true,
    enableCards: true,
    enableCash: true,
    currency: '₹',
    gstRate: 5,
    serviceCharge: 0
  },
  notifications: {
    orderAlerts: true,
    paymentAlerts: true,
    stockLowAlerts: true,
    emailDigest: true
  },
  profile: {
    name: 'Vikram Aditya',
    email: 'admin@asrcinemas.com',
    role: 'Operations Lead & General Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    lastLogin: 'Today, 09:30 AM'
  }
};
