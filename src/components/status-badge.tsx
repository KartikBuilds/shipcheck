type Tone = "pass" | "caution" | "fail" | "neutral";

const tones: Record<Tone, string> = {
  pass: "bg-pass-tint text-pass border-pass/30",
  caution: "bg-caution-tint text-caution border-caution/30",
  fail: "bg-fail-tint text-fail border-fail/30",
  neutral: "bg-paper text-ink-soft border-rule",
};

export function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium ${tones[tone]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function severityTone(severity: string): Tone {
  if (severity === "critical" || severity === "high") return "fail";
  if (severity === "medium") return "caution";
  return "neutral";
}
