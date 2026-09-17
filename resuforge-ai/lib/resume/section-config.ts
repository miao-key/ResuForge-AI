import type { BuiltInSectionConfig, BuiltInSectionType, SectionField, SectionFieldDefinition } from '@/types';

// ==================== 内置菜单配置 ====================

// 教育经历默认字段
const educationDefaultFields: SectionFieldDefinition[] = [
  { key: 'school', label: '学校名称', type: 'text', required: true, order: 1, placeholder: '例如：清华大学' },
  { key: 'major', label: '专业', type: 'text', required: true, order: 2, placeholder: '例如：计算机科学与技术' },
  { key: 'startDate', label: '开始时间', type: 'year', order: 3 },
  { key: 'endDate', label: '结束时间', type: 'year', order: 4 },
  { key: 'description', label: '经历描述', type: 'textarea', required: true, order: 5, placeholder: '描述在校期间的学习、项目、实践等内容...' },
];

// 工作经历默认字段（去掉"目前在职"，因为日期本身足以表达在任状态）
const workExperienceBaseFields: SectionFieldDefinition[] = [
  { key: 'company', label: '公司名称', type: 'text', required: true, order: 1, placeholder: '例如：字节跳动' },
  { key: 'position', label: '职位名称', type: 'text', required: true, order: 2, placeholder: '例如：前端工程师' },
  { key: 'department', label: '所在部门', type: 'text', order: 3, placeholder: '例如：电商部门（选填）' },
  { key: 'location', label: '工作地点', type: 'text', order: 4, placeholder: '例如：北京市' },
  { key: 'startDate', label: '开始时间', type: 'date', order: 5 },
  { key: 'endDate', label: '结束时间', type: 'date', order: 6 },
  { key: 'description', label: '工作描述', type: 'textarea', required: true, order: 7, placeholder: '描述工作职责和成就...' },
];

// 项目经历默认字段
const projectsDefaultFields: SectionFieldDefinition[] = [
  { key: 'name', label: '项目名称', type: 'text', required: true, order: 1, placeholder: '例如：电商平台重构' },
  { key: 'role', label: '项目角色', type: 'text', order: 2, placeholder: '例如：前端负责人、独立开发' },
  { key: 'startDate', label: '开始时间', type: 'date', order: 3 },
  { key: 'endDate', label: '结束时间', type: 'date', order: 4 },
  { key: 'technologies', label: '技术栈', type: 'text', order: 5, placeholder: '例如：React, TypeScript（逗号分隔）' },
  { key: 'url', label: '项目链接', type: 'url', order: 6, placeholder: 'https://github.com/...' },
  { key: 'description', label: '项目描述', type: 'textarea', required: true, order: 7, placeholder: '描述项目背景、职责和成就...' },
];

// 专业技能默认字段
const skillsDefaultFields: SectionFieldDefinition[] = [
  { key: 'description', label: '技能描述', type: 'textarea', required: true, order: 1, placeholder: '例如：熟练掌握 React、TypeScript，具备 2 年大型 SaaS 前端架构经验，能够独立完成从需求评审到上线的全流程...' },
];

// 个人优势默认字段
const advantagesDefaultFields: SectionFieldDefinition[] = [
  { key: 'description', label: '优势描述', type: 'textarea', required: true, order: 1, placeholder: '详细描述你的优势...' },
];

// 社交主页默认字段
const socialLinksDefaultFields: SectionFieldDefinition[] = [
  { key: 'platform', label: '平台名称', type: 'text', required: true, order: 1, placeholder: '例如：GitHub' },
  { key: 'url', label: '链接地址', type: 'url', required: true, order: 2, placeholder: 'https://github.com/username' },
];

// 内置菜单配置映射
export const BUILT_IN_SECTIONS: Record<BuiltInSectionType, BuiltInSectionConfig> = {
  education: {
    type: 'education',
    title: '教育经历',
    icon: '🎓',
    defaultFields: educationDefaultFields,
  },
  workExperience: {
    type: 'workExperience',
    title: '工作经历',
    icon: '💼',
    defaultFields: workExperienceBaseFields,
  },
  internship: {
    type: 'internship',
    title: '实习经历',
    icon: '🌱',
    defaultFields: workExperienceBaseFields,
  },
  projects: {
    type: 'projects',
    title: '项目经历',
    icon: '🚀',
    defaultFields: projectsDefaultFields,
  },
  skills: {
    type: 'skills',
    title: '专业技能',
    icon: '🛠️',
    defaultFields: skillsDefaultFields,
  },
  advantages: {
    type: 'advantages',
    title: '个人优势',
    icon: '⭐',
    defaultFields: advantagesDefaultFields,
  },
  socialLinks: {
    type: 'socialLinks',
    title: '社交主页',
    icon: '🔗',
    defaultFields: socialLinksDefaultFields,
  },
  personalInfo: {
    type: 'personalInfo',
    title: '个人信息',
    icon: '👤',
    defaultFields: [],
  },
};

// 默认显示的菜单（按顺序）
export const DEFAULT_SECTIONS: BuiltInSectionType[] = [
  'education',
  'skills',
  'projects',
  'socialLinks',
  'advantages',
];

// 所有可用的内置菜单
export const AVAILABLE_BUILT_IN_SECTIONS: BuiltInSectionType[] = [
  'education',
  'workExperience',
  'internship',
  'projects',
  'skills',
  'advantages',
  'socialLinks',
];

// 获取菜单配置
export function getSectionConfig(type: BuiltInSectionType): BuiltInSectionConfig {
  return BUILT_IN_SECTIONS[type];
}

// 用户添加后可删除的内置菜单类型（用户主动添加实例化的预设，允许再次删除）
export const REMOVABLE_BUILT_IN_SECTIONS: BuiltInSectionType[] = [
  'workExperience',
  'internship',
];

// 创建新的内置菜单（带默认模板）
// 当 deletable 为 true 时，即使用户是手动添加的，也可以再次删除（如：工作/实习经历）
export function createBuiltInSection(
  type: BuiltInSectionType,
  order: number,
  deletable: boolean = false,
) {
  const config = BUILT_IN_SECTIONS[type];
  // 创建时自动添加一个默认模板条目
  const defaultItem = createSectionItem(type);
  return {
    id: `${type}_${Date.now()}`,
    title: config.title,
    icon: config.icon,
    order,
    items: [defaultItem],
    isBuiltIn: true,
    deletable,
  };
}

// 创建新的条目（根据菜单类型初始化默认字段）
export function createSectionItem(sectionType: BuiltInSectionType) {
  const config = BUILT_IN_SECTIONS[sectionType];
  const fields: SectionField[] = config.defaultFields.map(field => ({
    ...field,
    value: '',
  }));
  
  return {
    id: `${sectionType}_item_${Date.now()}`,
    fields,
    customFields: [],
  };
}

// 获取菜单的中文分类名称
export function getSectionItemLabel(sectionType: BuiltInSectionType): string {
  const labels: Record<BuiltInSectionType, string> = {
    education: '教育',
    workExperience: '工作',
    internship: '实习',
    projects: '项目',
    skills: '技能',
    advantages: '优势',
    socialLinks: '链接',
    personalInfo: '个人信息',
  };
  return labels[sectionType] || '条目';
}
