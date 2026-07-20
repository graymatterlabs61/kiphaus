import type { Metadata } from "next"
import { MessageCircle, ShieldCheck, ReceiptIndianRupee } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { PageHero } from "@/components/features/public/page-hero"
import { VerificationLevels } from "@/components/features/public/verification-levels"
import { CtaBanner } from "@/components/features/public/cta-banner"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export const metadata: Metadata = {
  title: "About: India's Verified Stay Marketplace",
  description:
    "Why we built a homestay marketplace on verification and flat host fees instead of commissions and hidden charges. Meet Kiphaus.",
}

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Verification is the hero",
    description:
      "Trust badges and verification level carry as much visual weight as the photos — never buried in fine print.",
  },
  {
    icon: MessageCircle,
    title: "Direct-to-host, always",
    description:
      "Every conversation happens on WhatsApp with the real host — never a faceless platform inbox standing in between.",
  },
  {
    icon: ReceiptIndianRupee,
    title: "Transparent pricing everywhere",
    description:
      "The price shown at search is the price at booking. No fee reveal, no surprise total at the last step.",
  },
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="About Kiphaus"
          title="A marketplace built to be trusted with a deposit"
          description="Kiphaus is India's verified marketplace for homestays, villas, and unique stays — replacing the commission-heavy, trust-poor OTA model with direct host-to-guest bookings and pricing you can actually trust."
        />

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="space-y-5 text-body text-ink-black leading-body tracking-body">
            <p>
              Guests today are burned by hidden fees that inflate a ₹4,000 listing to ₹6,000–7,000 by checkout,
              fake listings, inconsistent quality, and last-minute cancellations. Kiphaus exists to fix that: find
              a stay you can trust before you pay, at the price actually shown, and reach a real host directly.
            </p>
            <p>
              Hosts pay a flat annual subscription instead of a 10–20% per-booking commission, so growing direct
              bookings actually pays off. From a first-time homestay owner to a multi-property villa manager, the
              platform is built for the full spectrum — not just the tech-savvy.
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-ash-mist py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <StaggerList className="grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, description }) => (
                <StaggerItem key={title}>
                  <div>
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                    <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        <VerificationLevels />

        <CtaBanner
          title="See it for yourself"
          description="Browse verified stays with transparent pricing, or list your property and keep what you earn."
          primaryHref="/s"
          primaryLabel="Search stays"
          secondaryHref="/host"
          secondaryLabel="Become a host"
        />
      </main>
      <SiteFooter />
    </>
  )
}
