import type { Review } from "@/types"

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="space-y-1 border-b border-border py-4 last:border-b-0">
      <p className="text-body-sm font-medium text-foreground">{review.author}</p>
      <p className="text-caption text-muted-foreground">
        {review.date} · ★ {review.rating.toFixed(1)}
      </p>
      <p className="text-body-sm text-graphite">{review.text}</p>
      {review.hostReply && (
        <p className="mt-2 rounded-md bg-muted p-3 text-body-sm text-muted-foreground">
          <span className="font-medium text-foreground">Host reply: </span>
          {review.hostReply}
        </p>
      )}
    </div>
  )
}
