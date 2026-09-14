import { ResumeContent } from '@/types';

interface MinimalTemplateProps {
  content: ResumeContent;
}

export function MinimalTemplate({ content }: MinimalTemplateProps) {
  return (
    <div className="bg-white text-slate-900 p-12 shadow-lg" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header - Ultra Minimal */}
      <div className="mb-10">
        <h1 className="text-5xl font-light mb-2 tracking-tight text-slate-900">
          {content.personalInfo?.name || '姓名'}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600 font-light">
          {content.personalInfo?.email && <span>{content.personalInfo.email}</span>}
          {content.personalInfo?.phone && <span>·</span>}
          {content.personalInfo?.phone && <span>{content.personalInfo.phone}</span>}
          {content.personalInfo?.location && <span>·</span>}
          {content.personalInfo?.location && <span>{content.personalInfo.location}</span>}
        </div>
        {content.personalInfo?.website && (
          <div className="mt-1 text-sm text-slate-500">{content.personalInfo.website}</div>
        )}
      </div>

      {/* Summary */}
      {content.personalInfo?.summary && (
        <div className="mb-10">
          <p className="text-slate-700 leading-relaxed font-light">
            {content.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {content.workExperience.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-6 text-slate-400 uppercase tracking-widest">
            Experience
          </h2>
          <div className="space-y-6">
            {content.workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-slate-900">{exp.position}</h3>
                  <span className="text-xs text-slate-500 font-light">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-light mb-2">{exp.company}</p>
                <p className="text-sm text-slate-700 leading-relaxed font-light whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {content.projects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-6 text-slate-400 uppercase tracking-widest">
            Projects
          </h2>
          <div className="space-y-6">
            {content.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-slate-900">{proj.name}</h3>
                  <span className="text-xs text-slate-500 font-light">
                    {proj.startDate} – {proj.endDate}
                  </span>
                </div>
                {proj.technologies.length > 0 && (
                  <p className="text-xs text-slate-500 font-light mb-2">
                    {proj.technologies.join(' · ')}
                  </p>
                )}
                <p className="text-sm text-slate-700 leading-relaxed font-light whitespace-pre-line">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-6 text-slate-400 uppercase tracking-widest">
            Education
          </h2>
          <div className="space-y-4">
            {content.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-slate-900">{edu.school}</h3>
                  <span className="text-xs text-slate-500 font-light">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-light">
                  {edu.degree}, {edu.major}
                  {edu.gpa && ` · ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {content.skills.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold mb-6 text-slate-400 uppercase tracking-widest">
            Skills
          </h2>
          <div className="space-y-1">
            {content.skills.map((skill) => (
              <p key={skill.id} className="text-sm font-light">
                <span className="text-slate-900">{skill.category}</span>
                <span className="text-slate-600"> · {skill.items.join(' · ')}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
