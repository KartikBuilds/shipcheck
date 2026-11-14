import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

const base = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };

describe("getEnv", () => {
  it("accepts the minimum configuration", () => {
    expect(getEnv(base).NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });
  it("refuses live Stripe keys", () => {
    expect(() => getEnv({ ...base, STRIPE_SECRET_KEY: "sk_live_123" })).toThrow(/TEST key/);
  });
});
