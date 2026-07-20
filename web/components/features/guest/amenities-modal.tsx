"use client"

import { useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getAmenityIcon } from "@/lib/amenity-icons"
import type { PropertyAmenity } from "@/types"

function categoryLabel(category: string) {
  if (!category.trim()) return "Other"
  return category
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function AmenitiesModal({ amenities }: { amenities: PropertyAmenity[] }) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, PropertyAmenity[]>()
    for (const amenity of amenities) {
      const label = categoryLabel(amenity.category)
      const existing = byCategory.get(label) ?? []
      existing.push(amenity)
      byCategory.set(label, existing)
    }
    return Array.from(byCategory.entries())
  }, [amenities])

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" className="mt-8 border-border text-ink-black hover:bg-muted font-semibold text-base py-6 px-6" />
        }
      >
        Show all {amenities.length} amenities
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What this place offers</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          {groups.map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-4 text-heading-sm font-semibold text-ink-black leading-heading-sm">{category}</h3>
              <ul className="space-y-4">
                {items.map((amenity) => {
                  const Icon = getAmenityIcon(amenity)
                  return (
                    <li key={amenity.name} className="flex items-center gap-4 text-body text-ink-black">
                      <Icon className="size-6 shrink-0 text-graphite" strokeWidth={1.5} />
                      {amenity.name}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
