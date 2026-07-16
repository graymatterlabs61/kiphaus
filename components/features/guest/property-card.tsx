import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { Property } from "@/types"
import { TrustBadgeRow } from "./trust-badge-row"
import { WhatsAppGateModal } from "./whatsapp-gate-modal"
import { Button } from "@/components/ui/button"

export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-glow)]">
      <Link href={`/rooms/${property.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {property.images[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No photo yet
            </div>
          )}
        </div>
      </Link>
      <WhatsAppGateModal
        variant="save"
        triggerRender={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Save ${property.title} to wishlist`}
            className="absolute right-3 top-3 rounded-full bg-card/80 text-foreground backdrop-blur hover:bg-card hover:text-primary"
          />
        }
      >
        <Heart className="size-4" />
      </WhatsAppGateModal>
      <div className="space-y-2 p-4">
        <Link href={`/rooms/${property.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">{property.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {property.city}, {property.region}
        </p>
        <TrustBadgeRow verificationLevel={property.verificationLevel} hostBadge={property.hostBadge} />
        <div className="flex items-baseline justify-between pt-1">
          <span className="font-semibold text-foreground">
            ₹{property.pricePerNight.toLocaleString("en-IN")}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ night</span>
          </span>
          <span className="text-sm text-muted-foreground">
            ★ {property.rating.toFixed(1)} ({property.reviewCount})
          </span>
        </div>
      </div>
    </div>
  )
}
