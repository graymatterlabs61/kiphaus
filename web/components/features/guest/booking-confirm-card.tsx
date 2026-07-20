"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Minus, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AuthError } from "@/lib/auth"
import { useAuth } from "@/hooks"
import { fetchPricePreview, createBooking, type PricePreview } from "@/lib/api"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { WhatsAppGateModal } from "./whatsapp-gate-modal"
import type { Property } from "@/types"

// Date.toISOString() converts to UTC first — in any timezone ahead of UTC (IST
// included) that silently shifts a locally-picked date back a day. Use local
// getters instead so the date sent to the backend matches what was clicked.
function toISODate(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function firstError(err: unknown): string {
  if (err instanceof AuthError) {
    const fieldError = err.errors && Object.values(err.errors)[0]?.[0]
    return fieldError ?? err.message
  }
  return err instanceof Error ? err.message : "Something went wrong."
}

export function BookingConfirmCard({ property }: { property: Property }) {
  const { user } = useAuth()
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [preview, setPreview] = useState<PricePreview | null>(null)
  const [isPricing, setIsPricing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refreshPreview(nextRange: DateRange | undefined, nextGuests: number) {
    setPreview(null)
    setError(null)
    if (!nextRange?.from || !nextRange?.to) return
    setIsPricing(true)
    try {
      const result = await fetchPricePreview({
        propertyId: property.id,
        checkIn: toISODate(nextRange.from),
        checkOut: toISODate(nextRange.to),
        guests: nextGuests,
      })
      setPreview(result)
    } catch (err) {
      setError(firstError(err))
    } finally {
      setIsPricing(false)
    }
  }

  function handleRangeChange(next: DateRange | undefined) {
    setRange(next)
    refreshPreview(next, guests)
  }

  function handleGuestsChange(next: number) {
    setGuests(next)
    refreshPreview(range, next)
  }

  async function handleConfirm() {
    if (!range?.from || !range?.to) return
    setIsConfirming(true)
    setError(null)
    try {
      await createBooking({
        propertyId: property.id,
        checkIn: toISODate(range.from),
        checkOut: toISODate(range.to),
        guests,
      })
      const link = buildWhatsAppLink(property, {
        checkin: toISODate(range.from),
        checkout: toISODate(range.to),
        guests,
      })
      window.open(link, "_blank", "noopener,noreferrer")
      setConfirmed(true)
    } catch (err) {
      setError(firstError(err))
    } finally {
      setIsConfirming(false)
    }
  }

  // Price preview requires auth on the backend — there's nothing real to show a
  // logged-out guest, so just gate up front like the rest of the contact flow.
  if (!user) {
    return (
      <WhatsAppGateModal
        variant="contact"
        triggerRender={
          <Button className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold" />
        }
      >
        Confirm via WhatsApp
      </WhatsAppGateModal>
    )
  }

  return (
    <div>
      <div className="rounded-2xl border border-border p-3">
        <Calendar
          mode="range"
          numberOfMonths={1}
          selected={range}
          onSelect={handleRangeChange}
          disabled={{ before: new Date() }}
          className="mx-auto"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-body text-ink-black">
        <span>Guests</span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={guests <= 1}
            onClick={() => handleGuestsChange(guests - 1)}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-4 text-center">{guests}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={guests >= property.guests}
            onClick={() => handleGuestsChange(guests + 1)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-5" />

      {preview ? (
        <div className="space-y-3 text-body text-ink-black leading-body tracking-body">
          <div className="flex justify-between">
            <span>₹{preview.pricePerNight.toLocaleString("en-IN")} x {preview.nights} {preview.nights === 1 ? "night" : "nights"}</span>
            <span>₹{preview.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>₹{preview.cleaningFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>₹{preview.serviceFee.toLocaleString("en-IN")}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{preview.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-smoke tracking-body-sm">
          {isPricing ? "Pricing your dates…" : "Select check-in and check-out dates for exact pricing."}
        </p>
      )}

      {error && <p className="mt-3 text-body-sm text-destructive tracking-body-sm">{error}</p>}

      {confirmed ? (
        <p className="mt-6 rounded-2xl bg-ash-mist p-4 text-body-sm text-ink-black tracking-body-sm">
          Request sent — continue on WhatsApp to confirm with {property.hostName}.
        </p>
      ) : (
        <Button
          className="mt-6 w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold"
          disabled={!preview || isConfirming}
          onClick={handleConfirm}
        >
          {isConfirming ? "Requesting…" : "Confirm via WhatsApp"}
        </Button>
      )}

      <p className="mt-3 text-center text-body-sm text-smoke tracking-body-sm">
        You won&rsquo;t be charged in-app
      </p>
    </div>
  )
}
