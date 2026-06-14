<template>
  <div id="app">
    <AppLoading :visible="authStore.isLoading && !authStore.isInitialized" />
    <AppHeader v-if="isAuthenticated && !authStore.isLoading" />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter v-if="isAuthenticated && !authStore.isLoading" />
  </div>
</template>

<script setup lang="ts">
import { computed} from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAuthCheck } from '@/composables/useAuthCheck';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import AppLoading from '@/components/layout/AppLoading.vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Запускаем периодическую проверку аутентификации
useAuthCheck();

</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
