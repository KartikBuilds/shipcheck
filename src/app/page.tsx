import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-3 text-3xl font-semibold">ShipCheck</h1>
      <p className="mb-6 text-gray-700">
        A small launch-blocker tracker built to demonstrate a production-style Next.js + Supabase + Stripe setup:
        email auth, Row Level Security, a database-enforced plan limit, and idempotent, signature-verified Stripe webhooks.
      </p>
      <Link href="/login" className="rounded bg-black px-4 py-2 text-white">Try the demo</Link>
      <p className="mt-6 text-sm text-gray-500">Personal portfolio project. Payments run in Stripe test mode only.</p>
    </main>
  );
}
