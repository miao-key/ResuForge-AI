import { z } from 'zod';

// ==================== 个人信息 ====================
export const personalInfoSchema = z.object({
  name: z
    .string()
    .min(1, '请填写姓名')
    .max(50, '姓名长度不能超过 50 个字符'),
  email: z
    .string()
    .min(1, '请填写邮箱')
    .email('邮箱格式不正确')
    .max(100, '邮箱长度不能超过 100 个字符'),
  phone: z
    .string()
    .min(1, '请填写电话')
    .regex(/^[\d\-\+\s\(\)]+$/, '电话格式不正确')
    .max(30, '电话长度不能超过 30 个字符'),
  location: z
    .string()
    .max(100, '地址长度不能超过 100 个字符')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('网址格式不正确,以 http:// 或 https:// 开头')
    .max(200, '网址长度不能超过 200 个字符')
    .optional()
    .or(z.literal('')),
  summary: z
    .string()
    .max(1000, '个人简介不能超过 1000 字')
    .optional()
    .or(z.literal('')),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

// ==================== 教育经历 ====================
export const educationSchema = z
  .object({
    id: z.string(),
    school: z.string().min(1, '请填写学校名称').max(100, '学校名称不能超过 100 字符'),
    degree: z.string().min(1, '请填写学历').max(50, '学历长度不能超过 50 字符'),
    major: z.string().min(1, '请填写专业').max(50, '专业长度不能超过 50 字符'),
    startDate: z.string().min(1, '请选择开始日期'),
    endDate: z.string().min(1, '请选择结束日期'),
    gpa: z.string().max(20, 'GPA 长度不能超过 20 字符').optional().or(z.literal('')),
    description: z.string().max(500, '描述不能超过 500 字').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // 如果 endDate 不是"至今",则必须晚于 startDate
      if (!data.endDate || data.endDate === '至今') return true;
      return data.endDate >= data.startDate;
    },
    { message: '结束日期不能早于开始日期', path: ['endDate'] }
  );

export type EducationInput = z.infer<typeof educationSchema>;

// ==================== 工作经历 ====================
export const workExperienceSchema = z
  .object({
    id: z.string(),
    company: z.string().min(1, '请填写公司名称').max(100, '公司名称不能超过 100 字符'),
    position: z.string().min(1, '请填写职位').max(100, '职位长度不能超过 100 字符'),
    startDate: z.string().min(1, '请选择开始日期'),
    endDate: z.string(),
    current: z.boolean(),
    description: z.string().max(2000, '工作描述不能超过 2000 字').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // 如果不是"目前就职",则 endDate 必须 >= startDate
      if (data.current) return true;
      if (!data.endDate) return false;
      return data.endDate >= data.startDate;
    },
    { message: '结束日期不能早于开始日期，或请勾选"目前就职"', path: ['endDate'] }
  );

export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;

// ==================== 项目经历 ====================
export const projectSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, '请填写项目名称').max(100, '项目名称不能超过 100 字符'),
    role: z.string().min(1, '请填写项目角色').max(50, '角色长度不能超过 50 字符'),
    startDate: z.string().min(1, '请选择开始日期'),
    endDate: z.string().min(1, '请选择结束日期'),
    description: z.string().min(1, '请填写项目描述').max(2000, '描述不能超过 2000 字'),
    technologies: z.array(z.string()).max(20, '技术栈最多 20 项'),
    url: z
      .string()
      .url('项目链接格式不正确')
      .max(200, '链接长度不能超过 200 字符')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    { message: '结束日期不能早于开始日期', path: ['endDate'] }
  );

export type ProjectInput = z.infer<typeof projectSchema>;

// ==================== 技能 ====================
export const skillSchema = z.object({
  id: z.string(),
  category: z.string().min(1, '请填写技能分类').max(50, '分类不能超过 50 字符'),
  items: z
    .array(z.string().min(1, '技能不能为空'))
    .min(1, '请至少填写一项技能')
    .max(30, '最多 30 项技能'),
});

export type SkillInput = z.infer<typeof skillSchema>;

// ==================== 简历完整内容 ====================
export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  education: z.array(educationSchema),
  workExperience: z.array(workExperienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
});

export type ResumeContentInput = z.infer<typeof resumeContentSchema>;

// ==================== 简历顶层对象 ====================
export const resumeSchema = z.object({
  title: z
    .string()
    .min(1, '请填写简历标题')
    .max(100, '标题长度不能超过 100 字符'),
  templateId: z.string().optional(),
  content: resumeContentSchema,
});

export type ResumeInput = z.infer<typeof resumeSchema>;

// ==================== 验证函数 ====================

/**
 * 校验简历内容,返回结构化的错误信息
 */
export function validateResumeContent(content: unknown) {
  return resumeContentSchema.safeParse(content);
}

/**
 * 校验简历顶层对象
 */
export function validateResume(data: unknown) {
  return resumeSchema.safeParse(data);
}

/**
 * 收集所有错误信息为扁平数组(用户友好)
 */
export function flattenZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
