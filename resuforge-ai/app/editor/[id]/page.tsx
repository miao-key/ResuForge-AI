'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useResumeStore } from '@/store/resume';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import type { ResumeContent } from '@/types';
import { ResumeRenderer } from '@/components/resume/ResumeRenderer';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { exportToPDF, generatePDFFileName, exportToImage } from '@/lib/pdf/export';
import { exportResumeAsJSON } from '@/lib/utils/export';
import { useAutoSave } from '@/hooks/use-auto-save';
import { AutoSaveIndicator } from '@/components/resume/AutoSaveIndicator';
import { EditorSection } from '@/components/resume/EditorSection';
import { WorkExperienceItem } from '@/components/resume/WorkExperienceItem';
import { EducationItem } from '@/components/resume/EducationItem';
import { ProjectItem } from '@/components/resume/ProjectItem';
import { SkillItem } from '@/components/resume/SkillItem';
import { PreviewControls } from '@/components/resume/PreviewControls';
import { useMounted } from '@/hooks/use-mounted';
import { FlowBackground } from '@/components/layout/flow-background';

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

  // --- 流式输出状态 ---
  const [streamContent, setStreamContent] = useState('');
  const [streamType, setStreamType] = useState<string | null>(null);
  const [streamIndex, setStreamIndex] = useState<number | undefined>(undefined);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- 分析结果状态 ---
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // --- 预览控制状态 ---
  const [previewScale, setPreviewScale] = useState(1);
  const [themeColor, setThemeColor] = useState('#0891b2');
  const [showExportOptions, setShowExportOptions] = useState(false);

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
      } else {
        toast.error(result.error || '加载简历失败');
      }
    } catch (error) {
      console.error('Load resume error:', error);
      toast.error('加载简历失败，请稍后重试');
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
      await exportToPDF('resume-preview', fileName, {
        quality: 2,
        format: 'a4',
        orientation: 'portrait',
        pageNumbers: true,
      });
      toast.success('PDF 导出成功！');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 导出图片 ---
  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      const fileName = `${content.personalInfo?.name || 'Resume'}_简历.png`;
      await exportToImage('resume-preview', fileName);
      toast.success('图片导出成功！');
    } catch (error) {
      console.error('Export image error:', error);
      toast.error('导出图片失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 打印 ---
  const handlePrint = () => {
    window.print();
  };

  // --- 导出 JSON ---
  const handleExportJSON = () => {
    if (!currentResume) {
      toast.warning('请先保存简历后再导出 JSON');
      return;
    }
    const result = exportResumeAsJSON(currentResume);
    if (!result.success) {
      toast.error(result.error || '导出失败');
    } else {
      toast.success('JSON 备份已下载');
    }
  };

  // --- AI 优化 (流式输出) ---
  const handleOptimize = async (
    type: string,
    originalContent: string,
    field?: string,
    index?: number
  ) => {
    if (!originalContent.trim()) {
      toast.warning('请先填写内容再进行优化');
      return;
    }

    // 打开流式输出弹窗
    setStreamType(type);
    setStreamIndex(index);
    setStreamContent('');
    setShowStreamModal(true);

    // 创建 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: originalContent, type }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // 解析 SSE 数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                fullContent = data.fullContent;
                setStreamContent(fullContent);
              } else if (data.type === 'done') {
                // 流式输出完成，但不在这里更新内容
                // 用户需要在弹窗中点击"应用"来确认
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // 请求被取消
      } else {
        setStreamContent('');
        toast.error('AI 优化失败：' + (err.message || '请稍后重试'));
        setShowStreamModal(false);
      }
    }
  };

  // --- 应用流式输出结果 ---
  const applyStreamResult = () => {
    if (!streamContent || !streamType) return;

    if (streamType === 'summary') {
      setContent({
        ...content,
        personalInfo: { ...content.personalInfo, summary: streamContent },
      });
    } else if (streamType === 'experience' && streamIndex !== undefined) {
      const newExperiences = [...content.workExperience];
      newExperiences[streamIndex] = { ...newExperiences[streamIndex], description: streamContent };
      setContent({ ...content, workExperience: newExperiences });
    } else if (streamType === 'project' && streamIndex !== undefined) {
      const newProjects = [...content.projects];
      newProjects[streamIndex] = { ...newProjects[streamIndex], description: streamContent };
      setContent({ ...content, projects: newProjects });
    } else if (streamType === 'education' && streamIndex !== undefined) {
      // 尝试解析教育信息
      try {
        const lines = streamContent.split('\n').filter((l: string) => l.trim());
        const newEducation = [...content.education];
        lines.forEach((line: string) => {
          if (line.includes('学校') || line.includes('大学') || line.includes('学院')) {
            newEducation[streamIndex] = { ...newEducation[streamIndex], school: line.replace(/[学校大学学院：:]/g, '').trim() };
          }
          if (line.includes('学历') || line.includes('学位')) {
            newEducation[streamIndex] = { ...newEducation[streamIndex], degree: line.replace(/[学历学位：:]/g, '').trim() };
          }
          if (line.includes('专业')) {
            newEducation[streamIndex] = { ...newEducation[streamIndex], major: line.replace(/[专业：:]/g, '').trim() };
          }
        });
        setContent({ ...content, education: newEducation });
      } catch {
        // 解析失败，忽略
      }
    } else if (streamType === 'analyze') {
      // 简历分析单独处理
      try {
        const analysis = JSON.parse(streamContent);
        setAnalysisResult(analysis);
        setShowAnalysis(true);
        setShowStreamModal(false);
        return; // 分析不关闭流式弹窗，由分析弹窗管理
      } catch {
        // 无法解析 JSON，显示原始文本
        setAnalysisResult({ rawText: streamContent });
        setShowAnalysis(true);
        setShowStreamModal(false);
        return;
      }
    }

    setShowStreamModal(false);
  };

  // --- 关闭流式弹窗 ---
  const closeStreamModal = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setShowStreamModal(false);
    setStreamContent('');
  };

  // --- 技能推荐 (流式输出) ---
  const handleRecommendSkills = async () => {
    // 构建简历上下文
    const resumeContext = `
目标岗位：${content.personalInfo.summary?.includes('前端') ? '前端开发工程师' : '全栈开发工程师'}
现有技能：
${content.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join('\n')}
工作经历：${content.workExperience.map(e => e.description).join('\n')}
项目经历：${content.projects.map(p => p.description).join('\n')}
`;

    // 打开流式弹窗
    setStreamType('skills');
    setStreamIndex(undefined);
    setStreamContent('');
    setShowStreamModal(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeContext, type: 'skills' }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                setStreamContent(data.fullContent);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('技能推荐失败：' + (err.message || '请稍后重试'));
        setShowStreamModal(false);
      }
    }
  };

  // --- 简历分析 (流式输出) ---
  const handleAnalyzeResume = async () => {
    // 打开流式弹窗
    setStreamType('analyze');
    setStreamIndex(undefined);
    setStreamContent('');
    setShowStreamModal(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: JSON.stringify(content, null, 2), type: 'analyze' }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                setStreamContent(data.fullContent);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('简历分析失败：' + (err.message || '请稍后重试'));
        setShowStreamModal(false);
      }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <>
      <FlowBackground />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="border-blue-200 hover:bg-blue-50 text-slate-700 shrink-0"
              >
                返回
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="简历标题"
                className="w-48 md:w-64 bg-white/80 border-blue-100 text-slate-800"
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
              className="border-blue-200 hover:bg-blue-50 text-slate-700"
              title="导出 JSON 备份"
            >
              📄 JSON
            </Button>

            {/* 导出选项菜单 */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
                disabled={isExporting}
                className="border-blue-200 hover:bg-blue-50"
              >
                {isExporting ? '导出中...' : '📥 导出'} ▾
              </Button>

              {showExportOptions && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportOptions(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-blue-200 rounded-lg shadow-xl z-50 p-2">
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <span>📥</span>
                      <span>导出 PDF (A4)</span>
                    </button>
                    <button
                      onClick={() => {
                        handleExportImage();
                        setShowExportOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <span>🖼️</span>
                      <span>导出 PNG 图片</span>
                    </button>
                    <div className="border-t border-blue-200 my-1" />
                    <button
                      onClick={() => {
                        handlePrint();
                        setShowExportOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <span>🖨️</span>
                      <span>打印</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || autoSaveStatus === 'saving'}
              size="sm"
              className="btn-flow text-white shrink-0"
            >
              {isSaving || autoSaveStatus === 'saving' ? '保存中...' : '💾 保存'}
            </Button>
          </div>
        </div>

        {/* 移动端 Tab 切换 */}
        <div className="lg:hidden mb-6">
          <div className="flex border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              编辑
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-500 hover:text-blue-600'
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
                  <Label className="text-slate-700">姓名</Label>
                  <Input
                    value={content.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    placeholder="张三"
                    className="mt-1.5 bg-white/80 border-blue-200 text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700">邮箱</Label>
                    <Input
                      type="email"
                      value={content.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="zhang@example.com"
                      className="mt-1.5 bg-white/80 border-blue-200 text-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700">电话</Label>
                    <Input
                      value={content.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="138-0000-0000"
                      className="mt-1.5 bg-white/80 border-blue-200 text-slate-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700">地址</Label>
                    <Input
                      value={content.personalInfo.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="北京市朝阳区"
                      className="mt-1.5 bg-white/80 border-blue-200 text-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700">个人网站</Label>
                    <Input
                      value={content.personalInfo.website || ''}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1.5 bg-white/80 border-blue-200 text-slate-800"
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
                className="bg-white/80 border-blue-200 text-slate-800 resize-none"
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
                  className="border-blue-200 hover:bg-blue-50 w-full"
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
                    onOptimize={() => {
                      const eduText = `${edu.school} ${edu.degree} ${edu.major} ${edu.gpa || ''}`;
                      handleOptimize('education', eduText, `edu_${index}`, index);
                    }}
                    isOptimizing={isOptimizing === `edu_${index}`}
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50 w-full"
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
                  className="border-blue-200 hover:bg-blue-50 w-full"
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50 w-full"
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRecommendSkills}
                    disabled={isOptimizing === 'skills'}
                    className="border-blue-300 hover:bg-blue-50 text-blue-600 whitespace-nowrap"
                    title="基于简历内容推荐技能"
                  >
                    {isOptimizing === 'skills' ? (
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-cyan-400 border-r-transparent" />
                        推荐中
                      </span>
                    ) : (
                      '✨ AI 推荐技能'
                    )}
                  </Button>
                </div>
              </div>
            </EditorSection>

            {/* 简历分析 */}
            <EditorSection 
              title="简历分析" 
              onOptimize={handleAnalyzeResume}
              isOptimizing={isOptimizing === 'analyze'}
              optimizeDisabled={!content.personalInfo.name}
            >
              <div className="text-slate-500 text-sm">
                <p>基于简历内容，AI 将分析：</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>内容完整度评分</li>
                  <li>描述质量评估</li>
                  <li>量化成果分析</li>
                  <li>关键词匹配度</li>
                </ul>
                <p className="mt-3 text-slate-500">点击右上角"AI 分析"按钮开始分析</p>
              </div>
            </EditorSection>
          </div>

          {/* Right Panel: Preview */}
          <div
            className={`card-flow rounded-2xl p-6 md:p-8 sticky top-8 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto ${
              activeTab === 'edit' ? 'hidden lg:block' : 'block'
            }`}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">实时预览</h3>

            {/* 预览控制面板 */}
            <PreviewControls
              scale={previewScale}
              onScaleChange={setPreviewScale}
              themeColor={themeColor}
              onThemeColorChange={setThemeColor}
              onPrint={handlePrint}
            />

            {/* 预览内容 */}
            <div className="overflow-auto bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/60 rounded-xl p-4 flex justify-center border border-blue-100/60">
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div id="resume-preview" className="bg-white rounded-lg shadow-2xl">
                  <ResumeRenderer
                    content={content}
                    templateId={templateId}
                    themeColor={themeColor}
                  />
                </div>
              </div>
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

      {/* 简历分析结果弹窗 */}
      <Dialog
        open={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        title="📊 简历分析报告"
        description=""
        confirmText="关闭"
        cancelText=""
        onConfirm={() => setShowAnalysis(false)}
      >
        {analysisResult && (
          <div className="space-y-4 py-4">
            {/* 评分概览 */}
            {analysisResult.overall && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-2">
                  <span className="text-3xl font-bold text-white">{analysisResult.overall}</span>
                </div>
                <p className="text-slate-500 text-sm">综合评分</p>
              </div>
            )}

            {/* 分项评分 */}
            {(analysisResult.completeness || analysisResult.quality) && (
              <div className="space-y-3">
                {analysisResult.completeness && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 w-28">内容完整度</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.completeness}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-10">{analysisResult.completeness}</span>
                  </div>
                )}
                {analysisResult.quality && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 w-28">描述质量</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.quality}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-10">{analysisResult.quality}</span>
                  </div>
                )}
                {analysisResult.quantification && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 w-28">量化成果</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.quantification}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-10">{analysisResult.quantification}</span>
                  </div>
                )}
                {analysisResult.formatting && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 w-28">格式规范</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.formatting}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-10">{analysisResult.formatting}</span>
                  </div>
                )}
                {analysisResult.keywords && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 w-28">关键词匹配</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.keywords}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-10">{analysisResult.keywords}</span>
                  </div>
                )}
              </div>
            )}

            {/* 亮点 */}
            {analysisResult.strengths && analysisResult.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                  <span>✨</span> 简历亮点
                </h4>
                <ul className="space-y-1">
                  {analysisResult.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-green-500 before:rounded-full">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 改进建议 */}
            {analysisResult.improvements && analysisResult.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                  <span>💡</span> 改进建议
                </h4>
                <ul className="space-y-1">
                  {analysisResult.improvements.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-500 before:rounded-full">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 原始文本（如果无法解析） */}
            {analysisResult.rawText && (
              <div className="mt-4 p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <h4 className="text-xs text-slate-500 mb-2">AI 原始反馈：</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{analysisResult.rawText}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* AI 流式输出弹窗 */}
      <Dialog
        open={showStreamModal}
        onClose={closeStreamModal}
        title={
          streamType === 'summary' ? '✨ 优化个人简介' :
          streamType === 'experience' ? '✨ 优化工作经历' :
          streamType === 'project' ? '✨ 优化项目经历' :
          streamType === 'education' ? '✨ 优化教育经历' :
          streamType === 'skills' ? '✨ 推荐技能关键词' :
          streamType === 'analyze' ? '📊 分析简历' :
          '✨ AI 生成中'
        }
        description=""
        confirmText=""
        cancelText=""
        className="max-w-2xl"
      >
        <div className="space-y-4 py-2">
          {/* 流式输出区域 */}
          <div className="min-h-[150px] max-h-[400px] overflow-y-auto bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {streamContent || (
                <span className="text-slate-500 italic flex items-center gap-2">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  AI 正在思考...
                </span>
              )}
              {showStreamModal && streamContent !== '' && (
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
              )}
            </div>
          </div>

          {/* 状态指示 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2 w-2`}>
                {showStreamModal && !streamContent ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                )}
              </span>
              <span className="text-slate-500">
                {showStreamModal && !streamContent ? '生成中...' : streamContent ? '生成完成' : '等待中'}
              </span>
            </div>
            {streamContent && (
              <span className="text-slate-500">{streamContent.length} 字符</span>
            )}
          </div>

          {/* 操作按钮 */}
          {streamContent && (
            <div className="flex items-center gap-3 pt-3 border-t border-blue-200">
              {streamType !== 'skills' && streamType !== 'analyze' ? (
                <>
                  <Button
                    size="sm"
                    onClick={applyStreamResult}
                    className="btn-flow text-white"
                  >
                    ✓ 应用建议
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // 重新生成 - 关闭弹窗，让用户重新点击
                      closeStreamModal();
                    }}
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    🔄 重新生成
                  </Button>
                </>
              ) : streamType === 'skills' ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      // 应用技能推荐
                      try {
                        const lines = streamContent.split('\n').filter((l: string) => l.trim());
                        const newSkills = [...content.skills];
                        
                        lines.forEach((line: string) => {
                          const cleanLine = line.replace(/^[-\d.、]\s*/, '').trim();
                          if ((cleanLine.includes('：') || cleanLine.includes(':')) && !cleanLine.startsWith('#')) {
                            const [category, items] = cleanLine.split(/[：:]/);
                            const skillItems = items.split(/[,，、]/).map((t: string) => t.trim()).filter(Boolean);
                            const existingIndex = newSkills.findIndex(s => 
                              s.category.toLowerCase().includes(category.trim().toLowerCase())
                            );
                            if (existingIndex >= 0) {
                              newSkills[existingIndex].items = [...new Set([...newSkills[existingIndex].items, ...skillItems])];
                            } else {
                              newSkills.push({
                                id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                category: category.trim(),
                                items: skillItems,
                              });
                            }
                          }
                        });

                        setContent({ ...content, skills: newSkills });
                        closeStreamModal();
                        toast.success('技能已添加');
                      } catch {
                        toast.error('技能解析失败，请手动复制内容');
                      }
                    }}
                    className="btn-flow text-white"
                  >
                    ✓ 添加技能
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={closeStreamModal}
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    取消
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      // 简历分析 - 解析并显示分析报告
                      try {
                        let analysis = null;
                        // 尝试提取 JSON
                        const jsonMatch = streamContent.match(/```(?:json)?\s*([\s\S]*?)```/);
                        if (jsonMatch) {
                          analysis = JSON.parse(jsonMatch[1].trim());
                        } else {
                          analysis = JSON.parse(streamContent);
                        }
                        setAnalysisResult(analysis);
                      } catch {
                        setAnalysisResult({ rawText: streamContent });
                      }
                      setShowAnalysis(true);
                      closeStreamModal();
                    }}
                    className="btn-flow text-white"
                  >
                    ✓ 查看分析报告
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={closeStreamModal}
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    取消
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </Dialog>
      </div>
    </>
  );
}

export default withAuth(EditorPage);
