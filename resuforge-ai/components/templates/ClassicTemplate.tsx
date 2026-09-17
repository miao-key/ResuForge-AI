import { ResumeContent } from '@/types';
import { sectionHasContent, getFieldValue, getCustomFieldValue } from '@/lib/resume/content-transform';

interface ClassicTemplateProps {
  content: ResumeContent;
  themeColor?: string;
}

export function ClassicTemplate({ content, themeColor }: ClassicTemplateProps) {
  // 检测是否为新格式
  const isNewFormat = content.sections && content.sections.length > 0;
  
  // 渲染个人信息头部
  const renderPersonalInfo = () => (
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
        {content.personalInfo?.phone && <span>•</span>}
        {content.personalInfo?.phone && (
          <span className="flex items-center gap-1">
            <span className="font-medium">电话:</span> {content.personalInfo.phone}
          </span>
        )}
        {content.personalInfo?.location && <span>•</span>}
        {content.personalInfo?.location && (
          <span className="flex items-center gap-1">
            <span className="font-medium">地址:</span> {content.personalInfo.location}
          </span>
        )}
        {content.personalInfo?.gender && (
          <>
            <span>•</span>
            <span>{content.personalInfo.gender}</span>
          </>
        )}
        {content.personalInfo?.age && (
          <>
            <span>•</span>
            <span>{content.personalInfo.age}</span>
          </>
        )}
      </div>
      {content.personalInfo?.jobIntention && (
        <div className="mt-2 text-sm text-slate-600">
          求职意向：{content.personalInfo.jobIntention}
        </div>
      )}
      {content.personalInfo?.website && (
        <div className="mt-2 text-sm text-blue-600 font-medium">
          {content.personalInfo.website}
        </div>
      )}
    </div>
  );

  // 渲染新格式的菜单
  const renderSections = () => {
    if (!isNewFormat) return null;

    return content.sections?.map(section => {
      if (!sectionHasContent(section)) return null;

      return (
        <div key={section.id} className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800 uppercase tracking-wide border-b pb-2">
            {section.icon && <span className="mr-2">{section.icon}</span>}
            {section.title}
          </h2>
          <div className="space-y-5">
            {section.items.map(item => {
              const fields = item.fields;
              const customFields = item.customFields;

              // 根据菜单类型渲染不同内容
              if (section.title === '教育经历') {
                const school = getFieldValue(item, 'school');
                const degree = getFieldValue(item, 'degree');
                const major = getFieldValue(item, 'major');
                const startDate = getFieldValue(item, 'startDate');
                const endDate = getFieldValue(item, 'endDate');
                const gpa = getFieldValue(item, 'gpa');
                const courses = getFieldValue(item, 'courses');
                const awards = getFieldValue(item, 'awards');
                const description = getFieldValue(item, 'description');

                if (!school && !degree && !major) return null;

                return (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-lg text-slate-800">{school}</h3>
                      <span className="text-sm text-slate-600 font-medium">
                        {startDate} - {endDate || '至今'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-semibold">
                      {degree && <span>{degree}</span>}
                      {major && <span> · {major}</span>}
                      {gpa && <span> · GPA: {gpa}</span>}
                    </p>
                    {courses && (
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="font-medium">主修课程：</span>{courses}
                      </p>
                    )}
                    {awards && (
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="font-medium">获奖情况：</span>{awards}
                      </p>
                    )}
                    {description && (
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    )}
                    {/* 渲染自定义字段 */}
                    {customFields.length > 0 && customFields.map(cf => (
                      cf.value && (
                        <p key={cf.id} className="text-sm text-slate-600 mt-1">
                          <span className="font-medium">{cf.label}：</span>{cf.value}
                        </p>
                      )
                    ))}
                  </div>
                );
              }

              if (section.title === '工作经历') {
                const company = getFieldValue(item, 'company');
                const position = getFieldValue(item, 'position');
                const startDate = getFieldValue(item, 'startDate');
                const endDate = getFieldValue(item, 'endDate');
                const current = getFieldValue(item, 'current');
                const description = getFieldValue(item, 'description');

                if (!company && !position) return null;

                return (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-lg text-slate-800">{company}</h3>
                      <span className="text-sm text-slate-600 font-medium">
                        {startDate} - {current === 'true' || current === '是' ? '至今' : endDate}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">{position}</p>
                    {description && (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    )}
                    {customFields.length > 0 && customFields.map(cf => (
                      cf.value && (
                        <p key={cf.id} className="text-sm text-slate-600 mt-1">
                          <span className="font-medium">{cf.label}：</span>{cf.value}
                        </p>
                      )
                    ))}
                  </div>
                );
              }

              if (section.title === '项目经历') {
                const name = getFieldValue(item, 'name');
                const role = getFieldValue(item, 'role');
                const startDate = getFieldValue(item, 'startDate');
                const endDate = getFieldValue(item, 'endDate');
                const technologies = getFieldValue(item, 'technologies');
                const url = getFieldValue(item, 'url');
                const description = getFieldValue(item, 'description');

                if (!name) return null;

                const techList = technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : [];

                return (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-lg text-slate-800">
                        {name}
                        {url && (
                          <span className="text-sm font-normal text-blue-600 ml-2">
                            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                          </span>
                        )}
                      </h3>
                      <span className="text-sm text-slate-600 font-medium">
                        {startDate} - {endDate || '至今'}
                      </span>
                    </div>
                    {role && <p className="text-sm text-slate-600 font-semibold mb-2">{role}</p>}
                    {techList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {techList.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-200 text-slate-800 px-2 py-1 rounded font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {description && (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    )}
                    {customFields.length > 0 && customFields.map(cf => (
                      cf.value && (
                        <p key={cf.id} className="text-sm text-slate-600 mt-1">
                          <span className="font-medium">{cf.label}：</span>{cf.value}
                        </p>
                      )
                    ))}
                  </div>
                );
              }

              if (section.title === '专业技能') {
                const category = getFieldValue(item, 'category');
                const items = getFieldValue(item, 'items');

                if (!category && !items) return null;

                const itemsList = items ? items.split(',').map(t => t.trim()).filter(Boolean) : [];

                return (
                  <div key={item.id} className="text-sm">
                    {category && (
                      <span className="font-bold text-slate-800">{category}: </span>
                    )}
                    <span className="text-slate-700">
                      {itemsList.join(' · ')}
                    </span>
                    {customFields.length > 0 && customFields.map(cf => (
                      cf.value && (
                        <span key={cf.id} className="text-slate-700 ml-2">
                          · {cf.value}
                        </span>
                      )
                    ))}
                  </div>
                );
              }

              // 自定义菜单渲染
              return (
                <div key={item.id} className="text-sm">
                  {customFields.map(cf => (
                    cf.value && (
                      <p key={cf.id} className="text-slate-700">
                        <span className="font-medium text-slate-800">{cf.label}：</span>{cf.value}
                      </p>
                    )
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white text-slate-900 p-12 shadow-lg" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header - Personal Info */}
      {renderPersonalInfo()}

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

      {/* 新格式菜单渲染 */}
      {isNewFormat && renderSections()}

      {/* 旧格式兼容渲染（如果有数据） */}
      {!isNewFormat && (
        <>
          {/* Work Experience */}
          {content.workExperience && content.workExperience.length > 0 && (
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
          {content.projects && content.projects.length > 0 && (
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
                    {proj.technologies && proj.technologies.length > 0 && (
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
          {content.education && content.education.length > 0 && (
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
          {content.skills && content.skills.length > 0 && (
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
        </>
      )}
    </div>
  );
}
