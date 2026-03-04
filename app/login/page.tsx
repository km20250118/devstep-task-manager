"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <main className="min-h-dvh bg-ink-950 bg-grid flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-ember-500/5 rounded-full blur-[120px]" />
      </div>

      <AuthCard
        title="TaskFlowへようこそ"
        subtitle="アカウントにログインしてください"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="メールアドレス"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Input
            label="パスワード"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 animate-fade-in">
              <p className="text-sm text-red-400 font-mono">{error}</p>
            </div>
          )}

          <Button type="submit" loading={isPending} className="mt-2">
            ログイン
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-ink-800 text-center">
          <p className="text-sm text-ink-500 font-body">
            アカウントをお持ちでない方は{" "}
            <Link
              href="/signup"
              className="text-ember-400 hover:text-ember-300 font-medium transition-colors"
            >
              新規登録
            </Link>
          </p>
        </div>
      </AuthCard>
    </main>
  );
}
