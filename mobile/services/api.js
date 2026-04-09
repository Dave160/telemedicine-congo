import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// En développement Expo, utiliser l'IP de la machine hôte
// En production, remplacer par l'URL réelle de l'API
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'; // 10.0.2.2 = localhost pour émulateur Android

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    }
    return Promise.reject(error);
  }
);

export default api;
