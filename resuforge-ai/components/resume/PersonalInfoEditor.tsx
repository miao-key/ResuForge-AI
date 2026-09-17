'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PersonalInfo } from '@/types';

interface PersonalInfoEditorProps {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

export function PersonalInfoEditor({
  personalInfo,
  onChange,
}: PersonalInfoEditorProps) {
  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...personalInfo, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* 第一行：姓名、性别、年龄 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-slate-700 font-medium">姓名 <span className="text-red-500">*</span></Label>
          <Input
            value={personalInfo.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="张三"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">性别</Label>
          <select
            value={personalInfo.gender || ''}
            onChange={(e) => updateField('gender', e.target.value)}
            className="mt-1.5 w-full px-3 py-2 bg-white/80 border border-blue-100 rounded-lg text-slate-800 focus:border-blue-400 focus:outline-none"
          >
            <option value="" disabled hidden></option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div>
          <Label className="text-slate-700 font-medium">年龄</Label>
          <Input
            value={personalInfo.age || ''}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="如：25岁"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      </div>

      {/* 第二行：电话、邮箱 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 font-medium">电话 <span className="text-red-500">*</span></Label>
          <Input
            value={personalInfo.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="138-0000-0000"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">邮箱 <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={personalInfo.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="zhang@example.com"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      </div>

      {/* 第三行：求职意向 */}
      <div>
        <Label className="text-slate-700 font-medium">求职意向</Label>
        <Input
          value={personalInfo.jobIntention || ''}
          onChange={(e) => updateField('jobIntention', e.target.value)}
          placeholder="如：智能前端工程师、前端开发"
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>
    </div>
  );
}
