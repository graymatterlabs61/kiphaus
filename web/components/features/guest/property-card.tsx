import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { Property } from "@/types"
import { SaveButton } from "./save-button"
import { Button } from "@/components/ui/button"
import { HoverLift } from "@/components/motion/hover-lift"

export function PropertyCard({ property }: { property: Property }) {
  return (
    <HoverLift className="group relative flex flex-col gap-3">
      <div className="relative">
        <Link
          href={`/rooms/${property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-square w-full overflow-hidden rounded-xl bg-muted"
        >
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
        </Link>
        
        {/* Guest favourite badge (mocked for high rating properties) */}
        {property.rating >= 4.9 && (
          <div className="absolute left-3 top-3 rounded-full bg-background/95 px-2 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            Guest favourite
          </div>
        )}

        <SaveButton
          propertyId={property.id}
          triggerRender={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Save ${property.title} to wishlist`}
              className="absolute right-3 top-3 h-8 w-8 rounded-full bg-transparent hover:scale-110 transition-transform hover:bg-transparent"
            />
          }
        >
          <Heart className="size-6 text-white drop-shadow-md stroke-[1.5] fill-black/30" />
        </SaveButton>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/rooms/${property.id}`} target="_blank" rel="noopener noreferrer" className="block truncate">
            <h3 className="truncate text-base font-semibold text-foreground">{property.title}</h3>
          </Link>
          <div className="flex shrink-0 items-center gap-1 text-sm text-foreground">
            <span aria-hidden="true">★</span>
            <span>{property.rating.toFixed(2)}</span>
          </div>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {property.city}, {property.region}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-semibold text-foreground">
            ₹{property.pricePerNight.toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-foreground">night</span>
        </div>
      </div>
    </HoverLift>
  )
}
