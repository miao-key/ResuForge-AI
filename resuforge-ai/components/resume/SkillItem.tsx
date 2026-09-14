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
  onRecommend?: () => void;
  isRecommending?: boolean;
}

export function SkillItem({ 
  skill, 
  onChange, 
  onDelete,
  onRecommend,
  isRecommending,
}: SkillItemProps) {
  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Label className="text-slate-300">技能分类</Label>
        <div className="flex items-center gap-2">
          {onRecommend && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRecommend}
              disabled={isRecommending}
              className="h-6 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
              title="AI 推荐技能"
            >
              {isRecommending ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-cyan-400 border-r-transparent" />
                  推荐中
                </span>
              ) : (
                '✨ AI 推荐'
              )}
            </Button>
          )}
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
