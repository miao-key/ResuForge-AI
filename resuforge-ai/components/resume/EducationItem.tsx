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
  onOptimize?: () => void;
  isOptimizing?: boolean;
}

export function EducationItem({
  education,
  onChange,
  onDelete,
  onOptimize,
  isOptimizing,
}: EducationItemProps) {
  const canOptimize = education.school || education.degree || education.major;

  return (
    <div className="border border-blue-100 rounded-lg p-4 space-y-3 bg-white/60 hover:bg-white/80 transition-colors">
      <div className="flex items-start justify-between">
        <Label className="text-slate-700 font-medium">School Name</Label>
        <div className="flex items-center gap-2">
          {onOptimize && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onOptimize}
              disabled={isOptimizing || !canOptimize}
              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              title="AI Optimize"
            >
              {isOptimizing ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-blue-500 border-r-transparent" />
                  Optimizing...
                </span>
              ) : (
                '? AI Optimize'
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
            title="Delete this education"
          >
            x
          </Button>
        </div>
      </div>
      <Input
        value={education.school}
        onChange={(e) => onChange({ ...education, school: e.target.value })}
        placeholder="e.g. Tsinghua University"
        className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-700 font-medium">Degree</Label>
          <Input
            value={education.degree}
            onChange={(e) => onChange({ ...education, degree: e.target.value })}
            placeholder="e.g. Bachelor"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">Major</Label>
          <Input
            value={education.major}
            onChange={(e) => onChange({ ...education, major: e.target.value })}
            placeholder="e.g. Computer Science"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-700 font-medium">Start Date</Label>
          <Input
            type="month"
            value={education.startDate}
            onChange={(e) => onChange({ ...education, startDate: e.target.value })}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">End Date</Label>
          <Input
            type="month"
            value={education.endDate}
            onChange={(e) => onChange({ ...education, endDate: e.target.value })}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 focus:border-blue-400"
          />
        </div>
      </div>

      <div>
        <Label className="text-slate-700 font-medium">GPA (Optional)</Label>
        <Input
          value={education.gpa || ''}
          onChange={(e) => onChange({ ...education, gpa: e.target.value })}
          placeholder="e.g. 3.8/4.0"
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>
    </div>
  );
}
