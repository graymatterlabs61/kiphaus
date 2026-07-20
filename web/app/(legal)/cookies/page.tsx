import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { LegalShell, type LegalSection } from "@/components/features/legal/legal-shell"

const SECTIONS: LegalSection[] = [
  {
    id: "what-are-cookies",
    heading: "1. What cookies are",
    body: (
      <p>
        Cookies are small files stored on your device that let Kiphaus recognize your browser between visits.
        We use them to keep you logged in, remember search preferences, and understand how the site is used.
      </p>
    ),
  },
  {
    id: "types-we-use",
    heading: "2. Types of cookies we use",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li><span className="font-medium text-ink-black">Essential</span> — required for login sessions and booking flow to function.</li>
        <li><span className="font-medium text-ink-black">Preference</span> — remember your last search city, filters, and theme.</li>
        <li><span className="font-medium text-ink-black">Analytics</span> — help us understand which pages and listings guests use most.</li>
      </ul>
    ),
  },
  {
    id: "managing-cookies",
    heading: "3. Managing cookies",
    body: (
      <p>
        Most browsers let you block or delete cookies in settings. Blocking essential cookies will prevent
        login and booking from working correctly, since Kiphaus doesn&rsquo;t use cookie-less session storage.
      </p>
    ),
  },
  {
    id: "third-party",
    heading: "4. Third-party cookies",
    body: (
      <p>
        We do not embed third-party advertising trackers. Analytics cookies are limited to understanding
        aggregate site usage and are never used to sell your data.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "5. Questions",
    body: (
      <p>
        Reach us at{" "}
        <a href="mailto:privacy@kiphaus.com" className="text-primary hover:underline">
          privacy@kiphaus.com
        </a>{" "}
        for anything not covered here.
      </p>
    ),
  },
]

export default function CookiePolicyPage() {
  return (
    <>
      <SiteHeader />
      <LegalShell
        title="Cookie Policy"
        lastUpdated="17 July 2026"
        intro="How Kiphaus uses cookies and similar technologies across the site."
        sections={SECTIONS}
      />
      <SiteFooter />
    </>
  )
}
