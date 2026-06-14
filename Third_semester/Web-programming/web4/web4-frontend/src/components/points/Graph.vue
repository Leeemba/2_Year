<!-- Graph.vue - полная переработка -->
<template>
  <div class="graph-container">
    <div class="graph-header">
      <h4>Coordinate Plane</h4>
      <div class="controls">
        <label>Radius (R):</label>
        <select v-model="currentR" @change="handleRChange">
          <option v-for="value in rValues" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
        <button @click="clearCanvas">Clear Points</button>
        <button @click="resetView" title="Reset View (R)">Reset View</button>
      </div>
    </div>

    <div class="graph-wrapper">
      <canvas
        ref="canvas"
        :width="canvasSize"
        :height="canvasSize"
        @click="handleCanvasClick"
        @mousedown="startDragging"
        @wheel.prevent="handleWheel"
        tabindex="0"
        @keydown="handleKeyDown"
      ></canvas>

      <div class="legend">
        <div class="legend-item">
          <span class="dot hit"></span>
          <span>Hit</span>
        </div>
        <div class="legend-item">
          <span class="dot miss"></span>
          <span>Miss</span>
        </div>
        <div class="legend-item">
          <span class="dot temp"></span>
          <span>Error/Out of bounds</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineEmits, defineExpose, onUnmounted } from 'vue'
import type { Point } from '@/types/points';
import { useAuthStore } from '@/stores/auth';
import { usePointsStore } from '@/stores/points';

interface Props {
  points: Point[];
  currentR?: number;
}

interface TemporaryPoint {
  x: number;
  y: number;
  r: number;
}

const props = withDefaults(defineProps<Props>(), {
  currentR: 1
});

const authStore = useAuthStore();
const pointsStore = usePointsStore();
const emit = defineEmits(['point-clicked', 'cleared','r-changed']);

// Canvas и контекст
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const temporaryPoint = ref<TemporaryPoint | null>(null);

// Константы
const canvasSize = 400;
const GRAPH_UNIT_RADIUS = 100; // Пикселей на единицу при R=1
const origin = canvasSize / 2;

// Диапазоны значений
const VALID_AREA = {
  xMin: -4,
  xMax: 4,
  yMin: -3,
  yMax: 3
};

// Цвета (сохраняем текущую палитру)
const COLORS = {
  background: '#f9f9f9',
  axes: '#333',
  grid: '#e0e0e0',
  validArea: 'rgba(0, 100, 255, 0.1)',
  validAreaBorder: 'rgba(0, 100, 255, 0.3)',
  shapeFill: 'rgba(0, 100, 255, 0.3)',
  shapeBorder: 'rgba(0, 100, 255, 0.7)',
  hit: '#4CAF50',
  miss: '#F44336',
  temp: '#ffcc00', // Желтый для временных точек
  hitGlow: '#00cc7d',
  missGlow: '#cc0000',
  tempGlow: '#cc9900'
};
/*const fontSize = computed(() => {
  // Базовый размер 12px, уменьшаем при увеличении масштаба
  const baseSize = 12;
  return Math.max(8, baseSize / scale.value);
});*/

// Состояние графика
const currentR = ref(props.currentR);
const rValues = [0.5, 1, 1.5, 2, 2.5, 3]; // Новый диапазон R

// Масштабирование и перемещение
const scale = ref(1.0);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });





// Функции преобразования координат
const graphToCanvas = (graphX: number, graphY: number) => {
  const scaleFactor = GRAPH_UNIT_RADIUS / currentR.value;
  const pixelX = origin + ((graphX - offsetX.value) * scaleFactor * scale.value);
  const pixelY = origin - ((graphY - offsetY.value) * scaleFactor * scale.value);
  return { x: pixelX, y: pixelY };
};

const canvasToGraph = (canvasX: number, canvasY: number) => {
  const scaleFactor = currentR.value / (GRAPH_UNIT_RADIUS * scale.value);
  const graphX = ((canvasX - origin) * scaleFactor) + offsetX.value;
  const graphY = ((origin - canvasY) * scaleFactor) + offsetY.value;
  return { x: graphX, y: graphY };
};

// Функция добавления временной точки
const addTemporaryPoint = (point: TemporaryPoint) => {
  console.log('Adding temporary point:', point);
  temporaryPoint.value = point;
  redraw();
};

// Функция очистки временных точек
const clearTemporaryPoints = () => {
  temporaryPoint.value = null;
  redraw();
};

// Экспортируемые методы для родителя
defineExpose({
  addTemporaryPoint,
  clearTemporaryPoints
});

// Отрисовка области допустимых значений
const drawValidArea = () => {
  if (!ctx.value) return;

  const topLeft = graphToCanvas(VALID_AREA.xMin, VALID_AREA.yMax);
  const bottomRight = graphToCanvas(VALID_AREA.xMax, VALID_AREA.yMin);

  ctx.value.fillStyle = COLORS.validArea;
  ctx.value.fillRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );

  ctx.value.strokeStyle = COLORS.validAreaBorder;
  ctx.value.lineWidth = 1;
  ctx.value.strokeRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );
};

// Отрисовка координатной сетки
const drawGrid = () => {
  if (!ctx.value) return;

  ctx.value.strokeStyle = COLORS.grid;
  ctx.value.lineWidth = 0.5;

  // Получаем границы видимой области в графических координатах
  const topLeftGraph = canvasToGraph(0, 0);
  const bottomRightGraph = canvasToGraph(canvasSize, canvasSize);

  const visibleXMin = Math.min(topLeftGraph.x, bottomRightGraph.x);
  const visibleXMax = Math.max(topLeftGraph.x, bottomRightGraph.x);
  const visibleYMin = Math.min(topLeftGraph.y, bottomRightGraph.y);
  const visibleYMax = Math.max(topLeftGraph.y, bottomRightGraph.y);

  // Расширяем диапазон для плавного перехода
  const extendedXMin = Math.floor(visibleXMin) - 1;
  const extendedXMax = Math.ceil(visibleXMax) + 1;
  const extendedYMin = Math.floor(visibleYMin) - 1;
  const extendedYMax = Math.ceil(visibleYMax) + 1;

  // Адаптивный шаг сетки в зависимости от масштаба
  const xRange = extendedXMax - extendedXMin;
  const yRange = extendedYMax - extendedYMin;

  let gridStep = 0.5;
  if (xRange > 10 || yRange > 10) gridStep = 1;
  if (xRange > 20 || yRange > 20) gridStep = 2;
  if (xRange > 40 || yRange > 40) gridStep = 4;

  // Рисуем вертикальные линии сетки
  for (let x = Math.floor(extendedXMin / gridStep) * gridStep; x <= extendedXMax; x += gridStep) {
    // Пропускаем ось Y
    if (Math.abs(x) < 0.001) continue;

    const start = graphToCanvas(x, extendedYMin);
    const end = graphToCanvas(x, extendedYMax);

    // Проверяем, что линия хотя бы частично в пределах холста
    if ((start.x >= 0 && start.x <= canvasSize) || (end.x >= 0 && end.x <= canvasSize) ||
      (start.y >= 0 && start.y <= canvasSize) || (end.y >= 0 && end.y <= canvasSize)) {

      ctx.value.beginPath();
      ctx.value.moveTo(start.x, start.y);
      ctx.value.lineTo(end.x, end.y);
      ctx.value.stroke();
    }
  }

  // Рисуем горизонтальные линии сетки
  for (let y = Math.floor(extendedYMin / gridStep) * gridStep; y <= extendedYMax; y += gridStep) {
    // Пропускаем ось X
    if (Math.abs(y) < 0.001) continue;

    const start = graphToCanvas(extendedXMin, y);
    const end = graphToCanvas(extendedXMax, y);

    // Проверяем, что линия хотя бы частично в пределах холста
    if ((start.x >= 0 && start.x <= canvasSize) || (end.x >= 0 && end.x <= canvasSize) ||
      (start.y >= 0 && start.y <= canvasSize) || (end.y >= 0 && end.y <= canvasSize)) {

      ctx.value.beginPath();
      ctx.value.moveTo(start.x, start.y);
      ctx.value.lineTo(end.x, end.y);
      ctx.value.stroke();
    }
  }
};

// Отрисовка осей
const drawAxes = () => {
  if (!ctx.value) return;

  ctx.value.strokeStyle = COLORS.axes;
  ctx.value.lineWidth = 2;
  ctx.value.fillStyle = COLORS.axes;
  ctx.value.font = '14px Arial';

  // Получаем границы видимой области в графических координатах
  const topLeftGraph = canvasToGraph(0, 0);
  const bottomRightGraph = canvasToGraph(canvasSize, canvasSize);

  const visibleXMin = Math.min(topLeftGraph.x, bottomRightGraph.x);
  const visibleXMax = Math.max(topLeftGraph.x, bottomRightGraph.x);
  const visibleYMin = Math.min(topLeftGraph.y, bottomRightGraph.y);
  const visibleYMax = Math.max(topLeftGraph.y, bottomRightGraph.y);

  // Определяем, видны ли оси в текущей области
  const isXAxisVisible = 0 >= visibleYMin && 0 <= visibleYMax;
  const isYAxisVisible = 0 >= visibleXMin && 0 <= visibleXMax;

  // Рисуем ось X, если она видна
  if (isXAxisVisible) {
    // Находим точки пересечения оси X (y=0) с границами холста
    const xAxisY = 0;

    // Левая граница (x = visibleXMin)
    const leftX = visibleXMin;
    const leftPoint = graphToCanvas(leftX, xAxisY);

    // Правая граница (x = visibleXMax)
    const rightX = visibleXMax;
    const rightPoint = graphToCanvas(rightX, xAxisY);

    // Проверяем, находятся ли точки в пределах холста
    const startX = Math.max(0, Math.min(canvasSize, leftPoint.x));
    const startY = Math.max(0, Math.min(canvasSize, leftPoint.y));
    const endX = Math.max(0, Math.min(canvasSize, rightPoint.x));
    const endY = Math.max(0, Math.min(canvasSize, rightPoint.y));

    // Рисуем ось X
    ctx.value.beginPath();
    ctx.value.moveTo(startX, startY);
    ctx.value.lineTo(endX, endY);
    ctx.value.stroke();

    // Рисуем стрелку на правом конце (если он видим)
    if (endX > 10 && endX < canvasSize - 10 && endY > 10 && endY < canvasSize - 10) {
      const arrowSize = 8;
      ctx.value.beginPath();
      ctx.value.moveTo(endX - arrowSize, endY - arrowSize);
      ctx.value.lineTo(endX, endY);
      ctx.value.lineTo(endX - arrowSize, endY + arrowSize);
      ctx.value.stroke();

      // Подпись оси X
      ctx.value.fillText('X', endX - 15, endY - 10);
    }

    // Рисуем засечки на оси X с шагом 0.5
    ctx.value.strokeStyle = COLORS.axes;
    ctx.value.lineWidth = 1;
    ctx.value.font = '12px Arial';
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'top';
    ctx.value.fillStyle = COLORS.axes;

    // Определяем диапазон для засечек на видимой оси X
    const tickStartX = Math.ceil(visibleXMin / 0.5) * 0.5;
    const tickEndX = Math.floor(visibleXMax / 0.5) * 0.5;

    for (let xValue = tickStartX; xValue <= tickEndX; xValue += 0.5) {
      // Пропускаем 0, так как это пересечение осей
      if (Math.abs(xValue) < 0.001) continue;

      const tickPos = graphToCanvas(xValue, 0);
      const tickLength = 6;

      // Проверяем, находится ли засечка в пределах холста
      if (tickPos.x >= 0 && tickPos.x <= canvasSize &&
        tickPos.y >= 0 && tickPos.y <= canvasSize) {

        // Засечка
        ctx.value.beginPath();
        ctx.value.moveTo(tickPos.x, tickPos.y - tickLength);
        ctx.value.lineTo(tickPos.x, tickPos.y + tickLength);
        ctx.value.stroke();

        // Подпись (только если не слишком близко к краю)
        if (tickPos.x > 20 && tickPos.x < canvasSize - 20) {
          ctx.value.fillText(xValue.toFixed(1), tickPos.x, tickPos.y + 8);
        }
      }
    }
  }

  // Рисуем ось Y, если она видна
  if (isYAxisVisible) {
    // Находим точки пересечения оси Y (x=0) с границами холста
    const yAxisX = 0;

    // Нижняя граница (y = visibleYMin)
    const bottomY = visibleYMin;
    const bottomPoint = graphToCanvas(yAxisX, bottomY);

    // Верхняя граница (y = visibleYMax)
    const topY = visibleYMax;
    const topPoint = graphToCanvas(yAxisX, topY);

    // Проверяем, находятся ли точки в пределах холста
    const startX = Math.max(0, Math.min(canvasSize, bottomPoint.x));
    const startY = Math.max(0, Math.min(canvasSize, bottomPoint.y));
    const endX = Math.max(0, Math.min(canvasSize, topPoint.x));
    const endY = Math.max(0, Math.min(canvasSize, topPoint.y));

    // Рисуем ось Y
    ctx.value.beginPath();
    ctx.value.moveTo(startX, startY);
    ctx.value.lineTo(endX, endY);
    ctx.value.stroke();

    // Рисуем стрелку на верхнем конце (если он видим)
    if (endX > 10 && endX < canvasSize - 10 && endY > 10 && endY < canvasSize - 10) {
      const arrowSize = 8;
      ctx.value.beginPath();
      ctx.value.moveTo(endX - arrowSize, endY + arrowSize);
      ctx.value.lineTo(endX, endY);
      ctx.value.lineTo(endX + arrowSize, endY + arrowSize);
      ctx.value.stroke();

      // Подпись оси Y
      ctx.value.fillText('Y', endX + 15, endY + 5);
    }

    // Рисуем засечки на оси Y с шагом 0.5
    ctx.value.strokeStyle = COLORS.axes;
    ctx.value.lineWidth = 1;
    ctx.value.font = '12px Arial';
    ctx.value.textAlign = 'right';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillStyle = COLORS.axes;

    // Определяем диапазон для засечек на видимой оси Y
    const tickStartY = Math.ceil(visibleYMin / 0.5) * 0.5;
    const tickEndY = Math.floor(visibleYMax / 0.5) * 0.5;

    for (let yValue = tickStartY; yValue <= tickEndY; yValue += 0.5) {
      // Пропускаем 0, так как это пересечение осей
      if (Math.abs(yValue) < 0.001) continue;

      const tickPos = graphToCanvas(0, yValue);
      const tickLength = 6;

      // Проверяем, находится ли засечка в пределах холста
      if (tickPos.x >= 0 && tickPos.x <= canvasSize &&
        tickPos.y >= 0 && tickPos.y <= canvasSize) {

        // Засечка
        ctx.value.beginPath();
        ctx.value.moveTo(tickPos.x - tickLength, tickPos.y);
        ctx.value.lineTo(tickPos.x + tickLength, tickPos.y);
        ctx.value.stroke();

        // Подпись (только если не слишком близко к краю)
        if (tickPos.y > 20 && tickPos.y < canvasSize - 20) {
          ctx.value.fillText(yValue.toFixed(1), tickPos.x - 8, tickPos.y);
        }
      }
    }
  }

  // Подпись в начале координат (если она видна)
  const originPos = graphToCanvas(0, 0);
  if (originPos.x >= 0 && originPos.x <= canvasSize &&
    originPos.y >= 0 && originPos.y <= canvasSize) {
    ctx.value.textAlign = 'left';
    ctx.value.textBaseline = 'top';
    ctx.value.fillText('0', originPos.x + 5, originPos.y + 5);
  }
};

// Отрисовка фигур (масштабируемых относительно R)
const drawShapes = () => {
  if (!ctx.value) return;

  const r = Math.abs(currentR.value);

  ctx.value.fillStyle = COLORS.shapeFill;
  ctx.value.strokeStyle = COLORS.shapeBorder;
  ctx.value.lineWidth = 2;

  // 1. Прямоугольник (1 четверть) x∈[0, R], y∈[0, R/2]
  const rectTopLeft = graphToCanvas(0, 0);
  const rectBottomRight = graphToCanvas(r, r);
  ctx.value.beginPath();
  ctx.value.rect(rectTopLeft.x, rectTopLeft.y,
    rectBottomRight.x - rectTopLeft.x,
    rectBottomRight.y - rectTopLeft.y);
  ctx.value.fill();
  ctx.value.stroke();

  // 2. Треугольник (4 четверть) x∈[-R/2, 0], y∈[0, R/2]
  const triangleA = graphToCanvas(r, 0);
  const triangleB = graphToCanvas(0, 0);
  const triangleC = graphToCanvas(0, -r/2);
  ctx.value.beginPath();
  ctx.value.moveTo(triangleA.x, triangleA.y);
  ctx.value.lineTo(triangleB.x, triangleB.y);
  ctx.value.lineTo(triangleC.x, triangleC.y);
  ctx.value.closePath();
  ctx.value.fill();
  ctx.value.stroke();

  // 3. Сектор круга (3 четверть) x∈[0, R], y∈[-R, 0]
  const center = graphToCanvas(0, 0);
  const radiusPixels = r * (GRAPH_UNIT_RADIUS / currentR.value) * scale.value;
  ctx.value.beginPath();
  ctx.value.moveTo(center.x, center.y);
  ctx.value.arc(center.x, center.y, radiusPixels, -1*Math.PI, -3*Math.PI/2, true);
  ctx.value.lineTo(center.x, center.y);
  ctx.value.fill();
  ctx.value.stroke();
};

// Отрисовка сохраненных точек
const drawSavedPoints = () => {
  if (!ctx.value || !props.points.length) return;

  props.points.forEach(point => {
    if (Math.abs(point.r - currentR.value) > 0.001) return;

    const { x, y } = graphToCanvas(point.x, point.y);

    // Глоу-эффект
    ctx.value!.shadowColor = point.shot === 1 ? COLORS.hitGlow : COLORS.missGlow;
    ctx.value!.shadowBlur = 10;

    // Точка
    ctx.value!.beginPath();
    ctx.value!.arc(x, y, 6, 0, Math.PI * 2);
    ctx.value!.fillStyle = point.shot === 1 ? COLORS.hit : COLORS.miss;
    ctx.value!.fill();

    ctx.value!.shadowBlur = 0;
    ctx.value!.strokeStyle = '#333';
    ctx.value!.lineWidth = 1;
    ctx.value!.stroke();
  });
};

// Отрисовка временных точек
const drawTemporaryPoint = () => {
  if (!ctx.value || !temporaryPoint.value) return;

  const point = temporaryPoint.value;

  // Проверяем, соответствует ли точка текущему R
  if (Math.abs(point.r - currentR.value) > 0.001) return;

  const { x, y } = graphToCanvas(point.x, point.y);

  // Глоу-эффект
  ctx.value!.shadowColor = COLORS.tempGlow;
  ctx.value!.shadowBlur = 10;

  // Точка
  ctx.value!.beginPath();
  ctx.value!.arc(x, y, 6, 0, Math.PI * 2);
  ctx.value!.fillStyle = COLORS.temp;
  ctx.value!.fill();

  ctx.value!.shadowBlur = 0;
  ctx.value!.strokeStyle = '#cc9900';
  ctx.value!.lineWidth = 1;
  ctx.value!.stroke();

  // Подпись точки (опционально)
  ctx.value!.fillStyle = '#cc9900';
  ctx.value!.font = '12px Arial';
  ctx.value!.textAlign = 'center';
  ctx.value!.fillText('Invalid', x, y - 15);
};

// Отрисовка всего графика
const redraw = () => {
  if (!ctx.value) return;

  // Очистка
  ctx.value.clearRect(0, 0, canvasSize, canvasSize);

  // Фон
  ctx.value.fillStyle = COLORS.background;
  ctx.value.fillRect(0, 0, canvasSize, canvasSize);

  // Сетка
  drawGrid();

  // Область допустимых значений
  drawValidArea();

  // Фигуры
  drawShapes();

  // Оси
  drawAxes();

  // Сохраненные точки
  drawSavedPoints();

  // Временная точка (рисуем последней, чтобы была поверх всего)
  drawTemporaryPoint();
};

// Обработчики событий
const handleCanvasClick = (event: MouseEvent) => {
  if (!canvas.value || isDragging.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const graphCoords = canvasToGraph(clickX, clickY);

  // Проверяем, попадает ли точка в область допустимых значений
  const isInValidArea =
    graphCoords.x >= VALID_AREA.xMin && graphCoords.x <= VALID_AREA.xMax &&
    graphCoords.y >= VALID_AREA.yMin && graphCoords.y <= VALID_AREA.yMax;

  // Если точка вне ОДЗ, добавляем временную точку
  if (!isInValidArea) {
    addTemporaryPoint({
      x: graphCoords.x,
      y: graphCoords.y,
      r: currentR.value
    });
    return;
  }

  // Отправляем событие родителю
  emit('point-clicked', { x: graphCoords.x, y: graphCoords.y });
};

const startDragging = (event: MouseEvent) => {
  if (!canvas.value) return;

  isDragging.value = true;
  const rect = canvas.value.getBoundingClientRect();
  lastMousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };

  canvas.value.style.cursor = 'grabbing';
};

const handleDrag = (event: MouseEvent) => {
  if (!isDragging.value || !canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const currentX = event.clientX - rect.left;
  const currentY = event.clientY - rect.top;

  const deltaX = currentX - lastMousePos.value.x;
  const deltaY = currentY - lastMousePos.value.y;

  // Преобразуем смещение в пикселях в смещение в координатах графика
  const scaleFactor = currentR.value / (GRAPH_UNIT_RADIUS * scale.value);
  offsetX.value -= deltaX * scaleFactor;
  offsetY.value += deltaY * scaleFactor;

  lastMousePos.value = { x: currentX, y: currentY };
  redraw();
};

const stopDragging = () => {
  isDragging.value = false;
  if (canvas.value) {
    canvas.value.style.cursor = 'crosshair';
  }
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  if (!canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Координаты мыши в системе графика
  const graphCoords = canvasToGraph(mouseX, mouseY);

  // Определяем направление масштабирования
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
  const newScale = scale.value * zoomFactor;

  // Ограничиваем масштаб
  if (newScale < 0.1 || newScale > 10) return;

  // Корректируем смещение для сохранения точки под курсором
  const scaleChange = newScale / scale.value;
  offsetX.value = graphCoords.x - (graphCoords.x - offsetX.value) / scaleChange;
  offsetY.value = graphCoords.y - (graphCoords.y - offsetY.value) / scaleChange;

  scale.value = newScale;
  redraw();
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'r' || event.key === 'R') {
    resetView();
  }
};

const handleRChange = () => {
  console.log('R changed in Graph:', currentR.value);
  // При изменении R очищаем временные точки
  clearTemporaryPoints();

  // Отправляем событие родителю
  emit('r-changed', currentR.value);

  redraw();
};

const resetView = () => {
  scale.value = 1.0;
  offsetX.value = 0;
  offsetY.value = 0;
  redraw();
};

const clearCanvas = async () => {
  if (authStore.user) {
    if (confirm(`Clear all points with R = ${currentR.value}?`)) {
      try {
        await pointsStore.deletePointsByRadius(authStore.user.uid, currentR.value);
        // Очищаем временные точки
        clearTemporaryPoints();
        emit('cleared');
      } catch (error) {
        console.error('Failed to clear canvas:', error);
      }
    }
  }
};

// Инициализация
onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d');
    redraw();

    // Добавляем обработчики событий
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDragging);
  }
});

onUnmounted(() => {
  // Удаляем обработчики событий
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDragging);
});

// Наблюдатели
watch([() => props.points, currentR], () => {
  redraw();
}, { deep: true });
</script>

<style scoped>
.graph-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls select, .controls button {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.controls button {
  background: #f0f0f0;
  cursor: pointer;
}

.controls button:hover {
  background: #e0e0e0;
}

.graph-wrapper {
  position: relative;
  margin: 0 auto;
  width: fit-content;
}

canvas {
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: crosshair;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #333;
}

.dot.hit {
  background: #4CAF50;
}

.dot.miss {
  background: #F44336;
}

.dot.temp {
  background: #ffcc00;
}
</style>
