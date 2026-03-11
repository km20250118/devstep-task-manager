"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTask, toggleTask, deleteTask } from "@/app/tasks/actions";

type Task = {
  id: string;
  title: string;
  detail: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const isOverdue = (due: string | null) => {
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(due) < today;
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className="w-[11px] h-[11px]"
      stroke="#0d0c09"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1.5 6 4.5 9 10.5 3" />
    </svg>
  );
}

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [task, setTask]           = useState<Task | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getTask(params.id).then((res) => {
      setTask(res.data ?? null);
      setLoading(false);
    });
  }, [params.id]);

  const handleToggle = () => {
    if (!task) return;
    setTask((t) => t ? { ...t, completed: !t.completed } : t);
    startTransition(async () => { await toggleTask(task.id, !task.completed); });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(params.id);
      router.push("/tasks");
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-ink-500 font-mono text-sm animate-pulse">
          loading...
        </span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-4xl opacity-30">🔒</div>
        <p className="font-display text-lg font-bold text-ink-200">
          アクセスできません
        </p>
        <p className="font-body text-sm text-ink-500">
          このタスクは存在しないか、アクセス権限がありません。
        </p>
        <Link
          href="/tasks"
          className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100
            rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all"
        >
          ← 一覧へ戻る
        </Link>
      </div>
    );
  }

  const od = !task.completed && isOverdue(task.due_date);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-ink-500 mb-6 animate-slide-in">
        <Link href="/tasks" className="text-ember-400 hover:text-ember-300 font-medium">
          タスク一覧
        </Link>
        <span className="text-ink-700">/</span>
        <span>詳細</span>
      </nav>

      {/* Detail card */}
      <div className="border border-ink-800 rounded-xl bg-ink-950/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Title + checkbox */}
          <div className="flex items-start gap-3 mb-4">
            <button
              onClick={handleToggle}
              className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 mt-1 transition-all
                ${
                  task.completed
                    ? "bg-ember-500 border-ember-500"
                    : "border-ink-700 hover:border-ember-500"
                }`}
            >
              {task.completed && <CheckIcon />}
            </button>
            <h1
              className={`font-display text-xl font-bold tracking-tight leading-snug
                ${task.completed ? "line-through text-ink-600" : "text-ink-50"}`}
            >
              {task.title}
            </h1>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap mb-6">
            <span
              className={`font-mono text-xs px-2 py-1 rounded border
                ${
                  task.completed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : od
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "text-ink-500 border-ink-800"
                }`}
            >
              {task.completed ? "✓ 完了" : od ? "⚠ 期限超過" : "○ 未完了"}
            </span>
            {task.due_date && (
              <span
                className={`font-mono text-xs px-2 py-1 rounded border
                  ${
                    od
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
              >
                期限 — {fmtDate(task.due_date)}
              </span>
            )}
          </div>

          {/* Detail text */}
          {task.detail && (
            <div className="mb-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-2">
                詳細
              </div>
              <p className="font-body text-sm text-ink-200 leading-relaxed whitespace-pre-wrap">
                {task.detail}
              </p>
            </div>
          )}

          <hr className="border-ink-800 my-6" />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-1">
                作成日時
              </div>
              <div className="font-body text-sm text-ink-200">
                {fmtDateTime(task.created_at)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-1">
                更新日時
              </div>
              <div className="font-body text-sm text-ink-200">
                {fmtDateTime(task.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-ink-950 border-t border-ink-800 flex gap-2 flex-wrap">
          <Link
            href="/tasks"
            className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100
              rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all"
          >
            ← 一覧へ戻る
          </Link>
          <Link
            href={`/tasks/${task.id}/edit`}
            className="bg-ember-500 hover:bg-ember-400 text-ink-950
              rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide
              transition-all shadow-lg shadow-ember-500/20"
          >
            ✏ 編集する
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-ink-950
              hover:border-red-500 rounded-md px-5 py-2.5 text-sm font-display font-semibold
              tracking-wide transition-all"
          >
            削除する
          </button>
        </div>
      </div>

      {/* Delete dialog */}
      {showDelete && (
        <div
          className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50
            flex items-center justify-center p-5 animate-fade-in"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="border border-ink-800 rounded-xl bg-ink-950/95 backdrop-blur-md
              p-8 max-w-sm w-full shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-2xl mb-3">🗑️</div>
            <h2 className="font-display text-lg font-bold text-ink-50 mb-2 tracking-tight">
              タスクを削除しますか？
            </h2>
            <p className="font-body text-sm text-ink-500 leading-relaxed mb-6">
              この操作は取り消せません。
              <br />
              タスクが完全に削除されます。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100
                  rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-ink-950
                  hover:border-red-500 disabled:opacity-50 rounded-md px-5 py-2.5 text-sm
                  font-display font-semibold tracking-wide transition-all"
              >
                {isPending ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
