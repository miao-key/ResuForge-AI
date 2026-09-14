import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/ui/toast';
import type { AuthResponse, Resume } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 带重试的 fetch 封装
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // 如果是服务器错误 (5xx)，重试
      if (response.status >= 500 && attempt < maxRetries) {
        // 指数退避等待
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }
  
  throw lastError!;
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
      const response = await fetchWithRetry(`${API_URL}${endpoint}`, {
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
        
        // 429 请求过多
        if (response.status === 429) {
          toast.error('请求过于频繁，请稍后重试', 6000);
          return {
            success: false,
            error: '请求过于频繁，请稍后重试',
          };
        }

        return {
          success: false,
          error: data.error || `请求失败 (${response.status})`,
        };
      }

      return data;
    } catch (error: any) {
      // 网络错误
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('网络连接失败，请检查网络');
        return {
          success: false,
          error: '网络连接失败，请检查网络',
        };
      }
      
      return {
        success: false,
        error: error.message || '网络请求失败，请稍后重试',
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
  optimize: (data: { content: string; type: 'summary' | 'experience' | 'project' | 'education' | 'skills' | 'analyze' }) =>
    api.post('/api/ai/optimize', data),
};
