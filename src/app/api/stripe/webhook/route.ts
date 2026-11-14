import Stripe from "stripe";
import { NextResponse } from "next/server";
import { billingActionFor } from "@/lib/billing";
import { getEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "billing not configured" }, { status: 503 });
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");
  const raw = await request.text(); // raw body is required for signature verification

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature ?? "", env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const db = supabaseAdmin();
  // Idempotency: the insert fails on a duplicate event id, so retries are no-ops.
  const { error: dupError } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dupError?.code === "23505") return NextResponse.json({ received: true, duplicate: true });
  if (dupError) return NextResponse.json({ error: "storage error" }, { status: 500 });

  const action = billingActionFor(event);
  if (action.kind === "link_customer_and_upgrade") {
    await db.from("profiles").update({ plan: "pro", stripe_customer_id: action.customerId, updated_at: new Date().toISOString() }).eq("id", action.userId);
  } else if (action.kind === "set_plan_by_customer") {
    await db.from("profiles").update({ plan: action.plan, updated_at: new Date().toISOString() }).eq("stripe_customer_id", action.customerId);
  }
  return NextResponse.json({ received: true, action: action.kind });
}
