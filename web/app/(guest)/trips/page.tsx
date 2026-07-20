"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { AccountNav } from "@/components/features/guest/account-nav"
import { TripCard } from "@/components/features/guest/trip-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { Button } from "@/components/ui/button"
import { fetchMyTrips } from "@/lib/api"
import type { Trip } from "@/types"

export default function GuestTripsPage() {
  const [trips, setTrips] = useState<Trip[] | null>(null)

  useEffect(() => {
    fetchMyTrips().then(setTrips).catch(() => setTrips([]))
  }, [])

  const upcoming = (trips ?? []).filter((trip) => trip.status === "upcoming")
  const past = (trips ?? []).filter((trip) => trip.status !== "upcoming")

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Trips</h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row">
          <AccountNav />

          <div className="min-w-0 flex-1">
            {trips === null ? (
              <p className="text-body-sm text-smoke tracking-body-sm">Loading…</p>
            ) : trips.length === 0 ? (
              <FadeIn inView={false} className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
                  No trips yet. Once you book a verified stay, it&rsquo;ll show up here.
                </p>
                <Button className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" render={<a href="/s" />} nativeButton={false}>
                  Search stays
                </Button>
              </FadeIn>
            ) : (
              <div className="space-y-10">
                {upcoming.length > 0 && (
                  <section aria-labelledby="upcoming-trips">
                    <h2 id="upcoming-trips" className="mb-4 text-heading-sm font-semibold text-ink-black leading-heading-sm">
                      Upcoming
                    </h2>
                    <StaggerList inView={false} className="space-y-4">
                      {upcoming.map((trip) => (
                        <StaggerItem key={trip.id}>
                          <TripCard trip={trip} />
                        </StaggerItem>
                      ))}
                    </StaggerList>
                  </section>
                )}

                {past.length > 0 && (
                  <section aria-labelledby="past-trips">
                    <h2 id="past-trips" className="mb-4 text-heading-sm font-semibold text-ink-black leading-heading-sm">
                      Past trips
                    </h2>
                    <StaggerList inView={false} className="space-y-4">
                      {past.map((trip) => (
                        <StaggerItem key={trip.id}>
                          <TripCard trip={trip} />
                        </StaggerItem>
                      ))}
                    </StaggerList>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
