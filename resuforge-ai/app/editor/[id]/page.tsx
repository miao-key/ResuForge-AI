'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useResumeStore } from '@/store/resume';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import type { ResumeContent, Section, PersonalInfo } from '@/types';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { exportToPDF, generatePDFFileName, exportToImage } from '@/lib/pdf/export';
import { exportResumeAsJSON } from '@/lib/utils/export';
import { useAutoSave } from '@/hooks/use-auto-save';
import { AutoSaveIndicator } from '@/components/resume/AutoSaveIndicator';
import { PersonalInfoEditor } from '@/components/resume/PersonalInfoEditor';
import { SectionEditor } from '@/components/resume/SectionEditor';
import { ZoomablePreview, type ZoomablePreviewHandle } from '@/components/resume/ZoomablePreview';
import { useMounted } from '@/hooks/use-mounted';
import { FlowBackground } from '@/components/layout/flow-background';
import { DEFAULT_SECTIONS, createBuiltInSection } from '@/lib/resume/section-config';

function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { currentResume, setCurrentResume } = useResumeStore();

  const isNew = params.id === 'new';
  const mounted = useMounted();

  // 初始化默认菜单
  const getDefaultSections = (): Section[] => {
    return DEFAULT_SECTIONS.map((type, index) => createBuiltInSection(type, index));
  };

  // --- 表单状态 ---
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('classic');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    gender: '',
    age: '',
    phone: '',
    email: '',
    jobIntention: '',
    location: '',
    website: '',
    summary: '',
  });
  const [sections, setSections] = useState<Section[]>(getDefaultSections());

  // --- UI 状态 ---
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // --- 左右栏分隔条：宽度百分比 + 拖拽 refs ---
  const [leftWidthPct, setLeftWidthPct] = useState(50); // 左侧占整体宽度百分比
  const isDraggingRef = useRef(false);
  const splitterContainerRef = useRef<HTMLDivElement | null>(null);

  // 拖拽分隔条：限制在 [25%, 75%]
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !splitterContainerRef.current) return;
      const rect = splitterContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      const clamped = Math.min(75, Math.max(25, pct));
      setLeftWidthPct(clamped);
    };
    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- 流式输出状态 ---
  const [streamContent, setStreamContent] = useState('');
  const [streamType, setStreamType] = useState<string | null>(null);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 预览区域 ref（导出时用于临时取消缩放，保证截图清晰）
  const desktopPreviewRef = useRef<ZoomablePreviewHandle>(null);
  const mobilePreviewRef = useRef<ZoomablePreviewHandle>(null);

  const [showExportOptions, setShowExportOptions] = useState(false);

  // 构建 ResumeContent
  const buildContent = useCallback((): ResumeContent => {
    return {
      personalInfo,
      sections,
    };
  }, [personalInfo, sections]);

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

        const parsedContent = result.data.content;
        
        // 支持新旧两种数据格式
        if (typeof parsedContent === 'string') {
          try {
            const parsed = JSON.parse(parsedContent);
            if (parsed.sections) {
              // 新格式
              setPersonalInfo(parsed.personalInfo || {});
              setSections(parsed.sections || []);
            } else {
              // 旧格式 - 转换为新格式
              setPersonalInfo(parsed.personalInfo || {});
              setSections(getDefaultSections());
            }
          } catch {
            setSections(getDefaultSections());
          }
        } else if (parsedContent) {
          if (parsedContent.sections) {
            setPersonalInfo(parsedContent.personalInfo || {});
            setSections(parsedContent.sections || []);
          } else {
            setPersonalInfo(parsedContent.personalInfo || {});
            setSections(getDefaultSections());
          }
        }
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
    async () => {
      const content = buildContent();
      if (!title.trim() && !personalInfo.name) return false;

      try {
        const url = isNew && !currentResume ? '/api/resumes' : `/api/resumes/${params.id}`;
        const method = isNew && !currentResume ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || '未命名简历',
            template_id: templateId,
            content,
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          if (isNew && !currentResume) {
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
    [title, templateId, isNew, currentResume, params.id, setCurrentResume, buildContent, personalInfo]
  );

  const { status: autoSaveStatus, lastSavedAt, saveNow } = useAutoSave({
    data: buildContent(),
    onSave: handleAutoSave,
    delay: 3000,
    enabled: !isNew,
  });

  // --- 手动保存 ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNow();
      if (isNew && currentResume?.id) {
        router.push(`/editor/${currentResume.id}`);
      }
      toast.success('保存成功！');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 导出 PDF ---
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const content = buildContent();
      const fileName = content.personalInfo.name
        ? `${content.personalInfo.name}_简历.pdf`
        : '简历.pdf';
      // 临时进入原始尺寸，保证截图清晰
      const restoreA = await desktopPreviewRef.current?.prepareForExport();
      const restoreB = await mobilePreviewRef.current?.prepareForExport();
      try {
        await exportToPDF('resume-preview', fileName, {
          quality: 2,
          format: 'a4',
          orientation: 'portrait',
          pageNumbers: true,
        });
        toast.success('PDF 导出成功！');
      } finally {
        restoreA?.();
        restoreB?.();
      }
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
      const content = buildContent();
      const fileName = content.personalInfo.name
        ? `${content.personalInfo.name}_简历.png`
        : '简历.png';
      const restoreA = await desktopPreviewRef.current?.prepareForExport();
      const restoreB = await mobilePreviewRef.current?.prepareForExport();
      try {
        await exportToImage('resume-preview', fileName);
        toast.success('图片导出成功！');
      } finally {
        restoreA?.();
        restoreB?.();
      }
    } catch (error) {
      console.error('Export image error:', error);
      toast.error('导出图片失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 导出 JSON ---
  const handleExportJSON = () => {
    if (!currentResume) {
      toast.warning('请先保存简历后再导出 JSON');
      return;
    }
    const content = buildContent();
    const result = exportResumeAsJSON({ ...currentResume, content });
    if (!result.success) {
      toast.error(result.error || '导出失败');
    } else {
      toast.success('JSON 备份已下载');
    }
  };

  // --- AI 优化 ---
  const handleOptimize = async (
    sectionId: string,
    itemId: string,
    fieldKey: string,
    value: string
  ) => {
    if (!value.trim()) {
      toast.warning('请先填写内容再进行优化');
      return;
    }

    // 根据 section 标题推断优化类型
    const section = sections.find(s => s.id === sectionId);
    const sectionTitle = section?.title || '';
    const isCustomSection = !section?.isBuiltIn;
    let optimizeType: string = 'experience';
    if (sectionTitle.includes('教育')) optimizeType = 'education';
    else if (sectionTitle.includes('项目')) optimizeType = 'project';
    else if (sectionTitle.includes('技能')) optimizeType = 'skills';
    else if (isCustomSection) optimizeType = 'custom';

    const optimizeKey = `${sectionId}-${itemId}`;
    setIsOptimizing(optimizeKey);

    setStreamType(fieldKey);
    setStreamContent('');
    setShowStreamModal(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: value,
          type: optimizeType,
          ...(optimizeType === 'custom' ? { sectionTitle } : {}),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                fullContent = data.fullContent;
                setStreamContent(fullContent);
              } else if (data.type === 'done') {
                // 应用优化结果
                applyOptimizeResult(sectionId, itemId, fieldKey, fullContent);
                setShowStreamModal(false);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('AI 优化失败：' + (err.message || '请稍后重试'));
        setShowStreamModal(false);
      }
    } finally {
      setIsOptimizing(null);
    }
  };

  // 应用优化结果
  const applyOptimizeResult = (
    sectionId: string,
    itemId: string,
    fieldKey: string,
    value: string
  ) => {
    setSections(prevSections => 
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id === itemId) {
                return {
                  ...item,
                  fields: item.fields.map(field => 
                    field.key === fieldKey ? { ...field, value } : field
                  ),
                };
              }
              return item;
            }),
          };
        }
        return section;
      })
    );
    toast.success('优化成功！');
  };

  // 关闭流式弹窗
  const closeStreamModal = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setShowStreamModal(false);
    setStreamContent('');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
      </div>
    );
  }

  const content = buildContent();

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
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportOptions(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-blue-200 rounded-lg shadow-xl z-50 p-2">
                      <button
                        onClick={() => { handleExportPDF(); setShowExportOptions(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2 text-sm text-slate-700"
                      >
                        <span>📥</span>
                        <span>导出 PDF (A4)</span>
                      </button>
                      <button
                        onClick={() => { handleExportImage(); setShowExportOptions(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2 text-sm text-slate-700"
                      >
                        <span>🖼️</span>
                        <span>导出 PNG 图片</span>
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

          {/* Editor Content - 桌面端：左右独立滚动 + 中间可拖拽分隔条 */}
          <div className={`hidden lg:block ${activeTab === 'edit' ? '' : ''}`}>
            <div
              ref={splitterContainerRef}
              className="flex w-full gap-0 items-stretch"
              style={{ height: 'calc(100vh - 7rem)' }}
            >
              {/* Left Panel: Editor - 独立滚动 */}
              <div
                className="overflow-y-auto pr-6"
                style={{ width: `calc(${leftWidthPct}% - 0.375rem)` }}
              >
                <div className="space-y-6">
                  {/* 个人信息 */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                      <h3 className="text-lg font-semibold text-slate-800">个人信息</h3>
                    </div>
                    <div className="bg-white/80 px-6 py-4">
                      <PersonalInfoEditor
                        personalInfo={personalInfo}
                        onChange={setPersonalInfo}
                      />
                    </div>
                  </div>

                  {/* 菜单编辑器 */}
                  <SectionEditor
                    sections={sections}
                    onChange={setSections}
                    onOptimize={handleOptimize}
                    isOptimizing={isOptimizing || undefined}
                  />
                </div>
              </div>

              {/* 中间可拖拽分隔条 */}
              <div
                onMouseDown={handleSplitterMouseDown}
                className="relative shrink-0 cursor-col-resize group flex flex-col items-center justify-center gap-1"
                style={{ width: '0.875rem', height: 'calc(100vh - 7rem)' }}
                title="拖动调整左右宽度"
                role="separator"
                aria-orientation="vertical"
              >
                {/* 整条可拖拽区域背景 */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 group-hover:w-2.5 group-hover:bg-blue-100 bg-transparent transition-all rounded-full" />
                {/* 拖拽指示器：三个竖向圆点 */}
                <div className="relative z-10 flex flex-col items-center gap-1.5 py-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors"
                    />
                  ))}
                </div>
              </div>

              {/* Right Panel: Preview - 独立滚动 */}
              <div
                className="overflow-y-auto pl-6"
                style={{ width: `calc(${100 - leftWidthPct}% - 0.375rem)` }}
              >
                <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                    <h3 className="text-lg font-semibold text-slate-800">实时预览</h3>
                  </div>
                  <div className="p-6 md:p-8">
                    {/* 可缩放预览 */}
                    <ZoomablePreview
                      ref={desktopPreviewRef}
                      content={content}
                      templateId={templateId}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 移动端 Tab 切换内容（保留原 Tab 行为） */}
          <div className="lg:hidden">
            <div className={`space-y-6 ${activeTab === 'edit' ? 'block' : 'hidden'}`}>
              {/* 个人信息 */}
              <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-slate-800">个人信息</h3>
                </div>
                <div className="bg-white/80 px-6 py-4">
                  <PersonalInfoEditor
                    personalInfo={personalInfo}
                    onChange={setPersonalInfo}
                  />
                </div>
              </div>

              {/* 菜单编辑器 */}
              <SectionEditor
                sections={sections}
                onChange={setSections}
                onOptimize={handleOptimize}
                isOptimizing={isOptimizing || undefined}
              />
            </div>

            <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-slate-800">实时预览</h3>
                </div>
                <div className="p-6 md:p-8">
                  <ZoomablePreview
                    ref={mobilePreviewRef}
                    content={content}
                    templateId={templateId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 流式输出弹窗 */}
      <Dialog
        open={showStreamModal}
        onClose={closeStreamModal}
        title="✨ AI 优化中"
        description=""
        confirmText=""
        cancelText="取消"
        onConfirm={closeStreamModal}
        className="max-w-2xl"
      >
        <div className="space-y-4 py-2">
          <div className="min-h-[150px] max-h-[400px] overflow-y-auto bg-white/80 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {streamContent || (
                <span className="text-slate-500 italic flex items-center gap-2">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  AI 正在思考...
                </span>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default withAuth(EditorPage);
