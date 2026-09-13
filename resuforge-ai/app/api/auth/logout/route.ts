import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: '登出成功',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '登出失败' },
      { status: 500 }
    );
  }
}
