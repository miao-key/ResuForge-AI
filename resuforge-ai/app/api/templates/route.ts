import { NextResponse } from 'next/server';

/**
 * 获取所有模板
 * GET /api/templates
 */
export async function GET() {
  try {
    // 模拟模板数据（后续可以从数据库读取）
    const templates = [
      {
        id: 'modern-1',
        name: '现代简约',
        thumbnail: '/templates/modern-1.png',
        description: '简洁现代的设计，适合互联网行业',
        category: 'modern',
      },
      {
        id: 'classic-1',
        name: '经典商务',
        thumbnail: '/templates/classic-1.png',
        description: '传统商务风格，适合金融、咨询行业',
        category: 'classic',
      },
      {
        id: 'creative-1',
        name: '创意设计',
        thumbnail: '/templates/creative-1.png',
        description: '富有创意的布局，适合设计师、创意行业',
        category: 'creative',
      },
      {
        id: 'minimal-1',
        name: '极简主义',
        thumbnail: '/templates/minimal-1.png',
        description: '极简设计，突出内容本身',
        category: 'minimal',
      },
    ];

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { success: false, error: '获取模板列表失败' },
      { status: 500 }
    );
  }
}
