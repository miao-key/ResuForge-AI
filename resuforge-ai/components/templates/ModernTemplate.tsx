import React from 'react';
import { ResumeContent } from '@/types';
import { RichTextView } from '@/components/resume/RichTextView';

interface ModernTemplateProps {
  content: ResumeContent;
  themeColor?: string;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ 
  content,
  themeColor = '#0891b2' // cyan-600
}) => {
  return (
    <div className="bg-white text-slate-900 min-h-[297mm] w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header with colored sidebar */}
      <div className="flex">
        {/* Left Sidebar */}
        <div 
          className="w-1/3 p-8 text-white"
          style={{ backgroundColor: themeColor }}
        >
          {/* Profile Section */}
          <div className="mb-8">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl font-bold">
                {content.personalInfo?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-center">
              {content.personalInfo?.name || '姓名'}
            </h1>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 text-sm mb-8">
            <h3 className="font-semibold text-lg mb-3 uppercase tracking-wide">联系方式</h3>
            {content.personalInfo?.email && (
              <div className="flex items-start gap-2">
                <span className="mt-0.5">📧</span>
                <span className="break-all">{content.personalInfo.email}</span>
              </div>
            )}
            {content.personalInfo?.phone && (
              <div className="flex items-start gap-2">
                <span>📱</span>
                <span>{content.personalInfo.phone}</span>
              </div>
            )}
            {content.personalInfo?.location && (
              <div className="flex items-start gap-2">
                <span>📍</span>
                <span>{content.personalInfo.location}</span>
              </div>
            )}
            {content.personalInfo?.website && (
              <div className="flex items-start gap-2">
                <span>🌐</span>
                <span className="break-all">{content.personalInfo.website}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {(content.skills?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-3 uppercase tracking-wide">专业技能</h3>
              <div className="space-y-3">
                {content.skills?.map((skill) => (
                  <div key={skill.id}>
                    <p className="font-medium mb-1">{skill.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {skill.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white/20 px-2 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(content.education?.length ?? 0) > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 uppercase tracking-wide">教育背景</h3>
              <div className="space-y-3 text-sm">
                {content.education?.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-semibold">{edu.school}</p>
                    <p className="text-white/90">{edu.degree}</p>
                    <p className="text-white/90">{edu.major}</p>
                    <p className="text-white/80 text-xs mt-1">
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.gpa && (
                      <p className="text-white/80 text-xs">GPA: {edu.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="w-2/3 p-8">
          {/* Summary */}
          {content.personalInfo?.summary && (
            <div className="mb-8">
              <h2 
                className="text-2xl font-bold mb-3 pb-2 border-b-2"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                个人简介
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {content.personalInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {(content.workExperience?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h2 
                className="text-2xl font-bold mb-4 pb-2 border-b-2"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                工作经历
              </h2>
              <div className="space-y-5">
                {content.workExperience?.map((exp) => (
                  <div key={exp.id} className="relative pl-6">
                    <div 
                      className="absolute left-0 top-2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{exp.position}</h3>
                        <p className="font-medium text-slate-600">{exp.company}</p>
                      </div>
                      <p className="text-sm text-slate-500 whitespace-nowrap ml-4">
                        {exp.startDate} - {exp.current ? '至今' : exp.endDate}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed mt-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {(content.projects?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h2 
                className="text-2xl font-bold mb-4 pb-2 border-b-2"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                项目经历
              </h2>
              <div className="space-y-5">
                {content.projects?.map((proj) => (
                  <div key={proj.id} className="relative pl-6">
                    <div 
                      className="absolute left-0 top-2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{proj.name}</h3>
                        <p className="font-medium text-slate-600">{proj.role}</p>
                      </div>
                      <p className="text-sm text-slate-500 whitespace-nowrap ml-4">
                        {proj.startDate} - {proj.endDate}
                      </p>
                    </div>
                    {(proj.technologies?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {proj.technologies?.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: `${themeColor}15`,
                              color: themeColor 
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.url && (
                      <p className="text-xs mt-1" style={{ color: themeColor }}>
                        🔗 {proj.url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
