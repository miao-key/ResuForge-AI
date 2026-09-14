export { ClassicTemplate } from './ClassicTemplate';
export { ModernTemplate } from './ModernTemplate';
export { ProfessionalTemplate } from './ProfessionalTemplate';
export { default as CreativeTemplate } from './CreativeTemplate';
export { MinimalTemplate } from './MinimalTemplate';

export const TEMPLATES = [
  {
    id: 'classic',
    name: '经典模板',
    description: '传统专业，适合各类职位',
    thumbnail: '📄',
  },
  {
    id: 'modern',
    name: '现代模板',
    description: '简洁现代，突出关键信息',
    thumbnail: '🎨',
  },
  {
    id: 'professional',
    name: '专业模板',
    description: '商务风格，适合高级职位',
    thumbnail: '💼',
  },
  {
    id: 'creative',
    name: '创意模板',
    description: '设计感强，适合创意行业',
    thumbnail: '✨',
  },
  {
    id: 'minimal',
    name: '极简模板',
    description: '极简风格，内容为王',
    thumbnail: '⚪',
  },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];
