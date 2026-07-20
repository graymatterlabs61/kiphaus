import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Heart, Share, Star, Medal, MapPin, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { PropertyGallery } from "@/components/features/guest/property-gallery"
import { SaveButton } from "@/components/features/guest/save-button"
import { ReserveButton } from "@/components/features/guest/reserve-button"
import { MessageHostButton } from "@/components/features/guest/message-host-button"
import { AmenitiesModal } from "@/components/features/guest/amenities-modal"
import { PropertyCard } from "@/components/features/guest/property-card"
import { getAmenityIcon } from "@/lib/amenity-icons"
import { BookingCalendar } from "@/components/features/guest/booking-calendar"
import { PropertyMap } from "@/components/features/guest/property-map"
import { Button } from "@/components/ui/button"
import { fetchProperties, fetchPropertyById } from "@/lib/api"
import { Separator } from "@/components/ui/separator"
import { HostCard } from "@/components/features/guest/host-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const property = await fetchPropertyById(id)
  if (!property) return {}
  const title = `${property.title} — Verified ${property.propertyType} in ${property.city}`
  return {
    title,
    description: `Book ${property.title} in ${property.city} direct from the host. Verification Level ${property.verificationLevel}, sleeps ${property.guests}, ₹${property.pricePerNight.toLocaleString("en-IN")}/night all-in. Reserve now.`,
    openGraph: {
      title,
      description: `Verified ${property.propertyType.toLowerCase()} in ${property.city}, ${property.region}. Sleeps ${property.guests}, ₹${property.pricePerNight.toLocaleString("en-IN")}/night — the price shown is the price paid.`,
      images: property.image ? [property.image] : undefined,
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await fetchPropertyById(id)
  if (!property) notFound()

  const similar = (await fetchProperties({ city: property.city }))
    .filter((candidate) => candidate.id !== property.id)
    .slice(0, 4)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 pt-6 pb-20">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold text-ink-black">{property.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-black">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="size-4 fill-current" />
                {property.rating}
              </span>
              <span className="underline font-semibold">{property.reviewCount} reviews</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {property.hostBadge && <><Medal className="size-4 text-muted-foreground" /> <span className="text-muted-foreground">{property.hostBadge}</span> <span>·</span></>}
              </span>
              <span className="underline font-semibold">{property.city}, {property.region}, India</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold underline">
            <button className="flex items-center gap-2 hover:bg-muted p-2 rounded-md transition"><Share className="size-4" /> Share</button>
            <SaveButton propertyId={property.id} triggerRender={<button className="flex items-center gap-2 hover:bg-muted p-2 rounded-md transition" />}>
              <Heart className="size-4" /> Save
            </SaveButton>
          </div>
        </div>

        {/* Gallery */}
        <FadeIn inView={false}>
          <PropertyGallery images={property.images} title={property.title} />
        </FadeIn>

        {/* Two Column Layout */}
        <div className="mt-8 grid gap-12 md:grid-cols-[1fr_33.333333%]">

          {/* Left Column */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-semibold text-ink-black">Entire rental unit hosted by {property.hostName}</h2>
                <p className="text-ink-black">
                  {property.guests} guests · 1 bedroom · {property.beds} {property.beds === 1 ? "bed" : "beds"} · 1 bath
                </p>
              </div>
              <div className="size-14 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                {property.hostName.charAt(0)}
              </div>
            </div>

            <Separator />

            {/* Highlights */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <Medal className="size-8 text-ink-black shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink-black">{property.hostName} is a Superhost</h3>
                  <p className="text-muted-foreground text-sm">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="size-8 text-ink-black shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink-black">Great location</h3>
                  <p className="text-muted-foreground text-sm">100% of recent guests gave the location a 5-star rating.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CalendarIcon className="size-8 text-ink-black shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink-black">Free cancellation</h3>
                  <p className="text-muted-foreground text-sm">{property.cancellationPolicy} cancellation policy.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <p className="text-ink-black leading-relaxed line-clamp-6">{property.description}</p>
              <button className="mt-4 flex items-center gap-1 font-semibold underline text-ink-black">Show more <ChevronRight className="size-4" /></button>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-[22px] font-semibold text-ink-black mb-6">What this place offers</h2>
              <ul className="grid grid-cols-2 gap-y-4 gap-x-4 text-ink-black">
                {property.amenities.slice(0, 10).map((amenity) => {
                  const Icon = getAmenityIcon(amenity)
                  return (
                    <li key={amenity.name} className="flex items-center gap-4">
                      <Icon className="size-6 shrink-0 text-graphite" strokeWidth={1.5} />
                      {amenity.name}
                    </li>
                  )
                })}
              </ul>
              {property.amenities.length > 0 && <AmenitiesModal amenities={property.amenities} />}
            </div>

            <Separator />

            {/* Calendar */}
            <BookingCalendar city={property.city} pricePerNight={property.pricePerNight} />

          </div>

          {/* Right Column - Sticky Booking Card */}
          <aside className="relative">
            <div className="sticky top-28 rounded-xl border border-border bg-card p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-[22px] font-semibold text-ink-black">₹{property.pricePerNight.toLocaleString("en-IN")}</span>
                <span className="text-ink-black">night</span>
              </div>

              <div className="mb-4 rounded-xl border border-border overflow-hidden">
                <div className="flex border-b border-border">
                  <div className="flex-1 p-3 border-r border-border cursor-pointer">
                    <div className="text-[10px] font-bold uppercase text-ink-black">Check-in</div>
                    <div className="text-sm text-muted-foreground">Add date</div>
                  </div>
                  <div className="flex-1 p-3 cursor-pointer">
                    <div className="text-[10px] font-bold uppercase text-ink-black">Checkout</div>
                    <div className="text-sm text-muted-foreground">Add date</div>
                  </div>
                </div>
                <div className="p-3 cursor-pointer flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-ink-black">Guests</div>
                    <div className="text-sm text-ink-black">1 guest</div>
                  </div>
                  <ChevronRight className="size-5 text-ink-black rotate-90" />
                </div>
              </div>

              <ReserveButton propertyId={property.id} />
              <MessageHostButton propertyId={property.id} />

              <p className="mt-4 text-center text-sm text-ink-black">You won&rsquo;t be charged yet</p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Exact pricing for your dates shows on the next step.
              </p>
            </div>
          </aside>
        </div>

        {/* Full Width Sections Below Split */}

        {/* Reviews */}
        <div className="mt-12 pt-12 border-t border-border">
          <div className="mb-8 flex items-center gap-4 text-ink-black">
            <Star className="size-6 fill-current" />
            <h2 className="text-[22px] font-semibold">{property.rating} · {property.reviewCount} reviews</h2>
          </div>
          <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
            {property.reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-black">{review.author}</h3>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <p className="text-ink-black line-clamp-3 leading-relaxed">{review.text}</p>
                {review.hostReply && (
                  <div className="mt-2 pl-4 border-l-2 border-border">
                    <p className="text-sm font-semibold mb-1">Response from {property.hostName}</p>
                    <p className="text-sm text-ink-black">{review.hostReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-8 border-border text-ink-black hover:bg-muted font-semibold text-base py-6 px-6">
            Show all {property.reviewCount} reviews
          </Button>
        </div>

        {/* Map / Location */}
        <div className="mt-12 pt-12 border-t border-border">
          <h2 className="text-[22px] font-semibold text-ink-black mb-6">Where you&rsquo;ll be</h2>
          <p className="mb-6 text-ink-black">{property.city}, {property.region}, India</p>
          <PropertyMap lat={property.lat} lng={property.lng} label={`${property.city}, ${property.region}`} />
          <p className="mt-6 text-ink-black font-semibold">Exact location provided after booking.</p>
        </div>

        {/* Host Details */}
        <div className="mt-12 pt-12 border-t border-border">
          <HostCard host={property.host} />
        </div>

        {/* Things to know */}
        <div className="mt-12 pt-12 border-t border-border">
          <h2 className="text-[22px] font-semibold text-ink-black mb-6">Things to know</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-ink-black mb-3">House rules</h3>
              <ul className="space-y-3 text-ink-black">
                {property.houseRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <button className="mt-4 flex items-center gap-1 font-semibold underline text-ink-black">Show more <ChevronRight className="size-4" /></button>
            </div>
            <div>
              <h3 className="font-semibold text-ink-black mb-3">Safety & property</h3>
              <ul className="space-y-3 text-ink-black">
                <li>No carbon monoxide alarm</li>
                <li>No smoke alarm</li>
                <li>Security camera/recording device</li>
              </ul>
              <button className="mt-4 flex items-center gap-1 font-semibold underline text-ink-black">Show more <ChevronRight className="size-4" /></button>
            </div>
            <div>
              <h3 className="font-semibold text-ink-black mb-3">Cancellation policy</h3>
              <ul className="space-y-3 text-ink-black">
                <li>{property.cancellationPolicy}</li>
                <li>Review the Host&rsquo;s full cancellation policy which applies even if you cancel for illness or disruptions caused by COVID-19.</li>
              </ul>
              <button className="mt-4 flex items-center gap-1 font-semibold underline text-ink-black">Show more <ChevronRight className="size-4" /></button>
            </div>
          </div>
        </div>

        {/* More stays */}
        {similar.length > 0 && (
          <div className="mt-12 pt-12 border-t border-border">
            <h2 className="text-[22px] font-semibold text-ink-black mb-6">More stays in {property.city}</h2>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((candidate) => (
                <StaggerItem key={candidate.id}>
                  <PropertyCard property={candidate} />
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        )}

      </main>
      <SiteFooter />
    </>
  )
}
