import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { searchCities } from "@/lib/mock-data"

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/policy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
]

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">
      <FadeIn className="grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-button">
              K
            </span>
            <span className="text-[18px] font-semibold tracking-[-0.36px] text-foreground">Kiphaus</span>
          </div>
          <p className="mt-3 max-w-xs">
            India&rsquo;s verified marketplace for homestays, villas, and unique stays. Every listing
            checked, every price shown upfront.
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground">Company</p>
          <ul className="mt-2 space-y-1">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Legal</p>
          <ul className="mt-2 space-y-1">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>
      <div className="mt-10 border-t border-border pt-6">
        <p className="font-medium text-foreground">Search by city</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {searchCities.map((city) => (
            <Link key={city} href={`/s?city=${encodeURIComponent(city)}`} className="hover:text-foreground">
              {city}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-10 border-t border-border pt-6">
        © {new Date().getFullYear()} Kiphaus. Every host verified. Every price final.
      </p>
    </footer>
  )
}
