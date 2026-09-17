import { ResumeContent } from '@/types';
import { Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react';

interface CreativeTemplateProps {
  content: ResumeContent;
}

export default function CreativeTemplate({ content }: CreativeTemplateProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 text-slate-900 p-10 rounded-lg shadow-2xl min-h-[1000px] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl -z-10" />

      {/* Header with Gradient */}
      <div className="relative mb-8 pb-8 border-b-4 border-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/40 via-pink-100/40 to-blue-100/40 rounded-xl blur-xl -z-10" />
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          {content.personalInfo?.name || '姓名'}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {content.personalInfo?.email && (
            <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
              <Mail className="w-4 h-4 text-purple-500" />
              <span>{content.personalInfo.email}</span>
            </div>
          )}
          {content.personalInfo?.phone && (
            <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
              <Phone className="w-4 h-4 text-pink-500" />
              <span>{content.personalInfo.phone}</span>
            </div>
          )}
          {content.personalInfo?.location && (
            <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{content.personalInfo.location}</span>
            </div>
          )}
          {content.personalInfo?.website && (
            <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>{content.personalInfo.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary with Accent */}
      {content.personalInfo?.summary && (
        <div className="mb-8 relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
          <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            关于我
          </h2>
          <p className="text-slate-700 leading-relaxed pl-4 italic bg-white/60 p-4 rounded-lg shadow-sm">
            {content.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {(content.workExperience?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
            💼 工作经历
          </h2>
          <div className="space-y-6">
            {content.workExperience?.map((exp, index) => (
              <div 
                key={exp.id}
                className="relative pl-6 pb-6 border-l-2 border-blue-200 last:border-l-0 last:pb-0"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg" />
                
                <div className="bg-white/70 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{exp.company}</h3>
                      <p className="text-purple-600 font-medium">{exp.position}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exp.startDate} - {exp.current ? '至今' : exp.endDate}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {(content.projects?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            🚀 项目经历
          </h2>
          <div className="grid gap-5">
            {content.projects?.map((proj) => (
              <div 
                key={proj.id}
                className="bg-white/70 p-5 rounded-xl shadow-md border-l-4 border-pink-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">{proj.name}</h3>
                    <p className="text-pink-600 font-medium text-sm">{proj.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    <span>{proj.startDate} - {proj.endDate}</span>
                  </div>
                </div>
                
                {(proj.technologies?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {proj.technologies?.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-medium shadow-sm"
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
                  <a 
                    href={proj.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700 underline mt-2 inline-block"
                  >
                    查看项目 →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {(content.education?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
            🎓 教育背景
          </h2>
          <div className="space-y-4">
            {content.education?.map((edu) => (
              <div 
                key={edu.id}
                className="bg-white/70 p-5 rounded-xl shadow-md flex justify-between items-start hover:shadow-lg transition-shadow"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{edu.school}</h3>
                  <p className="text-green-600 font-medium">
                    {edu.degree} · {edu.major}
                    {edu.gpa && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        GPA: {edu.gpa}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{edu.startDate} - {edu.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {(content.skills?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
            ⚡ 专业技能
          </h2>
          <div className="grid gap-4">
            {content.skills?.map((skill) => (
              <div key={skill.id} className="bg-white/70 p-4 rounded-xl shadow-md">
                <span className="font-bold text-orange-600 text-sm block mb-2">
                  {skill.category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item, i) => (
                    <span
                      key={i}
                      className="text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-3 py-1.5 rounded-lg font-medium shadow-sm"
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
    </div>
  );
}
