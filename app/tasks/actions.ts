"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type TaskInput = {
  title: string;
  detail: string | null;
  due_date: string | null;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTask(input: TaskInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  if (!input.title.trim())          return { data: null, error: "タイトルは必須です。" };
  if (input.title.length > 100)     return { data: null, error: "タイトルは100文字以内で入力してください。" };
  if ((input.detail?.length ?? 0) > 500) return { data: null, error: "詳細は500文字以内で入力してください。" };

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id:  user.id,
      title:    input.title.trim(),
      detail:   input.detail?.trim() || null,
      due_date: input.due_date || null,
      completed: false,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  revalidatePath("/tasks");
  return { data, error: null };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateTask(id: string, input: TaskInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  if (!input.title.trim())          return { data: null, error: "タイトルは必須です。" };
  if (input.title.length > 100)     return { data: null, error: "タイトルは100文字以内で入力してください。" };
  if ((input.detail?.length ?? 0) > 500) return { data: null, error: "詳細は500文字以内で入力してください。" };

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title:      input.title.trim(),
      detail:     input.detail?.trim() || null,
      due_date:   input.due_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)   // RLS double-check
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  revalidatePath("/tasks");
  return { data, error: null };
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export async function toggleTask(id: string, completed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .update({ completed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { error: null };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { error: null };
}
