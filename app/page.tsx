import Image from "next/image"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { PropertyCard } from "@/components/features/guest/property-card"
import { featuredProperties } from "@/lib/mock-data"

const TRUST_PROPS = [
  {
    title: "Zero commission, ever",
    body: "Hosts pay one flat annual subscription, not a cut of every booking. Guests never pay a platform fee — the price you see is the price you pay.",
  },
  {
    title: "Four-level verification",
    body: "Identity, property, video walkthrough, and on-site inspection. Every listing carries the badge it earned, not one it bought.",
  },
  {
    title: "Direct to host, always",
    body: "Every listing connects you straight to a real host on WhatsApp. No platform inbox, no hold queue, no bot in between.",
  },
]

// ponytail: falls back to the first featured property if p1's photo is ever
// removed from mock-data — keeps the hero from rendering an empty <Image>.
const heroProperty =
  featuredProperties.find((property) => property.images[0]) ?? featuredProperties[0]

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative">
          <div className="relative min-h-[560px] w-full overflow-hidden sm:min-h-[640px]">
            {heroProperty?.images[0] && (
              <Image
                src={heroProperty.images[0]}
                alt={`${heroProperty.title}, ${heroProperty.city}`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 100%)",
              }}
            />
            <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-end px-4 pb-16 sm:min-h-[640px] sm:pb-20">
              <div className="mx-auto w-full max-w-5xl">
                <h1 className="font-perfectly-nineties-regular max-w-2xl text-4xl leading-none text-white sm:text-5xl">
                  Verified stays. Zero commission. Direct to the host.
                </h1>
                <p className="mt-4 max-w-xl text-base text-white/90">
                  Every Kiphaus listing carries a verification badge it earned — identity,
                  property, video, and on-site checks — and a direct line to your host on
                  WhatsApp. No platform fee, no hidden markup.
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 sm:-mt-12">
            <SearchBar className="w-full" />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="font-perfectly-nineties-regular text-4xl leading-none">Nothing in the fine print</h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Every guarantee we make to guests and hosts, spelled out plainly — not buried in a terms page.
          </p>
          <div className="mt-10 border-t border-border">
            {TRUST_PROPS.map((prop) => (
              <div key={prop.title} className="grid gap-2 border-b border-border py-8 sm:grid-cols-[220px_1fr] sm:gap-8">
                <h3 className="text-base font-semibold text-foreground">{prop.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{prop.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-10 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="font-perfectly-nineties-regular text-4xl leading-none">Featured verified stays</h2>
            <Link href="/s" className="text-sm font-medium text-foreground hover:opacity-60">
              See all stays
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
