import type { Metadata } from "next"
import { IndianRupee, MessageCircle, ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { PageHero } from "@/components/features/public/page-hero"
import { VerificationLevels } from "@/components/features/public/verification-levels"
import { CtaBanner } from "@/components/features/public/cta-banner"
import { SubscriptionPlanCard } from "@/components/features/host/subscription-plan-card"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"

export const metadata: Metadata = {
  title: "List Your Property, Zero Commission",
  description:
    "List your homestay or villa on Kiphaus and keep every rupee guests pay. Flat annual fee, zero per-booking commission, hands-on onboarding. Start hosting.",
  openGraph: {
    title: "Stop paying commission on your own property",
    description:
      "Kiphaus hosts pay one flat annual fee and keep everything guests pay. Verification, onboarding, and GST help included.",
  },
  twitter: {
    title: "Host on Kiphaus — zero commission",
    description:
      "Flat annual fee. Every booking rupee stays yours. India's verified homestay marketplace is host-first.",
  },
}

const VALUE_PROPS = [
  {
    icon: IndianRupee,
    title: "Zero commission",
    description: "Pay one flat annual subscription — keep everything a guest pays you, direct bookings included.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp-native",
    description: "Guest inquiries land straight in your WhatsApp — no platform inbox to check separately.",
  },
  {
    icon: ShieldCheck,
    title: "Verification does the selling",
    description: "Get verified once and your listing carries that trust into every search result and share.",
  },
]

export default function HostLandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Kiphaus your home"
          title="Host on a platform that's on your side"
          description="No per-booking commission, no opaque ranking algorithm, no gatekeeping between you and your guest. List once, get verified, keep what you earn."
        >
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/host/onboarding"
              className="inline-flex h-[50px] w-full items-center justify-center rounded-full bg-primary px-8 text-body font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Get started
            </a>
            <a
              href="#pricing"
              className="inline-flex h-[50px] w-full items-center justify-center rounded-full border border-border px-8 text-body font-semibold text-graphite hover:bg-ash-mist sm:w-auto"
            >
              See pricing
            </a>
          </div>
        </PageHero>

        <section className="border-y border-border bg-ash-mist py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                  <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <VerificationLevels />

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
              One flat price, no surprises
            </h2>
            <p className="mt-4 text-body text-smoke leading-body tracking-body">
              An annual subscription instead of a per-booking cut — the more you host, the more it pays off.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <SubscriptionPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <CtaBanner
          title="Ready to list your first property?"
          description="Registration takes about ten minutes. Verification starts the moment you submit."
          primaryHref="/host/onboarding"
          primaryLabel="Start hosting"
          secondaryHref="/contact"
          secondaryLabel="Talk to us first"
        />
      </main>
      <SiteFooter />
    </>
  )
}
