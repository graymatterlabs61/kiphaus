import { notFound } from "next/navigation"
import { Heart, MessageCircle } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { PropertyGallery } from "@/components/features/guest/property-gallery"
import { TrustBadgeRow } from "@/components/features/guest/trust-badge-row"
import { HostCard } from "@/components/features/guest/host-card"
import { ReviewSummary } from "@/components/features/guest/review-summary"
import { ReviewCard } from "@/components/features/guest/review-card"
import { WhatsAppGateModal } from "@/components/features/guest/whatsapp-gate-modal"
import { PropertyCard } from "@/components/features/guest/property-card"
import { Button } from "@/components/ui/button"
import { propertiesByCity, propertyById } from "@/lib/mock-data"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = propertyById(id)
  if (!property) notFound()

  const similar = propertiesByCity(property.city)
    .filter((candidate) => candidate.id !== property.id)
    .slice(0, 3)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
        <h1 className="font-perfectly-nineties-regular text-3xl">{property.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {property.city}, {property.region}
        </p>

        <div className="mt-6">
          <PropertyGallery images={property.images} title={property.title} />
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <p className="text-sm text-muted-foreground">
              {property.guests} guests · {property.beds} {property.beds === 1 ? "bed" : "beds"} ·{" "}
              {property.propertyType}
            </p>

            <TrustBadgeRow verificationLevel={property.verificationLevel} hostBadge={property.hostBadge} />

            <p>{property.description}</p>

            <div className="border-t border-border pt-10">
              <h2 className="font-perfectly-nineties-regular text-2xl">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {property.amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-10">
              <h2 className="font-perfectly-nineties-regular text-2xl">House rules</h2>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {property.houseRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                Cancellation policy: <span className="font-medium">{property.cancellationPolicy}</span>
              </p>
            </div>

            <HostCard host={property.host} />

            <div className="border-t border-border pt-10">
              <h2 className="font-perfectly-nineties-regular text-2xl">Reviews</h2>
              <div className="mt-4">
                <ReviewSummary rating={property.rating} reviewCount={property.reviewCount} breakdown={property.reviewBreakdown} />
              </div>
              <div className="mt-4">
                {property.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Located in {property.city}, {property.region}. The exact address is shared once the host confirms
              your booking.
            </p>
          </div>

          <aside className="order-first h-fit space-y-4 rounded-3xl border border-border bg-card p-5 shadow-glow md:order-none md:sticky md:top-28">
            <p className="text-2xl font-semibold">
              ₹{property.pricePerNight.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ night, all-in</span>
            </p>
            <WhatsAppGateModal variant="contact" triggerRender={<Button className="w-full rounded-full" />}>
              <MessageCircle className="size-4" />
              Book via WhatsApp
            </WhatsAppGateModal>
            <WhatsAppGateModal
              variant="save"
              triggerRender={<Button variant="outline" className="w-full rounded-full" />}
            >
              <Heart className="size-4" />
              Save to wishlist
            </WhatsAppGateModal>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-perfectly-nineties-regular text-2xl">More stays in {property.city}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((candidate) => (
                <PropertyCard key={candidate.id} property={candidate} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
