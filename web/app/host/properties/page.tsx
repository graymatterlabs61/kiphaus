"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { HostShell } from "@/components/features/host/host-shell"
import { PropertyRow } from "@/components/features/host/property-row"
import { Button } from "@/components/ui/button"
import { fetchMyProperties, publishProperty, unpublishProperty, type HostPropertySummary } from "@/lib/api"
import { AuthError } from "@/lib/auth"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function HostPropertiesPage() {
  const [listings, setListings] = useState<HostPropertySummary[] | null>(null)
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reload() {
    fetchMyProperties()
      .then(setListings)
      .catch(() => setListings([]))
  }

  useEffect(reload, [])

  async function handlePublish(id: string) {
    setMutatingId(id)
    setError(null)
    try {
      await publishProperty(id)
      reload()
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Couldn't publish this property.")
    } finally {
      setMutatingId(null)
    }
  }

  async function handleUnpublish(id: string) {
    setMutatingId(id)
    setError(null)
    try {
      await unpublishProperty(id)
      reload()
    } catch {
      setError("Couldn't unpublish this property.")
    } finally {
      setMutatingId(null)
    }
  }

  return (
    <HostShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Properties</h1>
          {listings && (
            <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </p>
          )}
        </div>
        <Button
          className="rounded-full h-[50px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          render={<Link href="/host/properties/new" />}
          nativeButton={false}
        >
          <Plus className="size-4" />
          Add property
        </Button>
      </div>

      {error && <p className="mt-4 text-body-sm text-destructive tracking-body-sm">{error}</p>}

      <div className="mt-8">
        {!listings ? (
          <p className="text-body-sm text-smoke tracking-body-sm">Loading…</p>
        ) : listings.length === 0 ? (
          <FadeIn inView={false} className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
              You haven&rsquo;t listed a property yet. Add your first one to start getting verified.
            </p>
            <Button
              className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              render={<Link href="/host/properties/new" />}
              nativeButton={false}
            >
              Add your first property
            </Button>
          </FadeIn>
        ) : (
          <StaggerList inView={false} className="space-y-4">
            {listings.map((listing) => (
              <StaggerItem key={listing.id}>
                <PropertyRow listing={listing} onPublish={handlePublish} onUnpublish={handleUnpublish} isMutating={mutatingId === listing.id} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </HostShell>
  )
}
