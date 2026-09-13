import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import OpenAI from 'openai';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1',
});

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

const optimizePrompts = {
  summary: `你是一位专业的简历优化顾问。请优化以下个人简介，使其更专业、更有吸引力。要求：
- 突出核心技能和优势
- 使用动作动词
- 简洁有力，控制在 3-5 句话
- 保持真实性

待优化内容：`,

  experience: `你是一位专业的简历优化顾问。请优化以下工作经历描述，使其更专业、更有影响力。要求：
- 使用 STAR 原则（情境、任务、行动、结果）
- 量化成果（使用数字、百分比等）
- 突出个人贡献和价值
- 使用动作动词开头
- 每条不超过 2 行

待优化内容：`,

  project: `你是一位专业的简历优化顾问。请优化以下项目经历描述，使其更专业、更突出亮点。要求：
- 清晰说明项目背景和目标
- 突出技术难点和解决方案
- 量化项目成果和影响
- 强调个人角色和贡献
- 控制在 3-5 句话

待优化内容：`,
};

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
    const { content, type } = body;

    if (!content || !type) {
      return NextResponse.json(
        { success: false, error: '请提供内容和类型' },
        { status: 400 }
      );
    }

    if (!['summary', 'experience', 'project'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的优化类型' },
        { status: 400 }
      );
    }

    // Call Deepseek API
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: optimizePrompts[type as keyof typeof optimizePrompts] + content,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const optimizedContent = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        original: content,
        optimized: optimizedContent,
      },
    });
  } catch (error: any) {
    console.error('AI optimize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI 优化失败' },
      { status: 500 }
    );
  }
}
