'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { withGuest } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/utils';
import Link from 'next/link';

function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

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
        login(result.data.user, result.data.token);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">创建账号</h1>
          <p className="text-slate-400">开始打造你的专业简历</p>
        </div>

        {/* Register Form */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-950/50 border ${
                  errors.name ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition`}
                placeholder="请输入你的姓名"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-950/50 border ${
                  errors.email ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-950/50 border ${
                  errors.password ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition`}
                placeholder="至少 8 位，包含大小写字母和数字"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-950/50 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition`}
                placeholder="再次输入密码"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '注册中...' : '注册'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-500">
          注册即表示你同意我们的{' '}
          <a href="#" className="text-slate-400 hover:text-slate-300 transition">
            服务条款
          </a>{' '}
          和{' '}
          <a href="#" className="text-slate-400 hover:text-slate-300 transition">
            隐私政策
          </a>
        </p>
      </div>
    </div>
  );
}

export default withGuest(RegisterPage);
