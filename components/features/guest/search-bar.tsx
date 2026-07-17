"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { motion, useReducedMotion } from "motion/react"
import { Search, MapPin, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HoverLift } from "@/components/motion/hover-lift"
import { cn } from "@/lib/utils"
import { searchCities } from "@/lib/mock-data"

const FLEXIBLE_OPTIONS = [
  { label: "A weekend", days: 2 },
  { label: "A week", days: 7 },
  { label: "A month", days: 30 },
]

const fieldClass =
  "relative flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-5 py-3 text-left md:py-2 focus-visible:outline-none"
const labelClass =
  "text-micro font-semibold tracking-[0.08em] text-muted-foreground uppercase"
const valueClass = "truncate text-sm font-medium text-foreground"

function formatDate(date?: Date) {
  return date ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : undefined
}

// toISOString() converts to UTC first, which rolls the date back a day for any
// timezone behind UTC — format the local calendar date directly instead.
function toDateParam(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [whereOpen, setWhereOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()
  const [dateMode, setDateMode] = useState<"dates" | "flexible">("dates")
  const [whenOpen, setWhenOpen] = useState(false)
  const [guests, setGuests] = useState(1)
  const [whoOpen, setWhoOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const activeField = whereOpen ? "where" : whenOpen ? "when" : whoOpen ? "who" : null

  const filteredCities = useMemo(
    () => searchCities.filter((option) => option.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  )

  const whenLabel = range?.from
    ? `${formatDate(range.from)}${range.to ? ` – ${formatDate(range.to)}` : ""}`
    : "Add dates"

  function applyFlexible(days: number) {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + days)
    setRange({ from, to })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (range?.from) params.set("checkin", toDateParam(range.from))
    if (range?.to) params.set("checkout", toDateParam(range.to))
    params.set("guests", String(guests))
    router.push(`/s?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-background shadow-md transition-shadow hover:shadow-lg md:flex-row md:items-stretch md:rounded-full",
        activeField && "shadow-lg",
        className
      )}
    >
      <div className="flex flex-1 flex-col divide-y divide-border md:flex-row md:divide-x md:divide-y-0">
        <Popover
          open={whereOpen}
          onOpenChange={(open) => {
            setWhereOpen(open)
            if (open) setCitySearch("")
          }}
        >
          <PopoverTrigger render={<button type="button" className={fieldClass} />}>
            {activeField === "where" && (
              <motion.div
                layoutId="search-field-highlight"
                className="pointer-events-none absolute inset-1 rounded-full bg-muted"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={cn(labelClass, "relative")}>Where</span>
            <span className={cn(valueClass, "relative")}>{city || "Search destinations"}</span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-2.5">
              <Input
                autoFocus
                placeholder="Search destinations"
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                className="rounded-full"
              />
            </div>
            <div className="max-h-72 overflow-y-auto px-1.5 pb-1.5">
              {filteredCities.length === 0 ? (
                <p className="px-3 py-6 text-center text-body-sm text-smoke tracking-body-sm">
                  No destinations match &ldquo;{citySearch}&rdquo;
                </p>
              ) : (
                filteredCities.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setCity(option)
                      setWhereOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <MapPin className="size-4 shrink-0 text-smoke" aria-hidden="true" />
                    {option}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={whenOpen} onOpenChange={setWhenOpen}>
          <PopoverTrigger render={<button type="button" className={fieldClass} />}>
            {activeField === "when" && (
              <motion.div
                layoutId="search-field-highlight"
                className="pointer-events-none absolute inset-1 rounded-full bg-muted"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={cn(labelClass, "relative")}>When</span>
            <span className={cn(valueClass, "relative")}>{whenLabel}</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <Tabs value={dateMode} onValueChange={(val) => setDateMode(val as "dates" | "flexible")}>
              <div className="mb-2 flex justify-center">
                <TabsList>
                  <TabsTrigger value="dates">Dates</TabsTrigger>
                  <TabsTrigger value="flexible">Flexible</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dates">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={range}
                  onSelect={setRange}
                  disabled={{ before: new Date() }}
                />
              </TabsContent>
              <TabsContent value="flexible">
                <div className="flex flex-wrap gap-2 p-2 min-h-[300px]">
                  {FLEXIBLE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => applyFlexible(option.days)}
                      className="rounded-full border border-border px-4 py-2 h-fit text-body-sm font-medium text-graphite tracking-body-sm hover:bg-ash-mist"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
              <button
                type="button"
                onClick={() => setRange(undefined)}
                className="text-body-sm font-semibold text-graphite tracking-body-sm hover:text-ink-black"
              >
                Clear dates
              </button>
              <Button type="button" size="sm" className="rounded-full" onClick={() => setWhenOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={whoOpen} onOpenChange={setWhoOpen}>
          <PopoverTrigger render={<button type="button" className={cn(fieldClass, "md:max-w-[160px]")} />}>
            {activeField === "who" && (
              <motion.div
                layoutId="search-field-highlight"
                className="pointer-events-none absolute inset-1 rounded-full bg-muted"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={cn(labelClass, "relative")}>Who</span>
            <span className={cn(valueClass, "relative")}>{guests} {guests === 1 ? "guest" : "guests"}</span>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="flex items-center justify-between px-1 py-1.5">
              <div>
                <p className="font-medium text-ink-black">Guests</p>
                <p className="text-body-sm text-smoke tracking-body-sm">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease guests"
                  disabled={guests <= 1}
                  onClick={() => setGuests((value) => Math.max(1, value - 1))}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-graphite hover:bg-ash-mist disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
                <span className="w-4 text-center text-sm font-medium text-ink-black" aria-live="polite">
                  {guests}
                </span>
                <button
                  type="button"
                  aria-label="Increase guests"
                  onClick={() => setGuests((value) => value + 1)}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-graphite hover:bg-ash-mist"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center justify-center border-t border-border p-2.5 md:border-t-0 md:pr-2 md:pl-1">
        <HoverLift lift={0}>
          <Button
            type="submit"
            aria-label="Search stays"
            className="size-11 shrink-0 rounded-full bg-primary p-0 text-primary-foreground shadow-[var(--shadow-button)] hover:bg-primary/90"
          >
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </HoverLift>
      </div>
    </form>
  )
}
