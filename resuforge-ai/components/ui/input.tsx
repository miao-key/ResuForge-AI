import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const helperId = `${inputId}-helper`;
    
    return (
      <div className="w-full">
        <input
          type={type}
          id={inputId}
          aria-invalid={error}
          aria-describedby={helperText ? helperId : undefined}
          className={cn(
            "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "placeholder:text-slate-500",
            "focus-visible:outline-none focus-visible:ring-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error 
              ? "border-red-500 focus-visible:ring-red-500" 
              : "border-slate-700 focus-visible:ring-slate-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p 
            id={helperId}
            className={cn(
              "mt-1 text-xs",
              error ? "text-red-400" : "text-slate-500"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
