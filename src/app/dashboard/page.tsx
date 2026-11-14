import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { StatusBadge, severityTone } from "@/components/status-badge";
import { SEVERITIES, sortIssues, type Issue } from "@/lib/issues";
import { supabaseForUser } from "@/lib/supabase/server";
import { createIssue, setStatus } from "./actions";

const statusLabel = { open: "Open", in_progress: "In progress", done: "Done" } as const;

async function DashboardContent({ searchParams }: { searchParams: Promise<{ error?: string; upgraded?: string }> }) {
  const { error, upgraded } = await searchParams;
  const supabase = await supabaseForUser();
  const [{ data: issues }, { data: profile }] = await Promise.all([
    supabase.from("issues").select("id,title,severity,status,created_at").returns<Issue[]>(),
    supabase.from("profiles").select("plan").single(),
  ]);
  const list = sortIssues(issues ?? []);
  const plan = profile?.plan ?? "free";
  const open = list.filter((i) => i.status !== "done").length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <p className="font-display font-semibold text-pass">ShipCheck</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold">Launch blockers</h1>
          <p className="mt-2 text-ink-soft">
            {list.length === 0 ? "Nothing logged yet." : open === 0 ? "Everything is closed. You're clear to ship." : `${open} still open of ${list.length}.`}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <StatusBadge tone={plan === "pro" ? "pass" : "neutral"}>{plan === "pro" ? "Pro plan" : "Free plan"}</StatusBadge>
          {plan === "free" && (
            <form action="/api/checkout" method="post"><button className="btn btn-ghost py-1.5 text-sm">Upgrade (test mode)</button></form>
          )}
          <form action={signOut}><button className="cursor-pointer text-ink-soft underline underline-offset-4 hover:text-ink">Sign out</button></form>
        </div>
      </header>

      {upgraded && <p className="mt-6 rounded-md border border-pass/30 bg-pass-tint p-3 text-sm text-pass">Payment received. Your plan updates as soon as Stripe confirms it.</p>}
      {error && <p role="alert" className="mt-6 rounded-md border border-fail/30 bg-fail-tint p-3 text-sm text-fail">{error}</p>}

      <form action={createIssue} className="mt-8 flex flex-col gap-3 rounded-xl border border-rule bg-sheet p-4 sm:flex-row">
        <input name="title" required minLength={3} maxLength={140} placeholder="What's blocking launch? e.g. Password reset email never arrives" className="field flex-1" aria-label="Blocker" />
        <select name="severity" defaultValue="medium" className="field sm:w-36" aria-label="Severity">
          {SEVERITIES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button className="btn btn-primary">Add blocker</button>
      </form>

      <ul className="mt-6 divide-y divide-rule rounded-xl border border-rule bg-sheet">
        {list.map((i) => (
          <li key={i.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <StatusBadge tone={i.status === "done" ? "pass" : severityTone(i.severity)}>
                {i.status === "done" ? "Done" : i.severity[0].toUpperCase() + i.severity.slice(1)}
              </StatusBadge>
              <span className={i.status === "done" ? "text-ink-soft line-through" : ""}>{i.title}</span>
            </div>
            <form action={setStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={i.id} />
              <select name="status" defaultValue={i.status} className="field w-auto py-1.5 text-sm" aria-label={`Status of ${i.title}`}>
                {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button className="btn btn-ghost py-1.5 text-sm">Update</button>
            </form>
          </li>
        ))}
        {list.length === 0 && <li className="p-8 text-center text-ink-soft">Add the first thing blocking your launch.</li>}
      </ul>
    </main>
  );
}

export default function Dashboard(props: { searchParams: Promise<{ error?: string; upgraded?: string }> }) {
  return (
    <Suspense fallback={<main className="flex-1 p-8 text-ink-soft">Loading…</main>}>
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
