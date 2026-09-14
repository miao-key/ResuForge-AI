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
    <div className="border border-blue-100 rounded-lg p-4 space-y-3 bg-white/60 hover:bg-white/80 transition-colors">
      <div className="flex items-start justify-between">
        <Label className="text-slate-700 font-medium">Company</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
          title="Delete this experience"
        >
          x
        </Button>
      </div>
      <Input
        value={experience.company}
        onChange={(e) => onChange({ ...experience, company: e.target.value })}
        placeholder="e.g. ByteDance"
        className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
      />

      <div>
        <Label className="text-slate-700 font-medium">Position</Label>
        <Input
          value={experience.position}
          onChange={(e) => onChange({ ...experience, position: e.target.value })}
          placeholder="e.g. Frontend Engineer"
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-slate-700 font-medium">Start Date</Label>
          <Input
            type="month"
            value={experience.startDate}
            onChange={(e) => onChange({ ...experience, startDate: e.target.value })}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">End Date</Label>
          <Input
            type="month"
            value={experience.endDate}
            onChange={(e) => onChange({ ...experience, endDate: e.target.value })}
            disabled={experience.current}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 disabled:opacity-50 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`current-${experience.id}`}
          checked={experience.current}
          onChange={(e) => onChange({ ...experience, current: e.target.checked })}
          className="rounded border-blue-200 text-blue-500 focus:ring-blue-400"
        />
        <Label
          htmlFor={`current-${experience.id}`}
          className="text-slate-700 text-sm cursor-pointer"
        >
          Currently Working Here
        </Label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-slate-700 font-medium">Description</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOptimize}
            disabled={isOptimizing || !experience.description.trim()}
            className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            {isOptimizing ? '? Optimizing...' : '? AI Optimize'}
          </Button>
        </div>
        <Textarea
          value={experience.description}
          onChange={(e) => onChange({ ...experience, description: e.target.value })}
          placeholder="Describe your responsibilities and achievements..."
          rows={4}
          className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 resize-none focus:border-blue-400"
        />
      </div>
    </div>
  );
}
