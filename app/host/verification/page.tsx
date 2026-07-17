import { HostShell } from "@/components/features/host/host-shell"
import { VerificationTracker } from "@/components/features/host/verification-tracker"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { hostVerificationSteps } from "@/lib/mock-data"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function HostVerificationPage() {
  const approvedCount = hostVerificationSteps.filter((step) => step.status === "approved").length
  const progressValue = (approvedCount / hostVerificationSteps.length) * 100

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Verification</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Every level you clear becomes a trust badge guests see on your listing — carrying as much weight as your
        photos.
      </p>

      <div className="mt-8 max-w-md">
        <Progress value={progressValue}>
          <div className="flex w-full items-center justify-between">
            <ProgressLabel className="text-body-sm text-graphite tracking-body-sm">
              {approvedCount} of {hostVerificationSteps.length} levels approved
            </ProgressLabel>
            <ProgressValue />
          </div>
        </Progress>
      </div>

      <StaggerList inView={false} className="mt-10">
        <StaggerItem>
          <VerificationTracker steps={hostVerificationSteps} />
        </StaggerItem>
      </StaggerList>
    </HostShell>
  )
}
