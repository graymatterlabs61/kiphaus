"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarCheck, IndianRupee, Star } from "lucide-react"
import { HostShell } from "@/components/features/host/host-shell"
import { StatCard } from "@/components/features/host/stat-card"
import { PropertyRow } from "@/components/features/host/property-row"
import { VerificationTracker } from "@/components/features/host/verification-tracker"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { useAuth } from "@/hooks"
import {
  fetchHostAnalytics,
  fetchMyProperties,
  fetchMyVerificationSteps,
  publishProperty,
  unpublishProperty,
  type HostAnalytics,
  type HostPropertySummary,
  type VerificationStep,
} from "@/lib/api"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export default function HostDashboardPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<HostAnalytics | null>(null)
  const [listings, setListings] = useState<HostPropertySummary[] | null>(null)
  const [steps, setSteps] = useState<VerificationStep[] | null>(null)
  const [mutatingId, setMutatingId] = useState<string | null>(null)

  function reloadListings() {
    fetchMyProperties().then(setListings).catch(() => setListings([]))
  }

  useEffect(() => {
    fetchHostAnalytics().then(setAnalytics).catch(() => setAnalytics(null))
    reloadListings()
    fetchMyVerificationSteps().then(setSteps).catch(() => setSteps([]))
  }, [])

  async function handlePublish(id: string) {
    setMutatingId(id)
    try {
      await publishProperty(id)
      reloadListings()
    } finally {
      setMutatingId(null)
    }
  }

  async function handleUnpublish(id: string) {
    setMutatingId(id)
    try {
      await unpublishProperty(id)
      reloadListings()
    } finally {
      setMutatingId(null)
    }
  }

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
        Welcome back{user ? `, ${user.first_name || user.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
        {listings ? `Here's how your ${listings.length} ${listings.length === 1 ? "listing" : "listings"} are doing.` : "Loading your dashboard…"}
      </p>

      {analytics && (
        <StaggerList inView={false} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StaggerItem><StatCard icon={IndianRupee} label="Total earnings" value={`₹${analytics.earnings.total.toLocaleString("en-IN")}`} /></StaggerItem>
          <StaggerItem><StatCard icon={IndianRupee} label="This month" value={`₹${analytics.earnings.thisMonth.toLocaleString("en-IN")}`} /></StaggerItem>
          <StaggerItem><StatCard icon={CalendarCheck} label="Bookings" value={String(analytics.bookings.total)} /></StaggerItem>
          <StaggerItem><StatCard icon={Star} label="Avg rating" value={analytics.reviews.avgRating ? analytics.reviews.avgRating.toFixed(2) : "—"} hint={`${analytics.reviews.total} reviews`} /></StaggerItem>
        </StaggerList>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="upcoming-bookings">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="upcoming-bookings" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                Upcoming bookings
              </h2>
            </div>
            {!analytics ? (
              <p className="text-body-sm text-smoke tracking-body-sm">Loading…</p>
            ) : analytics.bookings.upcoming.length === 0 ? (
              <p className="text-body-sm text-smoke tracking-body-sm">No upcoming bookings yet.</p>
            ) : (
              <StaggerList className="space-y-3">
                {analytics.bookings.upcoming.map((booking) => (
                  <StaggerItem key={booking.id}>
                    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-black">{booking.guestName}</p>
                        <p className="truncate text-body-sm text-smoke tracking-body-sm">{booking.property}</p>
                        <p className="mt-1 text-body-sm text-graphite tracking-body-sm">
                          {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} · {booking.nights} {booking.nights === 1 ? "night" : "nights"}
                        </p>
                      </div>
                      <span className="shrink-0 text-body-sm font-medium text-ink-black">₹{booking.total.toLocaleString("en-IN")}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </section>

          <section aria-labelledby="your-properties">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="your-properties" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                Your properties
              </h2>
              <Link href="/host/properties" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                See all
              </Link>
            </div>
            {!listings ? (
              <p className="text-body-sm text-smoke tracking-body-sm">Loading…</p>
            ) : (
              <StaggerList className="space-y-3">
                {listings.slice(0, 2).map((listing) => (
                  <StaggerItem key={listing.id}>
                    <PropertyRow listing={listing} onPublish={handlePublish} onUnpublish={handleUnpublish} isMutating={mutatingId === listing.id} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-black">Verification</h2>
              <Link href="/host/verification" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                Details
              </Link>
            </div>
            {steps && <VerificationTracker steps={steps} compact />}
          </div>

          <div className="rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink-black">Subscription</h2>
              <Link href="/host/subscription" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                Manage
              </Link>
            </div>
            <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
              See your plan and billing on the Subscription page.
            </p>
          </div>
        </aside>
      </div>
    </HostShell>
  )
}
