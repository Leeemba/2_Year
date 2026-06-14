import { api } from '.';
import type { Stats } from '@/types/stats';

export const statsApi = {
  async getUserStats(userId: number): Promise<Stats> {
    const response = await api.get<Stats>(`/stats/user/${userId}`);
    return response.data;
  },

  async getLeaderboard(): Promise<Stats[]> {
    const response = await api.get<Stats[]>('/stats/leaderboard');
    return response.data;
  }
};
