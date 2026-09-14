'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EducationItemProps {
  education: {
    id: string;
    school: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    description?: string;
  };
  onChange: (edu: any) => void;
  onDelete: () => void;
}

export function EducationItem({ education, onChange, onDelete }: EducationItemProps) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">学校名称</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
          title="删除此教育经历"
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
