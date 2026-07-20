import Image from "next/image"
import Link from "next/link"
import { Star, CalendarCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { verificationLabel } from "@/types"
import type { HostPropertySummary } from "@/lib/api"

const STATUS_LABEL: Record<HostPropertySummary["status"], string> = {
  active: "Active",
  draft: "Draft",
  paused: "Paused",
  archived: "Archived",
}

const STATUS_VARIANT: Record<HostPropertySummary["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "outline",
  paused: "secondary",
  archived: "secondary",
}

export function PropertyRow({
  listing,
  onPublish,
  onUnpublish,
  isMutating,
}: {
  listing: HostPropertySummary
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
  isMutating: boolean
}) {
  // Level 2 = property verification — publishing needs it approved, same rule the
  // backend's PropertyViewSet.publish action enforces server-side.
  const propertyLevelApproved = listing.verificationLevel >= 2

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-32">
        {listing.coverImage ? (
          <Image src={listing.coverImage} alt={listing.title} fill className="object-cover" sizes="128px" />
        ) : (
          <div className="flex h-full items-center justify-center text-body-sm text-smoke tracking-body-sm">
            No photo yet
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANT[listing.status]}>{STATUS_LABEL[listing.status]}</Badge>
          <Badge variant="outline">{verificationLabel[listing.verificationLevel]}</Badge>
        </div>
        <p className="mt-1 truncate font-semibold text-ink-black">{listing.title}</p>
        <p className="truncate text-body-sm text-smoke tracking-body-sm">
          {listing.city}, {listing.region} · ₹{listing.pricePerNight.toLocaleString("en-IN")}/night
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-body-sm text-smoke tracking-body-sm">
          <span className="flex items-center gap-1"><Star className="size-3.5" /> {listing.avgRating.toFixed(2)} ({listing.totalReviews})</span>
          <span className="flex items-center gap-1"><CalendarCheck className="size-3.5" /> {listing.totalBookings} bookings</span>
        </div>
        {listing.status === "draft" && !propertyLevelApproved && (
          <p className="mt-2 text-body-sm text-destructive tracking-body-sm">
            Complete Level 2 verification to make this property visible to guests.
          </p>
        )}
      </div>

      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
        {(listing.status === "draft" || listing.status === "paused") && (
          <Button
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground sm:flex-none"
            disabled={!propertyLevelApproved || isMutating}
            title={!propertyLevelApproved ? "Complete Level 2 verification to make this property visible to guests." : undefined}
            onClick={() => onPublish(listing.id)}
          >
            Publish
          </Button>
        )}
        {listing.status === "active" && (
          <Button variant="outline" className="flex-1 rounded-full sm:flex-none" disabled={isMutating} onClick={() => onUnpublish(listing.id)}>
            Unpublish
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 rounded-full sm:flex-none"
          render={<Link href={`/host/properties/${listing.id}/edit`} />}
          nativeButton={false}
        >
          Edit
        </Button>
      </div>
    </div>
  )
}
