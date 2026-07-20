"use client"

import { useEffect, useState } from "react"
import { HostShell } from "@/components/features/host/host-shell"
import { VerificationTracker } from "@/components/features/host/verification-tracker"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { fetchMyVerificationSteps, submitVerificationLevel, type VerificationStep } from "@/lib/api"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function HostVerificationPage() {
  const [steps, setSteps] = useState<VerificationStep[] | null>(null)
  const [submittingLevel, setSubmittingLevel] = useState<number | null>(null)

  function reload() {
    fetchMyVerificationSteps()
      .then(setSteps)
      .catch(() => setSteps([]))
  }

  useEffect(reload, [])

  async function handleResubmit(level: number) {
    setSubmittingLevel(level)
    try {
      await submitVerificationLevel(level)
      reload()
    } finally {
      setSubmittingLevel(null)
    }
  }

  const approvedCount = steps?.filter((step) => step.status === "approved").length ?? 0
  const progressValue = steps && steps.length > 0 ? (approvedCount / steps.length) * 100 : 0

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Verification</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Every level you clear becomes a trust badge guests see on your listing — carrying as much weight as your
        photos.
      </p>

      {steps && (
        <div className="mt-8 max-w-md">
          <Progress value={progressValue}>
            <div className="flex w-full items-center justify-between">
              <ProgressLabel className="text-body-sm text-graphite tracking-body-sm">
                {approvedCount} of {steps.length} levels approved
              </ProgressLabel>
              <ProgressValue />
            </div>
          </Progress>
        </div>
      )}

      <StaggerList inView={false} className="mt-10">
        <StaggerItem>
          {!steps ? (
            <p className="text-body-sm text-smoke tracking-body-sm">Loading…</p>
          ) : (
            <VerificationTracker steps={steps} onResubmit={handleResubmit} isSubmitting={submittingLevel} />
          )}
        </StaggerItem>
      </StaggerList>
    </HostShell>
  )
}
