"use client";

import { useState, useTransition, useEffect } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "@/app/tasks/actions";

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
type View   = "list" | "new" | "detail" | "edit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

const isOverdue = (due: string | null) => {
  if (!due) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(due) < today;
};

// ─── Logo SVG ─────────────────────────────────────────────────────────────────

function LogoGrid({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" fill="#0d0c09" />
      <rect x="9" y="2" width="5" height="5" fill="#0d0c09" />
      <rect x="2" y="9" width="5" height="5" fill="#0d0c09" />
      <rect x="9" y="9" width="2" height="2" fill="#0d0c09" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="w-[11px] h-[11px]"
      stroke="#0d0c09" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5 6 4.5 9 10.5 3" />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [user, setUser]         = useState<{ id: string; email: string } | null>(null);
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [view, setView]         = useState<View>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [flash, setFlash]       = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3200);
  };

  const navigate = (v: View, id: string | null = null) => {
    setView(v); setActiveId(id); window.scrollTo(0, 0);
  };

  // Auth check & initial load
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { redirect("/login"); return; }
      setUser({ id: user.id, email: user.email! });
      getTasks().then((res) => { if (res.data) setTasks(res.data); setLoading(false); });
    });
  }, []);

  const handleToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed, updated_at: new Date().toISOString() };
    setTasks((p) => p.map((t) => t.id === id ? updated : t));
    await toggleTask(id, !task.completed);
  };

  const handleCreate = async (data: { title: string; detail: string | null; due_date: string | null }) => {
    const res = await createTask(data);
    if (res.data) {
      setTasks((p) => [res.data!, ...p]);
      showFlash("タスクを作成しました");
      navigate("list");
    } else {
      showFlash(res.error ?? "作成に失敗しました", "error");
    }
  };

  const handleUpdate = async (id: string, data: { title: string; detail: string | null; due_date: string | null }) => {
    const res = await updateTask(id, data);
    if (res.data) {
      setTasks((p) => p.map((t) => t.id === id ? res.data! : t));
      showFlash("タスクを更新しました");
      navigate("detail", id);
    } else {
      showFlash(res.error ?? "更新に失敗しました", "error");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks((p) => p.filter((t) => t.id !== id));
    setDeleteId(null);
    showFlash("タスクを削除しました", "error");
    navigate("list");
  };

  const myTasks = tasks.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const activeTask = myTasks.find((t) => t.id === activeId) ?? null;

  if (loading) {
    return (
      <main className="min-h-dvh bg-ink-950 bg-grid flex items-center justify-center">
        <span className="text-ink-500 font-mono text-sm animate-pulse">loading...</span>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-ink-950 bg-grid">
      {/* Fixed ember glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-ember-500/4 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("list")}
            className="flex items-center gap-3"
          >
            <div className="h-7 w-7 rounded bg-ember-500 flex items-center justify-center">
              <LogoGrid size={14} />
            </div>
            <span className="font-display font-bold text-ink-100 tracking-tight">
              TaskFlow
            </span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-500 font-mono hidden sm:block">
              {user?.email}
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

      {/* Main */}
      <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-up">
        {flash && (
          <div className={`flex items-center gap-2 rounded-md px-4 py-3 mb-6 text-sm font-mono animate-slide-in
            ${flash.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
            <span className="opacity-60 text-xs">{flash.type === "success" ? "[ok]" : "[--]"}</span>
            {flash.msg}
          </div>
        )}

        {view === "list"   && <ListView tasks={myTasks} onNavigate={navigate} onToggle={handleToggle} />}
        {view === "new"    && <TaskForm onSubmit={handleCreate} onCancel={() => navigate("list")} />}
        {view === "detail" && activeTask && (
          <DetailView
            task={activeTask}
            onEdit={() => navigate("edit", activeTask.id)}
            onDelete={() => setDeleteId(activeTask.id)}
            onToggle={handleToggle}
            onBack={() => navigate("list")}
          />
        )}
        {view === "edit" && activeTask && (
          <TaskForm
            task={activeTask}
            onSubmit={(d) => handleUpdate(activeTask.id, d)}
            onCancel={() => navigate("detail", activeTask.id)}
          />
        )}
      </div>

      {deleteId && (
        <DeleteDialog
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </main>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

function ListView({
  tasks,
  onNavigate,
  onToggle,
}: {
  tasks: Task[];
  onNavigate: (v: View, id?: string | null) => void;
  onToggle: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const total   = tasks.length;
  const done    = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => !t.completed && isOverdue(t.due_date)).length;

  const visible = tasks.filter((t) => {
    if (filter === "active")  return !t.completed;
    if (filter === "done")    return t.completed;
    if (filter === "overdue") return !t.completed && isOverdue(t.due_date);
    return true;
  });

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
        <p className="text-ink-500 font-body">{total} tasks · {done} done</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { num: total,   label: "合計タスク",  cls: "text-ember-500" },
          { num: done,    label: "完了済み",     cls: "text-emerald-400" },
          { num: overdue, label: "期限超過",     cls: "text-amber-400" },
        ].map(({ num, label, cls }) => (
          <div key={label} className="border border-ink-800 rounded-md bg-ink-900/50 px-4 py-4">
            <div className={`font-mono text-2xl font-normal tracking-tight ${cls}`}>{num}</div>
            <div className="text-xs text-ink-500 font-body mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Task panel */}
      <div className="border border-ink-800 rounded-xl bg-ink-900/50 overflow-hidden">
        {/* Panel header */}
        <div className="border-b border-ink-800 px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-ink-200 text-sm tracking-wide">
            マイタスク
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "active", "done", "overdue"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-body font-medium border transition-all
                    ${filter === f
                      ? "bg-ember-500 border-ember-500 text-ink-950 font-bold"
                      : "border-ink-800 text-ink-500 hover:border-ink-600 hover:text-ink-200"
                    }`}
                >
                  {{ all: "すべて", active: "未完了", done: "完了済み", overdue: "期限超過" }[f]}
                </button>
              ))}
            </div>
            <button
              onClick={() => onNavigate("new")}
              className="text-xs font-mono text-ink-950 bg-ember-500 hover:bg-ember-400 border border-ember-500 rounded px-3 py-1.5 transition-colors"
            >
              + タスクを追加
            </button>
          </div>
        </div>

        {/* Task rows */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 rounded-xl border-2 border-dashed border-ink-700 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" className="text-ink-700">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-ink-500 font-body text-sm">タスクがありません</p>
              <p className="text-ink-700 font-mono text-xs mt-1">
                {filter === "all" ? "「タスクを追加」からタスクを作成しましょう" : "このカテゴリにタスクはありません"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-ink-800">
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} onNavigate={onNavigate} onToggle={onToggle} />
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
  onNavigate,
  onToggle,
}: {
  task: Task;
  onNavigate: (v: View, id?: string | null) => void;
  onToggle: (id: string) => void;
}) {
  const od = !task.completed && isOverdue(task.due_date);

  return (
    <div
      className={`group flex items-center gap-3 px-6 py-4 cursor-pointer
        hover:bg-ink-800/40 transition-colors relative
        ${task.completed ? "opacity-50" : ""}`}
      onClick={() => onNavigate("detail", task.id)}
    >
      {/* Ember accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ember-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r" />

      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all
          ${task.completed
            ? "bg-ember-500 border-ember-500"
            : "border-ink-700 hover:border-ember-500"
          }`}
      >
        {task.completed && <CheckIcon />}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className={`font-body text-sm font-semibold text-ink-100 truncate
          ${task.completed ? "line-through text-ink-600" : ""}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`font-mono text-[11px] px-2 py-0.5 rounded border
            ${task.completed
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : od
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "text-ink-500 border-ink-800"
            }`}>
            {task.completed ? "完了" : od ? "期限超過" : "未完了"}
          </span>
          {task.due_date && (
            <span className={`font-mono text-[11px] px-2 py-0.5 rounded border
              ${od ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
              {fmtDate(task.due_date)}
            </span>
          )}
          <span className="font-mono text-[11px] text-ink-600">{fmtDate(task.created_at)}</span>
        </div>
      </div>

      <span className="text-ink-600 group-hover:text-ember-500 group-hover:translate-x-0.5 transition-all text-lg leading-none">›</span>
    </div>
  );
}

// ─── DetailView ───────────────────────────────────────────────────────────────

function DetailView({
  task,
  onEdit,
  onDelete,
  onToggle,
  onBack,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (id: string) => void;
  onBack: () => void;
}) {
  const od = !task.completed && isOverdue(task.due_date);

  return (
    <>
      <nav className="flex items-center gap-2 font-mono text-xs text-ink-500 mb-6 animate-slide-in">
        <button onClick={onBack} className="text-ember-400 hover:text-ember-300 font-medium">タスク一覧</button>
        <span className="text-ink-700">/</span>
        <span>詳細</span>
      </nav>

      <div className="border border-ink-800 rounded-xl bg-ink-950/80 backdrop-blur-sm shadow-2xl overflow-hidden animate-fade-up">
        <div className="p-8">
          <div className="flex items-start gap-3 mb-4">
            <button
              onClick={() => onToggle(task.id)}
              className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 mt-1 transition-all
                ${task.completed ? "bg-ember-500 border-ember-500" : "border-ink-700 hover:border-ember-500"}`}
            >
              {task.completed && <CheckIcon />}
            </button>
            <h1 className={`font-display text-xl font-bold text-ink-50 tracking-tight leading-snug
              ${task.completed ? "line-through text-ink-600" : ""}`}>
              {task.title}
            </h1>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            <span className={`font-mono text-xs px-2 py-1 rounded border
              ${task.completed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : od ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "text-ink-500 border-ink-800"}`}>
              {task.completed ? "✓ 完了" : od ? "⚠ 期限超過" : "○ 未完了"}
            </span>
            {task.due_date && (
              <span className={`font-mono text-xs px-2 py-1 rounded border
                ${od ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                期限 — {fmtDate(task.due_date)}
              </span>
            )}
          </div>

          {task.detail && (
            <div className="mb-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-2">詳細</div>
              <p className="font-body text-sm text-ink-200 leading-relaxed whitespace-pre-wrap">{task.detail}</p>
            </div>
          )}

          <hr className="border-ink-800 my-6" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-1">作成日時</div>
              <div className="font-body text-sm text-ink-200">{fmtDateTime(task.created_at)}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-1">更新日時</div>
              <div className="font-body text-sm text-ink-200">{fmtDateTime(task.updated_at)}</div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-ink-950 border-t border-ink-800 flex gap-2 flex-wrap">
          <button onClick={onBack}
            className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all">
            ← 一覧へ戻る
          </button>
          <button onClick={onEdit}
            className="bg-ember-500 hover:bg-ember-400 text-ink-950 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all shadow-lg shadow-ember-500/20">
            ✏ 編集する
          </button>
          <button onClick={onDelete}
            className="border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-ink-950 hover:border-red-500 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all">
            削除する
          </button>
        </div>
      </div>
    </>
  );
}

// ─── TaskForm ─────────────────────────────────────────────────────────────────

function TaskForm({
  task,
  onSubmit,
  onCancel,
}: {
  task?: Task;
  onSubmit: (d: { title: string; detail: string | null; due_date: string | null }) => void;
  onCancel: () => void;
}) {
  const isEdit = !!task;
  const [title,   setTitle]   = useState(task?.title    ?? "");
  const [detail,  setDetail]  = useState(task?.detail   ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())           e.title  = "タイトルは必須です。";
    else if (title.length > 100) e.title  = "タイトルは100文字以内で入力してください。";
    if (detail.length > 500)     e.detail = "詳細は500文字以内で入力してください。";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    startTransition(() => {
      onSubmit({ title: title.trim(), detail: detail.trim() || null, due_date: dueDate || null });
    });
  };

  const tl = title.length, dl = detail.length;

  return (
    <>
      <nav className="flex items-center gap-2 font-mono text-xs text-ink-500 mb-6 animate-slide-in">
        <button onClick={onCancel} className="text-ember-400 hover:text-ember-300 font-medium">
          {isEdit ? "タスク詳細" : "タスク一覧"}
        </button>
        <span className="text-ink-700">/</span>
        <span>{isEdit ? "編集" : "作成"}</span>
      </nav>

      <h1 className="font-display text-2xl font-bold text-ink-50 tracking-tight mb-6 animate-fade-up">
        {isEdit ? "タスクを編集" : "新しいタスクを作成"}
      </h1>

      <div className="border border-ink-800 rounded-xl bg-ink-950/80 backdrop-blur-sm shadow-2xl overflow-hidden animate-fade-up">
        <form onSubmit={handleSubmit}>
          <div className="p-8 flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-ink-400 font-mono">
                タイトル <span className="text-ember-500">*</span>
              </label>
              <input
                className={`w-full bg-ink-900 border rounded-md px-4 py-3
                  text-ink-100 placeholder:text-ink-600 font-body text-sm
                  focus:outline-none focus:ring-1 transition-all duration-200
                  ${errors.title
                    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/20"
                    : "border-ink-700 focus:border-ember-500 focus:ring-ember-500/30"
                  }`}
                placeholder="タスクのタイトルを入力してください"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              />
              <div className="flex justify-between items-start min-h-[18px]">
                {errors.title
                  ? <span className="text-xs text-red-400 font-mono">{errors.title}</span>
                  : <span />}
                <span className={`text-[11px] font-mono ${tl > 90 ? "text-amber-400" : "text-ink-500"} ${tl > 100 ? "text-red-400 font-medium" : ""}`}>
                  {tl}/100
                </span>
              </div>
            </div>

            {/* Detail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-ink-400 font-mono">
                詳細 <span className="text-ink-600 normal-case tracking-normal font-normal">（任意）</span>
              </label>
              <textarea
                className={`w-full bg-ink-900 border rounded-md px-4 py-3 resize-y min-h-24
                  text-ink-100 placeholder:text-ink-600 font-body text-sm leading-relaxed
                  focus:outline-none focus:ring-1 transition-all duration-200
                  ${errors.detail
                    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/20"
                    : "border-ink-700 focus:border-ember-500 focus:ring-ember-500/30"
                  }`}
                placeholder="タスクの詳細を入力してください"
                value={detail}
                onChange={(e) => { setDetail(e.target.value); setErrors((p) => ({ ...p, detail: "" })); }}
              />
              <div className="flex justify-between items-start min-h-[18px]">
                {errors.detail
                  ? <span className="text-xs text-red-400 font-mono">{errors.detail}</span>
                  : <span />}
                <span className={`text-[11px] font-mono ${dl > 450 ? "text-amber-400" : "text-ink-500"} ${dl > 500 ? "text-red-400 font-medium" : ""}`}>
                  {dl}/500
                </span>
              </div>
            </div>

            {/* Due date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-ink-400 font-mono">
                期限日 <span className="text-ink-600 normal-case tracking-normal font-normal">（任意）</span>
              </label>
              <input
                type="date"
                className="w-full max-w-[220px] bg-ink-900 border border-ink-700 rounded-md px-4 py-3
                  text-ink-100 font-body text-sm [color-scheme:dark]
                  focus:outline-none focus:border-ember-500 focus:ring-1 focus:ring-ember-500/30
                  transition-all duration-200"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="px-8 py-5 bg-ink-950 border-t border-ink-800 flex gap-2 flex-wrap">
            <button type="button" onClick={onCancel}
              className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all">
              キャンセル
            </button>
            <button type="submit" disabled={isPending}
              className="bg-ember-500 hover:bg-ember-400 disabled:opacity-50 text-ink-950 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all shadow-lg shadow-ember-500/20">
              {isPending ? "保存中..." : isEdit ? "変更を保存する" : "タスクを作成する"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── DeleteDialog ─────────────────────────────────────────────────────────────

function DeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-fade-in"
      onClick={onCancel}>
      <div className="border border-ink-800 rounded-xl bg-ink-950/95 backdrop-blur-md p-8 max-w-sm w-full shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="text-2xl mb-3">🗑️</div>
        <h2 className="font-display text-lg font-bold text-ink-50 mb-2 tracking-tight">タスクを削除しますか？</h2>
        <p className="font-body text-sm text-ink-500 leading-relaxed mb-6">この操作は取り消せません。<br />タスクが完全に削除されます。</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}
            className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all">
            キャンセル
          </button>
          <button onClick={onConfirm}
            className="border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-ink-950 hover:border-red-500 rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all">
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
