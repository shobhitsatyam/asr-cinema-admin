import type { Customer } from '../types';

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rahul Verma',
    mobile: '+91 98765 43210',
    email: 'rahul.v@gmail.com',
    ordersCount: 8,
    totalSpent: 6420,
    lastOrder: 'Today, 03:42 PM (#ASR1024)',
    status: 'VIP',
    joinedDate: 'Jan 15, 2026',
    favoriteAudi: 'Audi 2'
  },
  {
    id: 'cust-2',
    name: 'Vikram Malhotra',
    mobile: '+91 98112 34567',
    email: 'vikram.m@outlook.com',
    ordersCount: 14,
    totalSpent: 18240,
    lastOrder: 'Today, 03:30 PM (#ASR1023)',
    status: 'VIP',
    joinedDate: 'Nov 02, 2025',
    favoriteAudi: 'Audi 1'
  },
  {
    id: 'cust-3',
    name: 'Priya Sharma',
    mobile: '+91 97654 32109',
    email: 'priya.sharma@yahoo.com',
    ordersCount: 6,
    totalSpent: 4210,
    lastOrder: 'Today, 03:10 PM (#ASR1022)',
    status: 'Active',
    joinedDate: 'Mar 10, 2026',
    favoriteAudi: 'Audi 2'
  },
  {
    id: 'cust-4',
    name: 'Ananya Roy',
    mobile: '+91 99234 56789',
    email: 'ananya.roy@example.com',
    ordersCount: 3,
    totalSpent: 2650,
    lastOrder: 'Today, 03:50 PM (#ASR1025)',
    status: 'Active',
    joinedDate: 'Jun 22, 2026',
    favoriteAudi: 'Audi 3'
  },
  {
    id: 'cust-5',
    name: 'Rohan Deshmukh',
    mobile: '+91 98334 11223',
    email: 'rohan.d@gmail.com',
    ordersCount: 9,
    totalSpent: 7890,
    lastOrder: 'Today, 02:45 PM (#ASR1021)',
    status: 'Active',
    joinedDate: 'Feb 18, 2026',
    favoriteAudi: 'Audi 1'
  },
  {
    id: 'cust-6',
    name: 'Sneha Patel',
    mobile: '+91 98223 99887',
    email: 'sneha.patel@rediffmail.com',
    ordersCount: 1,
    totalSpent: 360,
    lastOrder: 'Today, 02:15 PM (#ASR1020)',
    status: 'Inactive',
    joinedDate: 'Aug 04, 2026',
    favoriteAudi: 'Audi 3'
  },
  {
    id: 'cust-7',
    name: 'Tanvi Sen',
    mobile: '+91 98451 22334',
    email: 'tanvi.sen@gmail.com',
    ordersCount: 5,
    totalSpent: 3950,
    lastOrder: 'Today, 12:40 PM (#ASR1017)',
    status: 'Active',
    joinedDate: 'May 30, 2026',
    favoriteAudi: 'Audi 2'
  }
];
