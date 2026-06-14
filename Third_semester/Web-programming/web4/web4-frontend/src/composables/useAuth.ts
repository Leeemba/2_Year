import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const authStore = useAuthStore();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const token = computed(() => authStore.token);

  return {
    isAuthenticated,
    user,
    token,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout
  };
}
