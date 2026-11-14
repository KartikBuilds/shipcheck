import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { billingActionFor } from "@/lib/billing";

const ev = (type: string, object: object) => ({ id: "evt_1", type, data: { object } }) as unknown as Stripe.Event;

describe("billingActionFor", () => {
  it("links the customer and upgrades on a completed subscription checkout", () => {
    expect(billingActionFor(ev("checkout.session.completed", { mode: "subscription", client_reference_id: "user-1", customer: "cus_1" })))
      .toEqual({ kind: "link_customer_and_upgrade", userId: "user-1", customerId: "cus_1" });
  });
  it("ignores checkouts without a user reference", () => {
    expect(billingActionFor(ev("checkout.session.completed", { mode: "subscription", customer: "cus_1" })).kind).toBe("ignore");
  });
  it("downgrades on past_due or deleted subscriptions", () => {
    expect(billingActionFor(ev("customer.subscription.updated", { customer: "cus_1", status: "past_due" })))
      .toEqual({ kind: "set_plan_by_customer", customerId: "cus_1", plan: "free" });
    expect(billingActionFor(ev("customer.subscription.deleted", { customer: "cus_1", status: "canceled" })))
      .toEqual({ kind: "set_plan_by_customer", customerId: "cus_1", plan: "free" });
  });
  it("keeps pro for active subscriptions", () => {
    expect(billingActionFor(ev("customer.subscription.updated", { customer: { id: "cus_2" }, status: "active" })))
      .toEqual({ kind: "set_plan_by_customer", customerId: "cus_2", plan: "pro" });
  });
});

describe("Stripe signature verification", () => {
  const stripe = new Stripe("sk_test_dummy");
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", object: "event", type: "customer.subscription.deleted", data: { object: {} } });

  it("accepts a correctly signed raw body", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(stripe.webhooks.constructEvent(payload, header, secret).id).toBe("evt_1");
  });
  it("rejects a tampered body", () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(() => stripe.webhooks.constructEvent(payload.replace("evt_1", "evt_2"), header, secret)).toThrow();
  });
});
