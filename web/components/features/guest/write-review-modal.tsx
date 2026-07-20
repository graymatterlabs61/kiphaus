"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/lib/auth"
import { createReview } from "@/lib/api"

const CATEGORIES = [
  { key: "overall", label: "Overall rating" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "communication", label: "Communication" },
  { key: "location", label: "Location" },
  { key: "value", label: "Value" },
] as const

type CategoryKey = (typeof CATEGORIES)[number]["key"]
type Ratings = Record<CategoryKey, number>

const DEFAULT_RATINGS: Ratings = { overall: 5, cleanliness: 5, communication: 5, location: 5, value: 5 }

function StarPicker({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="space-y-2">
      <Label className="text-body-sm font-medium text-graphite tracking-body-sm">{label}</Label>
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            className={`flex size-9 items-center justify-center rounded-full transition-colors ${
              n <= (hovered || value) ? "text-primary" : "text-smoke"
            }`}
          >
            <Star className="size-5" fill="currentColor" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function WriteReviewModal({ bookingId, propertyTitle }: { bookingId: string; propertyTitle: string }) {
  const [open, setOpen] = useState(false)
  const [ratings, setRatings] = useState<Ratings>(DEFAULT_RATINGS)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)
    try {
      await createReview({ bookingId, ...ratings, comment })
      setOpen(false)
      setRatings(DEFAULT_RATINGS)
      setComment("")
    } catch (err) {
      const message =
        err instanceof AuthError
          ? (err.errors && Object.values(err.errors)[0]?.[0]) ?? err.message
          : "Couldn't submit your review. Try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full shrink-0 rounded-full sm:w-auto" />}>
        Write a review
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review {propertyTitle}</DialogTitle>
          <DialogDescription>Only guests with a completed stay can review — this keeps ratings real.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {CATEGORIES.map(({ key, label }) => (
            <StarPicker key={key} label={label} value={ratings[key]} onChange={(n) => setRatings((r) => ({ ...r, [key]: n }))} />
          ))}
          <div className="space-y-2">
            <Label htmlFor="review-text" className="text-body-sm font-medium text-graphite tracking-body-sm">
              Your review
            </Label>
            <Textarea
              id="review-text"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the stay, the host, and the check-in?"
              className="rounded-2xl border-border bg-transparent px-4 py-3 text-body"
            />
          </div>
          {error && <p className="text-body-sm text-destructive tracking-body-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? "Submitting…" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
