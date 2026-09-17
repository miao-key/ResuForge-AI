import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase';
import { authenticateRequest } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { id } = await params;

    // Get resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, template_id, content } = body;

    const supabase = createClient();

    // Update resume
    const updateData: any = {
      title,
      content: JSON.stringify(content || {}),
      updated_at: new Date().toISOString(),
    };

    // Only update template_id if provided
    if (template_id !== undefined) {
      updateData.template_id = template_id;
    }

    const { data: resume, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createClient();

    // Delete resume
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

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
