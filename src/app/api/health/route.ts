import { getEnv } from "@/lib/env";

/** Liveness and database reachability, for uptime monitoring. Reveals nothing sensitive. */
export async function GET() {
  const started = Date.now();
  const env = getEnv();
  // Anonymous visitors can't read any table here (by design), so check the backend's own health endpoint.
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    cache: "no-store",
  }).catch(() => null);
  const error = !res?.ok;
  const body = { status: error ? "degraded" : "ok", database: error ? "unreachable" : "ok", latencyMs: Date.now() - started };
  return Response.json(body, { status: error ? 503 : 200, headers: { "cache-control": "no-store" } });
}
