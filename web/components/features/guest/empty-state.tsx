import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function EmptyState({ city }: { city?: string }) {
  const isOtherCity = city && !city.toLowerCase().includes("gurugram")

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center bg-card/50">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MapPin className="size-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">
        {isOtherCity ? `Kiphaus is currently live in Gurugram` : `No homestays found`}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        {isOtherCity
          ? `For our Phase 1 launch, Kiphaus is exclusively serving verified homestays in Gurugram. We're expanding to ${city} soon!`
          : `No homestays matched your selected criteria${city ? ` in ${city}` : ""}. Try adjusting your filters or check out all verified Gurugram stays.`}
      </p>
      <div className="mt-2">
        <Link
          href="/s?city=Gurugram"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Explore Gurugram Stays
        </Link>
      </div>
    </div>
  )
}
