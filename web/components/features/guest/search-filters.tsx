"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const PROPERTY_TYPES = ["Homestay", "Villa", "Farm Stay", "Heritage Home"] as const
const VERIFICATION_LEVELS = [1, 2, 3, 4] as const
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "verified", label: "Most verified first" },
] as const

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [type, setType] = useState(searchParams.get("type") ?? "")
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "")
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "")
  const [verification, setVerification] = useState(searchParams.get("verification") ?? "")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "relevance")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const setOrDelete = (key: string, value: string) => {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    setOrDelete("type", type)
    setOrDelete("priceMin", priceMin)
    setOrDelete("priceMax", priceMax)
    setOrDelete("verification", verification)
    setOrDelete("sort", sort)
    router.push(`/s?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:w-64"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Property type
        <NativeSelect value={type} onChange={(event) => setType(event.target.value)} className="w-full">
          <NativeSelectOption value="">Any type</NativeSelectOption>
          {PROPERTY_TYPES.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
          Min price
          <Input
            type="number"
            min={0}
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
          Max price
          <Input
            type="number"
            min={0}
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Minimum verification level
        <NativeSelect
          value={verification}
          onChange={(event) => setVerification(event.target.value)}
          className="w-full"
        >
          <NativeSelectOption value="">Any level</NativeSelectOption>
          {VERIFICATION_LEVELS.map((level) => (
            <NativeSelectOption key={level} value={String(level)}>
              Level {level}+
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Sort by
        <NativeSelect value={sort} onChange={(event) => setSort(event.target.value)} className="w-full">
          {SORT_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <Button type="submit" className="rounded-full">
        Apply filters
      </Button>
    </form>
  )
}
