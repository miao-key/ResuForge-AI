'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Section, SectionItem, SectionField, CustomField, BuiltInSectionType } from '@/types';
import { 
  BUILT_IN_SECTIONS, 
  DEFAULT_SECTIONS, 
  AVAILABLE_BUILT_IN_SECTIONS,
  REMOVABLE_BUILT_IN_SECTIONS,
  createBuiltInSection,
  createSectionItem,
  getSectionItemLabel
} from '@/lib/resume/section-config';
import { SectionItemEditor } from './SectionItemEditor';

interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  onOptimize?: (sectionId: string, itemId: string, fieldKey: string, value: string) => void;
  isOptimizing?: string;
}

export function SectionEditor({
  sections,
  onChange,
  onOptimize,
  isOptimizing,
}: SectionEditorProps) {
  const [isAddingSection, setIsAddingSection] = useState(false);

  // 获取可添加的菜单选项
  const availableToAdd = AVAILABLE_BUILT_IN_SECTIONS.filter(
    type => !sections.some(s => s.id.startsWith(type) || s.title === BUILT_IN_SECTIONS[type].title)
  );

  // 添加内置菜单
  const handleAddBuiltInSection = (type: BuiltInSectionType) => {
    const deletable = REMOVABLE_BUILT_IN_SECTIONS.includes(type);
    const newSection = createBuiltInSection(type, sections.length, deletable);
    const updatedSections = [...sections, newSection];
    onChange(updatedSections);
    setIsAddingSection(false);
  };

  // 添加自定义菜单
  const [customSectionTitle, setCustomSectionTitle] = useState('');

  const handleAddCustomSection = () => {
    const trimmedTitle = customSectionTitle.trim();
    if (!trimmedTitle) return;

    // 自定义菜单默认带一个条目，并自带一个“{标题}描述”字段（支持 AI 优化）
    const defaultItemId = `custom_item_${Date.now()}`;
    const descriptionFieldKey = 'description';
    const defaultItem = {
      id: defaultItemId,
      fields: [
        {
          key: descriptionFieldKey,
          label: `${trimmedTitle}描述`,
          value: '',
          type: 'textarea' as const,
          required: true,
          order: 1,
          placeholder: `详细描述${trimmedTitle}的内容、亮点与成果...`,
        },
      ],
      customFields: [],
    };

    const newSection: Section = {
      id: `custom_${Date.now()}`,
      title: trimmedTitle,
      order: sections.length,
      items: [defaultItem],
      isBuiltIn: false,
    };

    onChange([...sections, newSection]);
    setCustomSectionTitle('');
    setIsAddingSection(false);
  };

  // 删除菜单
  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    onChange(updatedSections.map((s, i) => ({ ...s, order: i })));
  };

  // 添加条目到菜单
  const handleAddItem = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    let newItem: SectionItem;

    if (section.isBuiltIn) {
      const sectionType = AVAILABLE_BUILT_IN_SECTIONS.find(
        type => section.title === BUILT_IN_SECTIONS[type].title
      );
      if (sectionType) {
        newItem = createSectionItem(sectionType);
      } else {
        newItem = { id: `item_${Date.now()}`, fields: [], customFields: [] };
      }
    } else {
      // 自定义菜单：参考同菜单已有条目的字段结构（继承首个条目的字段定义，但清空值并生成新 id）
      const templateItem = section.items[0];
      const clonedFields: SectionField[] = templateItem
        ? templateItem.fields.map(f => ({ ...f, value: '' }))
        : [];
      const clonedCustomFields: CustomField[] = templateItem
        ? templateItem.customFields.map(f => ({ ...f, id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, value: '' }))
        : [];
      newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        fields: clonedFields,
        customFields: clonedCustomFields,
      };
    }

    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: [...s.items, newItem] };
      }
      return s;
    });
    onChange(updatedSections);
  };

  // 更新条目
  const handleUpdateItem = (sectionId: string, itemId: string, updatedItem: SectionItem) => {
    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: s.items.map(item => item.id === itemId ? updatedItem : item),
        };
      }
      return s;
    });
    onChange(updatedSections);
  };

  // 删除条目
  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter(item => item.id !== itemId) };
      }
      return s;
    });
    onChange(updatedSections);
  };

  // 上移菜单
  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    const updatedSections = [...sections];
    [updatedSections[index - 1], updatedSections[index]] = [updatedSections[index], updatedSections[index - 1]];
    onChange(updatedSections.map((s, i) => ({ ...s, order: i })));
  };

  // 下移菜单
  const moveSectionDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const updatedSections = [...sections];
    [updatedSections[index], updatedSections[index + 1]] = [updatedSections[index + 1], updatedSections[index]];
    onChange(updatedSections.map((s, i) => ({ ...s, order: i })));
  };

  // 获取条目标签
  const getItemLabel = (section: Section): string => {
    if (section.isBuiltIn) {
      const sectionType = AVAILABLE_BUILT_IN_SECTIONS.find(
        type => section.title === BUILT_IN_SECTIONS[type].title
      );
      if (sectionType) {
        return getSectionItemLabel(sectionType);
      }
    }
    return '条目';
  };

  return (
    <div className="space-y-4">
      {/* 菜单列表 */}
      {sections.map((section, index) => (
        <div 
          key={section.id} 
          className="border border-blue-100 rounded-xl bg-white/80 overflow-hidden shadow-sm"
        >
          {/* 菜单头部 */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-800">{section.title}</h3>
              {!section.isBuiltIn && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                  自定义
                </span>
              )}
              <span className="text-xs text-slate-400">({section.items.length} 项)</span>
            </div>
            <div className="flex items-center gap-2">
              {/* 排序按钮 */}
              <button
                onClick={() => moveSectionUp(index)}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="上移"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown(index)}
                disabled={index === sections.length - 1}
                className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="下移"
              >
                ↓
              </button>
              {/* 删除按钮：自定义菜单 或 用户主动添加的可删除预设菜单 */}
              {section.deletable !== false && (
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="删除此菜单"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 菜单内容 */}
          <div className="border-t border-blue-100 p-4 space-y-4">
            {/* 条目列表 */}
            {section.items.map((item) => (
              <div key={item.id} className="relative">
                <SectionItemEditor
                  sectionId={section.id}
                  sectionTitle={section.title}
                  item={item}
                  isBuiltIn={section.isBuiltIn}
                  onUpdate={(updatedItem) => handleUpdateItem(section.id, item.id, updatedItem)}
                  onDelete={() => handleDeleteItem(section.id, item.id)}
                  onOptimize={onOptimize ? (fieldKey, value) => onOptimize(section.id, item.id, fieldKey, value) : undefined}
                  isOptimizing={isOptimizing === `${section.id}-${item.id}`}
                />
              </div>
            ))}
            
            {/* 添加新条目按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(section.id)}
              className="w-full border-blue-200 hover:bg-blue-50 text-blue-600 border-dashed"
            >
              + 添加新的{getItemLabel(section)}
            </Button>
          </div>
        </div>
      ))}

      {/* 添加菜单按钮 */}
      {isAddingSection ? (
        <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/30">
          <h4 className="font-medium text-slate-700 mb-3">添加菜单</h4>
          
          {/* 内置菜单选项 */}
          {availableToAdd.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-2">选择预设菜单：</p>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.map(type => (
                  <button
                    key={type}
                    onClick={() => handleAddBuiltInSection(type)}
                    className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {BUILT_IN_SECTIONS[type].title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 自定义菜单 */}
          <div className="border-t border-blue-200 pt-4 mt-4">
            <p className="text-sm text-slate-500 mb-2">或创建自定义菜单：</p>
            <div className="space-y-2">
              <Input
                value={customSectionTitle}
                onChange={(e) => setCustomSectionTitle(e.target.value)}
                placeholder="输入自定义菜单名称，如：竞赛经历、项目经验"
                className="bg-white"
              />
              <Button
                size="sm"
                onClick={handleAddCustomSection}
                disabled={!customSectionTitle.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                创建自定义菜单
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingSection(false)}
            className="mt-3 text-slate-500"
          >
            取消
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAddingSection(true)}
          className="w-full border-dashed border-blue-200 hover:bg-blue-50 text-blue-600 py-6"
        >
          + 添加新菜单
        </Button>
      )}
    </div>
  );
}
