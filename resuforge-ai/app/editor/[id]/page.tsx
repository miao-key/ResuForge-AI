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
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
    work_experience: [],
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
        setContent(result.data.content);
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

  const handleOptimize = async (type: string, originalContent: string) => {
    setIsOptimizing(type);
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalContent,
          type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // TODO: 更新对应字段的内容
        console.log('Optimized:', result.data);
      }
    } catch (error) {
      console.error('Optimize error:', error);
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
                    value={content.personal_info?.name || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personal_info: {
                          ...content.personal_info,
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
                    value={content.personal_info?.email || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personal_info: {
                          ...content.personal_info,
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
                    value={content.personal_info?.phone || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personal_info: {
                          ...content.personal_info,
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
                    value={content.personal_info?.location || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        personal_info: {
                          ...content.personal_info,
                          location: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
                  />
                </div>
              </div>
            </EditorSection>

            {/* Summary */}
            {content.summary !== undefined && (
              <EditorSection
                title="个人简介"
                onOptimize={() => handleOptimize('summary', content.summary || '')}
                isOptimizing={isOptimizing === 'summary'}
              >
                <Textarea
                  value={content.summary || ''}
                  onChange={(e) =>
                    setContent({ ...content, summary: e.target.value })
                  }
                  placeholder="用2-3句话介绍你的核心竞争力..."
                  rows={4}
                  className="bg-slate-950/50 border-slate-700 text-slate-50"
                />
              </EditorSection>
            )}

            {/* Work Experience */}
            <EditorSection title="工作经历">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                onClick={() =>
                  setContent({
                    ...content,
                    work_experience: [
                      ...(content.work_experience || []),
                      {
                        company: '',
                        position: '',
                        start_date: '',
                        end_date: '',
                        description: '',
                      },
                    ],
                  })
                }
              >
                + 添加工作经历
              </Button>
              {/* TODO: 工作经历列表编辑 */}
            </EditorSection>

            {/* Education */}
            <EditorSection title="教育背景">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                onClick={() =>
                  setContent({
                    ...content,
                    education: [
                      ...(content.education || []),
                      {
                        school: '',
                        degree: '',
                        major: '',
                        start_date: '',
                        end_date: '',
                      },
                    ],
                  })
                }
              >
                + 添加教育背景
              </Button>
              {/* TODO: 教育背景列表编辑 */}
            </EditorSection>
          </div>

          {/* Right Panel: Preview */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 sticky top-8 h-fit">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">
              实时预览
            </h3>
            <div className="text-slate-400 text-sm">
              <p>预览功能开发中...</p>
            </div>
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
