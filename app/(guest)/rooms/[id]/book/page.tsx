import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { FadeIn } from "@/components/motion/fade-in"
import { TrustBadgeRow } from "@/components/features/guest/trust-badge-row"
import { WhatsAppGateModal } from "@/components/features/guest/whatsapp-gate-modal"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { propertyById } from "@/lib/mock-data"

const NIGHTS = 5
const CLEANING_FEE = 1500
const SERVICE_FEE = 2100

export default async function BookPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = propertyById(id)
  if (!property) notFound()

  const subtotal = property.pricePerNight * NIGHTS
  const total = subtotal + CLEANING_FEE + SERVICE_FEE

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
                  <dt className="text-smoke">Dates</dt>
                  <dd>{NIGHTS} nights (select exact dates on WhatsApp)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-smoke">Guests</dt>
                  <dd>1 guest</dd>
                </div>
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
              <div className="mt-5 space-y-3 text-body text-ink-black leading-body tracking-body">
                <div className="flex justify-between">
                  <span>₹{property.pricePerNight.toLocaleString("en-IN")} x {NIGHTS} nights</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>₹{CLEANING_FEE.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₹{SERVICE_FEE.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex justify-between font-semibold text-ink-black">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <WhatsAppGateModal
                variant="contact"
                triggerRender={
                  <Button className="mt-6 w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold" />
                }
              >
                Confirm via WhatsApp
              </WhatsAppGateModal>
              <p className="mt-3 text-center text-body-sm text-smoke tracking-body-sm">
                You won&rsquo;t be charged in-app
              </p>
            </div>
          </aside>
        </FadeIn>
      </main>
      <SiteFooter />
    </>
  )
}
