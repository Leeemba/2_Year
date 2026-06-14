import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types/auth';
import { authApi } from '@/api/auth';
import { api } from '@/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null); // Только в памяти
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  // Проверка токена на сервере
  const checkToken = async (): Promise<boolean> => {
    if (!token.value) return false;

    try {
      await api.get('/users/verify');
      return true;
    } catch {
      return false;
    }
  };

  // Восстановление сессии с сервера
  const restoreSession = async (): Promise<boolean> => {
    isLoading.value = true;
    try {
      const response = await api.get('/users/session');
      if (response.data.authenticated) {
        token.value = response.data.token;
        user.value = response.data.user;
        return true;
      } else {
        forceLogout();
        return false;
      }
    } catch (error) {
      forceLogout();
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
  };

  const forceLogout = () => {
    token.value = null;
    user.value = null;
    // Пытаемся удалить cookie на клиенте (для не-HTTP-only)
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ login: username, pswd: password });
    // Токен будет в cookie, но сохраняем в память для быстрого доступа
    setAuth(response.token, response.user);
    return response;
  };

  const register = async (username: string, password: string) => {
    const response = await authApi.register({ login: username, pswd: password });
    setAuth(response.token, response.user);
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      forceLogout();
    }
  };

  // Инициализация при запуске приложения
  const init = async (): Promise<boolean> => {
    if (isInitialized.value) return isAuthenticated.value;

    try {
      return await restoreSession();
    } catch (error) {
      console.error('Auth init failed:', error);
      return false;
    } finally {
      isInitialized.value = true;
    }
  };

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    init,
    login,
    register,
    logout,
    clearAuth,
    checkToken,
    restoreSession,
    forceLogout
  };
});
