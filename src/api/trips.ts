import apiClient from './client';
import { StartTripRequest, TripResponse, LocationUpdateRequest, LocationUpdateResponse } from '@/models/types';

export const tripsApi = {
  start: (data: StartTripRequest) =>
    apiClient.request<TripResponse>('/api/v1/trips/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getActive: () => apiClient.request<TripResponse | null>('/api/v1/trips/active'),

  getHistory: () => apiClient.request<TripResponse[]>('/api/v1/trips/history'),

  get: (id: string) => apiClient.request<TripResponse>(`/api/v1/trips/${id}`),

  updateLocation: (tripId: string, data: LocationUpdateRequest) =>
    apiClient.request<LocationUpdateResponse>(`/api/v1/trips/${tripId}/location`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  complete: (tripId: string) =>
    apiClient.request<TripResponse>(`/api/v1/trips/${tripId}/complete`, { method: 'PUT' }),

  cancel: (tripId: string) =>
    apiClient.request<TripResponse>(`/api/v1/trips/${tripId}/cancel`, { method: 'PUT' }),
};
