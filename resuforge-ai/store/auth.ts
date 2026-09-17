'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  // 后端验证状态：'unknown' 初始未验证 / 'valid' 通过 / 'invalid' 失败
  authStatus: 'unknown' | 'valid' | 'invalid';
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setAuthStatus: (status: 'unknown' | 'valid' | 'invalid') => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      authStatus: 'unknown',
      setAuth: (user, token) => set({ user, token, authStatus: 'valid' }),
      setUser: (user) => set({ user }),
      setAuthStatus: (authStatus) => set({ authStatus }),
      logout: async () => {
        try {
          // Call backend logout API to clear httpOnly cookie
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // Clear frontend state regardless of API result
          set({ user: null, token: null, authStatus: 'invalid' });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化 user，不持久化 token（token 可能过期，下次必须从后端验证）
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          // 水合后强制重新验证（token 可能在 localStorage 关闭期间已过期）
          state.authStatus = 'unknown';
          state.token = null;
        }
      },
    }
  )
);
