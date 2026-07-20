import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/features/guest/hero-section"
import { PropertyCard } from "@/components/features/guest/property-card"
import { fetchProperties } from "@/lib/api"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { MapPin, ShieldCheck, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: { absolute: "Verified Homestays & Villas in India | Kiphaus" },
  description:
    "Book verified homestays and villas across India at the price you actually see. No hidden fees, direct host contact, four-level verification. Explore now.",
}

export default async function LandingPage() {
  const gurugramStays = await fetchProperties({ city: "Gurugram", sort: "rating" })
  const golfCourseDLF = gurugramStays.slice(0, 5)
  const cyberCityStays = gurugramStays.slice(4, 9)
  const farmhousesAravali = gurugramStays.slice(3, 8)

  return (
    <div className="relative min-h-screen bg-background">
      <Header variant="floating" />
      <main className="pb-32">
        {/* Hero Section */}
        <HeroSection />

        {/* Phase 1 Launch Announcement Banner */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 text-foreground shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Phase 1 Launch: Exclusively in Gurugram</p>
                <p className="text-xs text-muted-foreground">
                  Every listed homestay in DLF Phase 1-5, Golf Course Road, Cyber City, and Sohna Road is 100% in-person verified.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary shrink-0">
              <ShieldCheck className="size-4" />
              <span>Direct Host WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Listings Sections */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Homestays on Golf Course Road & DLF
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Verified premium homestays & lofts in Gurugram</p>
              </div>
              <Link
                href="/s?city=Gurugram"
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {golfCourseDLF.map((property) => (
                <StaggerItem key={`dlf-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Executive & Studio Homestays near Cyber City
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Tailored for business travelers & workations</p>
              </div>
              <Link
                href="/s?city=Gurugram&type=Homestay"
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {cyberCityStays.map((property) => (
                <StaggerItem key={`cyber-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Farmhouses & Aravali Retreats in Gurugram
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Spacious weekend getaways & pool farmhouses</p>
              </div>
              <Link
                href="/s?city=Gurugram&type=Farm+Stay"
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {farmhousesAravali.map((property) => (
                <StaggerItem key={`aravali-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
