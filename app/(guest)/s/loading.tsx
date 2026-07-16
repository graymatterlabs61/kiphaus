import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
      <Skeleton className="mb-8 h-24 w-full rounded-xl" />
      <div className="flex flex-col gap-8 md:flex-row">
        <Skeleton className="h-96 w-full rounded-xl md:w-64" />
        <div className="grid flex-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
