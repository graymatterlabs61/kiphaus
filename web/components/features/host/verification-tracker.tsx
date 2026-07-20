import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verificationLabel } from "@/types"
import type { VerificationStep } from "@/lib/api"

const STATUS_META: Record<
  VerificationStep["status"],
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  approved: { icon: CheckCircle2, label: "Approved", className: "text-primary" },
  in_review: { icon: Clock, label: "In review", className: "text-smoke" },
  rejected: { icon: AlertCircle, label: "Action needed", className: "text-destructive" },
  not_started: { icon: Circle, label: "Not started", className: "text-smoke" },
}

export function VerificationTracker({
  steps,
  compact,
  onResubmit,
  isSubmitting,
}: {
  steps: VerificationStep[]
  compact?: boolean
  onResubmit?: (level: number) => void
  isSubmitting?: number | null
}) {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const meta = STATUS_META[step.status]
        const Icon = meta.icon
        const priorApproved = step.level === 1 || steps.find((s) => s.level === step.level - 1)?.status === "approved"
        const canSubmit = onResubmit && priorApproved && (step.status === "not_started" || step.status === "rejected")
        return (
          <div key={step.level} className="flex items-start gap-4 rounded-2xl border border-border p-4">
            <Icon className={`mt-0.5 size-5 shrink-0 ${meta.className}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink-black">
                  Level {step.level} · {verificationLabel[step.level]}
                </p>
                <span className={`text-body-sm font-medium tracking-body-sm ${meta.className}`}>{meta.label}</span>
              </div>
              {!compact && step.detail && <p className="mt-1 text-body-sm text-smoke tracking-body-sm">{step.detail}</p>}
              {!compact && !priorApproved && step.status === "not_started" && (
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">Unlocks once Level {step.level - 1} is approved.</p>
              )}
            </div>
            {canSubmit && !compact && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full"
                disabled={isSubmitting === step.level}
                onClick={() => onResubmit?.(step.level)}
              >
                {isSubmitting === step.level ? "Submitting…" : step.status === "rejected" ? "Resubmit" : "Submit"}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
