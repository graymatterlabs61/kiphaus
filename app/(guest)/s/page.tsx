import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { SearchFilters } from "@/components/features/guest/search-filters"
import { PropertyCard } from "@/components/features/guest/property-card"
import { EmptyState } from "@/components/features/guest/empty-state"
import { searchProperties } from "@/lib/mock-data"
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
  const results = searchProperties(params)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
        <SearchBar className="mb-8" />
        <div className="flex flex-col gap-8 md:flex-row">
          <SearchFilters />
          <div className="flex-1">
            {results.length === 0 ? (
              <EmptyState city={params.city} />
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {results.length} {results.length === 1 ? "stay" : "stays"}
                  {params.city ? ` in ${params.city}` : ""}
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {results.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
