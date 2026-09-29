import type { Order } from '../types';

export const initialOrders: Order[] = [
  {
    id: '#ASR1026',
    auditorium: 'Audi 1',
    seat: 'A06',
    customer: {
      name: 'Karan Mehra',
      phone: '+91 98450 12345',
      email: 'karan.m@gmail.com'
    },
    items: [
      { id: 'item-1', name: 'Large Gourmet Salted Popcorn (350 gm)', quantity: 1, price: 340, type: 'Veg' },
      { id: 'item-2', name: 'Chilled Thums Up (500 ml)', quantity: 1, price: 190, type: 'Veg' }
    ],
    subtotal: 530,
    taxes: 27,
    deliveryFee: 0,
    discount: 0,
    total: 557,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    status: 'Pending',
    createdAt: '2026-09-29T16:02:00Z',
    time: '04:02 PM',
    specialInstructions: 'Please deliver during movie intermission',
    timeline: [
      { status: 'Pending', time: '04:02 PM', note: 'Order placed by customer via Seat QR scan', completed: true },
      { status: 'Accepted', time: '', note: 'Awaiting manager / kitchen acknowledgement', completed: false },
      { status: 'Preparing', time: '', note: 'Kitchen prep started', completed: false },
      { status: 'Ready', time: '', note: 'Packed & ready at dispatch counter', completed: false },
      { status: 'Served', time: '', note: 'Runner dispatched to Audi 1 • Seat A06', completed: false },
      { status: 'Completed', time: '', note: 'Delivery confirmed by patron', completed: false }
    ]
  },
  {
    id: '#ASR1025',
    auditorium: 'Audi 3',
    seat: 'B01',
    customer: {
      name: 'Ananya Roy',
      phone: '+91 99234 56789',
      email: 'ananya.roy@example.com'
    },
    items: [
      { id: 'item-1', name: 'Couple Combo', quantity: 1, price: 999, type: 'Veg' },
      { id: 'item-2', name: 'Fountain Coca-Cola (500 ml)', quantity: 1, price: 190, type: 'Veg' }
    ],
    subtotal: 1189,
    taxes: 59,
    deliveryFee: 0,
    discount: 0,
    total: 1248,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    status: 'Pending',
    createdAt: '2026-09-29T15:50:00Z',
    time: '03:50 PM',
    specialInstructions: 'Extra napkins and straws please',
    timeline: [
      { status: 'Pending', time: '03:50 PM', note: 'Order placed by customer via Seat QR', completed: true },
      { status: 'Accepted', time: '', note: 'Awaiting kitchen acceptance', completed: false },
      { status: 'Preparing', time: '', note: 'Kitchen accepts order', completed: false },
      { status: 'Ready', time: '', note: 'Items packed and verified', completed: false },
      { status: 'Served', time: '', note: 'Runner dispatched to Audi 3 • Seat B01', completed: false },
      { status: 'Completed', time: '', note: 'Delivery confirmed by patron', completed: false }
    ]
  },
  {
    id: '#ASR1024',
    auditorium: 'Audi 2',
    seat: 'B16',
    customer: {
      name: 'Rahul Verma',
      phone: '+91 98765 43210',
      email: 'rahul.v@gmail.com'
    },
    items: [
      { id: 'item-1', name: 'Medium Cheese Burst Popcorn (300 gm)', quantity: 2, price: 310, type: 'Veg' },
      { id: 'item-2', name: 'Fountain Coca-Cola (500 ml)', quantity: 2, price: 80, type: 'Veg' }
    ],
    subtotal: 780,
    taxes: 39,
    deliveryFee: 0,
    discount: 0,
    total: 819,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    status: 'Accepted',
    createdAt: '2026-09-29T15:42:00Z',
    time: '03:42 PM',
    specialInstructions: 'Hot butter on top of popcorn',
    timeline: [
      { status: 'Pending', time: '03:42 PM', note: 'Order placed via Seat QR scan', completed: true },
      { status: 'Accepted', time: '03:43 PM', note: 'Order accepted by Cinema Floor Manager', completed: true },
      { status: 'Preparing', time: '', note: 'Kitchen prep started at Popcorn station', completed: false },
      { status: 'Ready', time: '', note: 'Awaiting packaging', completed: false },
      { status: 'Served', time: '', note: 'Runner dispatch pending', completed: false },
      { status: 'Completed', time: '', note: 'Order fulfillment', completed: false }
    ]
  },
  {
    id: '#ASR1023',
    auditorium: 'Audi 1',
    seat: 'A12',
    customer: {
      name: 'Vikram Malhotra',
      phone: '+91 98112 34567',
      email: 'vikram.m@outlook.com'
    },
    items: [
      { id: 'item-1', name: 'Family Combo', quantity: 1, price: 1899, type: 'Veg' }
    ],
    subtotal: 1899,
    taxes: 95,
    deliveryFee: 0,
    discount: 100,
    total: 1894,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    status: 'Preparing',
    createdAt: '2026-09-29T15:30:00Z',
    time: '03:30 PM',
    timeline: [
      { status: 'Pending', time: '03:30 PM', note: 'Order placed by customer', completed: true },
      { status: 'Accepted', time: '03:31 PM', note: 'Order accepted by kitchen dispatch', completed: true },
      { status: 'Preparing', time: '03:32 PM', note: 'Kitchen preparation in progress', completed: true },
      { status: 'Ready', time: '', note: 'Tray assembled, ready for runner', completed: false },
      { status: 'Served', time: '', note: 'En route to Audi 1 • Seat A12', completed: false },
      { status: 'Completed', time: '', note: 'Customer confirmation', completed: false }
    ]
  },
  {
    id: '#ASR1022',
    auditorium: 'Audi 2',
    seat: 'B15',
    customer: {
      name: 'Priya Sharma',
      phone: '+91 97654 32109',
      email: 'priya.sharma@yahoo.com'
    },
    items: [
      { id: 'item-1', name: 'Ultimate Loaded Mexican Nachos', quantity: 1, price: 380, type: 'Veg' },
      { id: 'item-2', name: 'Hazelnut Iced Frappe', quantity: 1, price: 280, type: 'Veg' }
    ],
    subtotal: 660,
    taxes: 33,
    deliveryFee: 0,
    discount: 50,
    total: 643,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    status: 'Ready',
    createdAt: '2026-09-29T15:10:00Z',
    time: '03:10 PM',
    timeline: [
      { status: 'Pending', time: '03:10 PM', note: 'Order placed', completed: true },
      { status: 'Accepted', time: '03:11 PM', note: 'Kitchen accepted', completed: true },
      { status: 'Preparing', time: '03:12 PM', note: 'Prep started', completed: true },
      { status: 'Ready', time: '03:22 PM', note: 'Packed with cold insulation, awaiting runner', completed: true },
      { status: 'Served', time: '', note: 'Handover at Seat B15', completed: false },
      { status: 'Completed', time: '', note: 'Final audit signoff', completed: false }
    ]
  },
  {
    id: '#ASR1021',
    auditorium: 'Audi 1',
    seat: 'A13',
    customer: {
      name: 'Rohan Deshmukh',
      phone: '+91 98334 11223',
      email: 'rohan.d@gmail.com'
    },
    items: [
      { id: 'item-1', name: 'Crispy Chicken Zinger Burger', quantity: 1, price: 360, type: 'Non-Veg' },
      { id: 'item-2', name: 'Peri Peri Crinkle French Fries', quantity: 1, price: 220, type: 'Veg' },
      { id: 'item-3', name: 'Chilled Sprite (500 ml)', quantity: 1, price: 190, type: 'Veg' }
    ],
    subtotal: 770,
    taxes: 38,
    deliveryFee: 0,
    discount: 0,
    total: 808,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    status: 'Served',
    createdAt: '2026-09-29T14:45:00Z',
    time: '02:45 PM',
    timeline: [
      { status: 'Pending', time: '02:45 PM', note: 'Order placed', completed: true },
      { status: 'Accepted', time: '02:46 PM', note: 'Accepted by kitchen', completed: true },
      { status: 'Preparing', time: '02:47 PM', note: 'Kitchen cooking order', completed: true },
      { status: 'Ready', time: '02:59 PM', note: 'Ready for delivery', completed: true },
      { status: 'Served', time: '03:03 PM', note: 'Delivered to Audi 1 • Seat A13', completed: true },
      { status: 'Completed', time: '', note: 'Order closed successfully', completed: false }
    ]
  },
  {
    id: '#ASR1019',
    auditorium: 'Audi 3',
    seat: 'D04',
    customer: {
      name: 'Aakash Verma',
      phone: '+91 99887 66554',
      email: 'aakash.v@gmail.com'
    },
    items: [
      { id: 'item-1', name: 'Signature Cappuccino Coffee', quantity: 2, price: 220, type: 'Veg' }
    ],
    subtotal: 440,
    taxes: 22,
    deliveryFee: 0,
    discount: 0,
    total: 462,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    status: 'Completed',
    createdAt: '2026-09-29T14:30:00Z',
    time: '02:30 PM',
    timeline: [
      { status: 'Pending', time: '02:30 PM', note: 'Order placed', completed: true },
      { status: 'Accepted', time: '02:31 PM', note: 'Order accepted', completed: true },
      { status: 'Preparing', time: '02:32 PM', note: 'Brewing barista drinks', completed: true },
      { status: 'Ready', time: '02:40 PM', note: 'Sealed cups ready for transit', completed: true },
      { status: 'Served', time: '02:45 PM', note: 'Served to Audi 3 • Seat D04', completed: true },
      { status: 'Completed', time: '02:48 PM', note: 'Customer confirmed delivery', completed: true }
    ]
  },
  {
    id: '#ASR1020',
    auditorium: 'Audi 3',
    seat: 'F14',
    customer: {
      name: 'Sneha Patel',
      phone: '+91 98223 99887',
      email: 'sneha.patel@rediffmail.com'
    },
    items: [
      { id: 'item-1', name: 'Caramel Crunch Popcorn Tub', quantity: 1, price: 360, type: 'Veg' }
    ],
    subtotal: 360,
    taxes: 18,
    deliveryFee: 0,
    discount: 0,
    total: 378,
    paymentStatus: 'Failed',
    paymentMethod: 'UPI',
    status: 'Cancelled',
    createdAt: '2026-09-29T14:15:00Z',
    time: '02:15 PM',
    specialInstructions: 'Customer payment timed out at UPI gateway',
    timeline: [
      { status: 'Pending', time: '02:15 PM', note: 'Order initiated', completed: true },
      { status: 'Cancelled', time: '02:20 PM', note: 'Cancelled due to payment gateway timeout', completed: true }
    ]
  }
];
