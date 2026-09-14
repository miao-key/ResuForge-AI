import { ResumeContent } from '@/types';

interface ClassicTemplateProps {
  content: ResumeContent;
}

export function ClassicTemplate({ content }: ClassicTemplateProps) {
  return (
    <div className="bg-white text-slate-900 p-12 shadow-lg" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header - Personal Info */}
      <div className="text-center mb-8 pb-6 border-b-2 border-slate-800">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          {content.personalInfo?.name || '姓名'}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-700">
          {content.personalInfo?.email && (
            <span className="flex items-center gap-1">
              <span className="font-medium">邮箱:</span> {content.personalInfo.email}
            </span>
          )}
          {content.personalInfo?.phone && (
            <span>•</span>
          )}
          {content.personalInfo?.phone && (
            <span className="flex items-center gap-1">
              <span className="font-medium">电话:</span> {content.personalInfo.phone}
            </span>
          )}
          {content.personalInfo?.location && (
            <span>•</span>
          )}
          {content.personalInfo?.location && (
            <span className="flex items-center gap-1">
              <span className="font-medium">地址:</span> {content.personalInfo.location}
            </span>
          )}
        </div>
        {content.personalInfo?.website && (
          <div className="mt-2 text-sm text-blue-600 font-medium">
            {content.personalInfo.website}
          </div>
        )}
      </div>

      {/* Summary */}
      {content.personalInfo?.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-slate-800 uppercase tracking-wide border-b pb-2">
            个人简介
          </h2>
          <p className="text-slate-700 leading-relaxed text-justify">
            {content.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {content.workExperience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800 uppercase tracking-wide border-b pb-2">
            工作经历
          </h2>
          <div className="space-y-5">
            {content.workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-slate-800">{exp.company}</h3>
                  <span className="text-sm text-slate-600 font-medium">
                    {exp.startDate} - {exp.current ? '至今' : exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-semibold mb-2">{exp.position}</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {content.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800 uppercase tracking-wide border-b pb-2">
            项目经历
          </h2>
          <div className="space-y-5">
            {content.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-slate-800">{proj.name}</h3>
                  <span className="text-sm text-slate-600 font-medium">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-semibold mb-2">{proj.role}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {proj.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-200 text-slate-800 px-2 py-1 rounded font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800 uppercase tracking-wide border-b pb-2">
            教育背景
          </h2>
          <div className="space-y-4">
            {content.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-lg text-slate-800">{edu.school}</h3>
                  <span className="text-sm text-slate-600 font-medium">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  {edu.degree} · {edu.major}
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {content.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800 uppercase tracking-wide border-b pb-2">
            专业技能
          </h2>
          <div className="space-y-2">
            {content.skills.map((skill) => (
              <div key={skill.id} className="text-sm">
                <span className="font-bold text-slate-800">
                  {skill.category}:
                </span>{' '}
                <span className="text-slate-700">{skill.items.join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
