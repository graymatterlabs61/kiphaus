"use client"

import { useRouter } from "next/navigation"
import { FadeIn } from "@/components/motion/fade-in"
import { HostShell } from "@/components/features/host/host-shell"
import { PropertyForm } from "@/components/features/host/property-form"

export default function HostPropertyNewPage() {
  const router = useRouter()

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Add a property</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Submitting kicks off verification for this listing — it won&rsquo;t be searchable until Level 1 & 2 are approved.
      </p>
      <FadeIn inView={false} className="mt-10 max-w-2xl">
        <PropertyForm submitLabel="Save property" onSaved={(id) => router.push(`/host/properties/${id}/edit`)} />
      </FadeIn>
    </HostShell>
  )
}
