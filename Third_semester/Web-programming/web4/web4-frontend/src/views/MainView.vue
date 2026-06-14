<template>
  <div class="main-view">
    <div class="grid">
      <div class="column form-column">
        <PointForm
          :current-r="currentR"
          @point-added="handlePointAdded"
          @r-changed="handleRChanged"
        />
      </div>

      <div class="column graph-column">
        <Graph
          ref="graphRef"
          :points="pointsStore.points"
          :current-r="currentR"
          @point-clicked="handlePointClicked"
          @cleared="handleClearCanvas"
          @r-changed="handleRChanged"
        />
      </div>

      <div class="column table-column">
        <PointsTable
          :points="pointsStore.points"
          @clear="handleClearTable"
        />
      </div>
    </div>
    <h5><i>A mediocrity can never become a natural talent but can't mediocrity still get better than a natural talent?</i></h5>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePointsStore } from '@/stores/points';
import { useValidationStore, ValidationError } from '@/stores/validation'
import PointForm from '@/components/points/PointForm.vue';
import Graph from '@/components/points/Graph.vue';
import PointsTable from '@/components/points/PointsTable.vue';
import type { TemporaryPoint } from '@/types/points';

const authStore = useAuthStore();
const pointsStore = usePointsStore();
const currentR = ref(1);
const validationStore = useValidationStore();
const graphRef = ref<InstanceType<typeof Graph> | null>(null);

const handleRChanged = (newR: number) => {
  console.log('R changed in MainView:', newR);
  currentR.value = newR;
};

onMounted(() => {
  if (authStore.user) {
    pointsStore.fetchPoints(authStore.user.uid);
  }
});

// Функция проверки точки на соответствие ОДЗ
const validatePoint = (x: number, y: number): ValidationError | null => {
  const VALID_X = { min: -4, max: 4 };
  const VALID_Y = { min: -3, max: 3 };

  const isXValid = x >= VALID_X.min && x <= VALID_X.max;
  const isYValid = y >= VALID_Y.min && y <= VALID_Y.max;

  if (!isXValid && !isYValid) {
    return {
      type: 'both',
      message: `X must be between ${VALID_X.min} and ${VALID_X.max}, Y must be between ${VALID_Y.min} and ${VALID_Y.max}`,
      x,
      y
    };
  } else if (!isXValid) {
    return {
      type: 'x',
      message: `X must be between ${VALID_X.min} and ${VALID_X.max}`,
      x,
      y
    };
  } else if (!isYValid) {
    return {
      type: 'y',
      message: `Y must be between ${VALID_Y.min} and ${VALID_Y.max}`,
      x,
      y
    };
  }

  return null;
};


const handlePointAdded = async (point: any) => {
  console.log('Point added:', point);
  if (point === null) {
    // Это была временная точка - ничего не делаем
    console.log('Temporary point was added (not saved)');
  }
};

/*const handleClearTable = async () => {
  await refreshPoints(); // Обновляем данные после очистки
};

const handleClearCanvas = async () => {
  await refreshPoints(); // Обновляем данные после очистки
};*/

const handlePointClicked = async (coords: { x: number; y: number }) => {
  if (!authStore.user) return;

  console.log('Point clicked:', coords, 'with R:', currentR.value);

  // Проверяем точку на ОДЗ
  const validationError = validatePoint(coords.x, coords.y);

  if (validationError) {
    // Точка вне ОДЗ - показываем ошибку и временную точку
    validationError.r = currentR.value;
    validationStore.setError(validationError);

    // Добавляем временную точку (только одну, заменяя предыдущую)
    if (graphRef.value) {
      (graphRef.value as any).clearTemporaryPoints();
      (graphRef.value as any).addTemporaryPoint({
        x: coords.x,
        y: coords.y,
        r: currentR.value
      });
    }

    // Автоматически скрываем ошибку через 3 секунды
    setTimeout(() => {
      validationStore.hideError();
    }, 3000);

    return;
  }

  // Точка в ОДЗ - отправляем на сервер
  try {
    const result = await pointsStore.addPoint({
      x: coords.x,
      y: coords.y,
      r: currentR.value,
      uid: authStore.user.uid
    });

    if (result === null) {
      // Ошибка сервера (но точка в ОДЗ)
      validationStore.setError({
        type: null,
        message: 'Server error occurred',
        x: coords.x,
        y: coords.y,
        r: currentR.value
      });
    } else {
      // Успешное сохранение - очищаем временные точки и ошибки
      validationStore.clearError();
      if (graphRef.value) {
        (graphRef.value as any).clearTemporaryPoints();
      }
    }
  } catch (error: any) {
    // Ошибка при отправке
    validationStore.setError({
      type: null,
      message: error.message || 'Failed to send point',
      x: coords.x,
      y: coords.y,
      r: currentR.value
    });

    // Добавляем временную точку для ошибки сервера
    if (graphRef.value) {
      (graphRef.value as any).clearTemporaryPoints();
      (graphRef.value as any).addTemporaryPoint({
        x: coords.x,
        y: coords.y,
        r: currentR.value
      });
    }
  }
};

watch(() => authStore.user, (user) => {
  if (user) {
    pointsStore.fetchPoints(user.uid);
  }
});

// Обновляем график при изменении данных
watch(() => pointsStore.points, () => {
  // Принудительное обновление графика
  nextTick(() => {
    if (graphRef.value) {
      // Вызываем метод перерисовки, если он доступен
      const graphComponent = graphRef.value as any;
      if (typeof graphComponent.redraw === 'function') {
        graphComponent.redraw();
      }
    }
  });
}, { deep: true });
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.column {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

h5{
  color:dimgray;
  text-align: center;
}
</style>
