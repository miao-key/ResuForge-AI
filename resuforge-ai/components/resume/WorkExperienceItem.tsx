'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WorkExperienceItemProps {
  experience: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  };
  onChange: (exp: any) => void;
  onDelete: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}

export function WorkExperienceItem({
  experience,
  onChange,
  onDelete,
  onOptimize,
  isOptimizing,
}: WorkExperienceItemProps) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">公司名称</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
          title="删除此工作经历"
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
          id={`current-${experience.id}`}
          checked={experience.current}
          onChange={(e) => onChange({ ...experience, current: e.target.checked })}
          className="rounded border-slate-700"
        />
        <Label htmlFor={`current-${experience.id}`} className="text-slate-300 text-sm cursor-pointer">
          目前就职
        </Label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-slate-300">工作描述</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOptimize}
            disabled={isOptimizing || !experience.description.trim()}
            className="h-6 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {isOptimizing ? '✨ 优化中...' : '✨ AI 优化'}
          </Button>
        </div>
        <Textarea
          value={experience.description}
          onChange={(e) => onChange({ ...experience, description: e.target.value })}
          placeholder="描述你的工作职责和成就..."
          rows={4}
          className="bg-slate-950/50 border-slate-700 text-slate-50 resize-none"
        />
      </div>
    </div>
  );
}
