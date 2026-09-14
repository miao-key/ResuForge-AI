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
        className="border-blue-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300"
      >
        📄 切换模板
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl border border-blue-100 rounded-xl shadow-2xl shadow-blue-500/10 z-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
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
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 ring-2 ring-blue-100'
                        : 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/60'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{template.thumbnail}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 mb-1">
                        {template.name}
                        {currentTemplate === template.id && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">
                            ✓ 使用中
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">{template.description}</p>
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
