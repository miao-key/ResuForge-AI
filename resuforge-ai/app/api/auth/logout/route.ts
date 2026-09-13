import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

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
