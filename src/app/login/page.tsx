import Link from "next/link";
import { Suspense } from "react";
import { signIn, signUp } from "./actions";

async function LoginPageContent({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-rule bg-sheet p-8">
        <Link href="/" className="font-display text-lg font-semibold text-pass">ShipCheck</Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">Demo account: demo@shipcheck-demo.com / ShipCheckDemo2026</p>
        {error && <p role="alert" className="mt-5 rounded-md border border-fail/30 bg-fail-tint p-3 text-sm text-fail">{error}</p>}
        {message && <p className="mt-5 rounded-md border border-pass/30 bg-pass-tint p-3 text-sm text-pass">{message}</p>}
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email
            <input name="email" type="email" required autoComplete="email" className="field mt-1.5" />
          </label>
          <label className="block text-sm font-medium">Password
            <input name="password" type="password" required minLength={8} autoComplete="current-password" className="field mt-1.5" />
          </label>
          <div className="flex gap-3 pt-2">
            <button formAction={signIn} className="btn btn-primary flex-1">Sign in</button>
            <button formAction={signUp} className="btn btn-ghost flex-1">Create account</button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  return (
    <Suspense fallback={<main className="flex-1 p-8 text-ink-soft">Loading…</main>}>
      <LoginPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}
