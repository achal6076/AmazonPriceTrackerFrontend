import api from './client';

export const getCategories = () =>
  api.get('/categories').then((r) => r.data as Category[]);

export const addCategory = (data: { name: string; url?: string; description?: string }) =>
  api.post('/categories', data).then((r) => r.data as Category);

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`);

export interface Category {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
  created_at: string;
}
