import { Mail, MessageCircle } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { PageHero } from "@/components/features/public/page-hero"
import { ContactForm } from "@/components/features/public/contact-form"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

const CONTACT_OPTIONS = [
  {
    icon: MessageCircle,
    title: "Guest support",
    description: "Questions about a stay or booking",
    href: "https://wa.me/919876500000",
    label: "Message on WhatsApp",
  },
  {
    icon: MessageCircle,
    title: "Host support",
    description: "Onboarding, verification, or subscriptions",
    href: "https://wa.me/919876500001",
    label: "Message on WhatsApp",
  },
  {
    icon: Mail,
    title: "Press & media",
    description: "Interview and partnership requests",
    href: "mailto:press@kiphaus.com",
    label: "press@kiphaus.com",
  },
]

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Contact"
          title="Talk to a real person"
          description="No support ticket queue — reach the right team directly."
        />

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <StaggerList className="grid gap-6 sm:grid-cols-3">
            {CONTACT_OPTIONS.map(({ icon: Icon, title, description, href, label }) => (
              <StaggerItem key={title}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-border p-6 transition-colors hover:border-graphite/50"
                >
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                  <p className="mt-1 text-body-sm text-smoke tracking-body-sm">{description}</p>
                  <p className="mt-3 text-body-sm font-semibold text-primary">{label}</p>
                </a>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Send a message</h2>
          <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
            For anything that isn&rsquo;t urgent — we reply within one business day.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
