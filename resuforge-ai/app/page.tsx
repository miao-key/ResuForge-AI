import Link from 'next/link';
import { FlowBackground } from '@/components/layout/flow-background';

export default function HomePage() {
  return (
    <>
      <FlowBackground />
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3H3V9H9V3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 3H15V9H21V3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 15H15V21H21V15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 15H3V21H9V15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  ResuForge AI
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="btn-flow text-white font-medium px-6 py-2.5 rounded-lg shadow-md shadow-blue-500/30"
                >
                  注册
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-soft" />
              <span className="text-sm text-blue-700 font-medium">
                基于 Deepseek AI 的下一代简历工具
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              智能简历生成平台
              <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mt-2">
                让求职更高效
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
              使用先进的 AI 技术优化简历内容，提升专业度与吸引力
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/register"
                className="btn-flow text-white font-medium px-10 py-4 rounded-lg text-lg"
              >
                开始使用
              </Link>
              <Link
                href="/login"
                className="bg-white/80 backdrop-blur border border-blue-100 hover:border-blue-300 hover:bg-white text-slate-800 font-medium px-10 py-4 rounded-lg transition-all text-lg hover:shadow-xl hover:shadow-blue-500/10"
              >
                立即登录
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <div className="card-flow rounded-2xl p-8 text-center group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  AI 智能优化
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  基于 Deepseek AI 的智能优化引擎，自动提升简历专业度与竞争力
                </p>
              </div>

              <div className="card-flow rounded-2xl p-8 text-center group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  实时编辑预览
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  直观的编辑器界面，实时预览排版效果，所见即所得
                </p>
              </div>

              <div className="card-flow rounded-2xl p-8 text-center group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  多模板支持
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  多种专业简历模板，适配不同行业和职位需求
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-24 border-t border-white/40 bg-white/40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-slate-500 text-sm">
              © 2026 ResuForge AI. Powered by Deepseek AI.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
