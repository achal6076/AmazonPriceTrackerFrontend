import api from './client';

export interface DashboardStats {
  total_users: number;
  total_products: number;
  active_tracked_products: number;
  alerts_sent_this_week: number;
  new_users_this_week: number;
}

export const getDashboardStats = () =>
  api.get('/admin/dashboard/stats').then((r) => r.data as DashboardStats);

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  whatsapp_number: string | null;
  created_at: string;
  active_trackings: number;
}

export interface PaginatedUsers {
  data: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const getUsers = (params: { page?: number; limit?: number; search?: string }) =>
  api.get('/admin/users', { params }).then((r) => r.data as PaginatedUsers);

export const updateUserRole = (id: string, role: 'user' | 'admin') =>
  api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data as AdminUser);
