<template>
  <div class="server-clock" :class="{ 'auth-page': isAuthPage }">
    <span class="time">{{ formattedTime }}</span>
    <span class="countdown">({{ formattedCountdown }})</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api';

// Константы
const SYNC_INTERVAL_SECONDS = 7;
const COUNTDOWN_UPDATE_MS = 1000;

// Состояние
const serverTimeOffset = ref(0);
const displayedTime = ref<Date>(new Date());
const countdown = ref(SYNC_INTERVAL_SECONDS);
const intervalId = ref<number | null>(null);
const lastSyncTime = ref<number | null>(null);
const syncInProgress = ref(false);

// Получаем текущий маршрут
const route = useRoute();
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

// Форматирование времени
const formatTime = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const formattedTime = computed(() => formatTime(displayedTime.value));
const formattedCountdown = computed(() => String(countdown.value).padStart(2, '0'));

// Синхронизация с сервером
const syncWithServer = async (): Promise<boolean> => {
  if (syncInProgress.value) return false;

  syncInProgress.value = true;
  try {
    const response = await api.get('/time/server');
    const serverTimeText = response.data;

    // Парсим строку времени (формат: 2024-01-01T12:30:45)
    const serverTimeMatch = serverTimeText.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

    if (!serverTimeMatch) {
      throw new Error('Invalid time format');
    }

    const serverTime = new Date(serverTimeMatch[0].replace('T', ' '));
    const clientTime = new Date();

    serverTimeOffset.value = serverTime.getTime() - clientTime.getTime();
    displayedTime.value = new Date(clientTime.getTime() + serverTimeOffset.value);
    lastSyncTime.value = Date.now();

    return true;
  } catch (error) {
    console.debug('Time sync failed:', error);
    serverTimeOffset.value = 0;
    displayedTime.value = new Date();
    lastSyncTime.value = Date.now();
    return false;
  } finally {
    syncInProgress.value = false;
  }
};

// Обновление времени (вызывается каждую секунду)
const updateTime = () => {
  // Уменьшаем счетчик
  countdown.value -= 1;

  // Обновляем отображаемое время
  // displayedTime.value = new Date(Date.now() + serverTimeOffset.value);

  // Если счетчик достиг 0, синхронизируем
  if (countdown.value <= 0) {
    syncWithServer().then(() => {
      countdown.value = SYNC_INTERVAL_SECONDS;
    });
  }
};

// Инициализация часов
const initializeClock = () => {
  // Первая синхронизация
  syncWithServer().then(() => {
    countdown.value = SYNC_INTERVAL_SECONDS;
  });

  // Запускаем интервал обновления
  intervalId.value = window.setInterval(updateTime, COUNTDOWN_UPDATE_MS);
};

// Очистка
const cleanupClock = () => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Жизненный цикл
onMounted(() => {
  initializeClock();
});

onUnmounted(() => {
  cleanupClock();
});
</script>

<style scoped>
.server-clock {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  user-select: none;
  transition: all 0.3s ease;
}

.server-clock.auth-page {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.time {
  color: #333;
  font-weight: 500;
}

.countdown {
  color: #2196F3;
  font-weight: 600;
  margin-left: 4px;
}

/* Темная тема */
.dark-theme .server-clock {
  background: rgba(30, 30, 30, 0.95);
  color: #e0e0e0;
}

.dark-theme .server-clock.auth-page {
  background: rgba(30, 30, 30, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .time {
  color: #e0e0e0;
}

.dark-theme .countdown {
  color: #64b5f6;
}

/* Адаптивность */
@media (max-width: 768px) {
  .server-clock {
    top: 10px;
    right: 10px;
    font-size: 12px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .server-clock {
    font-size: 11px;
    padding: 4px 8px;
  }
}
</style>
