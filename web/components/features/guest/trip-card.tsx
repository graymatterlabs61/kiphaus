import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WriteReviewModal } from "@/components/features/guest/write-review-modal"
import type { Trip } from "@/types"

const STATUS_LABEL: Record<Trip["status"], string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_VARIANT: Record<Trip["status"], "default" | "secondary" | "outline"> = {
  upcoming: "default",
  completed: "secondary",
  cancelled: "outline",
}

function formatDateRange(checkIn: string, checkOut: string) {
  const fmt = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  return `${fmt(checkIn)} – ${fmt(checkOut)}`
}

export function TripCard({ trip }: { trip: Trip }) {
  const { property } = trip
  const whatsappHref = `https://wa.me/${property.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi ${property.hostName}, I'm messaging about my Kiphaus trip to ${property.title}.`
  )}`

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center">
      <Link
        href={`/rooms/${property.id}`}
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40"
      >
        {property.images[0] && (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
            sizes="160px"
          />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANT[trip.status]}>{STATUS_LABEL[trip.status]}</Badge>
          <span className="text-body-sm text-smoke tracking-body-sm">
            {formatDateRange(trip.checkIn, trip.checkOut)}
          </span>
        </div>
        <Link href={`/rooms/${property.id}`} className="mt-1 block truncate font-semibold text-ink-black hover:underline">
          {property.title}
        </Link>
        <p className="truncate text-body-sm text-smoke tracking-body-sm">
          {property.city}, {property.region} · {trip.guests} {trip.guests === 1 ? "guest" : "guests"}
        </p>
        {trip.status !== "cancelled" && (
          <p className="mt-1 text-body-sm font-medium text-ink-black">
            ₹{trip.totalPaid.toLocaleString("en-IN")} total
          </p>
        )}
      </div>

      {trip.status === "upcoming" && (
        <Button
          variant="outline"
          className="w-full shrink-0 rounded-full sm:w-auto"
          render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}
          nativeButton={false}
        >
          <MessageCircle className="size-4" />
          Message host
        </Button>
      )}

      {trip.status === "completed" && <WriteReviewModal bookingId={trip.id} propertyTitle={property.title} />}
    </div>
  )
}
