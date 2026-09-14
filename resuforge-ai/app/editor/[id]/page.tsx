'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useResumeStore } from '@/store/resume';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import type { ResumeContent } from '@/types';
import { ResumeRenderer } from '@/components/resume/ResumeRenderer';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { exportToPDF, generatePDFFileName } from '@/lib/pdf/export';
import { exportResumeAsJSON } from '@/lib/utils/export';
import { useAutoSave } from '@/hooks/use-auto-save';
import { AutoSaveIndicator } from '@/components/resume/AutoSaveIndicator';
import { EditorSection } from '@/components/resume/EditorSection';
import { WorkExperienceItem } from '@/components/resume/WorkExperienceItem';
import { EducationItem } from '@/components/resume/EducationItem';
import { ProjectItem } from '@/components/resume/ProjectItem';
import { SkillItem } from '@/components/resume/SkillItem';
import { useMounted } from '@/hooks/use-mounted';

function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { currentResume, setCurrentResume } = useResumeStore();

  const isNew = params.id === 'new';
  const mounted = useMounted();

  // --- 表单状态 ---
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('classic');
  const [content, setContent] = useState<ResumeContent>({
    personalInfo: { name: '', email: '', phone: '', location: '', website: '', summary: '' },
    workExperience: [],
    education: [],
    projects: [],
    skills: [],
  });

  // --- UI 状态 ---
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // --- 删除确认弹窗 ---
  const [deleteDialog, setDeleteDialog] = useState<{
    type: 'work' | 'education' | 'project' | 'skill';
    id: string;
    label: string;
  } | null>(null);

  // --- 验证错误 ---
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // --- 加载简历数据 ---
  useEffect(() => {
    if (!isNew && params.id) {
      loadResume(params.id as string);
    }
  }, [params.id, isNew]);

  const loadResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      const result = await response.json();

      if (result.success) {
        setCurrentResume(result.data);
        setTitle(result.data.title);
        setTemplateId(result.data.template_id || 'classic');

        const parsedContent =
          typeof result.data.content === 'string'
            ? JSON.parse(result.data.content)
            : result.data.content;

        setContent(
          parsedContent || {
            personalInfo: { name: '', email: '', phone: '', location: '', website: '', summary: '' },
            workExperience: [],
            education: [],
            projects: [],
            skills: [],
          }
        );
      }
    } catch (error) {
      console.error('Load resume error:', error);
    }
  };

  // --- 自动保存 ---
  const handleAutoSave = useCallback(
    async (data: ResumeContent) => {
      if (!title.trim() && !data.personalInfo.name) return false;

      try {
        const url = isNew && !currentResume ? '/api/resumes' : `/api/resumes/${params.id}`;
        const method = isNew && !currentResume ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || '未命名简历',
            template_id: templateId,
            content: data,
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          // 如果是新建,跳转 URL
          if (isNew && !currentResume) {
            // 不在自动保存中跳转,只在用户操作时跳转
            window.history.replaceState(null, '', `/editor/${result.data.id}`);
          }
          setCurrentResume(result.data);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [title, templateId, isNew, currentResume, params.id, setCurrentResume]
  );

  const { status: autoSaveStatus, lastSavedAt, saveNow } = useAutoSave({
    data: content,
    onSave: handleAutoSave,
    delay: 3000, // 3 秒防抖
    enabled: !isNew, // 新建简历不自动保存
  });

  // --- 手动保存 ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNow();
      // 新建简历时,首次保存后跳转为真实 ID
      // currentResume 已被 saveNow 内部的 onSave 更新
      if (isNew && currentResume?.id) {
        router.push(`/editor/${currentResume.id}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // --- 导出 PDF ---
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const fileName = generatePDFFileName(content);
      await exportToPDF('resume-preview', fileName);
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 导出 JSON ---
  const handleExportJSON = () => {
    if (!currentResume) {
      alert('请先保存简历后再导出 JSON');
      return;
    }
    const result = exportResumeAsJSON(currentResume);
    if (!result.success) {
      alert(result.error || '导出失败');
    }
  };

  // --- AI 优化 ---
  const handleOptimize = async (
    type: string,
    originalContent: string,
    field?: string,
    index?: number
  ) => {
    if (!originalContent.trim()) {
      alert('请先填写内容再进行优化');
      return;
    }

    const fieldKey = field || type;
    setIsOptimizing(fieldKey);

    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: originalContent, type }),
      });

      const result = await response.json();

      if (result.success && result.data?.optimized) {
        const optimized = result.data.optimized;

        if (type === 'summary') {
          setContent({
            ...content,
            personalInfo: { ...content.personalInfo, summary: optimized },
          });
        } else if (type === 'experience' && index !== undefined) {
          const newExperiences = [...content.workExperience];
          newExperiences[index] = { ...newExperiences[index], description: optimized };
          setContent({ ...content, workExperience: newExperiences });
        } else if (type === 'project' && index !== undefined) {
          const newProjects = [...content.projects];
          newProjects[index] = { ...newProjects[index], description: optimized };
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

  // --- 内容更新 helpers ---
  const updatePersonalInfo = (field: string, value: string) => {
    setContent({
      ...content,
      personalInfo: { ...content.personalInfo, [field]: value },
    });
  };

  // --- 删除确认 ---
  const confirmDelete = () => {
    if (!deleteDialog) return;

    const { type, id } = deleteDialog;

    switch (type) {
      case 'work':
        setContent({
          ...content,
          workExperience: content.workExperience.filter((e) => e.id !== id),
        });
        break;
      case 'education':
        setContent({
          ...content,
          education: content.education.filter((e) => e.id !== id),
        });
        break;
      case 'project':
        setContent({
          ...content,
          projects: content.projects.filter((p) => p.id !== id),
        });
        break;
      case 'skill':
        setContent({
          ...content,
          skills: content.skills.filter((s) => s.id !== id),
        });
        break;
    }

    setDeleteDialog(null);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="border-slate-700 hover:bg-slate-800 shrink-0"
            >
              ← 返回
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简历标题"
              className="w-48 md:w-64 bg-slate-950/50 border-slate-700 text-slate-50"
            />
            <AutoSaveIndicator
              status={autoSaveStatus}
              lastSavedAt={lastSavedAt}
              className="hidden md:flex"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <TemplateSelector
              currentTemplate={templateId}
              onSelectTemplate={(id) => setTemplateId(id)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
              title="导出 JSON 备份"
            >
              📄 JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="border-slate-700 hover:bg-slate-800"
            >
              {isExporting ? '导出中...' : '📥 PDF'}
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || autoSaveStatus === 'saving'}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 shrink-0"
            >
              {isSaving || autoSaveStatus === 'saving' ? '保存中...' : '💾 保存'}
            </Button>
          </div>
        </div>

        {/* 移动端 Tab 切换 */}
        <div className="lg:hidden mb-6">
          <div className="flex border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-50'
              }`}
            >
              编辑
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-50'
              }`}
            >
              预览
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${
            activeTab === 'edit' ? 'block' : 'hidden lg:grid'
          }`}
        >
          {/* Left Panel: Editor */}
          <div className="space-y-6">
            {/* 个人信息 */}
            <EditorSection title="个人信息">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">姓名</Label>
                  <Input
                    value={content.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    placeholder="张三"
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">邮箱</Label>
                    <Input
                      type="email"
                      value={content.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="zhang@example.com"
                      className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">电话</Label>
                    <Input
                      value={content.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="138-0000-0000"
                      className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">地址</Label>
                    <Input
                      value={content.personalInfo.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="北京市朝阳区"
                      className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">个人网站</Label>
                    <Input
                      value={content.personalInfo.website || ''}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                    />
                  </div>
                </div>
              </div>
            </EditorSection>

            {/* 个人简介 */}
            <EditorSection
              title="个人简介"
              onOptimize={() => handleOptimize('summary', content.personalInfo.summary || '')}
              isOptimizing={isOptimizing === 'summary'}
              optimizeDisabled={!content.personalInfo.summary?.trim()}
            >
              <Textarea
                value={content.personalInfo.summary || ''}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                placeholder="用 2-3 句话介绍你的核心竞争力..."
                rows={4}
                className="bg-slate-950/50 border-slate-700 text-slate-50 resize-none"
              />
            </EditorSection>

            {/* 工作经历 */}
            <EditorSection title="工作经历">
              <div className="space-y-4">
                {content.workExperience.map((exp, index) => (
                  <WorkExperienceItem
                    key={exp.id}
                    experience={exp}
                    onChange={(updated) => {
                      const newList = [...content.workExperience];
                      newList[index] = updated;
                      setContent({ ...content, workExperience: newList });
                    }}
                    onDelete={() =>
                      setDeleteDialog({ type: 'work', id: exp.id, label: exp.company || '此工作经历' })
                    }
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

            {/* 教育背景 */}
            <EditorSection title="教育背景">
              <div className="space-y-4">
                {content.education.map((edu, index) => (
                  <EducationItem
                    key={edu.id}
                    education={edu}
                    onChange={(updated) => {
                      const newList = [...content.education];
                      newList[index] = updated;
                      setContent({ ...content, education: newList });
                    }}
                    onDelete={() =>
                      setDeleteDialog({ type: 'education', id: edu.id, label: edu.school || '此教育经历' })
                    }
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

            {/* 项目经历 */}
            <EditorSection title="项目经历">
              <div className="space-y-4">
                {content.projects.map((project, index) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onChange={(updated) => {
                      const newList = [...content.projects];
                      newList[index] = updated;
                      setContent({ ...content, projects: newList });
                    }}
                    onDelete={() =>
                      setDeleteDialog({ type: 'project', id: project.id, label: project.name || '此项目' })
                    }
                    onOptimize={() =>
                      handleOptimize('project', project.description, `project_${index}`, index)
                    }
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

            {/* 技能 */}
            <EditorSection title="技能">
              <div className="space-y-4">
                {content.skills.map((skill, index) => (
                  <SkillItem
                    key={skill.id}
                    skill={skill}
                    onChange={(updated) => {
                      const newList = [...content.skills];
                      newList[index] = updated;
                      setContent({ ...content, skills: newList });
                    }}
                    onDelete={() =>
                      setDeleteDialog({ type: 'skill', id: skill.id, label: skill.category || '此技能' })
                    }
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
                        { id: `skill_${Date.now()}`, category: '', items: [] },
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
          <div
            className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8 sticky top-8 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto ${
              activeTab === 'edit' ? 'hidden lg:block' : 'block'
            }`}
          >
            <h3 className="text-lg font-semibold text-slate-50 mb-6">实时预览</h3>
            <div id="resume-preview" className="bg-white rounded-lg">
              <ResumeRenderer content={content} templateId={templateId} />
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <Dialog
        open={deleteDialog !== null}
        onClose={() => setDeleteDialog(null)}
        title={`确定要删除 ${deleteDialog?.label} 吗？`}
        description="此操作不可撤销，删除后将无法恢复。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDelete}
        confirmVariant="destructive"
      />
    </div>
  );
}

export default withAuth(EditorPage);
