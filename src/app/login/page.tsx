import { Suspense } from "react";
import { signIn, signUp } from "./actions";

async function LoginPageContent({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-6 text-2xl font-semibold">Sign in to ShipCheck</h1>
      {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {message && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      <form className="space-y-4">
        <label className="block text-sm">Email
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm">Password
          <input name="password" type="password" required minLength={8} autoComplete="current-password" className="mt-1 w-full rounded border p-2" />
        </label>
        <div className="flex gap-3">
          <button formAction={signIn} className="rounded bg-black px-4 py-2 text-white">Sign in</button>
          <button formAction={signUp} className="rounded border px-4 py-2">Create account</button>
        </div>
      </form>
    </main>
  );
}

export default function LoginPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl p-8 text-gray-500">Loading…</main>}>
      <LoginPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}
