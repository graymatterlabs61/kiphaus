export function EmptyState({ city }: { city?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-20 text-center">
      <p className="max-w-md text-base text-foreground">
        {`No properties found for those dates${city ? ` in ${city}` : ""}. Try adjusting your filters or exploring nearby destinations.`}
      </p>
    </div>
  )
}
