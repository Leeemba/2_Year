import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Point } from '@/types/points';
import { pointsApi } from '@/api/points';

export const usePointsStore = defineStore('points', () => {
  const points = ref<Point[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchPoints = async (userId: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      points.value = await pointsApi.getPoints(userId);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch points';
    } finally {
      isLoading.value = false;
    }
  };

  const addPoint = async (pointData: {
    x: number;
    y: number;
    r: number;
    uid: number;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await pointsApi.checkPoint(pointData);

      // Проверяем, является ли ответ временной точкой
      if ('status' in response && response.status === 'temporary') {
        // Временная точка - не добавляем в список, только сообщаем об ошибке
        error.value = response.message || 'Point is outside valid area';
        // Возвращаем null для временных точек
        return null;
      }

      // Это обычная точка - добавляем в список
      const newPoint = response as Point;
      points.value.push(newPoint);
      return newPoint;
    } catch (err: any) {
      error.value = err.message || 'Failed to add point';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearPoints = () => {
    points.value = [];
  };

  const deleteAllPoints = async (userId: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await pointsApi.deleteAllPoints(userId);
      clearPoints(); // Очищаем локальное состояние
    } catch (err: any) {
      error.value = err.message || 'Failed to delete points';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };


  const deletePointsByRadius = async (userId: number, r: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await pointsApi.deletePointsByRadius(userId, r);
      // Фильтруем локальные точки
      points.value = points.value.filter(point => point.r !== r);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete points';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    points,
    isLoading,
    error,
    fetchPoints,
    addPoint,
    clearPoints,
    deleteAllPoints,
    deletePointsByRadius
  };
});
