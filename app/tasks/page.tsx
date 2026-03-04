import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-dvh bg-ink-950 bg-grid">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-ember-500/4 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-ember-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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

          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-500 font-mono hidden sm:block">
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs font-mono text-ink-500 hover:text-ink-200 transition-colors px-3 py-1.5 border border-ink-800 rounded hover:border-ink-600"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-up">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-ember-500/10 border border-ember-500/20 rounded-full px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse" />
            <span className="text-xs font-mono text-ember-400">Week 2 準備中</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-ink-50 tracking-tight mb-3">
            タスク一覧
          </h1>
          <p className="text-ink-500 font-body">
            Week 2 でタスク管理機能を実装予定です
          </p>
        </div>

        {/* Placeholder task UI */}
        <div className="border border-ink-800 rounded-xl bg-ink-900/50 overflow-hidden">
          <div className="border-b border-ink-800 px-6 py-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink-200 text-sm tracking-wide">
              マイタスク
            </h2>
            <button
              disabled
              className="text-xs font-mono text-ink-600 border border-ink-800 rounded px-3 py-1.5 opacity-50 cursor-not-allowed"
            >
              + タスクを追加
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 rounded-xl border-2 border-dashed border-ink-700 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-700">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-ink-500 font-body text-sm">
                タスクはまだありません
              </p>
              <p className="text-ink-700 font-mono text-xs mt-1">
                Week 2 で実装予定
              </p>
            </div>
          </div>
        </div>

        {/* Auth confirmation */}
        <div className="mt-8 rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-5 py-4 flex items-start gap-3 animate-slide-in">
          <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
          <div>
            <p className="text-sm font-display font-semibold text-emerald-400">
              認証成功
            </p>
            <p className="text-xs text-ink-500 font-mono mt-0.5">
              {user.email} としてログイン中
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
