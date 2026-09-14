import { ResumeContent } from '@/types';
import {
  ClassicTemplate,
  ModernTemplate,
  ProfessionalTemplate,
  CreativeTemplate,
  MinimalTemplate,
} from '@/components/templates';

interface ResumeRendererProps {
  content: ResumeContent;
  templateId: string;
  themeColor?: string;
}

export function ResumeRenderer({ content, templateId, themeColor }: ResumeRendererProps) {
  const theme = themeColor || '#0891b2';

  switch (templateId) {
    case 'modern':
      return <ModernTemplate content={content} themeColor={theme} />;
    case 'professional':
      return <ProfessionalTemplate content={content} themeColor={theme} />;
    case 'creative':
      return <CreativeTemplate content={content} />;
    case 'minimal':
      return <MinimalTemplate content={content} />;
    case 'classic':
    default:
      return <ClassicTemplate content={content} />;
  }
}
