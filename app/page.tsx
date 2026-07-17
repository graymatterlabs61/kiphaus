import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { PropertyCard } from "@/components/features/guest/property-card"
import { featuredProperties } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function LandingPage() {
  // Mocking the two categories from the screenshot
  const popularGoa = featuredProperties.slice(0, 5)
  const chandigarhWeekend = featuredProperties.slice(2, 7)
  const noidaStays = featuredProperties.slice(4, 9)

  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-32">
        {/* Search Bar Section */}
        <section className="flex justify-center pt-8 pb-10 px-4">
          <FadeIn inView={false} className="w-full max-w-4xl">
            <SearchBar className="w-full" />
          </FadeIn>
        </section>

        {/* Listings Sections */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <section>
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Popular homes in North Goa</h2>
              <Link href="/s?city=Goa" className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <span aria-hidden="true" className="text-xl">→</span>
              </Link>
            </div>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {popularGoa.map((property) => (
                <StaggerItem key={`goa-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>

          <section>
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Available in Chandigarh this weekend</h2>
              <Link href="/s?city=Chandigarh" className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <span aria-hidden="true" className="text-xl">→</span>
              </Link>
            </div>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {chandigarhWeekend.map((property) => (
                <StaggerItem key={`chd-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>

          <section>
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Stay in Noida</h2>
              <Link href="/s?city=Noida" className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <span aria-hidden="true" className="text-xl">→</span>
              </Link>
            </div>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {noidaStays.map((property) => (
                <StaggerItem key={`noida-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
