import type { Seat, Auditorium } from '../types';

export const auditoriumsList: Auditorium[] = [
  {
    id: 'audi-1',
    name: 'Audi 1',
    screenType: '4K Laser • Dolby Atmos 7.1',
    soundSystem: 'JBL Cinema Surround 64-Channel',
    totalSeats: 96,
    availableSeats: 78,
    occupiedSeats: 15,
    blockedSeats: 3,
    revenueSummary: '₹24,800 Potential',
    sections: [
      { name: 'Premium Recliner', type: 'Premium Recliner', price: 350, rows: ['A'], seatsPerRow: 12 },
      { name: 'Premium Platinum', type: 'Premium Platinum', price: 250, rows: ['B', 'C', 'D'], seatsPerRow: 14 },
      { name: 'Premium Gold', type: 'Premium Gold', price: 200, rows: ['E', 'F'], seatsPerRow: 14 },
      { name: 'Premium Lounger', type: 'Premium Lounger', price: 250, rows: ['G'], seatsPerRow: 14 }
    ]
  },
  {
    id: 'audi-2',
    name: 'Audi 2',
    screenType: 'IMAX Laser • Dolby Atmos Ultra',
    soundSystem: 'Meyer Sound Linear Pro',
    totalSeats: 33, // 32 standard + 1 Demo Seat B16
    availableSeats: 26,
    occupiedSeats: 5,
    blockedSeats: 2,
    revenueSummary: '₹11,550 Potential',
    sections: [
      { name: 'Premium Recliner', type: 'Premium Recliner', price: 350, rows: ['A', 'B', 'C', 'D'], seatsPerRow: 8 }
    ]
  },
  {
    id: 'audi-3',
    name: 'Audi 3',
    screenType: 'Barco 4K • Dolby Surround 5.1',
    soundSystem: 'QSC Cinema Core Pro',
    totalSeats: 84,
    availableSeats: 68,
    occupiedSeats: 13,
    blockedSeats: 3,
    revenueSummary: '₹19,800 Potential',
    sections: [
      { name: 'Premium Platinum', type: 'Premium Platinum', price: 250, rows: ['A', 'B', 'C'], seatsPerRow: 12 },
      { name: 'Premium Gold', type: 'Premium Gold', price: 200, rows: ['D', 'E', 'F'], seatsPerRow: 12 },
      { name: 'Premium Lounger', type: 'Premium Lounger', price: 250, rows: ['G'], seatsPerRow: 12 }
    ]
  }
];

// Helper to generate seat layout
function generateAudiSeats(): Seat[] {
  const result: Seat[] = [];

  // ==========================================
  // AUDI 1
  // Row A: Premium Recliner — ₹350 (01–12)
  // Rows B, C, D: Premium Platinum — ₹250 (01–14)
  // Rows E, F: Premium Gold — ₹200 (01–14)
  // Row G: Premium Lounger — ₹250 (01–14)
  // ==========================================
  const audi1Rows = [
    { row: 'A', count: 12, type: 'Premium Recliner' as const, price: 350 },
    { row: 'B', count: 14, type: 'Premium Platinum' as const, price: 250 },
    { row: 'C', count: 14, type: 'Premium Platinum' as const, price: 250 },
    { row: 'D', count: 14, type: 'Premium Platinum' as const, price: 250 },
    { row: 'E', count: 14, type: 'Premium Gold' as const, price: 200 },
    { row: 'F', count: 14, type: 'Premium Gold' as const, price: 200 },
    { row: 'G', count: 14, type: 'Premium Lounger' as const, price: 250 }
  ];

  for (const cfg of audi1Rows) {
    for (let num = 1; num <= cfg.count; num++) {
      const seatNumStr = num < 10 ? `0${num}` : `${num}`;
      const seatNumber = `${cfg.row}${seatNumStr}`;
      const token = `audi1-${cfg.row.toLowerCase()}${seatNumStr}`;
      const id = `seat-audi1-${cfg.row.toLowerCase()}${seatNumStr}`;

      let status: Seat['status'] = 'Available';
      let currentOrder: Seat['currentOrder'] = undefined;
      let lastOrder: string | undefined = undefined;
      let lastOrderTime: string | undefined = undefined;

      // Realistic mock states for Audi 1
      if (seatNumber === 'A12') {
        status = 'Occupied';
        lastOrder = 'Today, 03:30 PM';
        lastOrderTime = '03:30 PM';
        currentOrder = {
          orderId: '#ASR1023',
          customerName: 'Vikram Malhotra',
          itemsSummary: 'Family Combo',
          total: 1899,
          status: 'Ready',
          time: '03:30 PM'
        };
      } else if (seatNumber === 'A06' || seatNumber === 'A07') {
        status = 'Occupied';
        lastOrder = 'Today, 03:15 PM';
        lastOrderTime = '03:15 PM';
      } else if (seatNumber === 'B04' || seatNumber === 'B05') {
        status = 'Occupied';
        lastOrder = 'Today, 02:45 PM';
        lastOrderTime = '02:45 PM';
      } else if (seatNumber === 'C05') {
        status = 'Blocked';
        lastOrder = '4 days ago';
      } else if (seatNumber === 'D08' || seatNumber === 'D09') {
        status = 'Occupied';
        lastOrder = 'Today, 03:00 PM';
        lastOrderTime = '03:00 PM';
      } else if (seatNumber === 'E07') {
        status = 'Blocked';
        lastOrder = '1 week ago';
      } else if (seatNumber === 'F10' || seatNumber === 'F11') {
        status = 'Occupied';
        lastOrder = 'Today, 01:40 PM';
        lastOrderTime = '01:40 PM';
      } else if (seatNumber === 'G04') {
        status = 'Blocked';
        lastOrder = '3 days ago';
      }

      result.push({
        id,
        seatNumber,
        auditorium: 'Audi 1',
        row: cfg.row,
        number: num,
        type: cfg.type,
        price: cfg.price,
        status,
        qrStatus: status === 'Blocked' ? 'Inactive' : 'Active',
        token,
        qrUrl: `https://asr-cinema-scan-to-food.vercel.app/order/${token}`,
        lastOrder,
        lastOrderTime,
        currentOrder
      });
    }
  }

  // ==========================================
  // AUDI 2
  // Rows A, B, C, D: Premium Recliner — ₹350 (8 seats: 01–08)
  // PLUS PRESERVED DEMO SEAT B16!
  // Token: "audi2-b16"
  // URL: https://asr-cinema-scan-to-food.vercel.app/order/audi2-b16
  // ==========================================
  const audi2Rows = ['A', 'B', 'C', 'D'];
  for (const row of audi2Rows) {
    for (let num = 1; num <= 8; num++) {
      const seatNumStr = num < 10 ? `0${num}` : `${num}`;
      const seatNumber = `${row}${seatNumStr}`;
      const token = `audi2-${row.toLowerCase()}${seatNumStr}`;
      const id = `seat-audi2-${row.toLowerCase()}${seatNumStr}`;

      let status: Seat['status'] = 'Available';
      let currentOrder: Seat['currentOrder'] = undefined;
      let lastOrder: string | undefined = undefined;
      let lastOrderTime: string | undefined = undefined;

      if (seatNumber === 'A04' || seatNumber === 'A05') {
        status = 'Occupied';
        lastOrder = 'Today, 03:10 PM';
        lastOrderTime = '03:10 PM';
      } else if (seatNumber === 'B04') {
        status = 'Occupied';
        lastOrder = 'Today, 02:20 PM';
        lastOrderTime = '02:20 PM';
      } else if (seatNumber === 'C06') {
        status = 'Blocked';
        lastOrder = '2 days ago';
      } else if (seatNumber === 'D02') {
        status = 'Blocked';
        lastOrder = '5 days ago';
      }

      result.push({
        id,
        seatNumber,
        auditorium: 'Audi 2',
        row,
        number: num,
        type: 'Premium Recliner',
        price: 350,
        status,
        qrStatus: status === 'Blocked' ? 'Inactive' : 'Active',
        token,
        qrUrl: `https://asr-cinema-scan-to-food.vercel.app/order/${token}`,
        lastOrder,
        lastOrderTime,
        currentOrder
      });
    }
  }

  // PRESERVED CUSTOMER DEMO SEAT B16 (Audi 2)
  // MUST NEVER BE REMOVED, RENAMED, OR INVALIDATED!
  result.push({
    id: 'seat-audi2-b16',
    seatNumber: 'B16',
    auditorium: 'Audi 2',
    row: 'B',
    number: 16,
    type: 'Premium Recliner',
    price: 350,
    status: 'Ordering',
    qrStatus: 'Active',
    token: 'audi2-b16',
    qrUrl: 'https://asr-cinema-scan-to-food.vercel.app/order/audi2-b16',
    isDemo: true,
    lastOrder: 'Today, 03:42 PM',
    lastOrderTime: '03:42 PM',
    currentOrder: {
      orderId: '#ASR1024',
      customerName: 'Rahul Verma',
      itemsSummary: '2x Popcorn + 2x Coke',
      total: 780,
      status: 'Preparing',
      time: '03:42 PM'
    }
  });

  // ==========================================
  // AUDI 3
  // Rows A, B, C: Premium Platinum — ₹250 (Seats 01–12)
  // Rows D, E, F: Premium Gold — ₹200 (Seats 01–12)
  // Row G: Premium Lounger — ₹250 (Seats 01–12)
  // ==========================================
  const audi3Rows = [
    { row: 'A', count: 12, type: 'Premium Platinum' as const, price: 250 },
    { row: 'B', count: 12, type: 'Premium Platinum' as const, price: 250 },
    { row: 'C', count: 12, type: 'Premium Platinum' as const, price: 250 },
    { row: 'D', count: 12, type: 'Premium Gold' as const, price: 200 },
    { row: 'E', count: 12, type: 'Premium Gold' as const, price: 200 },
    { row: 'F', count: 12, type: 'Premium Gold' as const, price: 200 },
    { row: 'G', count: 12, type: 'Premium Lounger' as const, price: 250 }
  ];

  for (const cfg of audi3Rows) {
    for (let num = 1; num <= cfg.count; num++) {
      const seatNumStr = num < 10 ? `0${num}` : `${num}`;
      const seatNumber = `${cfg.row}${seatNumStr}`;
      const token = `audi3-${cfg.row.toLowerCase()}${seatNumStr}`;
      const id = `seat-audi3-${cfg.row.toLowerCase()}${seatNumStr}`;

      let status: Seat['status'] = 'Available';
      let currentOrder: Seat['currentOrder'] = undefined;
      let lastOrder: string | undefined = undefined;
      let lastOrderTime: string | undefined = undefined;

      if (seatNumber === 'B01') {
        status = 'Ordering';
        lastOrder = 'Today, 03:50 PM';
        lastOrderTime = '03:50 PM';
        currentOrder = {
          orderId: '#ASR1025',
          customerName: 'Ananya Roy',
          itemsSummary: 'Couple Combo + 1 Coke',
          total: 1089,
          status: 'Pending',
          time: '03:50 PM'
        };
      } else if (seatNumber === 'A05' || seatNumber === 'A06') {
        status = 'Occupied';
        lastOrder = 'Today, 02:30 PM';
        lastOrderTime = '02:30 PM';
      } else if (seatNumber === 'C07') {
        status = 'Blocked';
        lastOrder = '4 days ago';
      } else if (seatNumber === 'D04' || seatNumber === 'D05') {
        status = 'Occupied';
        lastOrder = 'Today, 03:05 PM';
        lastOrderTime = '03:05 PM';
      } else if (seatNumber === 'E08') {
        status = 'Blocked';
        lastOrder = '6 days ago';
      } else if (seatNumber === 'F12') {
        status = 'Occupied';
        lastOrder = 'Today, 12:45 PM';
        lastOrderTime = '12:45 PM';
      } else if (seatNumber === 'G09') {
        status = 'Blocked';
        lastOrder = 'Yesterday';
      }

      result.push({
        id,
        seatNumber,
        auditorium: 'Audi 3',
        row: cfg.row,
        number: num,
        type: cfg.type,
        price: cfg.price,
        status,
        qrStatus: status === 'Blocked' ? 'Inactive' : 'Active',
        token,
        qrUrl: `https://asr-cinema-scan-to-food.vercel.app/order/${token}`,
        lastOrder,
        lastOrderTime,
        currentOrder
      });
    }
  }

  return result;
}

export const initialSeats: Seat[] = generateAudiSeats();
