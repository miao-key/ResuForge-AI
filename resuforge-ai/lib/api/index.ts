import { useAuthStore } from '@/store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchAPI(
  endpoint: string,
  options: RequestOptions = {}
) {
  const { requireAuth = false, ...fetchOptions } = options;
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (requireAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth APIs
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Resume APIs
export const resumeAPI = {
  list: () =>
    fetchAPI('/api/resumes', {
      requireAuth: true,
    }),

  get: (id: string) =>
    fetchAPI(`/api/resumes/${id}`, {
      requireAuth: true,
    }),

  create: (title: string, content: any) =>
    fetchAPI('/api/resumes', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ title, content }),
    }),

  update: (id: string, title: string, content: any) =>
    fetchAPI(`/api/resumes/${id}`, {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify({ title, content }),
    }),

  delete: (id: string) =>
    fetchAPI(`/api/resumes/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

// AI APIs
export const aiAPI = {
  optimize: (content: string, type: 'summary' | 'experience' | 'project' | 'education' | 'skills' | 'analyze') =>
    fetchAPI('/api/ai/optimize', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ content, type }),
    }),
};
