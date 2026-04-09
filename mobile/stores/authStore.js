import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  init: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      set({ user: data, isAuthenticated: true, loading: false });
    } catch {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    const me = await api.get('/users/me');
    set({ user: me.data, isAuthenticated: true });
    return me.data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
