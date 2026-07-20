import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { LegalShell, type LegalSection } from "@/components/features/legal/legal-shell"

const SECTIONS: LegalSection[] = [
  {
    id: "data-we-collect",
    heading: "1. Data we collect",
    body: (
      <p>
        To create an account and complete a booking, we collect your name, email, phone number, and the trip
        details you enter (dates, guest count, destination). Hosts complete identity, property, video, and
        on-site verification, which requires government ID and property documents — that data is used only for
        verification and is not shown to guests.
      </p>
    ),
  },
  {
    id: "how-we-use-it",
    heading: "2. How we use it",
    body: (
      <p>
        Your phone number is shared with a host only after you choose to contact them, so they can reach you on
        WhatsApp about your stay. We use your email for booking confirmations and account security. We don&rsquo;t
        sell personal data to third parties.
      </p>
    ),
  },
  {
    id: "whatsapp",
    heading: "3. WhatsApp communication",
    body: (
      <p>
        Kiphaus routes guest-host conversations directly to WhatsApp rather than a platform inbox. Messages
        exchanged on WhatsApp are subject to WhatsApp&rsquo;s own privacy terms in addition to this policy.
      </p>
    ),
  },
  {
    id: "retention",
    heading: "4. Data retention",
    body: (
      <p>
        We retain account and booking data for as long as your account is active, and for a limited period
        afterward to meet legal and tax record-keeping requirements. Host verification documents are retained
        only as long as needed for compliance.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "5. Your rights",
    body: (
      <p>
        You can review and update your personal information from your account settings at any time. To request
        deletion of your account and associated data, contact{" "}
        <a href="mailto:privacy@kiphaus.com" className="text-primary hover:underline">
          privacy@kiphaus.com
        </a>
        .
      </p>
    ),
  },
  {
    id: "security",
    heading: "6. Security",
    body: (
      <p>
        We use industry-standard safeguards to protect your data in transit and at rest. No online platform can
        guarantee absolute security, and we encourage you to use a strong, unique password.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <LegalShell
        title="Privacy Policy"
        lastUpdated="17 July 2026"
        intro="This policy explains what data Kiphaus collects from guests and hosts, and how it's used."
        sections={SECTIONS}
      />
      <SiteFooter />
    </>
  )
}
