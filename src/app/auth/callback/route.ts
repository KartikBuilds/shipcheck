import { NextResponse } from "next/server";
import { supabaseForUser } from "@/lib/supabase/server";

/** Exchanges the email-confirmation code for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await supabaseForUser();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
