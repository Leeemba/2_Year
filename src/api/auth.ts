import { api } from '.';
import type { AuthRequest, AuthResponse } from '@/types/auth';

export const authApi = {
  async login(credentials: Omit<AuthRequest, 'action'>): Promise<AuthResponse> {
    const request: AuthRequest = {
      ...credentials,
      action: 'login'
    };
    const response = await api.post<AuthResponse>('/users/login', request);
    return response.data;
  },

  async register(credentials: Omit<AuthRequest, 'action'>): Promise<AuthResponse> {
    const request: AuthRequest = {
      ...credentials,
      action: 'register'
    };
    const response = await api.post<AuthResponse>('/users/register', request);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/users/logout');
  },

  async verifyToken(): Promise<boolean> {
    try {
      await api.get('/users/verify');
      return true;
    } catch {
      return false;
    }
  },

  async getSession(): Promise<{ authenticated: boolean; token?: string; user?: any }> {
    const response = await api.get('/users/session');
    return response.data;
  }
};
