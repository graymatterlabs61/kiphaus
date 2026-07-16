import { Skeleton } from "@/components/ui/skeleton"

export default function PropertyDetailLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-2 h-5 w-1/3" />
      <Skeleton className="mt-6 h-80 w-full rounded-3xl" />
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </main>
  )
}
