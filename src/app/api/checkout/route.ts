import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { supabaseForUser } from "@/lib/supabase/server";

export async function POST() {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "billing not configured" }, { status: 503 });
  }
  const supabase = await supabaseForUser();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "sign in first" }, { status: 401 });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: data.user.id, // ties the payment to the user in the webhook
    customer_email: data.user.email,
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=1`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });
  return NextResponse.redirect(session.url!, 303);
}
