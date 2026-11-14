import { z } from "zod";
import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from "./public-config";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_test_", "Use a Stripe TEST key").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_ID: z.string().startsWith("price_").optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof schema>;

/** Validates environment variables once; fails fast with a readable message. */
export function getEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: PUBLIC_SUPABASE_KEY,
    ...Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== "")),
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}
