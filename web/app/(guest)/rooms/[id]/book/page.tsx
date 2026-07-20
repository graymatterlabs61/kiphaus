import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { FadeIn } from "@/components/motion/fade-in"
import { TrustBadgeRow } from "@/components/features/guest/trust-badge-row"
import { BookingConfirmCard } from "@/components/features/guest/booking-confirm-card"
import { Separator } from "@/components/ui/separator"
import { fetchPropertyById } from "@/lib/api"

export default async function BookPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await fetchPropertyById(id)
  if (!property) notFound()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pt-6 pb-24 sm:px-6 lg:px-8">
        <Link
          href={`/rooms/${property.id}`}
          className="inline-flex items-center gap-1 text-body-sm font-semibold text-graphite tracking-body-sm hover:text-ink-black"
        >
          <ChevronLeft className="size-4" />
          Back to listing
        </Link>

        <h1 className="mt-4 font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
          Confirm your request
        </h1>
        <p className="mt-2 text-body text-smoke leading-body tracking-body">
          Kiphaus doesn&rsquo;t take payment in-app. You&rsquo;ll confirm dates and pay {property.hostName}{" "}
          directly once they reply on WhatsApp — the total below is exactly what you&rsquo;ll be asked for, no
          surprise fees.
        </p>

        <FadeIn inView={false} className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div className="flex gap-4 rounded-2xl border border-border p-4">
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {property.images[0] && (
                  <Image src={property.images[0]} alt={property.title} fill className="object-cover" sizes="96px" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-black">{property.title}</p>
                <p className="truncate text-body-sm text-smoke tracking-body-sm">
                  {property.city}, {property.region} · Hosted by {property.hostName}
                </p>
                <TrustBadgeRow
                  verificationLevel={property.verificationLevel}
                  hostBadge={property.hostBadge}
                  className="mt-2"
                />
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Trip details</h2>
              <dl className="mt-4 space-y-3 text-body text-ink-black leading-body tracking-body">
                <div className="flex justify-between">
                  <dt className="text-smoke">Cancellation</dt>
                  <dd>{property.cancellationPolicy}</dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="relative">
            <div className="sticky top-28 rounded-2xl border border-border p-6">
              <h2 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Price details</h2>
              <div className="mt-5">
                <BookingConfirmCard property={property} />
              </div>
            </div>
          </aside>
        </FadeIn>
      </main>
      <SiteFooter />
    </>
  )
}
