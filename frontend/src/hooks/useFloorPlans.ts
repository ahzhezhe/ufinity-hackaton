import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FloorPlan } from '@/types';

// Query keys
export const floorPlanKeys = {
  all: ['floorPlans'] as const,
  lists: () => [...floorPlanKeys.all, 'list'] as const,
  details: () => [...floorPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...floorPlanKeys.details(), id] as const,
  active: () => [...floorPlanKeys.all, 'active'] as const,
};

// Fetch all floor plans
export function useFloorPlans() {
  return useQuery({
    queryKey: floorPlanKeys.lists(),
    queryFn: async () => {
      const response = await api.get<FloorPlan[]>('/floor-plans');
      return response.data;
    },
  });
}

// Fetch single floor plan
export function useFloorPlan(id: string) {
  return useQuery({
    queryKey: floorPlanKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<FloorPlan>(`/floor-plans/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Fetch active floor plan
export function useActiveFloorPlan() {
  return useQuery({
    queryKey: floorPlanKeys.active(),
    queryFn: async () => {
      const response = await api.get<FloorPlan>('/floor-plans/active');
      return response.data;
    },
  });
}

// Upload floor plan
export function useUploadFloorPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', name);

      const response = await api.post<FloorPlan>('/floor-plans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: floorPlanKeys.lists() });
    },
  });
}

// Set active floor plan
export function useSetActiveFloorPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<FloorPlan>(`/floor-plans/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: floorPlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: floorPlanKeys.active() });
    },
  });
}

// Delete floor plan
export function useDeleteFloorPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/floor-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: floorPlanKeys.lists() });
    },
  });
}
