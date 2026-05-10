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
