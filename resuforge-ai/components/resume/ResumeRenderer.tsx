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
}

export function ResumeRenderer({ content, templateId }: ResumeRendererProps) {
  switch (templateId) {
    case 'modern':
      return <ModernTemplate content={content} />;
    case 'professional':
      return <ProfessionalTemplate content={content} />;
    case 'creative':
      return <CreativeTemplate content={content} />;
    case 'minimal':
      return <MinimalTemplate content={content} />;
    case 'classic':
    default:
      return <ClassicTemplate content={content} />;
  }
}
