import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Booking, CreateBookingData, BulkBookingData, BookingFilter } from '@/types';
import { seatKeys } from './useSeats';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters?: BookingFilter) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  myBookings: () => [...bookingKeys.all, 'my'] as const,
};

// Fetch all bookings (admin)
export function useBookings(filters?: BookingFilter) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.seatId) params.append('seatId', filters.seatId);

      const response = await api.get<Booking[]>(`/bookings?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch my bookings
export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.myBookings(),
    queryFn: async () => {
      const response = await api.get<Booking[]>('/bookings/my');
      return response.data;
    },
  });
}

// Fetch single booking
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Booking>(`/bookings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const response = await api.post<Booking>('/bookings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings() });
      // Also invalidate seat availability since it changed
      queryClient.invalidateQueries({ queryKey: seatKeys.all });
    },
  });
}

// Bulk create bookings
export function useBulkCreateBookings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkBookingData) => {
      const response = await api.post<{ created: Booking[]; failed: Array<{ seatId: string; date: string; slot: string; reason: string }> }>(
        '/bookings/bulk',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings() });
      queryClient.invalidateQueries({ queryKey: seatKeys.all });
    },
  });
}

// Cancel booking
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings() });
      queryClient.invalidateQueries({ queryKey: seatKeys.all });
    },
  });
}
