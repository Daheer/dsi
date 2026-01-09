import api from './client';
import type {
  User,
  UserCreate,
  UserUpdate,
  Room,
  RoomCreate,
  RoomUpdate,
  RoomType,
  RoomTypeCreate,
  Guest,
  GuestCreate,
  GuestUpdate,
  Booking,
  BookingCreate,
  BookingUpdate,
  Payment,
  PaymentCreate,
  RefundRequest,
  HousekeepingTask,
  HousekeepingTaskCreate,
  HousekeepingTaskUpdate,
  MealOrder,
  MealOrderCreate,
  MealOrderUpdate,
  AuditLog,
  Notification as AppNotification,
  NotificationCreate,
  TokenResponse,
  LoginRequest,
} from '@/types';

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  loginForm: async (username: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  refreshToken: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken }),
};

// Users API
export const usersApi = {
  me: () => api.get<User>('/users/me'),

  list: () => api.get<User[]>('/users'),

  get: (id: string) => api.get<User>(`/users/${id}`),

  create: (user: UserCreate) => api.post<User>('/users', user),

  update: (id: string, user: UserUpdate) =>
    api.put<User>(`/users/${id}`, user),

  delete: (id: string) => api.delete<void>(`/users/${id}`),
};

// Rooms API
export const roomsApi = {
  list: () => api.get<Room[]>('/rooms'),

  get: (id: string) => api.get<Room>(`/rooms/${id}`),

  create: (room: RoomCreate) => api.post<Room>('/rooms', room),

  update: (id: string, room: RoomUpdate) =>
    api.put<Room>(`/rooms/${id}`, room),

  delete: (id: string) => api.delete<void>(`/rooms/${id}`),

  // Room types
  listTypes: () => api.get<RoomType[]>('/rooms/types'),

  getType: (id: string) => api.get<RoomType>(`/rooms/types/${id}`),

  createType: (roomType: RoomTypeCreate) =>
    api.post<RoomType>('/rooms/types', roomType),

  updateType: (id: string, roomType: Partial<RoomTypeCreate>) =>
    api.put<RoomType>(`/rooms/types/${id}`, roomType),

  deleteType: (id: string) => api.delete<void>(`/rooms/types/${id}`),
};

// Guests API
export const guestsApi = {
  list: (params?: { search?: string }) => api.get<Guest[]>('/guests', { params }),

  get: (id: string) => api.get<Guest>(`/guests/${id}`),

  create: (guest: GuestCreate) => api.post<Guest>('/guests', guest),

  update: (id: string, guest: GuestUpdate) =>
    api.put<Guest>(`/guests/${id}`, guest),

  delete: (id: string) => api.delete<void>(`/guests/${id}`),
};

// Bookings API
export const bookingsApi = {
  list: (params?: { guest_id?: string; room_id?: string; status?: string }) =>
    api.get<Booking[]>('/bookings', { params }),

  get: (id: string) => api.get<Booking>(`/bookings/${id}`),

  create: (booking: BookingCreate) => api.post<Booking>('/bookings', booking),

  update: (id: string, booking: BookingUpdate) =>
    api.put<Booking>(`/bookings/${id}`, booking),

  delete: (id: string) => api.delete<void>(`/bookings/${id}`),

  checkIn: (bookingId: string) =>
    api.post<Booking>('/bookings/check-in', { booking_id: bookingId }),

  checkOut: (bookingId: string) =>
    api.post<Booking>('/bookings/check-out', { booking_id: bookingId }),
};

// Payments API
export const paymentsApi = {
  list: (params?: { booking_id?: string }) =>
    api.get<Payment[]>('/payments', { params }),

  get: (id: string) => api.get<Payment>(`/payments/${id}`),

  create: (payment: PaymentCreate) => api.post<Payment>('/payments', payment),

  // Refund requests
  listRefundRequests: () => api.get<RefundRequest[]>('/refund-requests'),
};

// Housekeeping API
export const housekeepingApi = {
  listTasks: (params?: { status?: string }) =>
    api.get<HousekeepingTask[]>('/housekeeping/tasks', { params }),

  getTask: (id: string) => api.get<HousekeepingTask>(`/housekeeping/tasks/${id}`),

  createTask: (task: HousekeepingTaskCreate) =>
    api.post<HousekeepingTask>('/housekeeping/tasks', task),

  updateTask: (id: string, task: HousekeepingTaskUpdate) =>
    api.put<HousekeepingTask>(`/housekeeping/tasks/${id}`, task),

  completeTask: (id: string) =>
    api.patch<HousekeepingTask>(`/housekeeping/tasks/${id}/complete`, {}),
};

// Kitchen/Meals API
export const kitchenApi = {
  listOrders: () => api.get<MealOrder[]>('/meals/orders'),

  createOrder: (order: MealOrderCreate) =>
    api.post<MealOrder>('/meals/orders', order),

  updateOrder: (id: string, order: MealOrderUpdate) =>
    api.put<MealOrder>('/meals/orders/${id}', order),
};

// Reports API
export const reportsApi = {
  generateOccupancy: (params: { from_date: string; to_date: string }) =>
    api.post<{ task_id: string }>('/reports/occupancy', params),

  generateRevenue: (params: { from_date: string; to_date: string }) =>
    api.post<{ task_id: string }>('/reports/revenue', params),

  generateStaffActivity: (params: { from_date: string; to_date: string }) =>
    api.post<{ task_id: string }>('/reports/staff-activity', params),

  getOccupancy: (taskId: string) =>
    api.get<any>(`/reports/occupancy/${taskId}`),

  getRevenue: (taskId: string) =>
    api.get<any>(`/reports/revenue/${taskId}`),

  getStaffActivity: (taskId: string) =>
    api.get<any>(`/reports/staff-activity/${taskId}`),
};

// Audit API
export const auditApi = {
  getLogs: (params?: {
    entity_type?: string;
    entity_id?: string;
    action?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
  }) => api.get<AuditLog[]>('/audit/logs', { params }),
};

// Stats API
export interface GuestsPerDayItem {
  date: string;
  guests: number;
}

export const statsApi = {
  getGuestsPerDay: (days: number = 30) =>
    api.get<GuestsPerDayItem[]>('/stats/guests-per-day', { params: { days } }),
};

// Notifications API
export const notificationsApi = {
  list: (params?: { unread_only?: boolean; skip?: number; limit?: number }) =>
    api.get<AppNotification[]>('/notifications', { params }),

  get: (id: string) => api.get<AppNotification>(`/notifications/${id}`),

  markAsRead: (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`, {}),

  markAllRead: () => api.post<{ message: string }>('/notifications/mark-all-read', {}),

  create: (data: NotificationCreate) => api.post<AppNotification>('/notifications', data),
};
