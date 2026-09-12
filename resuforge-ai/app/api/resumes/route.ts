import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@/lib/db/supabase';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: '无效的 token' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Get user's resumes
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', payload.userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: resumes || [],
    });
  } catch (error: any) {
    console.error('Get resumes error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取简历列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: '无效的 token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: '请填写简历标题' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Create resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: payload.userId as string,
        title,
        content: JSON.stringify(content || {}),
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Create resume error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建简历失败' },
      { status: 500 }
    );
  }
}
