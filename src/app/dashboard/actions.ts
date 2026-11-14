"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { friendlyDbError, newIssueSchema, STATUSES } from "@/lib/issues";
import { supabaseForUser } from "@/lib/supabase/server";

export async function createIssue(formData: FormData) {
  const parsed = newIssueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/dashboard?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const supabase = await supabaseForUser();
  // owner_id defaults to auth.uid() in the database; RLS rejects anything else.
  const { error } = await supabase.from("issues").insert(parsed.data);
  if (error) redirect(`/dashboard?error=${encodeURIComponent(friendlyDbError(error)!)}`);
  revalidatePath("/dashboard");
}

export async function setStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !(STATUSES as readonly string[]).includes(status)) return;
  const supabase = await supabaseForUser();
  await supabase.from("issues").update({ status }).eq("id", id);
  revalidatePath("/dashboard");
}
