"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseForUser } from "@/lib/supabase/server";

const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function signIn(formData: FormData) {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=Enter a valid email and an 8%2B character password");
  const supabase = await supabaseForUser();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=Enter a valid email and an 8%2B character password");
  const supabase = await supabaseForUser();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Check your email to confirm, then sign in");
}

export async function signOut() {
  const supabase = await supabaseForUser();
  await supabase.auth.signOut();
  redirect("/login");
}
