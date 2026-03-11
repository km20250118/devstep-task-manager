"use client";

import { useState, useEffect, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTask, updateTask } from "@/app/tasks/actions";

export default function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [title,    setTitle]   = useState("");
  const [detail,   setDetail]  = useState("");
  const [dueDate,  setDueDate] = useState("");
  const [errors,   setErrors]  = useState<Record<string, string>>({});
  const [loading,  setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getTask(id).then((res) => {
      if (!res.data) {
        setNotFound(true);
      } else {
        setTitle(res.data.title);
        setDetail(res.data.detail ?? "");
        setDueDate(res.data.due_date ?? "");
      }
      setLoading(false);
    });
  }, [id]);

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

    startTransition(async () => {
      const res = await updateTask(id, {
        title:    title.trim(),
        detail:   detail.trim() || null,
        due_date: dueDate || null,
      });
      if (res.error) {
        setErrors({ submit: res.error });
      } else {
        router.push(`/tasks/${id}`);
      }
    });
  };

  const tl = title.length;
  const dl = detail.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-ink-500 font-mono text-sm animate-pulse">
          loading...
        </span>
      </div>
    );
  }

  if (notFound) {
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

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-ink-500 mb-6 animate-slide-in">
        <Link href="/tasks" className="text-ember-400 hover:text-ember-300 font-medium">
          タスク一覧
        </Link>
        <span className="text-ink-700">/</span>
        <Link
          href={`/tasks/${id}`}
          className="text-ember-400 hover:text-ember-300 font-medium"
        >
          詳細
        </Link>
        <span className="text-ink-700">/</span>
        <span>編集</span>
      </nav>

      <h1 className="font-display text-2xl font-bold text-ink-50 tracking-tight mb-6">
        タスクを編集
      </h1>

      <div className="border border-ink-800 rounded-xl bg-ink-950/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-8 flex flex-col gap-5">

            {/* Submit error */}
            {errors.submit && (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 animate-fade-in">
                <p className="text-sm text-red-400 font-mono">{errors.submit}</p>
              </div>
            )}

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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((p) => ({ ...p, title: "" }));
                }}
              />
              <div className="flex justify-between items-start min-h-[18px]">
                {errors.title
                  ? <span className="text-xs text-red-400 font-mono">{errors.title}</span>
                  : <span />
                }
                <span className={`text-[11px] font-mono
                  ${tl > 100 ? "text-red-400 font-medium" : tl > 90 ? "text-amber-400" : "text-ink-500"}`}>
                  {tl}/100
                </span>
              </div>
            </div>

            {/* Detail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-ink-400 font-mono">
                詳細{" "}
                <span className="text-ink-600 normal-case tracking-normal font-normal text-xs">
                  （任意）
                </span>
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
                onChange={(e) => {
                  setDetail(e.target.value);
                  setErrors((p) => ({ ...p, detail: "" }));
                }}
              />
              <div className="flex justify-between items-start min-h-[18px]">
                {errors.detail
                  ? <span className="text-xs text-red-400 font-mono">{errors.detail}</span>
                  : <span />
                }
                <span className={`text-[11px] font-mono
                  ${dl > 500 ? "text-red-400 font-medium" : dl > 450 ? "text-amber-400" : "text-ink-500"}`}>
                  {dl}/500
                </span>
              </div>
            </div>

            {/* Due date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-ink-400 font-mono">
                期限日{" "}
                <span className="text-ink-600 normal-case tracking-normal font-normal text-xs">
                  （任意）
                </span>
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

          {/* Footer */}
          <div className="px-8 py-5 bg-ink-950 border-t border-ink-800 flex gap-2 flex-wrap">
            <Link
              href={`/tasks/${id}`}
              className="border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100
                rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide transition-all"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="bg-ember-500 hover:bg-ember-400 disabled:opacity-50 text-ink-950
                rounded-md px-5 py-2.5 text-sm font-display font-semibold tracking-wide
                transition-all shadow-lg shadow-ember-500/20"
            >
              {isPending ? "保存中..." : "変更を保存する"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
