import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, showCount, maxLength, id, value, ...props }, ref) => {
    const textareaId = id || React.useId();
    const helperId = `${textareaId}-helper`;
    const currentLength = typeof value === 'string' ? value.length : 0;
    
    return (
      <div className="w-full">
        <textarea
          id={textareaId}
          aria-invalid={error}
          aria-describedby={helperText ? helperId : undefined}
          maxLength={maxLength}
          value={value}
          className={cn(
            "flex min-h-[60px] w-full rounded-md bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500",
            "focus-visible:outline-none focus-visible:ring-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none transition-colors",
            error 
              ? "border border-red-500 focus-visible:ring-red-500" 
              : "border border-slate-700 focus-visible:ring-slate-400",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {helperText && (
            <p 
              id={helperId}
              className={cn(
                "text-xs",
                error ? "text-red-400" : "text-slate-500"
              )}
            >
              {helperText}
            </p>
          )}
          {showCount && maxLength && (
            <p className="text-xs text-slate-500">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
