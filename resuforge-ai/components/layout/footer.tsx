'use client';

export function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-white/80">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              ResuForge AI
            </h3>
            <p className="text-sm text-slate-500">
              AI 驱动的智能简历生成平台，让求职更简单。
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">产品</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/templates"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  模板库
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  功能特性
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  定价方案
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">资源</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blog"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  博客
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  帮助中心
                </a>
              </li>
              <li>
                <a
                  href="/api"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  API 文档
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">关于</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  关于我们
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  隐私政策
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-slate-500 hover:text-blue-600 transition"
                >
                  服务条款
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-100 text-center">
          <p className="text-sm text-slate-400">
            © 2026 ResuForge AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
