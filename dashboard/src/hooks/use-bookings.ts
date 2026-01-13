import { useQuery } from '@tanstack/react-query';
import { bookingsApi, type BookingsListParams } from '@/lib/api';

export interface UseBookingsParams {
  page?: number;
  pageSize?: number;
  sorting?: {
    field: string;
    order: 'asc' | 'desc';
  };
  filters?: {
    search?: string;
    status?: string;
    payment_status?: string;
  };
}

export function useBookings(params: UseBookingsParams = {}) {
  const {
    page = 1,
    pageSize = 10,
    sorting = { field: 'created_at', order: 'desc' },
    filters = {},
  } = params;

  const skip = (page - 1) * pageSize;

  const queryParams: BookingsListParams = {
    skip,
    limit: pageSize,
    sort_by: sorting.field,
    order: sorting.order,
    ...(filters.search && { search: filters.search }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status as any }),
    ...(filters.payment_status && filters.payment_status !== 'all' && { payment_status: filters.payment_status as any }),
  };

  return useQuery({
    queryKey: ['bookings', page, pageSize, sorting, filters],
    queryFn: () => bookingsApi.list(queryParams),
    staleTime: 30000, // 30 seconds
  });
}
