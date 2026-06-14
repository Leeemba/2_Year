<template>
  <div class="stats-view">
    <h1>Statistics</h1>

    <div class="stats-container">
      <StatsDisplay :current-user-id="currentUserId" />
    </div>

    <div class="actions">
      <button @click="refreshStats" class="refresh-btn">
        Refresh Stats
      </button>
      <router-link to="/main" class="back-btn">
        Back to Points
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import StatsDisplay from '@/components/stats/StatsDisplay.vue';

const authStore = useAuthStore();
const currentUserId = ref<number | undefined>(undefined);

const statsComponent = ref<InstanceType<typeof StatsDisplay> | null>(null);

onMounted(() => {
  if (authStore.user) {
    currentUserId.value = authStore.user.uid;
  }
});

const refreshStats = () => {
  if (statsComponent.value && 'loadStats' in statsComponent.value) {
    (statsComponent.value as any).loadStats();
  }
};
</script>

<style scoped>
.stats-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-container {
  margin: 30px 0;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.refresh-btn, .back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: #4CAF50;
  color: white;
}

.refresh-btn:hover {
  background: #388E3C;
}

.back-btn {
  background: #2196F3;
  color: white;
  display: inline-block;
}

.back-btn:hover {
  background: #1976D2;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
}
</style>
