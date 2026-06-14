import { api } from '.';
import type { Point, PointRequest, PointResponse, TemporaryPoint } from '@/types/points'

export const pointsApi = {
  async checkPoint(pointData: Omit<PointRequest, 'action'>): Promise<PointResponse> {
    const request: PointRequest = {
      ...pointData,
      action: 'click'
    };

    try {
      const response = await api.post('/shots/home', request);

      // Проверяем тип ответа
      const data = response.data;
      if (data.status && data.status === 'temporary') {
        return data as TemporaryPoint;
      }

      return data as Point;
    } catch (error: any) {
      // Обрабатываем ошибки сервера
      if (error.response?.status === 400) {
        const errorData = error.response.data;

        // Если сервер вернул структурированную ошибку с данными точки
        if (errorData.x !== undefined && errorData.y !== undefined) {
          return {
            status: 'temporary',
            message: errorData.message || 'Invalid point data',
            x: errorData.x,
            y: errorData.y,
            r: errorData.r || pointData.r,
            hit: null
          } as TemporaryPoint;
        }
      }

      // Для всех других ошибок пробрасываем исключение
      throw error;
    }
  },

  async getPoints(userId: number): Promise<Point[]> {
    const response = await api.get<Point[]>(`/shots/points/${userId}`);
    return response.data;
  },

  async deleteAllPoints(userId: number): Promise<void> {
    await api.delete(`/shots/points/${userId}`);
  },

  async deletePointsByRadius(userId: number, r: number): Promise<void> {
    await api.delete(`/shots/points/${userId}/radius/${r}`);
  }
};
