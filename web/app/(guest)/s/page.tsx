import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { SearchFilters } from "@/components/features/guest/search-filters"
import { PropertyCard } from "@/components/features/guest/property-card"
import { EmptyState } from "@/components/features/guest/empty-state"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { fetchProperties } from "@/lib/api"
import type { PropertyType, SearchParams, VerificationLevel } from "@/types"

function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const get = (key: string) => {
    const value = raw[key]
    return Array.isArray(value) ? value[0] : value
  }
  return {
    city: get("city") || undefined,
    type: (get("type") as PropertyType) || undefined,
    guests: get("guests") ? Number(get("guests")) : undefined,
    priceMin: get("priceMin") ? Number(get("priceMin")) : undefined,
    priceMax: get("priceMax") ? Number(get("priceMax")) : undefined,
    verification: get("verification") ? (Number(get("verification")) as VerificationLevel) : undefined,
    sort: (get("sort") as SearchParams["sort"]) || undefined,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const params = parseSearchParams(raw)
  const results = await fetchProperties(params)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <FadeIn inView={false} className="mb-10 max-w-4xl">
          <SearchBar className="w-full" />
        </FadeIn>
        <div className="flex flex-col gap-10 md:flex-row">
          <SearchFilters />
          <div className="flex-1">
            {results.length === 0 ? (
              <FadeIn inView={false}>
                <EmptyState city={params.city} />
              </FadeIn>
            ) : (
              <>
                <p className="mb-6 text-sm font-medium text-foreground">
                  {results.length} {results.length === 1 ? "stay" : "stays"}
                  {params.city ? ` in ${params.city}` : ""}
                </p>
                <StaggerList inView={false} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((property) => (
                    <StaggerItem key={property.id}>
                      <PropertyCard property={property} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
