import { verificationLabel, type HostBadge, type VerificationLevel } from "@/types"
import { cn } from "@/lib/utils"

const badgeBase = "inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium"

export function TrustBadgeRow({
  verificationLevel,
  hostBadge,
  className,
}: {
  verificationLevel: VerificationLevel
  hostBadge: HostBadge
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className={cn(badgeBase, "border border-accent-foreground/15 bg-accent text-accent-foreground")}>
        {verificationLabel[verificationLevel]}
      </span>
      {hostBadge && (
        <span className={cn(badgeBase, "border border-border text-graphite")}>{hostBadge}</span>
      )}
    </div>
  )
}
