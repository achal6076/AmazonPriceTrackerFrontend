import api from './client';

export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password }).then((r) => r.data);

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const logout = () => api.post('/auth/logout');

export const getProfile = () => api.get('/auth/me').then((r) => r.data);

export const updateProfile = (data: {
  name?: string;
  current_password?: string;
  new_password?: string;
}) => api.patch('/auth/me', data).then((r) => r.data);
