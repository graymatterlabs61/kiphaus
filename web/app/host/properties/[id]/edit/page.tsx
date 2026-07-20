"use client"

import { use, useEffect, useState } from "react"
import { FadeIn } from "@/components/motion/fade-in"
import { HostShell } from "@/components/features/host/host-shell"
import { PropertyForm } from "@/components/features/host/property-form"
import { fetchHostProperty, type PropertyDraft, type PropertyPhoto } from "@/lib/api"

export default function HostPropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [draft, setDraft] = useState<(PropertyDraft & { photos: PropertyPhoto[] }) | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchHostProperty(id)
      .then(setDraft)
      .catch(() => setError(true))
  }, [id])

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Edit property</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Changes to verified details (address, ownership) may re-trigger Level 2 review.
      </p>
      <FadeIn inView={false} className="mt-10 max-w-2xl">
        {error ? (
          <p className="text-body-sm text-destructive tracking-body-sm">Couldn&rsquo;t load this property.</p>
        ) : !draft ? (
          <p className="text-body-sm text-smoke tracking-body-sm">Loading…</p>
        ) : (
          <PropertyForm propertyId={id} initial={draft} initialPhotos={draft.photos} submitLabel="Save changes" />
        )}
      </FadeIn>
    </HostShell>
  )
}
