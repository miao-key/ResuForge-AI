'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useResumeStore } from '@/store/resume';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResumeContent } from '@/types';

function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { currentResume, setCurrentResume } = useResumeStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ResumeContent>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
    },
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);

  const isNew = params.id === 'new';

  useEffect(() => {
    if (!isNew && params.id) {
      loadResume(params.id as string);
    }
  }, [params.id]);

  const loadResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      const result = await response.json();

      if (result.success) {
        setCurrentResume(result.data);
        setTitle(result.data.title);
        // Parse content if it's a string
        const parsedContent = typeof result.data.content === 'string'
          ? JSON.parse(result.data.content)
          : result.data.content;
        setContent(parsedContent || {
          personalInfo: { name: '', email: '', phone: '' },
          workExperience: [],
          education: [],
          skills: [],
          projects: [],
        });
      }
    } catch (error) {
      console.error('Load resume error:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isNew ? '/api/resumes' : `/api/resumes/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || '未命名简历',
          content,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (isNew) {
          router.push(`/editor/${result.data.id}`);
        } else {
          setCurrentResume(result.data);
        }
      }
    } catch (error) {
      console.error('Save resume error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptimize = async (type: string, originalContent: string, field?: string, index?: number) => {
    if (!originalContent.trim()) {
      alert('请先填写内容再进行优化');
      return;
    }

    setIsOptimizing(field || type);
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || ''}`,
        },
        body: JSON.stringify({
          content: originalContent,
          type,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.optimized) {
        const optimized = result.data.optimized;

        // 根据类型更新对应字段
        if (type === 'summary') {
          setContent({
            ...content,
            personalInfo: {
              ...content.personalInfo,
              summary: optimized,
            },
          });
        } else if (type === 'experience' && index !== undefined) {
          const newExperiences = [...content.workExperience];
          newExperiences[index] = {
            ...newExperiences[index],
            description: optimized,
          };
          setContent({ ...content, workExperience: newExperiences });
        } else if (type === 'project' && index !== undefined) {
          const newProjects = [...content.projects];
          newProjects[index] = {
            ...newProjects[index],
            description: optimized,
          };
          setContent({ ...content, projects: newProjects });
        }
      } else {
        alert(result.error || 'AI 优化失败');
      }
    } catch (error) {
      console.error('Optimize error:', error);
      alert('AI 优化失败，请稍后重试');
    } finally {
      setIsOptimizing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="border-slate-700 hover:bg-slate-800"
            >
              ← 返回
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简历标题"
              className="w-64 bg-slate-950/50 border-slate-700 text-slate-50"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              预览
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950"
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Editor */}
          <div className="space-y-6">
            {/* Personal Info */}
            <EditorSection title="个人信息">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">姓名</Label>
                  <Input
                    value={content.personalInfo?.name || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personalInfo: {
                          ...content.personalInfo,
                          name: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">邮箱</Label>
                  <Input
                    type="email"
                    value={content.personalInfo?.email || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personalInfo: {
                          ...content.personalInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">电话</Label>
                  <Input
                    value={content.personalInfo?.phone || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personalInfo: {
                          ...content.personalInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">地址</Label>
                  <Input
                    value={content.personalInfo?.location || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personalInfo: {
                          ...content.personalInfo,
                          location: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">个人网站</Label>
                  <Input
                    value={content.personalInfo?.website || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personalInfo: {
                          ...content.personalInfo,
                          website: e.target.value,
                        },
                      })
                    }
                    placeholder="https://"
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
              </div>
            </EditorSection>

            {/* Summary */}
            <EditorSection
              title="个人简介"
              onOptimize={() => handleOptimize('summary', content.personalInfo?.summary || '', 'summary')}
              isOptimizing={isOptimizing === 'summary'}
            >
              <Textarea
                value={content.personalInfo?.summary || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    personalInfo: {
                      ...content.personalInfo,
                      summary: e.target.value,
                    },
                  })
                }
                placeholder="用2-3句话介绍你的核心竞争力..."
                rows={4}
                className="bg-slate-950/50 border-slate-700 text-slate-50"
              />
            </EditorSection>

            {/* Work Experience */}
            <EditorSection title="工作经历">
              <div className="space-y-4">
                {content.workExperience.map((exp, index) => (
                  <WorkExperienceItem
                    key={exp.id}
                    experience={exp}
                    onChange={(updated) => {
                      const newExperiences = [...content.workExperience];
                      newExperiences[index] = updated;
                      setContent({ ...content, workExperience: newExperiences });
                    }}
                    onDelete={() => {
                      setContent({
                        ...content,
                        workExperience: content.workExperience.filter((_, i) => i !== index),
                      });
                    }}
                    onOptimize={() => handleOptimize('experience', exp.description, `work_${index}`, index)}
                    isOptimizing={isOptimizing === `work_${index}`}
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 w-full"
                  onClick={() =>
                    setContent({
                      ...content,
                      workExperience: [
                        ...content.workExperience,
                        {
                          id: `work_${Date.now()}`,
                          company: '',
                          position: '',
                          startDate: '',
                          endDate: '',
                          current: false,
                          description: '',
                        },
                      ],
                    })
                  }
                >
                  + 添加工作经历
                </Button>
              </div>
            </EditorSection>

            {/* Education */}
            <EditorSection title="教育背景">
              <div className="space-y-4">
                {content.education.map((edu, index) => (
                  <EducationItem
                    key={edu.id}
                    education={edu}
                    onChange={(updated) => {
                      const newEducation = [...content.education];
                      newEducation[index] = updated;
                      setContent({ ...content, education: newEducation });
                    }}
                    onDelete={() => {
                      setContent({
                        ...content,
                        education: content.education.filter((_, i) => i !== index),
                      });
                    }}
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 w-full"
                  onClick={() =>
                    setContent({
                      ...content,
                      education: [
                        ...content.education,
                        {
                          id: `edu_${Date.now()}`,
                          school: '',
                          degree: '',
                          major: '',
                          startDate: '',
                          endDate: '',
                        },
                      ],
                    })
                  }
                >
                  + 添加教育背景
                </Button>
              </div>
            </EditorSection>

            {/* Projects */}
            <EditorSection title="项目经历">
              <div className="space-y-4">
                {content.projects.map((project, index) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onChange={(updated) => {
                      const newProjects = [...content.projects];
                      newProjects[index] = updated;
                      setContent({ ...content, projects: newProjects });
                    }}
                    onDelete={() => {
                      setContent({
                        ...content,
                        projects: content.projects.filter((_, i) => i !== index),
                      });
                    }}
                    onOptimize={() => handleOptimize('project', project.description, `project_${index}`, index)}
                    isOptimizing={isOptimizing === `project_${index}`}
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 w-full"
                  onClick={() =>
                    setContent({
                      ...content,
                      projects: [
                        ...content.projects,
                        {
                          id: `proj_${Date.now()}`,
                          name: '',
                          role: '',
                          startDate: '',
                          endDate: '',
                          description: '',
                          technologies: [],
                        },
                      ],
                    })
                  }
                >
                  + 添加项目经历
                </Button>
              </div>
            </EditorSection>

            {/* Skills */}
            <EditorSection title="技能">
              <div className="space-y-4">
                {content.skills.map((skill, index) => (
                  <SkillItem
                    key={skill.id}
                    skill={skill}
                    onChange={(updated) => {
                      const newSkills = [...content.skills];
                      newSkills[index] = updated;
                      setContent({ ...content, skills: newSkills });
                    }}
                    onDelete={() => {
                      setContent({
                        ...content,
                        skills: content.skills.filter((_, i) => i !== index),
                      });
                    }}
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 w-full"
                  onClick={() =>
                    setContent({
                      ...content,
                      skills: [
                        ...content.skills,
                        {
                          id: `skill_${Date.now()}`,
                          category: '',
                          items: [],
                        },
                      ],
                    })
                  }
                >
                  + 添加技能分类
                </Button>
              </div>
            </EditorSection>
          </div>

          {/* Right Panel: Preview */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 sticky top-8 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-50 mb-6">
              实时预览
            </h3>
            <ResumePreview content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 子组件 ====================

function WorkExperienceItem({
  experience,
  onChange,
  onDelete,
  onOptimize,
  isOptimizing,
}: {
  experience: any;
  onChange: (exp: any) => void;
  onDelete: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">公司名称</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
        >
          ×
        </Button>
      </div>
      <Input
        value={experience.company}
        onChange={(e) => onChange({ ...experience, company: e.target.value })}
        placeholder="例：字节跳动"
        className="bg-slate-950/50 border-slate-700 text-slate-50"
      />
      
      <div>
        <Label className="text-slate-300">职位</Label>
        <Input
          value={experience.position}
          onChange={(e) => onChange({ ...experience, position: e.target.value })}
          placeholder="例：前端工程师"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-300">开始日期</Label>
          <Input
            type="month"
            value={experience.startDate}
            onChange={(e) => onChange({ ...experience, startDate: e.target.value })}
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
        <div>
          <Label className="text-slate-300">结束日期</Label>
          <Input
            type="month"
            value={experience.endDate}
            onChange={(e) => onChange({ ...experience, endDate: e.target.value })}
            disabled={experience.current}
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={experience.current}
          onChange={(e) => onChange({ ...experience, current: e.target.checked })}
          className="rounded border-slate-700"
        />
        <Label className="text-slate-300 text-sm">目前就职</Label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-slate-300">工作描述</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOptimize}
            disabled={isOptimizing}
            className="h-6 text-xs text-cyan-400 hover:text-cyan-300"
          >
            {isOptimizing ? '优化中...' : '✨ AI 优化'}
          </Button>
        </div>
        <Textarea
          value={experience.description}
          onChange={(e) => onChange({ ...experience, description: e.target.value })}
          placeholder="描述你的工作职责和成就..."
          rows={4}
          className="bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>
    </div>
  );
}

function EducationItem({
  education,
  onChange,
  onDelete,
}: {
  education: any;
  onChange: (edu: any) => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">学校名称</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
        >
          ×
        </Button>
      </div>
      <Input
        value={education.school}
        onChange={(e) => onChange({ ...education, school: e.target.value })}
        placeholder="例：清华大学"
        className="bg-slate-950/50 border-slate-700 text-slate-50"
      />
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-300">学历</Label>
          <Input
            value={education.degree}
            onChange={(e) => onChange({ ...education, degree: e.target.value })}
            placeholder="例：本科"
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
        <div>
          <Label className="text-slate-300">专业</Label>
          <Input
            value={education.major}
            onChange={(e) => onChange({ ...education, major: e.target.value })}
            placeholder="例：计算机科学"
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-300">开始日期</Label>
          <Input
            type="month"
            value={education.startDate}
            onChange={(e) => onChange({ ...education, startDate: e.target.value })}
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
        <div>
          <Label className="text-slate-300">结束日期</Label>
          <Input
            type="month"
            value={education.endDate}
            onChange={(e) => onChange({ ...education, endDate: e.target.value })}
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
      </div>

      <div>
        <Label className="text-slate-300">GPA（可选）</Label>
        <Input
          value={education.gpa || ''}
          onChange={(e) => onChange({ ...education, gpa: e.target.value })}
          placeholder="例：3.8/4.0"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>
    </div>
  );
}

function ProjectItem({
  project,
  onChange,
  onDelete,
  onOptimize,
  isOptimizing,
}: {
  project: any;
  onChange: (proj: any) => void;
  onDelete: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">项目名称</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
        >
          ×
        </Button>
      </div>
      <Input
        value={project.name}
        onChange={(e) => onChange({ ...project, name: e.target.value })}
        placeholder="例：电商平台前端重构"
        className="bg-slate-950/50 border-slate-700 text-slate-50"
      />
      
      <div>
        <Label className="text-slate-300">项目角色</Label>
        <Input
          value={project.role}
          onChange={(e) => onChange({ ...project, role: e.target.value })}
          placeholder="例：前端负责人"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-300">开始日期</Label>
          <Input
            type="month"
            value={project.startDate}
            onChange={(e) => onChange({ ...project, startDate: e.target.value })}
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
        <div>
          <Label className="text-slate-300">结束日期</Label>
          <Input
            type="month"
            value={project.endDate}
            onChange={(e) => onChange({ ...project, endDate: e.target.value })}
            className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
          />
        </div>
      </div>

      <div>
        <Label className="text-slate-300">技术栈</Label>
        <Input
          value={project.technologies.join(', ')}
          onChange={(e) =>
            onChange({
              ...project,
              technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            })
          }
          placeholder="例：React, TypeScript, Next.js（用逗号分隔）"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>

      <div>
        <Label className="text-slate-300">项目链接（可选）</Label>
        <Input
          value={project.url || ''}
          onChange={(e) => onChange({ ...project, url: e.target.value })}
          placeholder="https://"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-slate-300">项目描述</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOptimize}
            disabled={isOptimizing}
            className="h-6 text-xs text-cyan-400 hover:text-cyan-300"
          >
            {isOptimizing ? '优化中...' : '✨ AI 优化'}
          </Button>
        </div>
        <Textarea
          value={project.description}
          onChange={(e) => onChange({ ...project, description: e.target.value })}
          placeholder="描述项目背景、你的贡献和成果..."
          rows={4}
          className="bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>
    </div>
  );
}

function SkillItem({
  skill,
  onChange,
  onDelete,
}: {
  skill: any;
  onChange: (skill: any) => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">技能分类</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
        >
          ×
        </Button>
      </div>
      <Input
        value={skill.category}
        onChange={(e) => onChange({ ...skill, category: e.target.value })}
        placeholder="例：编程语言"
        className="bg-slate-950/50 border-slate-700 text-slate-50"
      />
      
      <div>
        <Label className="text-slate-300">技能列表</Label>
        <Input
          value={skill.items.join(', ')}
          onChange={(e) =>
            onChange({
              ...skill,
              items: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            })
          }
          placeholder="例：JavaScript, TypeScript, Python（用逗号分隔）"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>
    </div>
  );
}

function ResumePreview({ content }: { content: ResumeContent }) {
  return (
    <div className="bg-white text-slate-900 p-8 rounded-lg shadow-lg min-h-[600px]">
      {/* Personal Info */}
      <div className="text-center mb-6 pb-6 border-b-2 border-slate-200">
        <h1 className="text-3xl font-bold mb-2">
          {content.personalInfo?.name || '姓名'}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600">
          {content.personalInfo?.email && (
            <span>{content.personalInfo.email}</span>
          )}
          {content.personalInfo?.phone && (
            <span>•</span>
          )}
          {content.personalInfo?.phone && (
            <span>{content.personalInfo.phone}</span>
          )}
          {content.personalInfo?.location && (
            <span>•</span>
          )}
          {content.personalInfo?.location && (
            <span>{content.personalInfo.location}</span>
          )}
        </div>
        {content.personalInfo?.website && (
          <div className="mt-2 text-sm text-cyan-600">
            {content.personalInfo.website}
          </div>
        )}
      </div>

      {/* Summary */}
      {content.personalInfo?.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-800">个人简介</h2>
          <p className="text-slate-700 leading-relaxed">
            {content.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {content.workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-800">工作经历</h2>
          <div className="space-y-4">
            {content.workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-slate-800">{exp.company}</h3>
                    <p className="text-sm text-slate-600">{exp.position}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {exp.startDate} - {exp.current ? '至今' : exp.endDate}
                  </p>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {content.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-800">项目经历</h2>
          <div className="space-y-4">
            {content.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-slate-800">{proj.name}</h3>
                    <p className="text-sm text-slate-600">{proj.role}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {proj.startDate} - {proj.endDate}
                  </p>
                </div>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {proj.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-800">教育背景</h2>
          <div className="space-y-3">
            {content.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-800">{edu.school}</h3>
                  <p className="text-sm text-slate-600">
                    {edu.degree} · {edu.major}
                    {edu.gpa && ` · GPA: ${edu.gpa}`}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {edu.startDate} - {edu.endDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {content.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-slate-800">专业技能</h2>
          <div className="space-y-2">
            {content.skills.map((skill) => (
              <div key={skill.id}>
                <span className="font-semibold text-slate-700">
                  {skill.category}:
                </span>{' '}
                <span className="text-slate-600">{skill.items.join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
        </div>
      </div>
    </div>
  );
}

function EditorSection({
  title,
  children,
  onOptimize,
  isOptimizing,
}: {
  title: string;
  children: React.ReactNode;
  onOptimize?: () => void;
  isOptimizing?: boolean;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        {onOptimize && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOptimize}
            disabled={isOptimizing}
            className="border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/50"
          >
            {isOptimizing ? '优化中...' : '✨ AI 优化'}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

export default withAuth(EditorPage);
