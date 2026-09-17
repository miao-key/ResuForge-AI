import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { supabase, TABLES } from '@/lib/db/client';

// 强制动态路由，确保每次都重新执行
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    // 从数据库获取完整用户信息
    let user;
    let error;
    try {
      const result = await supabase
        .from(TABLES.USERS)
        .select('id, email, name, avatar, created_at')
        .eq('id', currentUser.userId)
        .single();
      user = result.data;
      error = result.error;
    } catch (dbError) {
      console.error('Supabase query error:', dbError);
      // 数据库查询失败时，仍然返回 token 中的基本信息
      return NextResponse.json({
        success: true,
        data: {
          id: currentUser.userId,
          email: currentUser.email,
          name: currentUser.email.split('@')[0],
          avatar: null,
          createdAt: new Date().toISOString(),
        },
      });
    }

    if (error || !user) {
      console.warn('User not found in DB:', currentUser.userId, 'error:', error);
      // 用户在数据库中不存在时，也返回基本信息（避免 404）
      return NextResponse.json({
        success: true,
        data: {
          id: currentUser.userId,
          email: currentUser.email,
          name: currentUser.email.split('@')[0],
          avatar: null,
          createdAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
