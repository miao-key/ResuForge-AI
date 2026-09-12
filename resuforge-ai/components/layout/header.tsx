'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        clearAuth();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-slate-50">
          ResuForge AI
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-slate-300 hover:text-slate-50 transition"
              >
                我的简历
              </Link>
              <Link
                href="/templates"
                className="text-sm text-slate-300 hover:text-slate-50 transition"
              >
                模板库
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{user.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-slate-700 hover:bg-slate-800"
                >
                  退出
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-300 hover:text-slate-50 transition"
              >
                登录
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950"
                >
                  注册
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
