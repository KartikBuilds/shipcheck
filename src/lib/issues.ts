import { z } from "zod";

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const STATUSES = ["open", "in_progress", "done"] as const;

export const newIssueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(140),
  severity: z.enum(SEVERITIES).default("medium"),
});

export type NewIssue = z.infer<typeof newIssueSchema>;
export type Issue = NewIssue & { id: number; status: (typeof STATUSES)[number]; created_at: string };

const rank: Record<(typeof SEVERITIES)[number], number> = { critical: 0, high: 1, medium: 2, low: 3 };

/** Open work first, then by severity, then newest first. */
export function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const doneA = a.status === "done" ? 1 : 0;
    const doneB = b.status === "done" ? 1 : 0;
    if (doneA !== doneB) return doneA - doneB;
    if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
    return b.created_at.localeCompare(a.created_at);
  });
}

/** Maps Postgres errors raised by the database to messages a user can act on. */
export function friendlyDbError(err: { code?: string; message?: string } | null): string | null {
  if (!err) return null;
  if (err.code === "P0001" && err.message?.includes("free plan limit")) {
    return "Free plan limit reached (20 issues). Upgrade to Pro to add more.";
  }
  if (err.code === "42501") return "You do not have permission to do that.";
  return "Something went wrong. Please try again.";
}
