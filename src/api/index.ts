import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.ts'

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно: отправляем cookies с запросами
});

// Интерцептор для добавления токена из памяти
api.interceptors.request.use(
  (config) => {
    // Токен будет браться из памяти через authStore
    // В заголовке он нужен только если не используется cookie
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Принудительный logout при 401
      const authStore = useAuthStore();

      // Очищаем локальное состояние
      authStore.clearAuth();

      // Пытаемся удалить cookie на клиенте (не HTTP-only)
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Перенаправляем на логин
      const router = useRouter();
      router.push('/login');

      // Прерываем цепочку промисов
      return Promise.reject(new Error('Session expired'));
    }
    return Promise.reject(error);
  }
);
