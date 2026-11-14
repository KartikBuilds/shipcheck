import { describe, expect, it } from "vitest";
import { friendlyDbError, newIssueSchema, sortIssues, type Issue } from "@/lib/issues";

const issue = (p: Partial<Issue>): Issue => ({ id: 1, title: "x x x", severity: "medium", status: "open", created_at: "2026-11-01", ...p });

describe("newIssueSchema", () => {
  it("trims and defaults severity", () => {
    expect(newIssueSchema.parse({ title: "  Login broken  " })).toEqual({ title: "Login broken", severity: "medium" });
  });
  it("rejects short titles and unknown severities", () => {
    expect(newIssueSchema.safeParse({ title: "ab" }).success).toBe(false);
    expect(newIssueSchema.safeParse({ title: "valid title", severity: "urgent" }).success).toBe(false);
  });
});

describe("sortIssues", () => {
  it("puts open work first, then severity, then newest", () => {
    const sorted = sortIssues([
      issue({ id: 1, status: "done", severity: "critical" }),
      issue({ id: 2, severity: "low" }),
      issue({ id: 3, severity: "critical", created_at: "2026-11-01" }),
      issue({ id: 4, severity: "critical", created_at: "2026-11-05" }),
    ]);
    expect(sorted.map((i) => i.id)).toEqual([4, 3, 2, 1]);
  });
});

describe("friendlyDbError", () => {
  it("explains the plan limit", () => {
    expect(friendlyDbError({ code: "P0001", message: "free plan limit reached" })).toMatch(/Upgrade to Pro/);
  });
  it("hides raw database errors", () => {
    expect(friendlyDbError({ code: "XX000", message: "internal detail" })).toBe("Something went wrong. Please try again.");
  });
});
