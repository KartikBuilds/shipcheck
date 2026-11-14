import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { SEVERITIES, sortIssues, type Issue } from "@/lib/issues";
import { supabaseForUser } from "@/lib/supabase/server";
import { createIssue, setStatus } from "./actions";

async function DashboardContent({ searchParams }: { searchParams: Promise<{ error?: string; upgraded?: string }> }) {
  const { error, upgraded } = await searchParams;
  const supabase = await supabaseForUser();
  const [{ data: issues }, { data: profile }] = await Promise.all([
    supabase.from("issues").select("id,title,severity,status,created_at").returns<Issue[]>(),
    supabase.from("profiles").select("plan").single(),
  ]);
  const list = sortIssues(issues ?? []);
  const plan = profile?.plan ?? "free";

  return (
    <main className="mx-auto max-w-2xl p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Launch blockers</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded bg-gray-100 px-2 py-1">Plan: {plan}</span>
          {plan === "free" && (
            <form action="/api/checkout" method="post"><button className="rounded bg-indigo-600 px-3 py-1 text-white">Upgrade (test mode)</button></form>
          )}
          <form action={signOut}><button className="underline">Sign out</button></form>
        </div>
      </header>
      {upgraded && <p className="mb-4 rounded bg-green-50 p-3 text-sm">Payment received. Your plan updates as soon as Stripe confirms it.</p>}
      {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form action={createIssue} className="mb-8 flex gap-2">
        <input name="title" required minLength={3} maxLength={140} placeholder="e.g. Password reset email never arrives" className="flex-1 rounded border p-2" aria-label="Issue title" />
        <select name="severity" defaultValue="medium" className="rounded border p-2" aria-label="Severity">
          {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="rounded bg-black px-4 text-white">Add</button>
      </form>
      <ul className="divide-y">
        {list.map((i) => (
          <li key={i.id} className="flex items-center justify-between py-3">
            <span className={i.status === "done" ? "text-gray-400 line-through" : ""}>
              <span className="mr-2 rounded bg-gray-100 px-1 text-xs uppercase">{i.severity}</span>{i.title}
            </span>
            <form action={setStatus} className="flex gap-1">
              <input type="hidden" name="id" value={i.id} />
              <select name="status" defaultValue={i.status} className="rounded border p-1 text-sm" aria-label="Status">
                <option value="open">open</option><option value="in_progress">in progress</option><option value="done">done</option>
              </select>
              <button className="text-sm underline">Save</button>
            </form>
          </li>
        ))}
        {list.length === 0 && <li className="py-6 text-gray-500">No issues yet. Add the first thing blocking your launch.</li>}
      </ul>
    </main>
  );
}

export default function Dashboard(props: { searchParams: Promise<{ error?: string; upgraded?: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl p-8 text-gray-500">Loading…</main>}>
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
