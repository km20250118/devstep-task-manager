"use client";

import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, subtitle, children, className }: AuthCardProps) {
  return (
    <div className={cn(
      "w-full max-w-md animate-fade-up",
      className
    )}>
      {/* Logo mark */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-ember-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" fill="#0d0c09" />
            <rect x="9" y="2" width="5" height="5" fill="#0d0c09" />
            <rect x="2" y="9" width="5" height="5" fill="#0d0c09" />
            <rect x="9" y="9" width="2" height="2" fill="#0d0c09" />
          </svg>
        </div>
        <span className="font-display font-bold text-ink-100 tracking-tight">
          TaskFlow
        </span>
      </div>

      <div className="border border-ink-800 rounded-xl bg-ink-950/80 backdrop-blur-sm p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold text-ink-50 mb-1 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-500 mb-8 font-body">{subtitle}</p>
        )}
        <div className={cn(!subtitle && "mt-6")}>
          {children}
        </div>
      </div>
    </div>
  );
}
