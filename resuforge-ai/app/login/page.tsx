'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { withGuest } from '@/components/auth/with-auth';
import { FlowBackground } from '@/components/layout/flow-background';
import { toast } from '@/components/ui/toast';
import { resetAuthValidation } from '@/lib/auth/use-auth-check';
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
      // 重置验证缓存，确保 dashboard 会重新校验
      resetAuthValidation();
      toast.success('登录成功！');
      window.location.href = '/dashboard';
    } else {
      toast.error(response.error || '登录失败，请检查账号密码');
    }

    setLoading(false);
  };

  return (
    <>
      <FlowBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo / 品牌 */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-flow mb-2">ResuForge AI</h1>
            <p className="text-slate-500">智能简历锻造工坊</p>
          </div>

          <div className="card-flow rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                欢迎回来
              </h2>
              <p className="text-slate-500 text-sm">登录您的账户继续创作</p>
            </div>

            {expiredNotice && (
              <div
                className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm"
                role="alert"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">⚠️</span>
                  <span>您的登录已过期，请重新登录</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  邮箱地址
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="input-flow w-full px-4 py-3 rounded-lg text-slate-800 placeholder-slate-400 transition disabled:opacity-50"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-red-500"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  密码
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  className="input-flow w-full px-4 py-3 rounded-lg text-slate-800 placeholder-slate-400 transition disabled:opacity-50"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1 text-sm text-red-500"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn-flow w-full py-3 px-4 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"
                      aria-hidden="true"
                    />
                    <span>登录中...</span>
                  </span>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                还没有账户？{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition focus-visible:outline-none focus-visible:underline"
                >
                  立即注册
                </button>
              </p>
            </div>

            {/* 演示账号提示 */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-3">
                ✨ 演示账号（点击一键填入）
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'user1@demo.com', {
                      shouldValidate: true,
                    });
                    setValue('password', 'Demo@2026', {
                      shouldValidate: true,
                    });
                  }}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded text-blue-700 hover:text-blue-800 transition"
                >
                  user1@demo.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'user2@demo.com', {
                      shouldValidate: true,
                    });
                    setValue('password', 'Demo@2026', {
                      shouldValidate: true,
                    });
                  }}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded text-blue-700 hover:text-blue-800 transition"
                >
                  user2@demo.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'user3@demo.com', {
                      shouldValidate: true,
                    });
                    setValue('password', 'Demo@2026', {
                      shouldValidate: true,
                    });
                  }}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded text-blue-700 hover:text-blue-800 transition"
                >
                  user3@demo.com
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                密码: Demo@2026
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 ResuForge AI · Powered by Next.js
          </p>
        </div>
      </div>
    </>
  );
}

export default withGuest(LoginPage);
