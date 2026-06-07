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
