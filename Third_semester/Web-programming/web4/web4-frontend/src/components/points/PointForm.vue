<!-- /components/points/PointForm.vue -->
<template>
  <div class="point-form">
    <h3>Check Point</h3>
    <form @submit.prevent="handleSubmit">

      <!-- X Coordinate - Button Group -->
      <div class="form-section">
        <label class="section-label">X Coordinate (-2...2)</label>
        <div class="button-group">
          <button
            v-for="value in xValues"
            :key="value"
            type="button"
            class="coordinate-btn"
            :class="{ active: x === value }"
            @click="x = value"
            :disabled="isLoading"
          >
            {{ value }}
          </button>
        </div>
        <div class="selected-value">Selected: {{ x }}</div>
      </div>

      <!-- Y Coordinate - Slider -->
      <div class="form-section">
        <label class="section-label">Y Coordinate (-3...3)</label>
        <div class="slider-container">
          <input
            type="range"
            v-model.number="y"
            min="-3"
            max="3"
            step="0.1"
            :disabled="isLoading"
            class="styled-slider"
          />
          <div class="slider-info">
            <span>{{ y }}</span>

          </div>
        </div>
      </div>

      <!-- R Value - Visual Selector -->
      <div class="form-section">
        <label class="section-label">Radius (R)</label>
        <div class="r-selector">
          <div
            v-for="value in rValues"
            :key="value"
            class="r-option"
            :class="{ active: r === value, selected: r === value }"
            @click="r = value"
          >
            <div class="r-visual">
              <div class="r-circle" :style="{ transform: `scale(${Math.abs(value) / 2})` }"></div>
            </div>
            <span class="r-label">{{ value }}</span>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn" :disabled="isLoading || !isValid">
        {{ isLoading ? 'Checking...' : 'Check Point' }}
<!--        <span class="submit-icon">🎯</span>-->
      </button>

      <div v-if="currentPoint" class="preview">
        <p>Point to check: ({{ x }}, {{ y }}) with R = {{ r }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePointsStore } from '@/stores/points';

// Добавляем props для синхронизации R
interface Props {
  currentR?: number;
}

const props = withDefaults(defineProps<Props>(), {
  currentR: 1
});

const emit = defineEmits(['point-added', 'r-changed']);

const x = ref(0);
const y = ref(0);
const r = ref(props.currentR); // Используем props.currentR как начальное значение

const xValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
const rValues = [0.5, 1, 1.5, 2, 2.5, 3];

const pointsStore = usePointsStore();
const authStore = useAuthStore();
const isLoading = computed(() => pointsStore.isLoading);

const currentPoint = computed(() => ({ x: x.value, y: y.value, r: r.value }));
const isValid = computed(() => y.value >= -3 && y.value <= 3);

// Следим за изменением R в форме
watch(r, (newR) => {
  console.log('R changed in PointForm:', newR);
  emit('r-changed', newR);
});

// Следим за изменением R извне
watch(() => props.currentR, (newR) => {
  if (newR !== r.value) {
    r.value = newR;
  }
});

const handleSubmit = async () => {
  if (!authStore.user || !isValid.value) return;

  try {
    const point = await pointsStore.addPoint({
      x: x.value,
      y: y.value,
      r: r.value,
      uid: authStore.user.uid
    });
    emit('point-added', point);
  } catch (error) {
    console.error('Failed to add point:', error);
  }
};
</script>
<style scoped>
.point-form {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 25px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.form-section {
  margin-bottom: 25px;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--text-color);
  font-size: 16px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.coordinate-btn {
  padding: 10px 16px;
  border: 2px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-color);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 50px;
}

.coordinate-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.coordinate-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.coordinate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-value {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 5px;
}

.slider-container {
  padding: 15px 0;
}

.styled-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  outline: none;
  -webkit-appearance: none;
}

.styled-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 3px solid var(--surface-color);
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

.slider-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.r-selector {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.r-option {
  flex: 1;
  text-align: center;
  cursor: pointer;
  padding: 15px 10px;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.r-option:hover {
  border-color: var(--border-color);
  background: rgba(33, 150, 243, 0.05);
}

.r-option.selected {
  border-color: var(--primary-color);
  background: rgba(33, 150, 243, 0.1);
}

.r-visual {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.r-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  background: rgba(33, 150, 243, 0.1);
  transition: transform 0.3s ease;
}

.r-label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-icon {
  font-size: 18px;
}

.preview {
  margin-top: 15px;
  padding: 12px;
  background: rgba(33, 150, 243, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 865px) {
  .button-group {
    justify-content: center;
  }

  .coordinate-btn {
    flex: 1;
    min-width: 45px;
  }

  .r-selector {
    flex-wrap: wrap;
  }

  .r-option {
    flex: 0 0 calc(50% - 10px);
  }
}
</style>
