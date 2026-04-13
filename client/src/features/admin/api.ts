import api from '@/services/api';
import type {
  AdminOverview,
  AdminRole,
  AdminUser,
  AdminUserStatus,
  AdminUsersResponse,
  CreateAdminUserPayload,
} from './types';

export async function fetchAdminOverview() {
  const response = await api.get<AdminOverview>('/admin/overview');
  return response.data;
}

export async function fetchAdminUsers(params: {
  search?: string;
  role?: AdminRole | 'all';
  status?: AdminUserStatus | 'all';
}) {
  const response = await api.get<AdminUsersResponse>('/admin/users', { params });
  return response.data;
}

export async function createAdminUser(payload: CreateAdminUserPayload) {
  const response = await api.post<{ status: string; user: AdminUser }>('/admin/users', payload);
  return response.data.user;
}

export async function updateAdminUserStatus(userId: string, status: AdminUserStatus) {
  const response = await api.patch<{ status: string; user: AdminUser }>(`/admin/users/${userId}/status`, { status });
  return response.data.user;
}

export async function updateAdminUserRole(userId: string, role: AdminRole) {
  const response = await api.patch<{ status: string; user: AdminUser }>(`/admin/users/${userId}/role`, { role });
  return response.data.user;
}
