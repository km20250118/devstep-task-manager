import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium tracking-widest uppercase text-ink-400 font-mono">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-ink-900 border border-ink-700 rounded-md px-4 py-3",
            "text-ink-100 placeholder:text-ink-600 font-body text-sm",
            "focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500/30",
            "transition-all duration-200",
            error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 font-mono">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
