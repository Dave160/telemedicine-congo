import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Priorité : variable d'env → fallback local
// Pour Expo Go sur vrai téléphone : créer mobile/.env avec EXPO_PUBLIC_API_URL=http://IP_DE_VOTRE_PC:3000
// Pour émulateur Android : http://10.0.2.2:3000
// Pour émulateur iOS     : http://localhost:3000
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

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
