import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold",
          "text-sm tracking-wide transition-all duration-200 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" && [
            "bg-ember-500 text-ink-950 px-6 py-3 w-full",
            "hover:bg-ember-400 active:scale-[0.98]",
            "shadow-lg shadow-ember-500/20",
          ],
          variant === "ghost" && [
            "text-ink-400 px-4 py-2 hover:text-ink-100",
          ],
          variant === "outline" && [
            "border border-ink-700 text-ink-300 px-6 py-3 w-full",
            "hover:border-ink-500 hover:text-ink-100",
          ],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          </span>
        )}
        <span className={cn(loading && "opacity-0")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
