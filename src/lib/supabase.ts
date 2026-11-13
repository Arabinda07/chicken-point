import {createClient} from '@supabase/supabase-js';

export type CutStyle = 'curry' | 'biryani' | 'fry';
export type BookingStatus = 'pending' | 'ready' | 'completed' | 'cancelled';

export type Product = {
  id: string;
  name: string;
  name_bengali: string;
  price_per_kg: number;
  is_available: boolean;
  display_order: number;
  updated_at?: string;
};

export type BookingInsert = {
  order_code: string;
  customer_name: string;
  phone: string;
  product_id: string;
  product_name: string;
  weight_kg: number;
  cut_style: CutStyle;
  pickup_time: string;
  request_invoice: boolean;
  status: BookingStatus;
};

export type Booking = BookingInsert & {
  id: string;
  order_date: string;
  created_at: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = createClient(
  supabaseUrl ?? 'https://example.supabase.co',
  supabaseKey ?? 'missing-publishable-key',
);

export type PhonePeUpiPayment = {
  id: string;
  provider_reference_id: string; // Bank UTR / UPI Ref (Unique)
  merchant_transaction_id: string;
  phonepe_transaction_id?: string | null;
  amount_paise: number;
  amount_rupees: number;
  payment_mode: 'UPI' | 'PHONEPE_QR' | 'STANDEE_CSV';
  status: 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payer_vpa?: string | null;
  payer_name?: string | null;
  payer_phone?: string | null;
  notes?: string | null;
  settlement_id?: string | null;
  paid_at: string;
};

// Aliased for backwards compatibility where needed
export type ShopPayment = PhonePeUpiPayment;

export type BestCustomer = {
  customer_identifier: string; // VPA or Phone
  customer_name?: string | null;
  total_visits: number;
  total_lifetime_spend: number;
  average_order_value: number;
  first_visit_date: string;
  last_visit_date: string;
  days_since_last_visit: number;
  loyalty_tier: '👑 VIP Regular' | '⭐ Frequent' | '🌱 Occasional';
  favorite_cuts?: string[];
  recent_payments?: PhonePeUpiPayment[];
};

export type Settlement = {
  id: string;
  settlement_id: string;
  settlement_date: string;
  gross_amount: number;
  fee_amount: number;
  tax_amount: number;
  net_settled_amount: number;
  bank_utr?: string | null;
  status: 'SETTLED' | 'PROCESSING' | 'FAILED';
  created_at: string;
};

export type WeeklyRecapMetrics = {
  total_revenue: number;
  total_orders: number;
  weekly_aov: number;
  sunday_revenue: number;
  sunday_orders: number;
  unique_customers: number;
  repeat_customer_rate: number;
};

// Realistic seed data of regular weekly shop customers from PhonePe Statement
export const fallbackShopPayments: PhonePeUpiPayment[] = [
  // Subrata Da (Local Roll Counter Owner - Bulk Party Buyer)
  {
    id: 'pay-001',
    provider_reference_id: '424519881023',
    merchant_transaction_id: 'BKP_TXN_0905_03',
    phonepe_transaction_id: 'T260905091533',
    amount_paise: 147000,
    amount_rupees: 1470.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'subrata.rolls@oksbi',
    payer_name: 'Subrata Da (Roll Corner)',
    notes: '7kg Curry Cut (Weekend Bulk)',
    paid_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-002',
    provider_reference_id: '424519395211',
    merchant_transaction_id: 'BKP_TXN_0903_02',
    phonepe_transaction_id: 'T260903084522',
    amount_paise: 105000,
    amount_rupees: 1050.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'subrata.rolls@oksbi',
    payer_name: 'Subrata Da (Roll Corner)',
    notes: '5kg Curry Cut (Bulk)',
    paid_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-003',
    provider_reference_id: '424519284102',
    merchant_transaction_id: 'BKP_TXN_0901_01',
    phonepe_transaction_id: 'T260901083011',
    amount_paise: 126000,
    amount_rupees: 1260.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'subrata.rolls@oksbi',
    payer_name: 'Subrata Da (Roll Corner)',
    notes: '6kg Curry Cut (Morning Bulk)',
    paid_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },

  // Dr. S. Banerjee (VIP Regular - Premium Boneless & Leg)
  {
    id: 'pay-004',
    provider_reference_id: '424520334925',
    merchant_transaction_id: 'BKP_TXN_0905_06',
    phonepe_transaction_id: 'T260905100520',
    amount_paise: 72000,
    amount_rupees: 720.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'dr.sbanerjee@hdfcbank',
    payer_name: 'Dr. S. Banerjee',
    notes: '2kg Boneless Breast',
    paid_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-005',
    provider_reference_id: '424520223914',
    merchant_transaction_id: 'BKP_TXN_0901_05',
    phonepe_transaction_id: 'T260901101509',
    amount_paise: 56000,
    amount_rupees: 560.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'dr.sbanerjee@hdfcbank',
    payer_name: 'Dr. S. Banerjee',
    notes: '2kg Leg Pieces (Sunday prep)',
    paid_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-006',
    provider_reference_id: '424520112903',
    merchant_transaction_id: 'BKP_TXN_0828_04',
    phonepe_transaction_id: 'T260828094511',
    amount_paise: 72000,
    amount_rupees: 720.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'dr.sbanerjee@hdfcbank',
    payer_name: 'Dr. S. Banerjee',
    notes: '2kg Boneless Breast',
    paid_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },

  // Sourav Mondal (Weekly Sunday Family Regular)
  {
    id: 'pay-007',
    provider_reference_id: '424410395823',
    merchant_transaction_id: 'BKP_TXN_0905_09',
    phonepe_transaction_id: 'T260905103045',
    amount_paise: 33000,
    amount_rupees: 330.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'sourav.m@oksbi',
    payer_name: 'Sourav Mondal',
    notes: '1.5kg Curry Cut',
    paid_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-008',
    provider_reference_id: '424410294812',
    merchant_transaction_id: 'BKP_TXN_0901_08',
    phonepe_transaction_id: 'T260901093015',
    amount_paise: 33000,
    amount_rupees: 330.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'sourav.m@oksbi',
    payer_name: 'Sourav Mondal',
    notes: '1.5kg Curry Cut',
    paid_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pay-009',
    provider_reference_id: '424410129481',
    merchant_transaction_id: 'BKP_TXN_0825_07',
    phonepe_transaction_id: 'T260825091512',
    amount_paise: 33000,
    amount_rupees: 330.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'sourav.m@oksbi',
    payer_name: 'Sourav Mondal',
    notes: '1.5kg Curry Cut',
    paid_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
  },

  // Anita Dey (Regular Family Home Cook)
  {
    id: 'pay-010',
    provider_reference_id: '424319586721',
    merchant_transaction_id: 'BKP_TXN_0905_11',
    phonepe_transaction_id: 'T260905111530',
    amount_paise: 42000,
    amount_rupees: 420.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'anita.dey@ybl',
    payer_name: 'Anita Dey',
    notes: '2kg Whole Chicken cut',
    paid_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'pay-011',
    provider_reference_id: '424319485710',
    merchant_transaction_id: 'BKP_TXN_0830_10',
    phonepe_transaction_id: 'T260830112001',
    amount_paise: 54000,
    amount_rupees: 540.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'anita.dey@ybl',
    payer_name: 'Anita Dey',
    notes: '1.5kg Boneless Breast',
    paid_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },

  // Rahul Sen (Regular Meal Prep)
  {
    id: 'pay-012',
    provider_reference_id: '424219485822',
    merchant_transaction_id: 'BKP_TXN_0905_13',
    phonepe_transaction_id: 'T260905121015',
    amount_paise: 28000,
    amount_rupees: 280.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'rahul98@paytm',
    payer_name: 'Rahul Sen',
    notes: '1kg Leg Pieces',
    paid_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'pay-013',
    provider_reference_id: '424219384711',
    merchant_transaction_id: 'BKP_TXN_0902_12',
    phonepe_transaction_id: 'T260902120045',
    amount_paise: 28000,
    amount_rupees: 280.00,
    payment_mode: 'UPI',
    status: 'COMPLETED',
    payer_vpa: 'rahul98@paytm',
    payer_name: 'Rahul Sen',
    notes: '1kg Leg Pieces',
    paid_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
];

export const fallbackSettlements: Settlement[] = [
  {
    id: 'settl-001',
    settlement_id: 'SETTL_BKP_20260904',
    settlement_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10),
    gross_amount: 3780.00,
    fee_amount: 0.00,
    tax_amount: 0.00,
    net_settled_amount: 3780.00,
    bank_utr: 'YESB00000019284102',
    status: 'SETTLED',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'settl-002',
    settlement_id: 'SETTL_BKP_20260901',
    settlement_date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    gross_amount: 8420.00,
    fee_amount: 0.00,
    tax_amount: 0.00,
    net_settled_amount: 8420.00,
    bank_utr: 'YESB00000019172401',
    status: 'SETTLED',
    created_at: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
  },
];


