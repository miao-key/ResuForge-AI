import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { supabase, TABLES } from '@/lib/db/client';

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
    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .select('id, email, name, avatar, created_at')
      .eq('id', currentUser.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
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
