import type { ReviewBreakdown } from "@/types"

const CATEGORY_LABELS: Record<keyof ReviewBreakdown, string> = {
  cleanliness: "Cleanliness",
  accuracy: "Accuracy",
  checkIn: "Check-in",
  communication: "Communication",
  location: "Location",
  value: "Value",
}

export function ReviewSummary({
  rating,
  reviewCount,
  breakdown,
}: {
  rating: number
  reviewCount: number
  breakdown: ReviewBreakdown
}) {
  const categories = Object.keys(CATEGORY_LABELS) as (keyof ReviewBreakdown)[]

  return (
    <div className="space-y-4">
      <p className="text-heading-sm font-semibold text-foreground">
        ★ {rating.toFixed(1)}{" "}
        <span className="text-body-sm font-normal text-muted-foreground">
          ({reviewCount} reviews)
        </span>
      </p>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {categories.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 border-b border-border py-2 text-body-sm"
          >
            <dt className="text-muted-foreground">{CATEGORY_LABELS[key]}</dt>
            <dd className="tabular-nums text-graphite">{breakdown[key].toFixed(1)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
