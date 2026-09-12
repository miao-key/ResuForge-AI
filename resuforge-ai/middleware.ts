import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// 不需要认证的路径
const publicPaths = ['/login', '/register', '/'];

// 只允许未登录用户访问的路径
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 获取 token
  const token = request.cookies.get('auth-token')?.value;
  
  // 验证 token
  const user = token ? await verifyToken(token) : null;
  
  // 如果是公开路径，直接放行
  if (publicPaths.includes(pathname)) {
    // 如果已登录且访问登录/注册页，重定向到仪表板
    if (user && authPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // 如果未登录且访问受保护路径，重定向到登录页
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 已认证，放行
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
