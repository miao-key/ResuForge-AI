import OpenAI from 'openai';

// 初始化 Deepseek 客户端
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1',
});

export interface OptimizeOptions {
  content: string;
  type: 'work_experience' | 'project' | 'skill' | 'summary' | 'education';
  context?: string;
}

export interface OptimizeResult {
  optimized: string;
  suggestions: string[];
}

/**
 * 优化简历内容
 */
export async function optimizeContent(
  options: OptimizeOptions
): Promise<OptimizeResult> {
  const { content, type, context } = options;

  // 根据类型生成不同的提示词
  const prompts = {
    work_experience: `你是一位专业的简历优化师。请优化以下工作经历描述，使其更加专业、具体和有说服力。

要求：
1. 使用动作词开头（如：负责、主导、实现、优化等）
2. 量化成果（如：提升X%、节省X小时、服务X用户等）
3. 突出技术栈和方法论
4. 保持简洁专业的语言

原始内容：
${content}

${context ? `补充信息：${context}` : ''}

请以 JSON 格式返回：
{
  "optimized": "优化后的内容",
  "suggestions": ["建议1", "建议2", "建议3"]
}`,

    project: `你是一位专业的简历优化师。请优化以下项目经历描述，使其更加清晰和有吸引力。

要求：
1. 清晰说明项目背景和目标
2. 突出你的角色和贡献
3. 量化项目成果和影响力
4. 展示使用的技术栈

原始内容：
${content}

${context ? `补充信息：${context}` : ''}

请以 JSON 格式返回：
{
  "optimized": "优化后的内容",
  "suggestions": ["建议1", "建议2", "建议3"]
}`,

    skill: `你是一位专业的简历优化师。请优化以下技能描述，使其更加结构化和专业。

要求：
1. 按技能类别分组（如：编程语言、框架、工具等）
2. 突出核心技能
3. 添加熟练程度说明
4. 保持简洁

原始内容：
${content}

${context ? `补充信息：${context}` : ''}

请以 JSON 格式返回：
{
  "optimized": "优化后的内容",
  "suggestions": ["建议1", "建议2", "建议3"]
}`,

    summary: `你是一位专业的简历优化师。请优化以下个人简介，使其更加吸引人。

要求：
1. 突出核心竞争力
2. 展示职业目标
3. 保持2-3句话的简洁度
4. 使用专业自信的语气

原始内容：
${content}

${context ? `补充信息：${context}` : ''}

请以 JSON 格式返回：
{
  "optimized": "优化后的内容",
  "suggestions": ["建议1", "建议2", "建议3"]
}`,

    education: `你是一位专业的简历优化师。请优化以下教育经历描述。

要求：
1. 突出相关课程和成绩
2. 添加获奖或荣誉
3. 强调与目标职位相关的经历
4. 保持简洁专业

原始内容：
${content}

${context ? `补充信息：${context}` : ''}

请以 JSON 格式返回：
{
  "optimized": "优化后的内容",
  "suggestions": ["建议1", "建议2", "建议3"]
}`,
  };

  try {
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompts[type],
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    // 提取响应内容
    const responseText = completion.choices[0]?.message?.content || '';

    // 解析 JSON 响应
    const result = JSON.parse(responseText);

    return {
      optimized: result.optimized,
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error('AI optimization error:', error);
    throw new Error('AI 优化失败，请稍后重试');
  }
}

/**
 * 分析简历并给出改进建议
 */
export async function analyzeResume(resumeContent: any): Promise<{
  score: number;
  strengths: string[];
  improvements: string[];
}> {
  const prompt = `你是一位专业的简历分析师。请分析以下简历，给出评分和改进建议。

简历内容：
${JSON.stringify(resumeContent, null, 2)}

请从以下维度分析：
1. 内容完整性（是否包含必要的模块）
2. 描述质量（是否清晰、专业、有说服力）
3. 量化成果（是否有数据支撑）
4. 格式规范（是否结构清晰）

请以 JSON 格式返回：
{
  "score": 85,
  "strengths": ["优点1", "优点2", "优点3"],
  "improvements": ["改进建议1", "改进建议2", "改进建议3"]
}`;

  try {
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    const result = JSON.parse(responseText);

    return {
      score: result.score || 0,
      strengths: result.strengths || [],
      improvements: result.improvements || [],
    };
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error('简历分析失败，请稍后重试');
  }
}
