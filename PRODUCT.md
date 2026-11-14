# ShipCheck — product brief and definition of done

## The buyer
A startup founder or small team that needs a SaaS foundation built properly: accounts, teams, plans and payments,
with customer data kept separate and safe.

**What they're hiring for:** "Build the core of my SaaS so it doesn't break or leak when real customers arrive."
**What makes them trust me:** working billing, airtight data separation, and tests that prove both.

## Job to be done
Track what's blocking a launch, as a team, on a free or paid plan, with billing that behaves correctly in every case.

## Scope
- Accounts: sign up, sign in, email verification, password reset, account deletion and data export.
- Team workspaces: invite members by email, owner/member roles, shared launch blockers.
- Plans and billing: Free (20 blockers) and Pro, Stripe Checkout, customer billing portal, cancel, failed-payment handling. Test mode only.
- Transactional email: welcome, invite, payment receipt.

## Non-goals
Real payments, integrations, mobile apps, analytics dashboards.

## Definition of done

| Aspect | Done means |
| --- | --- |
| Product | A visitor can sign up, create a workspace, invite someone, upgrade with a Stripe test card, manage or cancel the plan, reset a password and delete the account, all from the live demo. |
| Code | Strict TypeScript; server actions validated with Zod; billing logic isolated and unit-tested; no duplicated permission checks. |
| Security | Written threat model; Row Level Security scoped to workspace membership; role checks enforced in the database; webhook signatures verified and idempotent; sign-in and invite rate limited; security headers; dependency scanning in CI. |
| Testing | Unit, database (membership isolation, roles, plan limits, webhook idempotency) and browser tests (full sign-up → upgrade → cancel journey) in CI against an isolated test stack. Tests never write to the live site. |
| Reliability | Error monitoring with alerts; uptime check; health endpoint; webhook failures retried and visible; demo data reset daily. |
| Performance | Lighthouse mobile ≥ 95 / 100 / 100 / ≥ 95, recorded in the README. |
| Accessibility | WCAG 2.1 AA across sign-up, dashboard and billing; automated axe checks in CI. |
| Design | House style; clear plan state; helpful empty, loading and error states; confirmation for destructive actions. |
| Delivery | Preview deployment per change; clean history; short production address. |
| Documentation | README: problem, result, proof, architecture and billing-flow diagrams, how to run/test/deploy, decision log. |
| Proof | Live demo with working test billing, public code, test results, Lighthouse scores. Real users when available. |
