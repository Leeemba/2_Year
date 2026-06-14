<template>
  <div class="stats-display">
    <h3>Statistics</h3>

    <div class="stats-grid">
      <div class="stat-card user-stats">
        <h4>Your Stats</h4>
        <div v-if="userStats" class="stats-content">
          <div class="stat-item">
            <span class="label">Username:</span>
            <span class="value">{{ userStats.username }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Hits:</span>
            <span class="value hit">{{ userStats.alive }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Misses:</span>
            <span class="value miss">{{ userStats.died }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Total Points:</span>
            <span class="value">{{ userStats.alive + userStats.died }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Accuracy:</span>
            <span class="value">{{ accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="label">Score:</span>
            <span class="value score">{{ userStats.score }}</span>
          </div>
        </div>
        <div v-else class="loading">Loading...</div>
      </div>

      <div class="stat-card leaderboard">
        <h4>Leaderboard</h4>
        <div v-if="leaderboard.length > 0" class="leaderboard-content">
          <table>
            <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              <th>Hits</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(stat, index) in leaderboard" :key="stat.id"
                :class="{ current: stat.userId === currentUserId }">
              <td>{{ index + 1 }}</td>
              <td>{{ stat.username }}</td>
              <td>{{ stat.score }}</td>
              <td>{{ stat.alive }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="loading">Loading...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Stats } from '@/types/stats';
import { statsApi } from '@/api/stats';

interface Props {
  currentUserId?: number;
}

const props = defineProps<Props>();

const userStats = ref<Stats | null>(null);
const leaderboard = ref<Stats[]>([]);
const loading = ref(true);

const accuracy = computed(() => {
  if (!userStats.value || userStats.value.alive + userStats.value.died === 0) {
    return 0;
  }
  return ((userStats.value.alive / (userStats.value.alive + userStats.value.died)) * 100).toFixed(1);
});

onMounted(async () => {
  await loadStats();
});

const loadStats = async () => {
  loading.value = true;
  try {
    if (props.currentUserId) {
      userStats.value = await statsApi.getUserStats(props.currentUserId);
    }
    leaderboard.value = await statsApi.getLeaderboard();
  } catch (error) {
    console.error('Failed to load stats:', error);
  } finally {
    loading.value = false;
  }
};

// Экспортируем метод для обновления
defineExpose({ loadStats });
</script>

<style scoped>
.stats-display {
  max-width: 1000px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.stat-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  font-weight: 600;
}

.value.hit {
  color: #4CAF50;
}

.value.miss {
  color: #F44336;
}

.value.score {
  color: #2196F3;
  font-size: 1.2em;
}

.leaderboard-content {
  overflow-x: auto;
}

.leaderboard table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard th, .leaderboard td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.leaderboard th {
  background: #f9f9f9;
  font-weight: 600;
  color: #333;
}

.leaderboard tr.current {
  background: #e3f2fd;
  font-weight: 600;
}

.leaderboard tr:hover {
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
