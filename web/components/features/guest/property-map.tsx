"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
})

export function PropertyMap({
  lat,
  lng,
  label,
}: {
  lat: number
  lng: number
  label: string
}) {
  return (
    <div className="h-[480px] w-full overflow-hidden rounded-xl border border-border">
      <LeafletMap lat={lat} lng={lng} label={label} />
    </div>
  )
}
