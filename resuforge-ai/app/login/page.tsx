'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { withGuest } from '@/components/auth/with-auth';
import { toast } from '@/components/ui/toast';
import type { AuthResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(8, { message: '密码至少需要 8 个字符' }),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [expiredNotice, setExpiredNotice] = useState(false);

  useEffect(() => {
    // 检查是否因 Token 过期跳转而来
    if (searchParams.get('expired') === 'true') {
      setExpiredNotice(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    const response = await authApi.login(data);

    if (response.success && response.data) {
      const authData = response.data as AuthResponse;
      setAuth(authData.user, authData.token);
      toast.success('登录成功！');
      
      // Force a full page reload to avoid hydration issues
      window.location.href = '/dashboard';
    } else {
      toast.error(response.error || '登录失败，请检查账号密码');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-50 mb-2">
              欢迎回来
            </h1>
            <p className="text-slate-400">登录您的 ResuForge AI 账户</p>
          </div>

          {expiredNotice && (
            <div 
              className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg text-amber-400 text-sm"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true">⚠️</span>
                <span>您的登录已过期，请重新登录</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                邮箱地址
                <span className="text-red-400 ml-1" aria-hidden="true">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition disabled:opacity-50"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                密码
                <span className="text-red-400 ml-1" aria-hidden="true">*</span>
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition disabled:opacity-50"
                placeholder="••••••••"
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" aria-hidden="true" />
                  <span>登录中...</span>
                </span>
              ) : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              还没有账户？{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition focus-visible:outline-none focus-visible:underline"
              >
                立即注册
              </button>
            </p>
          </div>
          
          {/* 演示账号提示 */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center mb-2">演示账号</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'user1@demo.com', { shouldValidate: true });
                  setValue('password', 'Demo@2026', { shouldValidate: true });
                }}
                className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition"
              >
                user1@demo.com
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'user2@demo.com', { shouldValidate: true });
                  setValue('password', 'Demo@2026', { shouldValidate: true });
                }}
                className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition"
              >
                user2@demo.com
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'user3@demo.com', { shouldValidate: true });
                  setValue('password', 'Demo@2026', { shouldValidate: true });
                }}
                className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition"
              >
                user3@demo.com
              </button>
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">密码: Demo@2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withGuest(LoginPage);
