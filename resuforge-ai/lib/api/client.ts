import { useAuthStore } from '@/store/auth';
import type { AuthResponse, Resume } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // 401 表示 Token 过期或无效，自动跳转到登录页
        if (response.status === 401) {
          const { logout } = useAuthStore.getState();
          await logout();
          
          // 只在浏览器环境跳转
          if (typeof window !== 'undefined') {
            window.location.href = '/login?expired=true';
          }
        }

        return {
          success: false,
          error: data.error || '请求失败',
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络请求失败',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Auth APIs
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data),
};

// Resume APIs
export const resumeApi = {
  getAll: () => api.get<Resume[]>('/api/resumes'),
  getById: (id: string) => api.get<Resume>(`/api/resumes/${id}`),
  create: (data: { title: string; content?: any }) =>
    api.post<Resume>('/api/resumes', data),
  update: (id: string, data: { title?: string; content?: any }) =>
    api.put<Resume>(`/api/resumes/${id}`, data),
  delete: (id: string) => api.delete<void>(`/api/resumes/${id}`),
};

// AI APIs
export const aiApi = {
  optimize: (data: { content: string; type: 'summary' | 'experience' | 'project' }) =>
    api.post('/api/ai/optimize', data),
};
