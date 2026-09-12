'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useResumeStore } from '@/store/resume';
import { resumeApi } from '@/lib/api/client';
import { withAuth } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';

function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { resumes, setResumes, deleteResume, setLoading, loading } = useResumeStore();
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    setError('');

    const response = await resumeApi.getAll();

    if (response.success && response.data) {
      setResumes(response.data);
    } else {
      setError(response.error || '加载简历列表失败');
    }

    setLoading(false);
  };

  const handleCreateResume = () => {
    router.push('/editor/new');
  };

  const handleEditResume = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('确定要删除这份简历吗？此操作不可恢复。')) {
      return;
    }

    const response = await resumeApi.delete(id);

    if (response.success) {
      deleteResume(id);
    } else {
      alert(response.error || '删除失败');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-50">ResuForge AI</h1>
              <p className="text-sm text-slate-400 mt-1">欢迎回来，{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-300 hover:text-slate-50 border border-slate-700 hover:border-slate-600 rounded-lg transition"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-50">我的简历</h2>
            <p className="text-slate-400 mt-2">管理和编辑你的简历</p>
          </div>
          <button
            onClick={handleCreateResume}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200"
          >
            + 创建新简历
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="text-slate-400 mt-4">加载中...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">还没有简历</h3>
            <p className="text-slate-500 mb-6">创建你的第一份简历，开始打造专业形象</p>
            <button
              onClick={handleCreateResume}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200"
            >
              创建第一份简历
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-50 mb-2 group-hover:text-cyan-400 transition">
                      {resume.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      更新于 {formatDateTime(resume.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleEditResume(resume.id)}
                    className="flex-1 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/30 hover:border-red-500/50 transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(DashboardPage);
