// composables/useGraph.ts
import { ref, computed } from 'vue';

export function useGraph() {
  // Константы
  const CANVAS_SIZE = 400;
  const GRAPH_UNIT_RADIUS = 100;
  const ORIGIN = CANVAS_SIZE / 2;

  // Диапазоны значений
  const VALID_AREA = {
    xMin: -4,
    xMax: 4,
    yMin: -3,
    yMax: 3
  };

  // Состояние
  const scale = ref(1.0);
  const offsetX = ref(0);
  const offsetY = ref(0);
  const isDragging = ref(false);
  const lastMousePos = ref({ x: 0, y: 0 });

  // Функции преобразования координат
  const graphToCanvas = (graphX: number, graphY: number, currentR: number) => {
    const scaleFactor = GRAPH_UNIT_RADIUS / currentR;
    const pixelX = ORIGIN + ((graphX - offsetX.value) * scaleFactor * scale.value);
    const pixelY = ORIGIN - ((graphY - offsetY.value) * scaleFactor * scale.value);
    return { x: pixelX, y: pixelY };
  };

  const canvasToGraph = (canvasX: number, canvasY: number, currentR: number) => {
    const scaleFactor = currentR / (GRAPH_UNIT_RADIUS * scale.value);
    const graphX = ((canvasX - ORIGIN) * scaleFactor) + offsetX.value;
    const graphY = ((ORIGIN - canvasY) * scaleFactor) + offsetY.value;
    return { x: graphX, y: graphY };
  };

  // Проверка точки на попадание в ОДЗ
  const isInValidArea = (x: number, y: number) => {
    return x >= VALID_AREA.xMin && x <= VALID_AREA.xMax &&
      y >= VALID_AREA.yMin && y <= VALID_AREA.yMax;
  };

  // Обработка масштабирования колесиком мыши
  const handleWheelZoom = (
    event: WheelEvent,
    currentR: number,
    redrawCallback: () => void
  ) => {
    event.preventDefault();

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const graphCoords = canvasToGraph(mouseX, mouseY, currentR);
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale.value * zoomFactor;

    if (newScale < 0.1 || newScale > 10) return;

    const scaleChange = newScale / scale.value;
    offsetX.value = graphCoords.x - (graphCoords.x - offsetX.value) / scaleChange;
    offsetY.value = graphCoords.y - (graphCoords.y - offsetY.value) / scaleChange;

    scale.value = newScale;
    redrawCallback();
  };

  // Сброс вида
  const resetView = (redrawCallback: () => void) => {
    scale.value = 1.0;
    offsetX.value = 0;
    offsetY.value = 0;
    redrawCallback();
  };

  return {
    CANVAS_SIZE,
    GRAPH_UNIT_RADIUS,
    ORIGIN,
    VALID_AREA,
    scale,
    offsetX,
    offsetY,
    isDragging,
    lastMousePos,
    graphToCanvas,
    canvasToGraph,
    isInValidArea,
    handleWheelZoom,
    resetView
  };
}
