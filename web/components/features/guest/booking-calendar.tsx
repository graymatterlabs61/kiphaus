"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"

function nightsBetween(range?: DateRange) {
  if (!range?.from || !range?.to) return 0
  const ms = range.to.getTime() - range.from.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function BookingCalendar({
  city,
  pricePerNight,
}: {
  city: string
  pricePerNight: number
}) {
  const [range, setRange] = useState<DateRange | undefined>()
  const nights = nightsBetween(range)
  const total = nights * pricePerNight

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-ink-black mb-1">
        {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} in ${city}` : `Select dates in ${city}`}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {nights > 0
          ? `₹${pricePerNight.toLocaleString("en-IN")} x ${nights} ${nights === 1 ? "night" : "nights"} = ₹${total.toLocaleString("en-IN")}`
          : "Select dates for exact pricing"}
      </p>
      <div className="rounded-xl border border-border p-3">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          disabled={{ before: new Date() }}
          className="mx-auto"
        />
      </div>
    </div>
  )
}
