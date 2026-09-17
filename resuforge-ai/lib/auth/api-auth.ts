import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOKEN_NAME = 'auth-token';

/**
 * 从请求中提取 token，优先级：
 * 1. Authorization: Bearer <token>
 * 2. Cookie: auth-token=<token>
 */
export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  // 1. 尝试 Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // 2. 回退到 Cookie
  try {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * 验证请求中的 token 并返回用户 ID
 * @returns userId 或 null（未认证）
 */
export async function authenticateRequest(request: NextRequest): Promise<string | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  return payload.userId;
}
