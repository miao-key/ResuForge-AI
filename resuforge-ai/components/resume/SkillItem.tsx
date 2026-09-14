'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SkillItemProps {
  skill: {
    id: string;
    category: string;
    items: string[];
  };
  onChange: (skill: any) => void;
  onDelete: () => void;
}

export function SkillItem({ skill, onChange, onDelete }: SkillItemProps) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">技能分类</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
          title="删除此技能分类"
        >
          ×
        </Button>
      </div>
      <Input
        value={skill.category}
        onChange={(e) => onChange({ ...skill, category: e.target.value })}
        placeholder="例：编程语言"
        className="bg-slate-950/50 border-slate-700 text-slate-50"
      />

      <div>
        <Label className="text-slate-300">技能列表</Label>
        <Input
          value={skill.items.join(', ')}
          onChange={(e) =>
            onChange({
              ...skill,
              items: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="例：JavaScript, TypeScript, Python（用逗号分隔）"
          className="mt-1.5 bg-slate-950/50 border-slate-700 text-slate-50"
        />
      </div>
    </div>
  );
}
