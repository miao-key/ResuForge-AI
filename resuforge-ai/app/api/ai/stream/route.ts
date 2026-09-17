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

// Prompt 模板库
const optimizePrompts = {
  summary: `你是一位专业的简历优化顾问。请优化以下个人简介，使其更专业、更有吸引力。要求：
- 突出核心技能和优势
- 使用动作动词
- 简洁有力，控制在 3-5 句话
- 保持真实性
- 强调可量化的成果

待优化内容：`,

  experience: `你是一位专业的简历优化顾问。请优化以下工作经历描述，使其更专业、更有影响力。要求：
- 使用 STAR 原则（情境、任务、行动、结果）
- 量化成果（使用数字、百分比等）
- 突出个人贡献和价值
- 使用动作动词开头
- 每条不超过 2 行
- 突出技术栈和方法论

待优化内容：`,

  project: `你是一位专业的简历优化顾问。请优化以下项目经历描述，使其更专业、更突出亮点。要求：
- 清晰说明项目背景和目标
- 突出技术难点和解决方案
- 量化项目成果和影响
- 强调个人角色和贡献
- 控制在 3-5 句话
- 使用 STAR 法则

待优化内容：`,

  education: `你是一位专业的简历优化顾问。请优化以下教育经历描述，使其更专业。要求：
- 突出相关课程和成绩
- 添加 GPA 或排名（如有亮点）
- 强调与目标职位相关的经历
- 突出学术成就和荣誉
- 保持简洁专业，1-2 句话

待优化内容：`,

  skills: `你是一位专业的简历优化顾问。基于以下简历内容和目标岗位，推荐相关的技能关键词。要求：
- 分类列出（如：编程语言、框架、工具、方法论等）
- 每类 3-5 个核心技能
- 优先选择招聘需求中常见技能
- 使用专业的技能名称

简历内容：`,

  custom: `你是一位专业的简历优化顾问。请优化以下自定义菜单的描述内容，使其更专业、更有吸引力。要求：
- 突出关键亮点和个人贡献
- 使用 STAR 原则（情境、任务、行动、结果）
- 量化成果（使用数字、百分比等）
- 使用动作动词开头
- 简洁有力，控制在 3-5 句话
- 保留原始事实，避免编造

待优化内容：`,

  analyze: `你是一位专业的简历分析师。请对以下简历进行全面分析，给出评分和改进建议。要求：
- 从以下维度评分（每项 1-100 分）：
  1. 内容完整性（是否包含所有必要模块）
  2. 描述质量（是否清晰、专业、有说服力）
  3. 量化成果（是否有数据支撑）
  4. 格式规范（是否结构清晰）
  5. 关键词匹配（是否匹配目标岗位）
- 找出简历的 3 个亮点
- 提出 3 条具体改进建议

简历内容：`,
};

/**
 * 流式输出 API
 * 使用 ReadableStream 实现打字机效果
 */
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

    const validTypes = ['summary', 'experience', 'project', 'education', 'skills', 'custom', 'analyze'];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的优化类型' },
        { status: 400 }
      );
    }

    const promptTemplate = optimizePrompts[type as keyof typeof optimizePrompts];
    // 自定义菜单：把 section 标题作为上下文注入 prompt
    const extraContext = (type === 'custom' && body?.sectionTitle)
      ? `\n\n菜单名称：${body.sectionTitle}\n`
      : '';
    const fullPrompt = promptTemplate + extraContext + '\n\n' + content;

    // 创建流式响应
    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'user',
                content: fullPrompt,
              },
            ],
            max_tokens: type === 'analyze' ? 2048 : 1024,
            temperature: 0.7,
            stream: true, // 启用流式输出
          });

          // 处理流式响应
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              // 发送 SSE 格式的数据
              const data = JSON.stringify({
                type: 'chunk',
                content: delta,
                fullContent: fullContent,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // 发送完成信号
          const finishData = JSON.stringify({
            type: 'done',
            content: fullContent,
            analysisType: type,
          });
          controller.enqueue(encoder.encode(`data: ${finishData}\n\n`));
          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error.message || '流式输出失败',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI stream error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI 优化失败' },
      { status: 500 }
    );
  }
}
