import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      set({ user: data, isAuthenticated: true, loading: false });
    } catch {
      localStorage.clear();
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const me = await api.get('/users/me');
    set({ user: me.data, isAuthenticated: true });
    return me.data;
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
