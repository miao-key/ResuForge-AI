import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="bg-[#1E293B] border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#F8FAFC]">ResuForge AI</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-[#F8FAFC] transition"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-medium px-6 py-2.5 rounded-lg transition"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#F8FAFC] mb-6">
            智能简历生成平台
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl">
            使用 AI 技术优化你的简历内容，让求职更高效
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-medium px-8 py-3.5 rounded-lg transition text-lg"
            >
              开始使用
            </Link>
            <Link
              href="/login"
              className="bg-[#1E293B] border border-slate-600 hover:border-[#38BDF8] text-[#F8FAFC] font-medium px-8 py-3.5 rounded-lg transition text-lg"
            >
              立即登录
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                AI 智能优化
              </h3>
              <p className="text-slate-400">
                基于 Claude AI 的智能优化引擎，提升简历专业度
              </p>
            </div>

            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                实时编辑
              </h3>
              <p className="text-slate-400">
                直观的编辑器，实时预览，所见即所得
              </p>
            </div>

            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                多模板支持
              </h3>
              <p className="text-slate-400">
                多种专业简历模板，适配不同行业和职位
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] border-t border-slate-700 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-400 text-sm">
            © 2026 ResuForge AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
