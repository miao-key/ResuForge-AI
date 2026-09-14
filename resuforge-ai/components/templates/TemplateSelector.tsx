'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TEMPLATES } from './index';

interface TemplateSelectorProps {
  currentTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({
  currentTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="border-slate-700 hover:bg-slate-800"
      >
        📄 切换模板
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              选择模板
            </h3>
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-all
                    ${
                      currentTemplate === template.id
                        ? 'border-cyan-500 bg-cyan-950/30'
                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{template.thumbnail}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-200 mb-1">
                        {template.name}
                        {currentTemplate === template.id && (
                          <span className="ml-2 text-xs text-cyan-400">
                            ✓ 使用中
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
