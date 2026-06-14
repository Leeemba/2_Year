import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

export function useAuthCheck() {
  const authStore = useAuthStore();
  let checkInterval: number | undefined;

  const startChecking = () => {
    if (!authStore.isInitialized || !authStore.isAuthenticated) return;

    // Проверяем каждые 5 минут
    checkInterval = window.setInterval(async () => {
      if (authStore.isAuthenticated) {
        const isValid = await authStore.checkToken();
        if (!isValid) {
          await authStore.restoreSession(); // Пробуем восстановить
          if (!authStore.isAuthenticated) {
            // Автоматический логаут только если не удалось восстановить
            authStore.clearAuth();
          }
        }
      }
    }, 5 * 60 * 1000); // 5 минут
  };

  const stopChecking = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  };

  onMounted(() => {
    setTimeout(startChecking, 1000);
  });

  onUnmounted(() => {
    stopChecking();
  });

  return { startChecking, stopChecking };
}
