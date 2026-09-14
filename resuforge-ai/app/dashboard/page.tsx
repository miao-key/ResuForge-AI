'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useResumeStore } from '@/store/resume';
import { resumeApi } from '@/lib/api/client';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { toast } from '@/components/ui/toast';

function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { resumes, setResumes, deleteResume, setLoading, loading } = useResumeStore();
  const mounted = useMounted();

  // 删除确认弹窗
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (mounted) {
      loadResumes();
    }
  }, [mounted]);

  const loadResumes = async () => {
    setLoading(true);

    const response = await resumeApi.getAll();

    if (response.success && response.data) {
      setResumes(response.data);
    } else {
      toast.error(response.error || '加载简历列表失败');
    }

    setLoading(false);
  };

  const handleCreateResume = () => {
    router.push('/editor/new');
  };

  const handleEditResume = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    const response = await resumeApi.delete(deleteTarget.id);

    if (response.success) {
      deleteResume(deleteTarget.id);
      toast.success('简历已删除');
    } else {
      toast.error(response.error || '删除失败');
    }

    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleLogout = async () => {
    await logout();
    toast.info('已退出登录');
    // 强制刷新页面，确保 middleware 重新评估认证状态
    window.location.href = '/login';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50">
      {/* Header */}
      <header className="border-b border-white/40 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-flow">ResuForge AI</h1>
              <p className="text-sm text-slate-500 mt-1">欢迎回来，{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg transition bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">我的简历</h2>
            <p className="text-slate-500 mt-2">
              {resumes.length > 0 && (
                <span>共 {resumes.length} 份简历</span>
              )}
            </p>
          </div>
          <Button
            onClick={handleCreateResume}
            className="btn-flow text-white font-medium rounded-lg shadow-md shadow-blue-500/30"
          >
            + 创建新简历
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12" role="status" aria-label="加载中">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
            <p className="text-slate-500 mt-4">加载中...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16 card-flow rounded-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-3">还没有简历</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              创建你的第一份简历，让 AI 帮你优化内容，打造专业的求职形象
            </p>
            <Button
              onClick={handleCreateResume}
              className="btn-flow text-white font-medium rounded-lg shadow-md shadow-blue-500/30 px-8 py-3"
            >
              创建第一份简历
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="简历列表">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                role="listitem"
                className="card-flow rounded-2xl p-6 group flex flex-col"
              >
                {/* 卡片头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate group-hover:text-blue-600 transition">
                      {resume.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      更新于 {formatDateTime(resume.updated_at)}
                    </p>
                  </div>

                  {/* 模板标签 */}
                  {resume.template_id && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                      {resume.template_id}
                    </span>
                  )}
                </div>

                {/* 内容预览 (如果有) */}
                {(() => {
                  try {
                    const content =
                      typeof resume.content === 'string'
                        ? JSON.parse(resume.content)
                        : resume.content;
                    if (content?.personalInfo?.name) {
                      return (
                        <p className="text-sm text-slate-600 mb-4 truncate">
                          {content.personalInfo.name}
                          {content.personalInfo.email && ` · ${content.personalInfo.email}`}
                        </p>
                      );
                    }
                  } catch {}
                  return null;
                })()}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEditResume(resume.id)}
                    className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 hover:border-blue-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteClick(resume.id, resume.title)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg border border-red-100 hover:border-red-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`删除简历：${resume.title}`}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 删除确认弹窗 */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="确定要删除这份简历吗？"
        description={`"${deleteTarget?.title}" 删除后将无法恢复。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteConfirm}
        confirmVariant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}

export default withAuth(DashboardPage);
