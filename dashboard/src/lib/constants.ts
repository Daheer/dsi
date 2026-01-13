import type { UserRole } from '@/types';

export const APP_NAME = 'De Signature International';
export const APP_DESCRIPTION = 'Hotel Management Platform';

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  receptionist: 'Receptionist',
  housekeeping: 'Housekeeping',
  kitchen: 'Kitchen Staff',
  auditor: 'Auditor',
};

// Room status colors
export const ROOM_STATUS_COLORS = {
  available: 'bg-emerald-500',
  occupied: 'bg-rose-500',
  cleaning: 'bg-amber-500',
  maintenance: 'bg-orange-500',
} as const;

export const ROOM_STATUS_LABELS = {
  available: 'Available',
  occupied: 'Occupied',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance',
} as const;

// Booking status colors (outline style like rooms page)
export const BOOKING_STATUS_COLORS = {
  reserved: 'text-blue-400',
  confirmed: 'text-green-400',
  checked_in: 'text-emerald-400',
  checked_out: 'text-slate-400',
  cancelled: 'text-rose-400',
  expired: 'text-orange-400',
} as const;

export const BOOKING_STATUS_LABELS = {
  reserved: 'Reserved',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
  expired: 'Expired',
} as const;

// Payment method labels
export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Bank Transfer',
  mobile: 'Mobile Payment',
} as const;

// Task status colors
export const TASK_STATUS_COLORS = {
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-emerald-500',
} as const;

export const TASK_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
} as const;

// Meal order status
export const MEAL_STATUS_COLORS = {
  ordered: 'bg-blue-500',
  preparing: 'bg-amber-500',
  ready: 'bg-emerald-500',
  delivered: 'bg-slate-500',
} as const;

export const MEAL_STATUS_LABELS = {
  ordered: 'Ordered',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
} as const;

// Navigation items per role
export const NAVIGATION_BY_ROLE: Record<UserRole, Array<{
  title: string;
  href: string;
  icon: string;
}>> = {
  admin: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Staff', href: '/dashboard/staff', icon: 'Users' },
    { title: 'Rooms', href: '/dashboard/rooms', icon: 'Building' },
    { title: 'Guests', href: '/dashboard/guests', icon: 'UserCircle' },
    { title: 'Bookings', href: '/dashboard/bookings', icon: 'Calendar' },
    { title: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
    { title: 'Reports', href: '/dashboard/reports', icon: 'BarChart' },
    { title: 'Audit Logs', href: '/dashboard/audit', icon: 'FileText' },
  ],
  manager: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Rooms', href: '/dashboard/rooms', icon: 'Building' },
    { title: 'Bookings', href: '/dashboard/bookings', icon: 'Calendar' },
    { title: 'Staff Activity', href: '/dashboard/staff', icon: 'Users' },
    { title: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
    { title: 'Reports', href: '/dashboard/reports', icon: 'BarChart' },
  ],
  receptionist: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Bookings', href: '/dashboard/bookings', icon: 'Calendar' },
    { title: 'Guests', href: '/dashboard/guests', icon: 'UserCircle' },
    { title: 'Rooms', href: '/dashboard/rooms', icon: 'Building' },
    { title: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
  ],
  housekeeping: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'My Tasks', href: '/dashboard/housekeeping', icon: 'ClipboardList' },
  ],
  kitchen: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Orders', href: '/dashboard/kitchen', icon: 'UtensilsCrossed' },
  ],
  auditor: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Audit Logs', href: '/dashboard/audit', icon: 'FileText' },
    { title: 'Reports', href: '/dashboard/reports', icon: 'BarChart' },
  ],
};
