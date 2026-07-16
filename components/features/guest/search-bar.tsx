"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
import { searchCities } from "@/lib/mock-data"

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [checkin, setCheckin] = useState("")
  const [checkout, setCheckout] = useState("")
  const [guests, setGuests] = useState(2)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (checkin) params.set("checkin", checkin)
    if (checkout) params.set("checkout", checkout)
    params.set("guests", String(guests))
    router.push(`/s?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "grid grid-cols-1 gap-5 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-glow)] sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto] md:items-end md:gap-4 md:p-4",
        className
      )}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        City
        <NativeSelect
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="w-full"
        >
          <NativeSelectOption value="">Anywhere in India</NativeSelectOption>
          {searchCities.map((cityOption) => (
            <NativeSelectOption key={cityOption} value={cityOption}>
              {cityOption}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Check-in
        <Input
          type="date"
          value={checkin}
          onChange={(event) => setCheckin(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Check-out
        <Input
          type="date"
          value={checkout}
          onChange={(event) => setCheckout(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Guests
        <Input
          type="number"
          min={1}
          value={guests}
          onChange={(event) => setGuests(Number(event.target.value))}
        />
      </label>
      <Button
        type="submit"
        size="lg"
        className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] hover:bg-primary/90"
      >
        Search stays
      </Button>
    </form>
  )
}
