// ==================== 用户相关类型 ====================
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ==================== 简历相关类型 ====================
export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id?: string;
  content: ResumeContent | string;
  created_at: string;
  updated_at: string;
}

// 简历内容结构 - 支持自定义菜单
export interface ResumeContent {
  personalInfo: PersonalInfo;
  // 菜单顺序和配置（新格式）
  sections?: Section[];
  // 旧版兼容属性（用于数据迁移）
  education?: Education[];
  workExperience?: WorkExperience[];
  projects?: Project[];
  skills?: Skill[];
}

// 个人信息
export interface PersonalInfo {
  name: string;           // 姓名
  gender?: string;        // 性别
  age?: string;           // 年龄
  phone: string;          // 电话
  email: string;          // 邮箱
  jobIntention?: string;  // 求职意向
  location?: string;       // 所在地
  website?: string;        // 个人网站
  summary?: string;        // 个人简介
}

// 菜单/章节
export interface Section {
  id: string;
  title: string;                    // 菜单标题（如：教育经历、专业技能）
  icon?: string;                    // 菜单图标
  order: number;                    // 排序顺序
  items: SectionItem[];             // 该菜单下的条目列表
  isBuiltIn: boolean;               // 是否为内置菜单（控制字段模板和图标）
  deletable?: boolean;              // 是否允许用户删除（默认：自定义 true，内置 false）
}

// 内置菜单类型
export type BuiltInSectionType = 
  | 'personalInfo'      // 个人信息（特殊处理）
  | 'education'         // 教育经历
  | 'workExperience'    // 工作经历
  | 'internship'        // 实习经历
  | 'projects'          // 项目经历
  | 'skills'            // 专业技能
  | 'advantages'        // 个人优势
  | 'socialLinks';      // 社交主页

// 内置菜单配置
export interface BuiltInSectionConfig {
  type: BuiltInSectionType;
  title: string;
  icon: string;
  defaultFields: SectionFieldDefinition[];  // 默认字段定义
}

// 菜单条目（一个条目对应简历中的一行/一段）
export interface SectionItem {
  id: string;
  // 固定字段（每个内置菜单有预设的固定字段）
  fields: SectionField[];
  // 自定义字段（用户可以添加自己的字段）
  customFields: CustomField[];
}

// 字段
export interface SectionField {
  key: string;           // 字段标识
  label: string;         // 字段标签（如：学校名称、职位名称）
  value?: string;        // 字段值（编辑时填充）
  type: 'text' | 'textarea' | 'date' | 'year' | 'url';  // 字段类型
  required?: boolean;     // 是否必填
  placeholder?: string;   // 占位符提示
  order: number;         // 排序顺序
  bold?: boolean;         // 是否加粗
  textAlign?: 'left' | 'center' | 'right'; // 文本对齐
}

// 字段定义（用于配置，不含 value）
export type SectionFieldDefinition = Omit<SectionField, 'value'>;

// 自定义字段
export interface CustomField {
  id: string;
  label: string;         // 字段标签
  value: string;         // 字段值
  type: 'text' | 'textarea' | 'date' | 'year' | 'url';
  order: number;
  bold?: boolean;         // 是否加粗
  textAlign?: 'left' | 'center' | 'right'; // 文本对齐
}

// ==================== 旧版兼容类型（保留用于数据迁移）====================
// @deprecated 使用新的 sections 结构替代
export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

// ==================== 模板相关类型 ====================
export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
}

// ==================== AI 相关类型 ====================
export interface AIOptimizeRequest {
  content: string;
  type: 'work_experience' | 'project' | 'summary' | 'education' | 'skills' | 'analyze';
  context?: {
    targetRole?: string;
    targetIndustry?: string;
  };
}

export interface AIOptimizeResponse {
  optimizedContent: string;
  suggestions: string[];
  type: string;
}

export interface AIAnalysisResponse {
  type: 'analyze';
  analysis: {
    completeness?: number;
    quality?: number;
    quantification?: number;
    formatting?: number;
    keywords?: number;
    overall?: number;
    strengths?: string[];
    improvements?: string[];
    rawText?: string;
  };
}

// ==================== API 响应类型 ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
