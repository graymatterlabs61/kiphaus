import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { AccountNav } from "@/components/features/guest/account-nav"
import { PropertyCard } from "@/components/features/guest/property-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { Button } from "@/components/ui/button"
import { featuredProperties } from "@/lib/mock-data"

export default function GuestWishlistsPage() {
  const saved = featuredProperties.slice(0, 6)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Wishlists</h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row">
          <AccountNav />

          <div className="min-w-0 flex-1">
            {saved.length === 0 ? (
              <FadeIn inView={false} className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
                  No saved stays yet. Tap the heart on any listing to save it here.
                </p>
                <Button className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" render={<a href="/s" />} nativeButton={false}>
                  Search stays
                </Button>
              </FadeIn>
            ) : (
              <StaggerList inView={false} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((property) => (
                  <StaggerItem key={property.id}>
                    <PropertyCard property={property} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
