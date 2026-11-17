export type UserRole = 'admin' | 'business_owner' | 'customer';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface DaySchedule {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_name: string;
  is_open: boolean;
  open_time: string; // '09:00'
  close_time: string; // '18:00'
  break_start?: string; // '13:00'
  break_end?: string; // '14:00'
}

export interface SpecialDate {
  id: string;
  date: string; // 'YYYY-MM-DD'
  is_closed: boolean;
  reason: string;
  open_time?: string;
  close_time?: string;
}

export interface AvailabilitySettings {
  slot_duration_minutes: number;
  buffer_time_minutes: number;
  advance_booking_days: number;
  weekly_schedule: DaySchedule[];
  special_dates: SpecialDate[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  booking_reference: string;
  business_id: string;
  service_id: string;
  service: Service;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string; // 'YYYY-MM-DD'
  start_time: string; // '10:00'
  end_time: string; // '10:45'
  status: BookingStatus;
  total_price: number;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  booking_id: string;
  customer_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
  reply?: string;
}

export interface AnalyticsSummary {
  total_revenue: number;
  revenue_change_percent: number;
  total_bookings: number;
  bookings_change_percent: number;
  pending_bookings: number;
  completion_rate: number;
  average_rating: number;
  top_services: {
    id: string;
    name: string;
    bookings_count: number;
    revenue: number;
  }[];
  daily_revenue: {
    date: string;
    day_label: string;
    amount: number;
    bookings: number;
  }[];
  status_distribution: {
    status: BookingStatus;
    count: number;
  }[];
}
