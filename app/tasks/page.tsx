"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getTasks, toggleTask } from "@/app/tasks/actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type Task = {
  id: string;
  user_id: string;
  title: string;
  detail: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

type Filter = "all" | "active" | "done" | "overdue";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks().then((res) => {
      if (res.data) setTasks(res.data);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    // Optimistic update
    setTasks((p) =>
      p.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
    await toggleTask(id, !task.completed);
  };

  const sorted = [...tasks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const visible = sorted.filter((t) => {
    if (filter === "active")  return !t.completed;
    if (filter === "done")    return t.completed;
    if (filter === "overdue") return !t.completed && isOverdue(t.due_date);
    return true;
  });

  const total   = sorted.length;
  const done    = sorted.filter((t) => t.completed).length;
  const overdue = sorted.filter((t) => !t.completed && isOverdue(t.due_date)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-ink-500 font-mono text-sm animate-pulse">
          loading...
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-ember-500/10 border border-ember-500/20 rounded-full px-3 py-1 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse" />
          <span className="text-xs font-mono text-ember-400">タスク管理</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-50 tracking-tight mb-3">
          タスク一覧
        </h1>
        <p className="text-ink-500 font-body">
          {total} tasks · {done} done
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { num: total,   label: "合計タスク", cls: "text-ember-500"   },
          { num: done,    label: "完了済み",    cls: "text-emerald-400" },
          { num: overdue, label: "期限超過",    cls: "text-amber-400"   },
        ].map(({ num, label, cls }) => (
          <div
            key={label}
            className="border border-ink-800 rounded-md bg-ink-900/50 px-4 py-4"
          >
            <div className={`font-mono text-2xl tracking-tight ${cls}`}>
              {num}
            </div>
            <div className="text-xs text-ink-500 font-body mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Task panel — border-ink-800 rounded-xl bg-ink-900/50 overflow-hidden */}
      <div className="border border-ink-800 rounded-xl bg-ink-900/50 overflow-hidden">
        {/* Panel header */}
        <div className="border-b border-ink-800 px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-ink-200 text-sm tracking-wide">
            マイタスク
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  ["all",     "すべて"],
                  ["active",  "未完了"],
                  ["done",    "完了済み"],
                  ["overdue", "期限超過"],
                ] as [Filter, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-body font-medium border transition-all
                    ${
                      filter === f
                        ? "bg-ember-500 border-ember-500 text-ink-950 font-bold"
                        : "border-ink-800 text-ink-500 hover:border-ink-600 hover:text-ink-200"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* New task button */}
            <Link
              href="/tasks/new"
              className="text-xs font-mono text-ink-950 bg-ember-500 hover:bg-ember-400 rounded px-3 py-1.5 transition-colors"
            >
              + タスクを追加
            </Link>
          </div>
        </div>

        {/* Task rows */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 rounded-xl border-2 border-dashed border-ink-700 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ink-700"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-ink-500 font-body text-sm">
                タスクがありません
              </p>
              <p className="text-ink-700 font-mono text-xs mt-1">
                {filter === "all"
                  ? "「タスクを追加」からタスクを作成しましょう"
                  : "このカテゴリにタスクはありません"}
              </p>
            </div>
            {filter === "all" && (
              <Link
                href="/tasks/new"
                className="text-xs font-mono text-ink-950 bg-ember-500 hover:bg-ember-400 rounded px-3 py-1.5 transition-colors"
              >
                最初のタスクを作成
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-ink-800">
            {visible.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  const od = !task.completed && isOverdue(task.due_date);
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`group flex items-center gap-3 px-6 py-4 relative
        hover:bg-ink-800/40 transition-colors
        ${task.completed ? "opacity-50" : ""}`}
    >
      {/* Ember accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ember-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r" />

      {/* Checkbox */}
      <button
        onClick={() =>
          startTransition(() => onToggle(task.id))
        }
        disabled={isPending}
        className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all
          ${
            task.completed
              ? "bg-ember-500 border-ember-500"
              : "border-ink-700 hover:border-ember-500"
          }`}
      >
        {task.completed && <CheckIcon />}
      </button>

      {/* Body — link to detail */}
      <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
        <div
          className={`font-body text-sm font-semibold text-ink-100 truncate
            ${task.completed ? "line-through text-ink-600" : ""}`}
        >
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded border
              ${
                task.completed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : od
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "text-ink-500 border-ink-800"
              }`}
          >
            {task.completed ? "完了" : od ? "期限超過" : "未完了"}
          </span>
          {task.due_date && (
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded border
                ${
                  od
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
            >
              {fmtDate(task.due_date)}
            </span>
          )}
          <span className="font-mono text-[11px] text-ink-600">
            {fmtDate(task.created_at)}
          </span>
        </div>
      </Link>

      <span className="text-ink-600 group-hover:text-ember-500 group-hover:translate-x-0.5 transition-all text-lg leading-none">
        ›
      </span>
    </div>
  );
}
