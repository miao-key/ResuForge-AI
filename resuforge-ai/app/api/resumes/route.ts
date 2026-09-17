import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { authenticateRequest } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Get user's resumes
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
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
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, template_id, content } = body;

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
        user_id: userId,
        title,
        template_id: template_id || 'classic',
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
