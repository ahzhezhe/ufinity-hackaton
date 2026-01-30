import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Seat, CreateSeatData, UpdateSeatData, DateAvailability } from '@/types';

// Query keys
export const seatKeys = {
  all: ['seats'] as const,
  lists: () => [...seatKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...seatKeys.lists(), filters] as const,
  details: () => [...seatKeys.all, 'detail'] as const,
  detail: (id: string) => [...seatKeys.details(), id] as const,
  availability: (date: string) => [...seatKeys.all, 'availability', date] as const,
  availabilityRange: (startDate: string, endDate: string) =>
    [...seatKeys.all, 'availability-range', startDate, endDate] as const,
};

// Fetch all seats
export function useSeats(filters?: { floorPlanId?: string; type?: string }) {
  return useQuery({
    queryKey: seatKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.floorPlanId) params.append('floorPlanId', filters.floorPlanId);
      if (filters?.type) params.append('type', filters.type);

      const response = await api.get<Seat[]>(`/seats?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch single seat
export function useSeat(id: string) {
  return useQuery({
    queryKey: seatKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Seat>(`/seats/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Fetch seat availability for a date
export function useSeatAvailability(date: string) {
  return useQuery({
    queryKey: seatKeys.availability(date),
    queryFn: async () => {
      const response = await api.get<Seat[]>(`/seats/availability?date=${date}`);
      return response.data;
    },
    enabled: !!date,
  });
}

// Fetch seat availability for date range
export function useSeatAvailabilityRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: seatKeys.availabilityRange(startDate, endDate),
    queryFn: async () => {
      const response = await api.get<DateAvailability[]>(
        `/seats/availability/range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
}

// Create seat
export function useCreateSeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSeatData) => {
      const response = await api.post<Seat>('/seats', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seatKeys.lists() });
    },
  });
}

// Update seat
export function useUpdateSeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSeatData }) => {
      const response = await api.patch<Seat>(`/seats/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seatKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seatKeys.detail(id) });
    },
  });
}

// Delete seat
export function useDeleteSeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/seats/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seatKeys.lists() });
    },
  });
}

// Block/Unblock seat
export function useToggleSeatBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }) => {
      const response = await api.patch<Seat>(`/seats/${id}/block`, { isBlocked });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seatKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seatKeys.detail(id) });
    },
  });
}
