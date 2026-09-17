'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SkillItemProps {
  skill: {
    id: string;
    description: string;
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
    <div className="border border-blue-100 rounded-lg p-4 space-y-3 bg-white/60 hover:bg-white/80 transition-colors">
      <div className="flex items-start justify-between">
        <Label className="text-slate-700 font-medium">技能描述</Label>
        <div className="flex items-center gap-2">
          {onRecommend && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRecommend}
              disabled={isRecommending}
              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              title="AI 推荐技能描述"
            >
              {isRecommending ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-blue-500 border-r-transparent" />
                  推荐中...
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
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
            title="删除此技能条目"
          >
            ×
          </Button>
        </div>
      </div>

      <Textarea
        value={skill.description}
        onChange={(e) => onChange({ ...skill, description: e.target.value })}
        placeholder="例如：熟练掌握 React、TypeScript，具备 2 年大型 SaaS 前端架构经验，能够独立完成从需求评审到上线的全流程..."
        rows={5}
        className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 resize-none focus:border-blue-400"
      />
    </div>
  );
}
