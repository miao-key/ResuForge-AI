'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-flow">
          ResuForge AI
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
              >
                我的简历
              </Link>
              <Link
                href="/templates"
                className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
              >
                模板库
              </Link>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                  <span className="text-sm text-blue-700 font-medium">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  退出
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
              >
                登录
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="btn-flow border-0 text-white shadow-md shadow-blue-500/30"
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
