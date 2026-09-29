import type { Payment } from '../types';

export const initialPayments: Payment[] = [
  {
    id: 'TXN-98421034',
    orderId: '#ASR1025',
    customer: 'Ananya Roy',
    amount: 1143,
    method: 'UPI',
    status: 'Successful',
    date: 'Today, 03:50 PM',
    gatewayRef: 'UPI-RAZORPAY-892301'
  },
  {
    id: 'TXN-98421033',
    orderId: '#ASR1024',
    customer: 'Rahul Verma',
    amount: 819,
    method: 'UPI',
    status: 'Successful',
    date: 'Today, 03:42 PM',
    gatewayRef: 'UPI-GPAY-776211'
  },
  {
    id: 'TXN-98421032',
    orderId: '#ASR1023',
    customer: 'Vikram Malhotra',
    amount: 1894,
    method: 'Card',
    status: 'Successful',
    date: 'Today, 03:30 PM',
    gatewayRef: 'HDFC-POS-554109'
  },
  {
    id: 'TXN-98421031',
    orderId: '#ASR1022',
    customer: 'Priya Sharma',
    amount: 643,
    method: 'UPI',
    status: 'Successful',
    date: 'Today, 03:10 PM',
    gatewayRef: 'UPI-PHONEPE-102948'
  },
  {
    id: 'TXN-98421030',
    orderId: '#ASR1021',
    customer: 'Rohan Deshmukh',
    amount: 808,
    method: 'Card',
    status: 'Successful',
    date: 'Today, 02:45 PM',
    gatewayRef: 'ICICI-CARD-382910'
  },
  {
    id: 'TXN-98421029',
    orderId: '#ASR1020',
    customer: 'Sneha Patel',
    amount: 378,
    method: 'UPI',
    status: 'Failed',
    date: 'Today, 02:15 PM',
    gatewayRef: 'UPI-TIMEOUT-ERR-408'
  },
  {
    id: 'TXN-98421028',
    orderId: '#ASR1018',
    customer: 'Kunal Kapoor',
    amount: 520,
    method: 'UPI',
    status: 'Refunded',
    date: 'Today, 01:20 PM',
    gatewayRef: 'REF-TXN-492019'
  },
  {
    id: 'TXN-98421027',
    orderId: '#ASR1017',
    customer: 'Tanvi Sen',
    amount: 940,
    method: 'Cash',
    status: 'Successful',
    date: 'Today, 12:40 PM',
    gatewayRef: 'COUNTER-CASH-REC-082'
  }
];
