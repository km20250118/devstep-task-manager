import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

function LogoGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" fill="#0d0c09" />
      <rect x="9" y="2" width="5" height="5" fill="#0d0c09" />
      <rect x="2" y="9" width="5" height="5" fill="#0d0c09" />
      <rect x="9" y="9" width="2" height="2" fill="#0d0c09" />
    </svg>
  );
}

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh bg-ink-950 bg-grid">
      {/* Fixed ember glow — tasks/page.tsx: top-0 left-1/3 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-ember-500/4 rounded-full blur-[100px]" />
      </div>

      {/* Topbar — h-16, max-w-4xl, h-7 w-7 logo */}
      <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-10 h-16">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/tasks" className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-ember-500 flex items-center justify-center">
              <LogoGrid />
            </div>
            <span className="font-display font-bold text-ink-100 tracking-tight">
              TaskFlow
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* text-xs text-ink-500 font-mono hidden sm:block */}
            <span className="text-xs text-ink-500 font-mono hidden sm:block">
              {user?.email}
            </span>
            {/* logout: font-mono border-ink-800 rounded */}
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

      {/* Main — max-w-4xl mx-auto px-6 py-16 */}
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-[1] animate-fade-up">
        {children}
      </main>
    </div>
  );
}
