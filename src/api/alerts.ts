import apiClient from './client';
import { AlertResponse, RespondToAlertRequest } from '@/models/types';

export const alertsApi = {
  listForTrip: (tripId: string) =>
    apiClient.request<AlertResponse[]>(`/api/v1/alerts/trip/${tripId}`),

  respond: (alertId: string, data: RespondToAlertRequest) =>
    apiClient.request<AlertResponse>(`/api/v1/alerts/${alertId}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
