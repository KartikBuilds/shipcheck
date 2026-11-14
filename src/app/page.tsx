import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

const sample = [
  { title: "Password reset email never arrives", tone: "fail" as const, label: "Critical" },
  { title: "Checkout button unresponsive on iOS Safari", tone: "fail" as const, label: "High" },
  { title: "Pricing page shows the old annual price", tone: "caution" as const, label: "Medium" },
  { title: "Favicon missing on the docs site", tone: "neutral" as const, label: "Low" },
];

const proof = [
  { title: "Your data stays yours", body: "Every row is locked to its owner by the database itself, not just the app. Six automated checks try to read and change other users' data and confirm they can't." },
  { title: "Plan limits the app can't skip", body: "The free plan's 20-item limit lives in the database, so a bug or a hand-made request can't get around it." },
  { title: "Payments that don't double-count", body: "Stripe events are signature-checked and recorded once, so a retried webhook never upgrades or charges twice. Test mode only." },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.05fr_1fr] md:items-center md:pt-24">
        <div>
          <p className="mb-5 font-display text-lg font-semibold text-pass">ShipCheck</p>
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">Know exactly what stands between you and launch day.</h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            List the problems blocking your release, rank them by how much they hurt, and close them out one by one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="btn btn-primary">Try the demo</Link>
            <a href="https://github.com/KartikBuilds/shipcheck" className="btn btn-ghost">Read the code</a>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Demo login: demo@shipcheck-demo.com / ShipCheckDemo2026</p>
        </div>

        <div className="rounded-xl border border-rule bg-sheet p-6 shadow-[0_24px_48px_-24px_rgba(20,33,61,0.35)]" aria-label="Example launch checklist">
          <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-4">
            <h2 className="font-display text-xl font-semibold">Launch blockers</h2>
            <span className="text-sm text-ink-soft">3 open of 4</span>
          </div>
          <ul className="space-y-3">
            {sample.map((s, i) => (
              <li key={s.title} className="flex items-start justify-between gap-4">
                <span className={i === 3 ? "text-ink-soft line-through" : ""}>{s.title}</span>
                <StatusBadge tone={i === 3 ? "pass" : s.tone}>{i === 3 ? "Done" : s.label}</StatusBadge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-rule bg-sheet">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="max-w-2xl font-display text-3xl font-semibold">Built the way production apps should be</h2>
          <dl className="mt-10 grid gap-10 md:grid-cols-3">
            {proof.map((p) => (
              <div key={p.title} className="border-l-2 border-pass pl-5">
                <dt className="font-display text-lg font-semibold">{p.title}</dt>
                <dd className="mt-2 text-ink-soft">{p.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-12 text-sm text-ink-soft">
            Next.js, TypeScript, Supabase (Postgres with row-level security) and Stripe. A personal portfolio project by Kartik Shinde.
          </p>
        </div>
      </section>
    </main>
  );
}
