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

export interface ResumeContent {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  summary?: string;
}

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
  type: 'work_experience' | 'project' | 'summary' | 'full_resume';
  context?: {
    targetRole?: string;
    targetIndustry?: string;
  };
}

export interface AIOptimizeResponse {
  optimizedContent: string;
  suggestions: string[];
}

// ==================== API 响应类型 ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
