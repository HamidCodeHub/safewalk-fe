import apiClient from './client';
import { SavedLocationRequest, SavedLocationResponse } from '@/models/types';

export const savedLocationsApi = {
  list: () => apiClient.request<SavedLocationResponse[]>('/api/v1/saved-locations'),

  get: (id: string) => apiClient.request<SavedLocationResponse>(`/api/v1/saved-locations/${id}`),

  create: (data: SavedLocationRequest) =>
    apiClient.request<SavedLocationResponse>('/api/v1/saved-locations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: SavedLocationRequest) =>
    apiClient.request<SavedLocationResponse>(`/api/v1/saved-locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient.request<void>(`/api/v1/saved-locations/${id}`, { method: 'DELETE' }),
};
