<!-- PointsTable.vue -->
<template>
  <div class="points-table">
    <h3>Results History</h3>

    <div class="table-controls">
      <button @click="clearTable" :disabled="points.length === 0">
        Clear History
      </button>
      <div class="stats">
        <span>Total: {{ points.length }}</span>
        <span>Hits: {{ hitCount }}</span>
        <span>Misses: {{ missCount }}</span>
      </div>
    </div>

    <div class="table-container">
      <div class="table-scroll-wrapper">
        <table v-if="points.length > 0">
          <thead class="table-header">
          <tr>
            <th class="col-index">#</th>
            <th class="col-x">X</th>
            <th class="col-y">Y</th>
            <th class="col-r">R</th>
            <th class="col-result">Result</th>
<!--            <th class="col-time">Time</th>-->
          </tr>
          </thead>
          <tbody class="table-body">
          <tr v-for="(point, index) in sortedPoints" :key="point.id">
            <td class="col-index">{{ index + 1 }}</td>
            <td class="col-x number-cell">{{ formatX(point.x) }}</td>
            <td class="col-y number-cell">{{ formatY(point.y) }}</td>
            <td class="col-r number-cell">{{ point.r.toFixed(1) }}</td>
            <td :class="['col-result', point.shot === 1 ? 'hit' : 'miss']">
              {{ point.shot === 1 ? 'Hit' : 'Miss' }}
            </td>
<!--            <td class="col-time">{{ formatTime(point.createdAt) }}</td>-->
          </tr>
          </tbody>
        </table>

        <div v-else class="empty-message">
          No points checked yet
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Point } from '@/types/points';
import { usePointsStore } from '@/stores/points';
import { useAuthStore } from '@/stores/auth';

interface Props {
  points: Point[];
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const pointsStore = usePointsStore();

const sortedPoints = computed(() => {
  return [...props.points].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

const hitCount = computed(() => {
  return props.points.filter(p => p.shot === 1).length;
});

const missCount = computed(() => {
  return props.points.filter(p => p.shot === 0).length;
});

// Форматирование X с 5 знаками после запятой
const formatX = (value: number): string => {
  return value.toFixed(5);
};

// Форматирование Y с 5 знаками после запятой
const formatY = (value: number): string => {
  return value.toFixed(5);
};

const formatTime = (timestamp?: string) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const clearTable = async () => {
  if (authStore.user) {
    if (confirm('Are you sure you want to delete all points?')) {
      try {
        await pointsStore.deleteAllPoints(authStore.user.uid);
      } catch (error) {
        console.error('Failed to clear points:', error);
      }
    }
  }
};
</script>

<style scoped>
.points-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 470px; /* Немного увеличиваем общую ширину */
  min-width: 470px; /* Минимальная ширина */
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.table-controls button {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.table-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.table-controls button:not(:disabled):hover {
  background: #d32f2f;
}

.stats {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto; /* Горизонтальный скролл при необходимости */
  max-height: 580px;
  border: 1px solid #eee;
  border-radius: 4px;
}

/* Стилизация скроллбара */
.table-scroll-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px; /* Для горизонтального скролла */
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Фиксированная ширина столбцов */
}

.table-header {
  position: sticky;
  top: 0;
  background: #f9f9f9;
  z-index: 10;
  box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
  word-wrap: break-word;
}

/* Моноширинный шрифт для числовых значений */
.number-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

/* Ширина столбцов с учетом количества символов */
/* # - 4 символа, X/Y/R - по 7 символов */
.col-index {
  width: 50px;  /* Для 4 символов */
  min-width: 50px;
}

.col-x, .col-y, .col-r {
  width: 100px;  /* Для 7 символов с запасом */
  min-width: 100px;
}

.col-result {
  width: 80px;
  min-width: 80px;
}

.col-time {
  width: 120px;
  min-width: 120px;
}

th {
  font-weight: 600;
  color: #333;
  background: #f9f9f9;
}

tbody tr:hover {
  background: #f5f5f5;
}

.hit {
  color: #4CAF50;
  font-weight: 600;
}

.miss {
  color: #F44336;
  font-weight: 600;
}

.empty-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 768px) {
  .points-table {
    width: 100%;
    min-width: 100%;
    padding: 15px;
  }

  .table-controls {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .table-controls button {
    width: 100%;
  }

  .stats {
    justify-content: space-between;
  }

  .table-scroll-wrapper {
    max-height: 300px;
  }

  th, td {
    padding: 8px 4px;
    font-size: 12px;
  }

  .number-cell {
    font-size: 11px;
  }

  /* На мобильных уменьшаем ширину столбцов */
  .col-index {
    width: 40px;
    min-width: 40px;
  }

  .col-x, .col-y, .col-r {
    width: 80px;
    min-width: 80px;
  }

  .col-result {
    width: 70px;
    min-width: 70px;
  }

  .col-time {
    width: 100px;
    min-width: 100px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  th, td {
    padding: 6px 3px;
    font-size: 11px;
  }

  .number-cell {
    font-size: 10px;
  }

  .table-controls button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .stats {
    font-size: 12px;
    gap: 8px;
  }

  /* Еще больше уменьшаем для очень маленьких экранов */
  .col-index {
    width: 35px;
    min-width: 35px;
  }

  .col-x, .col-y, .col-r {
    width: 70px;
    min-width: 70px;
  }

  .col-result {
    width: 60px;
    min-width: 60px;
  }

  .col-time {
    width: 90px;
    min-width: 90px;
  }
}

/* Для горизонтальной ориентации на мобильных */
@media (max-width: 768px) and (orientation: landscape) {
  .table-scroll-wrapper {
    max-height: 250px;
  }

  .points-table {
    min-width: auto;
  }
}
</style>
