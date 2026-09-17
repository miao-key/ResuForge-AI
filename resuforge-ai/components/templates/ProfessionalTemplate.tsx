import React from 'react';
import { ResumeContent } from '@/types';

interface ProfessionalTemplateProps {
  content: ResumeContent;
  themeColor?: string;
}

export const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ content, themeColor = '#0f172a' }) => {
  return (
    <div className="bg-white text-slate-900 p-10" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header */}
      <div className="mb-6 pb-5 border-b-4" style={{ borderBottomColor: themeColor }}>
        <h1 className="text-5xl font-bold mb-2 text-slate-900">
          {content.personalInfo?.name || '姓名'}
        </h1>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-600 mt-4">
          {content.personalInfo?.email && (
            <div>✉ {content.personalInfo.email}</div>
          )}
          {content.personalInfo?.phone && (
            <div>☎ {content.personalInfo.phone}</div>
          )}
          {content.personalInfo?.location && (
            <div>⚲ {content.personalInfo.location}</div>
          )}
          {content.personalInfo?.website && (
            <div>⌘ {content.personalInfo.website}</div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - 1/3 width */}
        <div className="col-span-1 space-y-6">
          {/* Skills */}
          {(content.skills?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 pb-1 border-b-2 border-slate-300">
                技能专长
              </h2>
              <div className="space-y-3">
                {content.skills?.map((skill) => (
                  <div key={skill.id}>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      {skill.category}
                    </p>
                    <div className="space-y-1">
                      {skill.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          {item}
                        </div>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 pb-1 border-b-2 border-slate-300">
                教育背景
              </h2>
              <div className="space-y-4">
                {content.education?.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-bold text-sm text-slate-800">{edu.school}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{edu.degree}</p>
                    <p className="text-xs text-slate-600">{edu.major}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - 2/3 width */}
        <div className="col-span-2 space-y-6">
          {/* Professional Summary */}
          {content.personalInfo?.summary && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 pb-1 border-b-2 border-slate-300">
                职业概述
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                {content.personalInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {(content.workExperience?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 pb-1 border-b-2 border-slate-300">
                工作经历
              </h2>
              <div className="space-y-5">
                {content.workExperience?.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{exp.position}</h3>
                        <p className="text-sm text-slate-700 font-medium">{exp.company}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {exp.startDate} - {exp.current ? '至今' : exp.endDate}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {(content.projects?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 pb-1 border-b-2 border-slate-300">
                项目经历
              </h2>
              <div className="space-y-5">
                {content.projects?.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{proj.name}</h3>
                        <p className="text-sm text-slate-700 font-medium">{proj.role}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {proj.startDate} - {proj.endDate}
                      </p>
                    </div>
                    {(proj.technologies?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {proj.technologies?.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {proj.description}
                    </p>
                    {proj.url && (
                      <p className="text-xs text-slate-500 mt-1">
                        {proj.url}
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
