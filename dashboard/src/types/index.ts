// Types matching the FastAPI backend schemas

// Enums
export type UserRole = 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'kitchen' | 'auditor';
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';
export type BookingStatus = 'reserved' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'expired';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type MealOrderStatus = 'ordered' | 'preparing' | 'ready' | 'delivered';
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// User
export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  full_name: string;
  role: UserRole;
  password: string;
}

export interface UserUpdate {
  username?: string;
  full_name?: string;
  password?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Room Types
export interface RoomType {
  id: string;
  name: string;
  base_price: number;
  max_occupancy: number;
  amenities?: string[];
  images?: string[];
}

export interface RoomTypeCreate {
  name: string;
  base_price: number;
  max_occupancy: number;
  amenities?: string[];
  images?: string[];
}

// Room
export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  status: RoomStatus;
  room_type?: RoomType;
}

export interface RoomCreate {
  room_number: string;
  room_type_id: string;
  status?: RoomStatus;
}

export interface RoomUpdate {
  room_number?: string;
  room_type_id?: string;
  status?: RoomStatus;
}

// Guest
export interface Guest {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  id_type?: string;
  id_number?: string;
  address?: string;
}

export interface GuestCreate {
  full_name: string;
  email?: string;
  phone?: string;
  id_type?: string;
  id_number?: string;
  address?: string;
}

export interface GuestUpdate {
  full_name?: string;
  email?: string;
  phone?: string;
  id_type?: string;
  id_number?: string;
  address?: string;
}

// Booking
export interface Booking {
  id: string;
  guest_id: string;
  room_type_id: string;  // Room type category (always present)
  room_id?: string;  // Specific room (optional - assigned at check-in)
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  status: BookingStatus;
  created_by: string;
  created_at: string;
  notes?: string;
  guest?: Guest;
  room_type?: RoomType;
  room?: Room;
}

export interface BookingCreate {
  guest_id?: string;
  guest_details?: GuestCreate;
  room_type_id: string;  // Room type category (required)
  room_id?: string;  // Optional specific room (for internal staff bookings)
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  notes?: string;
}

export interface BookingUpdate {
  guest_id?: string;
  room_type_id?: string;
  room_id?: string;
  check_in_date?: string;
  check_out_date?: string;
  total_amount?: number;
  status?: BookingStatus;
  notes?: string;
}

export interface BookingCheckIn {
  booking_id: string;
  room_id: string;  // Mandatory - specific room being assigned (soft allocation)
  guest_id_type?: string;  // To fill gaps in guest profile
  guest_id_number?: string;  // To fill gaps in guest profile
  key_card_id?: string;  // The ID of the key/card given
}

// Payment
export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  processed_by?: string;  // Optional for webhook/automated payments
  processed_at: string;
  receipt_number?: string;
  notes?: string;
}

export interface PaymentCreate {
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface RefundRequest {
  payment_id: string;
  amount: number;
  reason?: string;
}

// Housekeeping
export interface HousekeepingTask {
  id: string;
  room_id: string;
  assigned_to?: string;
  status: TaskStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  room?: Room;
  assigned_user?: User;
}

export interface HousekeepingTaskCreate {
  room_id: string;
  assigned_to?: string;
  notes?: string;
}

export interface HousekeepingTaskUpdate {
  assigned_to?: string;
  status?: TaskStatus;
  notes?: string;
}

// Kitchen
export interface MealOrder {
  id: string;
  booking_id: string;
  meal_type: string;
  status: MealOrderStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  booking?: Booking;
}

export interface MealOrderCreate {
  booking_id: string;
  meal_type: string;
  notes?: string;
}

export interface MealOrderUpdate {
  meal_type?: string;
  status?: MealOrderStatus;
  notes?: string;
}

// Audit
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: string;
  created_at: string;
  user?: User;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  todays_checkins: number;
  todays_checkouts: number;
  pending_housekeeping: number;
  pending_kitchen_orders: number;
  total_revenue_today: number;
  occupancy_rate: number;
}

// Notification
export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  entity_type?: string;  // e.g., 'booking', 'guest', 'payment'
  entity_id?: string;    // ID of the related entity
  created_at: string;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type?: NotificationType;
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
}

export interface NotificationUpdate {
  is_read?: boolean;
}
