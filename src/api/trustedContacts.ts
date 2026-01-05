import apiClient from './client';
import { TrustedContactRequest, TrustedContactResponse } from '@/models/types';

export const trustedContactsApi = {
  list: () => apiClient.request<TrustedContactResponse[]>('/api/v1/trusted-contacts'),

  get: (id: string) => apiClient.request<TrustedContactResponse>(`/api/v1/trusted-contacts/${id}`),

  create: (data: TrustedContactRequest) =>
    apiClient.request<TrustedContactResponse>('/api/v1/trusted-contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: TrustedContactRequest) =>
    apiClient.request<TrustedContactResponse>(`/api/v1/trusted-contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient.request<void>(`/api/v1/trusted-contacts/${id}`, { method: 'DELETE' }),
};
