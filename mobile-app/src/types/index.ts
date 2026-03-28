export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'customer' | 'worker' | 'both';
  mode: 'customer' | 'worker';
  avatar?: string;
  is_verified: boolean;
  created_at: string;
}

export interface WorkerService {
  service_type: string;
  label: string;
}

export interface WorkerPricing {
  hourly?: number;
  daily?: number;
  monthly?: number;
}

export interface Worker {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  bio?: string;
  services: string[];
  pricing: WorkerPricing;
  experience_years?: number;
  languages?: string[];
  is_available: boolean;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  location?: string;
  distance?: number;
  is_favorite?: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'ongoing'
  | 'completed'
  | 'payment_pending';

export type DurationType = 'hourly' | 'daily' | 'monthly';

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  service_type: string;
  duration_type: DurationType;
  start_time: string;
  end_time?: string;
  address: string;
  status: BookingStatus;
  amount: number;
  coupon_code?: string;
  discount?: number;
  final_amount?: number;
  payment_status?: string;
  otp?: string;
  worker?: Worker;
  customer?: User;
  review?: Review;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name?: string;
  text: string;
  created_at: string;
  is_read: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percent?: number;
  discount_amount?: number;
  code?: string;
  image?: string;
  valid_until?: string;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const SERVICE_TYPES = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'eldercare', label: 'Eldercare' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'driving', label: 'Driving' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

export const DURATION_TYPES: { value: DurationType; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
];
