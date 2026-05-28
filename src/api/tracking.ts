import api from './client';

export const getTracking = () => api.get('/tracking').then((r) => r.data);

export const startTracking = (product_id: string, target_price?: number) =>
  api.post('/tracking', { product_id, target_price }).then((r) => r.data);

export const updateTracking = (id: string, data: { target_price?: number | null; is_active?: boolean }) =>
  api.patch(`/tracking/${id}`, data).then((r) => r.data);

export const stopTracking = (id: string) => api.delete(`/tracking/${id}`);

export const getAlerts = () => api.get('/alerts').then((r) => r.data);
