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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', payload.userId)
      .single();

    if (error || !resume) {
      return NextResponse.json(
        { success: false, error: '简历不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Get resume error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取简历失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supabase = createClient();

    // Update resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .update({
        title,
        content: JSON.stringify(content || {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', payload.userId)
      .select('*')
      .single();

    if (error || !resume) {
      return NextResponse.json(
        { success: false, error: '简历不存在或更新失败' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error('Update resume error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新简历失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete resume
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', params.id)
      .eq('user_id', payload.userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '简历已删除',
    });
  } catch (error: any) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除简历失败' },
      { status: 500 }
    );
  }
}
