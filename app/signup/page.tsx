"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
    });
  }

  return (
    <main className="min-h-dvh bg-ink-950 bg-grid flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-ember-500/5 rounded-full blur-[120px]" />
      </div>

      <AuthCard
        title="はじめましょう"
        subtitle="無料でアカウントを作成してください"
      >
        {success ? (
          <div className="animate-fade-up">
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-4 py-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg leading-none mt-0.5">✓</span>
                <p className="text-sm text-emerald-400 font-mono">{success}</p>
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline">
                ログイン画面へ戻る
              </Button>
            </Link>
          </div>
        ) : (
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
              placeholder="6文字以上"
              autoComplete="new-password"
              required
            />
            <Input
              label="パスワード（確認）"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />

            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 animate-fade-in">
                <p className="text-sm text-red-400 font-mono">{error}</p>
              </div>
            )}

            <Button type="submit" loading={isPending} className="mt-2">
              アカウントを作成
            </Button>
          </form>
        )}

        {!success && (
          <div className="mt-6 pt-6 border-t border-ink-800 text-center">
            <p className="text-sm text-ink-500 font-body">
              すでにアカウントをお持ちの方は{" "}
              <Link
                href="/login"
                className="text-ember-400 hover:text-ember-300 font-medium transition-colors"
              >
                ログイン
              </Link>
            </p>
          </div>
        )}
      </AuthCard>
    </main>
  );
}
