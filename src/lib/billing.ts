import type Stripe from "stripe";

export type BillingAction =
  | { kind: "link_customer_and_upgrade"; userId: string; customerId: string }
  | { kind: "set_plan_by_customer"; customerId: string; plan: "free" | "pro" }
  | { kind: "ignore"; reason: string };

const ACTIVE = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

/** Pure mapping from a verified Stripe event to the change our database needs. */
export function billingActionFor(event: Stripe.Event): BillingAction {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.mode !== "subscription") return { kind: "ignore", reason: "not a subscription checkout" };
      const userId = s.client_reference_id;
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
      if (!userId || !customerId) return { kind: "ignore", reason: "missing user or customer id" };
      return { kind: "link_customer_and_upgrade", userId, customerId };
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const plan = event.type === "customer.subscription.deleted" || !ACTIVE.has(sub.status) ? "free" : "pro";
      return { kind: "set_plan_by_customer", customerId, plan };
    }
    default:
      return { kind: "ignore", reason: `unhandled event ${event.type}` };
  }
}
