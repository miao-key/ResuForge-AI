import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="bg-[#1E293B]/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-[#38BDF8]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3H3V9H9V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3H15V9H21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 15H15V21H21V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15H3V21H9V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
              </svg>
              <h1 className="text-xl font-bold text-[#F8FAFC]">ResuForge AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-[#38BDF8] transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-medium px-6 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-[#F97316]/20"
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
          <h1 className="text-5xl md:text-7xl font-bold text-[#F8FAFC] mb-6 leading-tight">
            智能简历生成平台
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#22D3EE] mt-2">
              让求职更高效
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
            使用先进的 AI 技术优化简历内容，提升专业度与吸引力
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/register"
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-medium px-10 py-4 rounded-lg transition-all text-lg hover:shadow-2xl hover:shadow-[#F97316]/30 hover:scale-105"
            >
              开始使用 →
            </Link>
            <Link
              href="/login"
              className="bg-[#1E293B] border border-slate-600 hover:border-[#38BDF8] hover:bg-[#1E293B]/80 text-[#F8FAFC] font-medium px-10 py-4 rounded-lg transition-all text-lg hover:shadow-xl hover:shadow-[#38BDF8]/10"
            >
              立即登录
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <div className="group bg-[#1E293B] border border-slate-700 hover:border-[#38BDF8]/50 rounded-xl p-8 transition-all hover:shadow-xl hover:shadow-[#38BDF8]/10 hover:-translate-y-1 text-center">
              <div className="w-14 h-14 rounded-lg bg-[#38BDF8]/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-[#38BDF8]/20 transition-colors">
                <svg className="w-7 h-7 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">
                AI 智能优化
              </h3>
              <p className="text-slate-400 leading-relaxed">
                基于 Deepseek AI 的智能优化引擎，自动提升简历专业度与竞争力
              </p>
            </div>

            <div className="group bg-[#1E293B] border border-slate-700 hover:border-[#22D3EE]/50 rounded-xl p-8 transition-all hover:shadow-xl hover:shadow-[#22D3EE]/10 hover:-translate-y-1 text-center">
              <div className="w-14 h-14 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-[#22D3EE]/20 transition-colors">
                <svg className="w-7 h-7 text-[#22D3EE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">
                实时编辑预览
              </h3>
              <p className="text-slate-400 leading-relaxed">
                直观的编辑器界面，实时预览排版效果，所见即所得
              </p>
            </div>

            <div className="group bg-[#1E293B] border border-slate-700 hover:border-[#F97316]/50 rounded-xl p-8 transition-all hover:shadow-xl hover:shadow-[#F97316]/10 hover:-translate-y-1 text-center">
              <div className="w-14 h-14 rounded-lg bg-[#F97316]/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-[#F97316]/20 transition-colors">
                <svg className="w-7 h-7 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">
                多模板支持
              </h3>
              <p className="text-slate-400 leading-relaxed">
                多种专业简历模板，适配不同行业和职位需求
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B]/50 backdrop-blur-sm border-t border-slate-700/50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            © 2026 ResuForge AI. Powered by Deepseek AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
