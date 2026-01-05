import apiClient from './client';
import { UserResponse, UpdateUserRequest } from '@/models/types';

export const usersApi = {
  getMe: () => apiClient.request<UserResponse>('/api/v1/users/me'),

  updateMe: (data: UpdateUserRequest) => {
    const params = new URLSearchParams();
    if (data.name) params.append('name', data.name);
    if (data.phoneNumber) params.append('phoneNumber', data.phoneNumber);
    return apiClient.request<UserResponse>(`/api/v1/users/me?${params.toString()}`, { method: 'PUT' });
  },

  deleteMe: () => apiClient.request<void>('/api/v1/users/me', { method: 'DELETE' }),
};
