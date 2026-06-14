import { computed, ref } from 'vue'
import { usePointsStore } from '@/stores/points';

export function usePoints() {
  const pointsStore = usePointsStore();

  const points = computed(() => pointsStore.points);
  const isLoading = computed(() => pointsStore.isLoading);
  const error = computed(() => pointsStore.error);

  const fetchPoints = async (userId: number) => {
    await pointsStore.fetchPoints(userId);
  };

  const addPoint = async (pointData: {
    x: number;
    y: number;
    r: number;
    uid: number;
  }) => {
    return await pointsStore.addPoint(pointData);
  };

  const clearPoints = () => {
    pointsStore.clearPoints();
  };

  return {
    points,
    isLoading,
    error,
    fetchPoints,
    addPoint,
    clearPoints
  };
}
