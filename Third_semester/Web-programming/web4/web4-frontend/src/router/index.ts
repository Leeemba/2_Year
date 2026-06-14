import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import MainView from '@/views/MainView.vue';
import StatsView from '@/views/StatsView.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/main'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/main',
    name: 'Main',
    component: MainView,
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: StatsView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Глобальные навигационные хуки
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    try {
      await authStore.init();
    } catch (error) {
      console.error('Auth initialization failed:', error);
    }
  }

  // Если маршрут требует аутентификации
  if (to.meta.requiresAuth) {
    // Если нет токена в памяти, пробуем восстановить сессию
    if (!authStore.isAuthenticated) {
      const restored = await authStore.restoreSession();
      if (!restored) {
        next('/login');
        return;
      }
    }

    // Проверяем валидность токена
    const isValid = await authStore.checkToken();
    if (!isValid) {
      // Принудительный выход
      authStore.forceLogout();
      next('/login');
      return;
    }

    next();
    return;
  }

  // Если маршрут требует гостя (неаутентифицированного)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      const isValid = await authStore.checkToken();
      if (isValid) {
        next('/main');
        return;
      }
      // Если токен невалиден, очищаем и разрешаем доступ
      authStore.forceLogout();
    }
    next();
    return;
  }

  next();
});

export default router;
