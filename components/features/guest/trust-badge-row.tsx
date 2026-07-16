import { ShieldCheck } from "lucide-react"
import { verificationLabel, type HostBadge, type VerificationLevel } from "@/types"
import { cn } from "@/lib/utils"

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
      <span className="inline-flex items-center gap-1 rounded-full border border-accent-foreground/15 bg-accent px-2.5 py-1 text-caption font-medium text-accent-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        {verificationLabel[verificationLevel]}
      </span>
      {hostBadge && (
        <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-caption font-medium text-graphite">
          {hostBadge}
        </span>
      )}
    </div>
  )
}
