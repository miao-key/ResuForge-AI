'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PersonalInfo } from '@/types';

interface PersonalInfoEditorProps {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

// 严格约束：电话只允许数字 / 空格 / -，且最多 11 位数字
const sanitizePhone = (raw: string): string => {
  // 先去掉所有非数字、空格、- 的字符
  let cleaned = raw.replace(/[^\d\s-]/g, '');
  // 仅保留数字位数最多 11 位（超出的直接截掉）
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length > 11) {
    // 按前 11 位数字重建（保留原顺序与分隔符位置近似，用最稳的策略：过滤掉多余数字字符）
    let count = 0;
    cleaned = cleaned
      .split('')
      .filter((ch) => {
        if (/\d/.test(ch)) {
          count += 1;
          return count <= 11;
        }
        return true;
      })
      .join('');
  }
  return cleaned;
};

// 严格约束：邮箱只允许合法字符（小写字母、数字、@ . _ - +），并实时校验结构
const EMAIL_MAX_LENGTH = 254;     // RFC 5321：邮箱总长度上限
const EMAIL_LOCAL_MAX_LENGTH = 64; // RFC 5321：本地部分长度上限

const sanitizeEmail = (raw: string): string => {
  // 1. 过滤非法字符（只保留小写字母、数字、@ . _ - +）
  let cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9@._\-+]/g, '');
  // 2. 只允许出现一个 @
  const atIndex = cleaned.indexOf('@');
  if (atIndex !== -1) {
    const first = cleaned.slice(0, atIndex + 1);
    const rest = cleaned.slice(atIndex + 1).replace(/@/g, '');
    cleaned = first + rest;
  }
  // 3. @ 之前不允许以 . - _ + 开头/结尾；不允许连续分隔符
  const atIdx = cleaned.indexOf('@');
  if (atIdx > 0) {
    const local = cleaned.slice(0, atIdx);
    const safeLocal = local
      .replace(/^[.\-_+]+/, '')
      .replace(/[.\-_+]+$/, '')
      .replace(/[.\-_+]{2,}/g, (m) => m[0]);
    cleaned = safeLocal + cleaned.slice(atIdx);
  }
  // 4. @ 之后域名段：不允许连续 .，且不能以 . - 开头/结尾
  if (cleaned.includes('@')) {
    const [localPart, ...domainParts] = cleaned.split('@');
    const domainRaw = domainParts.join('@');
    let domain = domainRaw.replace(/\.{2,}/g, '.');
    domain = domain.replace(/^[.\-]+/, '').replace(/[.\-]+$/, '');
    cleaned = `${localPart}@${domain}`;
  }
  // 5. 长度约束：本地部分最多 64 字符；整体最多 254 字符
  if (cleaned.includes('@')) {
    const atIdx2 = cleaned.indexOf('@');
    const localPart = cleaned.slice(0, atIdx2);
    const domainPart = cleaned.slice(atIdx2 + 1);
    const limitedLocal = localPart.slice(0, EMAIL_LOCAL_MAX_LENGTH);
    let limited = `${limitedLocal}@${domainPart}`;
    if (limited.length > EMAIL_MAX_LENGTH) {
      limited = limited.slice(0, EMAIL_MAX_LENGTH);
    }
    cleaned = limited;
  } else {
    // 没有 @ 时也按总长度截断
    cleaned = cleaned.slice(0, EMAIL_MAX_LENGTH);
  }
  return cleaned;
};

// 严格约束：年龄只允许 0-150 的整数
const sanitizeAge = (raw: string): string => {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return '';
  // 去掉前导 0（避免 "00025" 这种）
  const noLeadingZero = digitsOnly.replace(/^0+(\d)/, '$1');
  // 限制最大 3 位（150 以内）
  const trimmed = noLeadingZero.slice(0, 3);
  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num)) return '';
  if (num < 0) return '';
  if (num > 150) return '150';
  return String(num);
};

export function PersonalInfoEditor({
  personalInfo,
  onChange,
}: PersonalInfoEditorProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...personalInfo, [field]: value });
  };

  // 头像上传：将图片压缩并转为 base64 data URL（限制大小，避免内容过大）
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 清空 input value，允许重复选择同一文件
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    if (!file) return;

    // 基础校验：类型 + 大小（5MB）
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      alert('仅支持 PNG / JPG / WEBP 格式的图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      // 用 Image 压缩到 200x200 以内，输出 JPEG dataURL，控制存储体积
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 200;
        let { width, height } = img;
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // 兜底：直接保存原图
          updateField('avatar', result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        updateField('avatar', compressed);
      };
      img.onerror = () => {
        // 解析失败时直接保存原始 dataURL
        updateField('avatar', result);
      };
      img.src = result;
    };
    reader.onerror = () => {
      alert('读取图片失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateField('avatar', '');
  };

  // 处理电话输入：每次只允许插入合法字符；粘贴也会被清洗
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhone(e.target.value);
    updateField('phone', sanitized);
  };

  // 邮箱：失焦时再做一次完整校验；输入时只清洗字符
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmail(e.target.value);
    updateField('email', sanitized);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAge(e.target.value);
    updateField('age', sanitized);
  };

  // 阻止非法按键（粘贴也会在 onChange 中再次清洗）
  const blockNonDigit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End',
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    // 年龄只允许数字；电话只允许数字 / 空格 / -
    if (e.currentTarget.dataset.field === 'age') {
      if (!/^\d$/.test(e.key)) e.preventDefault();
    } else if (e.currentTarget.dataset.field === 'phone') {
      if (!/^[\d\- ]$/.test(e.key)) e.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      {/* 第零行：头像上传（独立一行，置于第一行之上） */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {personalInfo.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.avatar}
              alt="头像预览"
              className="w-20 h-20 object-cover border-2 border-blue-100 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-dashed border-blue-200 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>{personalInfo.avatar ? '更换头像' : '上传头像'}</span>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
          {personalInfo.avatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-slate-600 text-sm font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span>移除</span>
            </button>
          )}
          <span className="text-xs text-slate-400">支持 PNG / JPG / WEBP</span>
        </div>
      </div>

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
            required
            className="mt-1.5 w-full px-3 py-2 bg-white/80 border border-blue-100 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none"
            style={!personalInfo.gender ? { color: '#9ca3af' } : {}}
          >
            <option value="" disabled hidden>性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div>
          <Label className="text-slate-700 font-medium">年龄</Label>
          <Input
            data-field="age"
            inputMode="numeric"
            value={personalInfo.age || ''}
            onChange={handleAgeChange}
            onKeyDown={blockNonDigit}
            maxLength={3}
            placeholder="如：25"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      </div>

      {/* 第二行：电话、邮箱 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 font-medium">电话 <span className="text-red-500">*</span></Label>
          <Input
            data-field="phone"
            inputMode="tel"
            value={personalInfo.phone || ''}
            onChange={handlePhoneChange}
            onKeyDown={blockNonDigit}
            maxLength={20}
            placeholder="138-0000-0000"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
        <div>
          <Label className="text-slate-700 font-medium">邮箱 <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={personalInfo.email || ''}
            onChange={handleEmailChange}
            maxLength={254}
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
