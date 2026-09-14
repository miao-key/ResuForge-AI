'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { withGuest } from '@/components/auth/with-auth';
import { FlowBackground } from '@/components/layout/flow-background';
import { validateEmail, validatePassword } from '@/lib/utils';
import type { AuthResponse } from '@/types';
import Link from 'next/link';

function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message || '密码不符合要求';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 注册成功，自动登录
        const authData = result.data as AuthResponse;
        setAuth(authData.user, authData.token);
        router.push('/dashboard');
      } else {
        setErrors({
          submit: result.error || '注册失败，请稍后重试',
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrors({
        submit: '网络错误，请检查网络连接后重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FlowBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-flow mb-2">ResuForge AI</h1>
            <p className="text-slate-500">智能简历锻造工坊</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
            创建账号
          </h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            开始打造你的专业简历
          </p>

          {/* Register Form */}
          <div className="card-flow rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`input-flow w-full px-4 py-3 rounded-lg text-slate-800 placeholder-slate-400 ${
                  errors.name ? 'border-red-400' : ''
                }`}
                placeholder="请输入你的姓名"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-flow w-full px-4 py-3 rounded-lg text-slate-800 placeholder-slate-400 ${
                  errors.email ? 'border-red-400' : ''
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-flow w-full px-4 py-3 rounded-lg text-slate-800 placeholder-slate-400 ${
                  errors.password ? 'border-red-400' : ''
                }`}
                placeholder="至少 8 位，包含大小写字母和数字"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-flow w-full px-4 py-3 rounded-lg text-slate-800 placeholder-slate-400 ${
                  errors.confirmPassword ? 'border-red-400' : ''
                }`}
                placeholder="再次输入密码"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-flow w-full py-3 px-4 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '注册中...' : '注册'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                立即登录
              </Link>
            </p>
          </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-slate-400">
            注册即表示你同意我们的{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 transition">
              服务条款
            </a>{' '}
            和{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 transition">
              隐私政策
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default withGuest(RegisterPage);
