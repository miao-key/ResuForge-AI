'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { resumeAPI, aiAPI } from '@/lib/api';
import { useResumeStore } from '@/store/resume';
import { ResumeContent } from '@/types';
import Link from 'next/link';

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { currentResume, setCurrentResume, addResume, updateResume } = useResumeStore();
  
  const [title, setTitle] = useState('未命名简历');
  const [content, setContent] = useState<ResumeContent>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
  });
  
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const isNewResume = !params.id;

  useEffect(() => {
    if (!isNewResume) {
      loadResume();
    }
  }, [params.id]);

  const loadResume = async () => {
    try {
      const response = await resumeAPI.get(params.id as string);
      if (response.success) {
        setCurrentResume(response.data);
        setTitle(response.data.title);
        setContent(typeof response.data.content === 'string' 
          ? JSON.parse(response.data.content) 
          : response.data.content
        );
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
      alert('加载简历失败');
      router.push('/dashboard');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (isNewResume) {
        const response = await resumeAPI.create(title, content);
        if (response.success) {
          addResume(response.data);
          router.push(`/editor/${response.data.id}`);
        }
      } else {
        const response = await resumeAPI.update(params.id as string, title, content);
        if (response.success) {
          updateResume(params.id as string, response.data);
        }
      }
    } catch (error) {
      console.error('Failed to save resume:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleOptimize = async (field: string, fieldContent: string, type: 'summary' | 'experience' | 'project') => {
    try {
      setOptimizing(true);
      setSelectedField(field);

      const response = await aiAPI.optimize(fieldContent, type);
      
      if (response.success) {
        // Update the content with optimized text
        if (field === 'summary') {
          setContent(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              summary: response.data.optimized,
            },
          }));
        }
        alert('优化成功！');
      }
    } catch (error) {
      console.error('Failed to optimize:', error);
      alert('优化失败，请重试');
    } finally {
      setOptimizing(false);
      setSelectedField(null);
    }
  };

  const addEducation = () => {
    setContent(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: '',
          degree: '',
          major: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    }));
  };

  const addExperience = () => {
    setContent(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          current: false,
        },
      ],
    }));
  };

  const addProject = () => {
    setContent(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: '',
          description: '',
          technologies: [],
          startDate: '',
          endDate: '',
          url: '',
        },
      ],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="bg-[#1E293B] border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-[#F8FAFC] transition"
              >
                ← 返回
              </Link>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition"
                placeholder="简历标题"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">
                {saving ? '保存中...' : ''}
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#F97316] hover:bg-[#F97316]/90 disabled:bg-[#F97316]/50 text-white font-medium px-6 py-2.5 rounded-lg transition"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Personal Info */}
          <section className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">个人信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  value={content.personalInfo.name}
                  onChange={(e) =>
                    setContent(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, name: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition"
                  placeholder="张三"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={content.personalInfo.email}
                  onChange={(e) =>
                    setContent(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  电话
                </label>
                <input
                  type="tel"
                  value={content.personalInfo.phone}
                  onChange={(e) =>
                    setContent(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition"
                  placeholder="138-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  所在地
                </label>
                <input
                  type="text"
                  value={content.personalInfo.location}
                  onChange={(e) =>
                    setContent(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition"
                  placeholder="北京市"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  个人简介
                </label>
                <button
                  onClick={() => handleOptimize('summary', content.personalInfo.summary, 'summary')}
                  disabled={optimizing || !content.personalInfo.summary}
                  className="text-sm text-[#38BDF8] hover:text-[#38BDF8]/80 disabled:text-slate-600 transition"
                >
                  {optimizing && selectedField === 'summary' ? 'AI 优化中...' : '✨ AI 优化'}
                </button>
              </div>
              <textarea
                value={content.personalInfo.summary}
                onChange={(e) =>
                  setContent(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, summary: e.target.value },
                  }))
                }
                rows={4}
                className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition resize-none"
                placeholder="简要介绍你的背景、技能和职业目标..."
              />
            </div>
          </section>

          {/* Education */}
          <section className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F8FAFC]">教育经历</h2>
              <button
                onClick={addEducation}
                className="text-[#38BDF8] hover:text-[#38BDF8]/80 transition text-sm"
              >
                + 添加
              </button>
            </div>
            <div className="space-y-4">
              {content.education.length === 0 ? (
                <p className="text-slate-400 text-sm">暂无教育经历</p>
              ) : (
                content.education.map((edu, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const newEducation = [...content.education];
                          newEducation[index].school = e.target.value;
                          setContent(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                        placeholder="学校名称"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...content.education];
                          newEducation[index].degree = e.target.value;
                          setContent(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                        placeholder="学位（如：本科、硕士）"
                      />
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => {
                          const newEducation = [...content.education];
                          newEducation[index].major = e.target.value;
                          setContent(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                        placeholder="专业"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => {
                            const newEducation = [...content.education];
                            newEducation[index].startDate = e.target.value;
                            setContent(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="flex-1 bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                          placeholder="2018-09"
                        />
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => {
                            const newEducation = [...content.education];
                            newEducation[index].endDate = e.target.value;
                            setContent(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="flex-1 bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                          placeholder="2022-06"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newEducation = content.education.filter((_, i) => i !== index);
                        setContent(prev => ({ ...prev, education: newEducation }));
                      }}
                      className="text-red-400 hover:text-red-300 transition text-sm mt-2"
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Experience */}
          <section className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F8FAFC]">工作经历</h2>
              <button
                onClick={addExperience}
                className="text-[#38BDF8] hover:text-[#38BDF8]/80 transition text-sm"
              >
                + 添加
              </button>
            </div>
            <div className="space-y-4">
              {content.experience.length === 0 ? (
                <p className="text-slate-400 text-sm">暂无工作经历</p>
              ) : (
                content.experience.map((exp, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const newExperience = [...content.experience];
                          newExperience[index].company = e.target.value;
                          setContent(prev => ({ ...prev, experience: newExperience }));
                        }}
                        className="bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                        placeholder="公司名称"
                      />
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => {
                          const newExperience = [...content.experience];
                          newExperience[index].position = e.target.value;
                          setContent(prev => ({ ...prev, experience: newExperience }));
                        }}
                        className="bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                        placeholder="职位"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExperience = [...content.experience];
                            newExperience[index].startDate = e.target.value;
                            setContent(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="flex-1 bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                          placeholder="2020-01"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => {
                            const newExperience = [...content.experience];
                            newExperience[index].endDate = e.target.value;
                            setContent(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="flex-1 bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition"
                          placeholder="至今"
                        />
                      </div>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExperience = [...content.experience];
                        newExperience[index].description = e.target.value;
                        setContent(prev => ({ ...prev, experience: newExperience }));
                      }}
                      rows={3}
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition resize-none"
                      placeholder="描述你的工作职责和成就..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleOptimize(`exp-${index}`, exp.description, 'experience')}
                        disabled={optimizing || !exp.description}
                        className="text-sm text-[#38BDF8] hover:text-[#38BDF8]/80 disabled:text-slate-600 transition"
                      >
                        {optimizing && selectedField === `exp-${index}` ? 'AI 优化中...' : '✨ AI 优化'}
                      </button>
                      <button
                        onClick={() => {
                          const newExperience = content.experience.filter((_, i) => i !== index);
                          setContent(prev => ({ ...prev, experience: newExperience }));
                        }}
                        className="text-red-400 hover:text-red-300 transition text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Projects */}
          <section className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F8FAFC]">项目经历</h2>
              <button
                onClick={addProject}
                className="text-[#38BDF8] hover:text-[#38BDF8]/80 transition text-sm"
              >
                + 添加
              </button>
            </div>
            <div className="space-y-4">
              {content.projects.length === 0 ? (
                <p className="text-slate-400 text-sm">暂无项目经历</p>
              ) : (
                content.projects.map((proj, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4">
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        const newProjects = [...content.projects];
                        newProjects[index].name = e.target.value;
                        setContent(prev => ({ ...prev, projects: newProjects }));
                      }}
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition mb-4"
                      placeholder="项目名称"
                    />
                    <textarea
                      value={proj.description}
                      onChange={(e) => {
                        const newProjects = [...content.projects];
                        newProjects[index].description = e.target.value;
                        setContent(prev => ({ ...prev, projects: newProjects }));
                      }}
                      rows={3}
                      className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] outline-none transition resize-none"
                      placeholder="项目描述..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleOptimize(`proj-${index}`, proj.description, 'project')}
                        disabled={optimizing || !proj.description}
                        className="text-sm text-[#38BDF8] hover:text-[#38BDF8]/80 disabled:text-slate-600 transition"
                      >
                        {optimizing && selectedField === `proj-${index}` ? 'AI 优化中...' : '✨ AI 优化'}
                      </button>
                      <button
                        onClick={() => {
                          const newProjects = content.projects.filter((_, i) => i !== index);
                          setContent(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="text-red-400 hover:text-red-300 transition text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Skills */}
          <section className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">技能</h2>
            <textarea
              value={content.skills.join('\n')}
              onChange={(e) =>
                setContent(prev => ({
                  ...prev,
                  skills: e.target.value.split('\n').filter(s => s.trim()),
                }))
              }
              rows={6}
              className="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2.5 text-[#F8FAFC] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] outline-none transition resize-none"
              placeholder="每行输入一个技能，例如：&#10;JavaScript, TypeScript&#10;React, Next.js, Vue&#10;Node.js, Express"
            />
          </section>
        </div>
      </main>
    </div>
  );
}
