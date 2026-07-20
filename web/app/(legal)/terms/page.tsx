import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { LegalShell, type LegalSection } from "@/components/features/legal/legal-shell"

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    heading: "1. Acceptance of terms",
    body: (
      <p>
        By creating a Kiphaus account or booking a stay through the platform, you agree to these Terms of
        Service. If you don&rsquo;t agree, don&rsquo;t use Kiphaus. We may update these terms from time to time; continued
        use after an update means you accept the revised terms.
      </p>
    ),
  },
  {
    id: "what-kiphaus-is",
    heading: "2. What Kiphaus is",
    body: (
      <p>
        Kiphaus is a marketplace connecting guests with verified hosts of homestays, villas, farm stays, and
        heritage homes across India. Kiphaus is not the host, does not own any listed property, and is not a
        party to the booking agreement between you and the host. Hosts pay Kiphaus a flat annual subscription,
        not a per-booking commission — Kiphaus does not process guest payments in-app.
      </p>
    ),
  },
  {
    id: "verification",
    heading: "3. Verification",
    body: (
      <p>
        Every listing displays a verification level (Identity, Property, Video, or On-Site verified) reflecting
        the checks Kiphaus has completed on that host and property. Verification reduces risk but does not
        guarantee the accuracy of every listing detail or the outcome of any individual stay.
      </p>
    ),
  },
  {
    id: "bookings",
    heading: "4. Bookings and pricing",
    body: (
      <p>
        Prices shown at search are the full, all-in price — Kiphaus does not add fees at checkout. Once you
        request a stay, final confirmation, payment, and any date changes happen directly between you and the
        host, most commonly over WhatsApp. Cancellation terms are set per listing and shown before you confirm.
      </p>
    ),
  },
  {
    id: "conduct",
    heading: "5. Guest conduct",
    body: (
      <p>
        You agree to provide accurate information when booking, to follow the house rules published on each
        listing, and to communicate with hosts respectfully. Kiphaus may suspend accounts that misuse the
        platform, submit fraudulent bookings, or harass hosts.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "6. Liability",
    body: (
      <p>
        Kiphaus facilitates the connection between guests and hosts but is not liable for the condition of a
        property, acts of a host or guest, or events outside Kiphaus&rsquo;s reasonable control. Disputes about a
        specific stay should first be raised directly with the host, then escalated to Kiphaus support if
        unresolved.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "7. Contact",
    body: (
      <p>
        Questions about these terms can be sent to{" "}
        <a href="mailto:legal@kiphaus.com" className="text-primary hover:underline">
          legal@kiphaus.com
        </a>
        .
      </p>
    ),
  },
]

export default function TermsOfServicePage() {
  return (
    <>
      <SiteHeader />
      <LegalShell
        title="Terms of Service"
        lastUpdated="17 July 2026"
        intro="These terms govern your use of Kiphaus as a guest. A separate host agreement covers listing and subscription terms."
        sections={SECTIONS}
      />
      <SiteFooter />
    </>
  )
}
