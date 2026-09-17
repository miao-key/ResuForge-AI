'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProjectItemProps {
  project: {
    id: string;
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    url?: string;
  };
  onChange: (proj: any) => void;
  onDelete: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}

export function ProjectItem({
  project,
  onChange,
  onDelete,
  onOptimize,
  isOptimizing,
}: ProjectItemProps) {
  return (
    <div className="border border-blue-100 rounded-lg p-4 space-y-3 bg-white/60 hover:bg-white/80 transition-colors">
      <div className="flex items-start justify-between">
        <Label className="text-slate-700 font-medium">项目名称</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
          title="删除此项目"
        >
          x
        </Button>
      </div>
      <Input
        value={project.name}
        onChange={(e) => onChange({ ...project, name: e.target.value })}
        placeholder="例如：电商平台重构"
        className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
      />

      <div>
        <Label className="text-slate-700 font-medium">项目角色</Label>
        <Input
          value={project.role}
          onChange={(e) => onChange({ ...project, role: e.target.value })}
          placeholder="例如：前端负责人"
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-700 font-medium">开始时间</Label>
          <Input
            type="month"
            value={project.startDate}
            onChange={(e) => onChange({ ...project, startDate: e.target.value })}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">结束时间</Label>
          <Input
            type="month"
            value={project.endDate}
            onChange={(e) => onChange({ ...project, endDate: e.target.value })}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 focus:border-blue-400"
          />
        </div>
      </div>

      <div>
        <Label className="text-slate-700 font-medium">技术栈</Label>
        <Input
          value={project.technologies.join(', ')}
          onChange={(e) =>
            onChange({
              ...project,
              technologies: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="例如：React, TypeScript, Next.js（逗号分隔）"
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      <div>
        <Label className="text-slate-700 font-medium">项目链接（选填）</Label>
        <Input
          value={project.url || ''}
          onChange={(e) => onChange({ ...project, url: e.target.value })}
          placeholder="https://"
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-slate-700 font-medium">项目描述</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOptimize}
            disabled={isOptimizing || !project.description.trim()}
            className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            {isOptimizing ? '✨ 优化中...' : '✨ AI 优化'}
          </Button>
        </div>
        <Textarea
          value={project.description}
          onChange={(e) => onChange({ ...project, description: e.target.value })}
          placeholder="描述项目背景、你的职责和成就..."
          rows={4}
          className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 resize-none focus:border-blue-400"
        />
      </div>
    </div>
  );
}
