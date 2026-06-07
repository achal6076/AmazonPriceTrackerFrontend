import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string; role?: 'user' | 'admin' } | null;
  isAuthenticated: boolean;
  setAuth: (user: { id: string; email: string; role?: 'user' | 'admin' }, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }
  })(),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));
