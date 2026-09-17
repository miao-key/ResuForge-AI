'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SectionItem, SectionField, CustomField } from '@/types';

interface SectionItemEditorProps {
  sectionId: string;
  item: SectionItem;
  isBuiltIn: boolean;
  onUpdate: (item: SectionItem) => void;
  onDelete: () => void;
  onOptimize?: (fieldKey: string, value: string) => void;
  isOptimizing?: boolean;
}

export function SectionItemEditor({
  sectionId,
  item,
  isBuiltIn,
  onUpdate,
  onDelete,
  onOptimize,
  isOptimizing,
}: SectionItemEditorProps) {
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'date' | 'url'>('text');

  // 更新固定字段
  const updateField = (key: string, value: string) => {
    const updatedFields = item.fields.map(field => 
      field.key === key ? { ...field, value } : field
    );
    onUpdate({ ...item, fields: updatedFields });
  };

  // 更新自定义字段
  const updateCustomField = (id: string, value: string) => {
    const updatedCustomFields = item.customFields.map(field =>
      field.id === id ? { ...field, value } : field
    );
    onUpdate({ ...item, customFields: updatedCustomFields });
  };

  // 删除自定义字段
  const deleteCustomField = (id: string) => {
    const updatedCustomFields = item.customFields.filter(field => field.id !== id);
    onUpdate({ ...item, customFields: updatedCustomFields });
  };

  // 添加自定义字段
  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    
    const newField: CustomField = {
      id: `custom_${Date.now()}`,
      label: newFieldLabel.trim(),
      value: '',
      type: newFieldType,
      order: item.customFields.length,
    };
    
    onUpdate({ ...item, customFields: [...item.customFields, newField] });
    setNewFieldLabel('');
    setIsAddingCustomField(false);
  };

  // 判断是否是"目前在职"字段
  const isCurrentField = (key: string, value: string) => {
    return key === 'current' && (value === 'true' || value === '是');
  };

  // 渲染字段
  const renderField = (field: SectionField) => {
    const { key, label, value = '', type, placeholder } = field;
    
    // 处理"目前在职"复选框
    if (key === 'current') {
      return (
        <div className="flex items-center gap-2" key={key}>
          <input
            type="checkbox"
            id={`${sectionId}-${item.id}-${key}`}
            checked={value === 'true' || value === '是'}
            onChange={(e) => updateField(key, e.target.checked ? 'true' : 'false')}
            className="rounded border-blue-200 text-blue-500 focus:ring-blue-400 w-4 h-4"
          />
          <Label 
            htmlFor={`${sectionId}-${item.id}-${key}`}
            className="text-slate-700 cursor-pointer"
          >
            目前在职
          </Label>
        </div>
      );
    }

    // 处理技术栈字段（逗号分隔）
    if (key === 'technologies' || key === 'items') {
      return (
        <div key={key}>
          <Label className="text-slate-700 font-medium">{label}</Label>
          <Input
            value={value}
            onChange={(e) => key && updateField(key, e.target.value)}
            placeholder={placeholder || '用逗号分隔多个值'}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      );
    }

    // 根据类型渲染不同输入框
    if (type === 'textarea') {
      return (
        <div key={key}>
          <Label className="text-slate-700 font-medium mb-1.5 block">{label}</Label>
          <Textarea
            value={value}
            onChange={(e) => key && updateField(key, e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 resize-none focus:border-blue-400"
          />
          {key === 'description' && onOptimize && (
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => key && value && onOptimize(key, value)}
                disabled={isOptimizing || !value.trim()}
                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                {isOptimizing ? '✨ 优化中...' : '✨ AI 优化'}
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (type === 'date') {
      return (
        <div key={key}>
          <Label className="text-slate-700 font-medium">{label}</Label>
          <Input
            type="month"
            value={value}
            onChange={(e) => key && updateField(key, e.target.value)}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 focus:border-blue-400"
          />
        </div>
      );
    }

    if (type === 'year') {
      return (
        <div key={key}>
          <Label className="text-slate-700 font-medium">{label}</Label>
          <Input
            type="number"
            min="1900"
            max="2100"
            step="1"
            value={value}
            onChange={(e) => key && updateField(key, e.target.value)}
            placeholder="例如：2020"
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      );
    }

    if (type === 'url') {
      return (
        <div key={key}>
          <Label className="text-slate-700 font-medium">{label}</Label>
          <Input
            type="url"
            value={value}
            onChange={(e) => key && updateField(key, e.target.value)}
            placeholder={placeholder || 'https://'}
            className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>
      );
    }

    // 默认 text 类型
    return (
      <div key={key}>
        <Label className="text-slate-700 font-medium">{label}</Label>
        <Input
          value={value}
          onChange={(e) => key && updateField(key, e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>
    );
  };

  return (
    <div className="border border-blue-50 rounded-lg p-4 bg-white/40 hover:bg-white/60 transition-colors relative">
      {/* 右上角删除按钮 */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        title="删除此条目"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
        </svg>
      </button>

      {/* 固定字段 - 时间字段单独处理 */}
      <div className="space-y-3 pr-8">
        {(() => {
          // 先按原始顺序找出 description 的位置
          const descIndex = item.fields.findIndex(f => f.key === 'description');
          
          if (descIndex >= 0) {
            // 有 description：在它之前插入时间字段
            const beforeDesc = item.fields.slice(0, descIndex).filter(f => f.key !== 'startDate' && f.key !== 'endDate');
            const afterDesc = item.fields.slice(descIndex + 1);
            return (
              <>
                {/* description 之前的字段 */}
                {beforeDesc.map(field => (
                  <div key={field.key}>{renderField(field)}</div>
                ))}
                {/* 时间字段（同行） */}
                {item.fields.some(f => f.key === 'startDate' || f.key === 'endDate') && (
                  <div className="flex gap-3">
                    {item.fields.find(f => f.key === 'startDate') && (
                      <div className="flex-1">
                        <Label className="text-slate-700 font-medium">开始时间</Label>
                        <Input
                          type="number"
                          min="1900"
                          max="2100"
                          step="1"
                          value={item.fields.find(f => f.key === 'startDate')?.value || ''}
                          onChange={(e) => updateField('startDate', e.target.value)}
                          placeholder="例如：2020"
                          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-center pt-5 text-slate-400">—</div>
                    {item.fields.find(f => f.key === 'endDate') && (
                      <div className="flex-1">
                        <Label className="text-slate-700 font-medium">结束时间</Label>
                        <Input
                          type="number"
                          min="1900"
                          max="2100"
                          step="1"
                          value={item.fields.find(f => f.key === 'endDate')?.value || ''}
                          onChange={(e) => updateField('endDate', e.target.value)}
                          placeholder="例如：2024"
                          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
                        />
                      </div>
                    )}
                  </div>
                )}
                {/* description 及之后的字段 */}
                {renderField(item.fields[descIndex])}
                {afterDesc.map(field => (
                  <div key={field.key}>{renderField(field)}</div>
                ))}
              </>
            );
          } else {
            // 没有 description：保持原顺序，时间字段同行
            return (
              <>
                {item.fields
                  .filter(field => field.key !== 'startDate' && field.key !== 'endDate')
                  .map(field => (
                    <div key={field.key}>{renderField(field)}</div>
                  ))}
                {item.fields.some(f => f.key === 'startDate' || f.key === 'endDate') && (
                  <div className="flex gap-3">
                    {item.fields.find(f => f.key === 'startDate') && (
                      <div className="flex-1">
                        <Label className="text-slate-700 font-medium">开始时间</Label>
                        <Input
                          type="number"
                          min="1900"
                          max="2100"
                          step="1"
                          value={item.fields.find(f => f.key === 'startDate')?.value || ''}
                          onChange={(e) => updateField('startDate', e.target.value)}
                          placeholder="例如：2020"
                          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-center pt-5 text-slate-400">—</div>
                    {item.fields.find(f => f.key === 'endDate') && (
                      <div className="flex-1">
                        <Label className="text-slate-700 font-medium">结束时间</Label>
                        <Input
                          type="number"
                          min="1900"
                          max="2100"
                          step="1"
                          value={item.fields.find(f => f.key === 'endDate')?.value || ''}
                          onChange={(e) => updateField('endDate', e.target.value)}
                          placeholder="例如：2024"
                          className="mt-1.5 bg-white/80 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          }
        })()}
      </div>

      {/* 自定义字段 */}
      {item.customFields.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-100 space-y-3">
          {item.customFields.map(customField => (
            <div key={customField.id} className="relative">
              <Label className="text-slate-600 font-medium text-sm">{customField.label}</Label>
              {customField.type === 'textarea' ? (
                <Textarea
                  value={customField.value}
                  onChange={(e) => updateCustomField(customField.id, e.target.value)}
                  rows={3}
                  className="mt-1 bg-white/80 border-blue-100 text-slate-800 text-sm"
                />
              ) : (
                <Input
                  value={customField.value}
                  onChange={(e) => updateCustomField(customField.id, e.target.value)}
                  type={customField.type === 'url' ? 'url' : 'text'}
                  placeholder={`输入${customField.label}`}
                  className="mt-1 bg-white/80 border-blue-100 text-slate-800 text-sm"
                />
              )}
              <button
                onClick={() => deleteCustomField(customField.id)}
                className="absolute top-0 right-0 text-slate-400 hover:text-red-500 text-xs"
                title="删除此字段"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 添加自定义字段 */}
      {isAddingCustomField ? (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <div className="space-y-2">
            <Input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="字段名称，如：项目经费"
              className="bg-white text-sm"
            />
            <div className="flex items-center gap-2">
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm text-slate-800"
              >
                <option value="text">单行文本</option>
                <option value="textarea">多行文本</option>
                <option value="date">日期</option>
                <option value="url">链接</option>
              </select>
              <Button
                size="sm"
                onClick={addCustomField}
                disabled={!newFieldLabel.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                添加
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingCustomField(false);
                  setNewFieldLabel('');
                }}
                className="text-slate-500"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
